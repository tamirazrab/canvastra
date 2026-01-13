import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for Next.js caching behavior.
 * Tests validate cache invalidation on updates.
 * Zero mocking.
 */

test.describe("Next.js Caching", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should invalidate cache on project update", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, { name: "Original Name" });

    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto("/en/editor");
    await page.waitForLoadState("networkidle");

    // Verify original name is displayed
    await expect(page.locator(`text=Original Name`)).toBeVisible();

    // Update project via API
    const response = await page.request.patch(`/api/projects/${project.id}`, {
      headers: {
        Cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; "),
        "Content-Type": "application/json",
      },
      data: { name: "Updated Name" },
    });

    expect(response.status()).toBe(200);

    // Reload page - should show updated name (cache invalidated)
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify updated name is displayed
    await expect(page.locator(`text=Updated Name`)).toBeVisible({ timeout: 10000 });
  });

  test("should show fresh data after project creation", async ({ page }) => {
    const user = await createTestUser();

    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto("/en/editor");
    await page.waitForLoadState("networkidle");

    // Create new project
    await page.click('button:has-text("Create Project")');
    await page.waitForURL(/\/editor\/[^/]+$/, { timeout: 10000 });

    // Navigate back to editor list
    await page.goto("/en/editor");
    await page.waitForLoadState("networkidle");

    // Verify new project appears in list (fresh data, not cached)
    const projectCards = page.locator('[data-project-card], .project-card');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

