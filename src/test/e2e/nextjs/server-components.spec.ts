import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for Next.js server components.
 * Tests validate that server components render with correct data.
 * Zero mocking.
 */

test.describe("Server Components", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should render server components with correct data", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, { name: "Test Project" });

    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page (uses server components)
    await page.goto("/en/editor");

    // Wait for server components to render
    await page.waitForLoadState("networkidle");

    // Verify project is displayed (rendered by server component)
    await expect(page.locator(`text=${project.name}`)).toBeVisible({ timeout: 10000 });
  });

  test("should render server components with user-specific data", async ({ page }) => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const project1 = await createTestProject(user1.id, { name: "User 1 Project" });
    const project2 = await createTestProject(user2.id, { name: "User 2 Project" });

    // Authenticate as user1
    await authenticateUser(page, user1.email, user1.password);
    await page.goto("/en/editor");
    await page.waitForLoadState("networkidle");

    // Verify only user1's project is visible
    await expect(page.locator(`text=${project1.name}`)).toBeVisible();
    await expect(page.locator(`text=${project2.name}`)).not.toBeVisible();
  });

  test("should handle server component errors gracefully", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/en/editor");

    // Should redirect to sign-in (server component handles auth check)
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

