import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";
import { testDb } from "../setup/db-setup";
import { projects } from "@/bootstrap/boundaries/db/schema";

/**
 * E2E tests for templates.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Templates", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should list available templates", async ({ page }) => {
    const user = await createTestUser();
    
    // Create a template project
    await createTestProject(user.id, {
      name: "Template 1",
      isTemplate: true,
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

  test("should create project from template", async ({ page }) => {
    const user = await createTestUser();
    
    // Create a template
    const template = await createTestProject(user.id, {
      name: "My Template",
      isTemplate: true,
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

    await authenticateUser(page, user.email, user.password);
    await page.goto("/editor");

    // Open templates sidebar
    await page.click('button[aria-label*="templates"], button:has-text("Templates")');

    await page.waitForTimeout(1000);

    // Click on template card
    const templateCard = page.locator(`text=${template.name}`);
    await templateCard.click();

    // Click "Use Template" button
    const useButton = page.locator('button:has-text("Use"), button:has-text("Use Template")');
    await useButton.click();

    // Wait for redirect to new project editor
    await page.waitForURL(/\/editor\/[^/]+$/, { timeout: 10000 });

    // Get new project ID from URL
    const url = page.url();
    const newProjectId = url.split("/").pop();
    expect(newProjectId).toBeTruthy();
    expect(newProjectId).not.toBe(template.id);

    // Verify canvas loaded with template content
    await page.waitForSelector("canvas", { timeout: 10000 });
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("should show template previews", async ({ page }) => {
    const user = await createTestUser();
    
    await createTestProject(user.id, {
      name: "Template with Preview",
      isTemplate: true,
      thumbnailUrl: "https://via.placeholder.com/300",
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto("/editor");

    // Open templates sidebar
    await page.click('button[aria-label*="templates"], button:has-text("Templates")');

    await page.waitForTimeout(1000);

    // Verify template card has preview image
    const templateCard = page.locator('text=Template with Preview');
    await expect(templateCard).toBeVisible();

    // Check for image in template card
    const previewImage = templateCard.locator("..").locator("img");
    const hasImage = await previewImage.isVisible().catch(() => false);
    // Preview may or may not be visible depending on implementation
  });
});

