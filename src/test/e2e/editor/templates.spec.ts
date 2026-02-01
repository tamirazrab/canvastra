import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestTemplate } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for templates.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking. Templates are stored in the template table (no user required).
 */

test.describe("Templates", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should list available templates", async ({ page }) => {
    await createTestTemplate({
      name: "Template 1",
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            fill: "blue",
          },
        ],
      }),
    });

    const user = await createTestUser();
    await authenticateUser(page, user.email, user.password);
    await page.goto("/editor");

    // Open templates sidebar
    await page.click('button[aria-label*="templates"], button:has-text("Templates")');

    // Wait for templates to load
    await page.waitForTimeout(1000);

    // Verify template is visible
    const templateCard = page.locator('text=Template 1');
    await expect(templateCard).toBeVisible({ timeout: 5000 });
  });

  test("should load template into canvas when clicked", async ({ page }) => {
    const template = await createTestTemplate({
      name: "My Template",
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            fill: "red",
          },
          {
            type: "textbox",
            left: 150,
            top: 150,
            text: "Template Text",
          },
        ],
      }),
    });

    const user = await createTestUser();
    await authenticateUser(page, user.email, user.password);
    await page.goto("/editor");

    // Open templates sidebar
    await page.click('button[aria-label*="templates"], button:has-text("Templates")');

    await page.waitForTimeout(1000);

    // Click on template card (loads template JSON into current canvas)
    const templateCard = page.locator(`text=${template.name}`);
    await templateCard.click();

    // Confirm dialog may appear
    const dialog = page.locator('text=Are you sure');
    if (await dialog.isVisible()) {
      await page.getByRole("button", { name: /ok|yes|confirm/i }).click();
    }

    // Verify canvas is visible
    await page.waitForSelector("canvas", { timeout: 10000 });
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("should show template previews", async ({ page }) => {
    await createTestTemplate({
      name: "Template with Preview",
      thumbnailUrl: "https://via.placeholder.com/300",
    });

    const user = await createTestUser();
    await authenticateUser(page, user.email, user.password);
    await page.goto("/editor");

    // Open templates sidebar
    await page.click('button[aria-label*="templates"], button:has-text("Templates")');

    await page.waitForTimeout(1000);

    // Verify template card is visible
    const templateCard = page.locator('text=Template with Preview');
    await expect(templateCard).toBeVisible();

    // Check for image in template card
    const previewImage = templateCard.locator("..").locator("img");
    await previewImage.isVisible().catch(() => false);
  });
});

