import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for client hydration boundaries.
 * Tests validate that client components hydrate without errors.
 * Zero mocking.
 */

test.describe("Client Hydration", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should hydrate client components without errors", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page (has client components)
    await page.goto(`/en/editor/${project.id}`);

    // Wait for hydration
    await page.waitForLoadState("domcontentloaded");

    // Check for hydration errors in console
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (text.includes("hydration") || text.includes("Hydration")) {
          errors.push(text);
        }
      }
    });

    // Wait a bit for any hydration errors to appear
    await page.waitForTimeout(2000);

    // Should have no hydration errors
    expect(errors.length).toBe(0);
  });

  test("should hydrate interactive client components", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto(`/en/editor/${project.id}`);

    // Wait for canvas (client component) to hydrate
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Verify canvas is interactive
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Try to interact with canvas (should work after hydration)
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
  });
});

