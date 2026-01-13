import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";
import * as fs from "fs";
import * as path from "path";

/**
 * E2E tests for export/save functionality.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Export and Save", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should save project as PNG", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
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
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click save PNG button
    const saveButton = page.locator('button[aria-label*="save"], button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Look for PNG option in dropdown
      const pngOption = page.locator('button:has-text("PNG"), [role="menuitem"]:has-text("PNG")');
      if (await pngOption.isVisible()) {
        await pngOption.click();
      }
    } else {
      // Try direct PNG button
      const pngButton = page.locator('button[aria-label*="PNG"], button:has-text("PNG")');
      if (await pngButton.isVisible()) {
        await pngButton.click();
      }
    }

    // Wait for download
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.png$/i);

    // Save file temporarily to verify it's valid
    const downloadPath = path.join(__dirname, "../../../test-downloads", filename);
    await download.saveAs(downloadPath);

    // Verify file exists and has content
    expect(fs.existsSync(downloadPath)).toBe(true);
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Cleanup
    fs.unlinkSync(downloadPath);
  });

  test("should save project as JSON", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 200,
            height: 200,
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click save JSON button
    const saveButton = page.locator('button[aria-label*="save"], button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      const jsonOption = page.locator('button:has-text("JSON"), [role="menuitem"]:has-text("JSON")');
      if (await jsonOption.isVisible()) {
        await jsonOption.click();
      }
    } else {
      const jsonButton = page.locator('button[aria-label*="JSON"], button:has-text("JSON")');
      if (await jsonButton.isVisible()) {
        await jsonButton.click();
      }
    }

    // Wait for download
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.json$/i);

    // Save and verify JSON content
    const downloadPath = path.join(__dirname, "../../../test-downloads", filename);
    await download.saveAs(downloadPath);

    const jsonContent = fs.readFileSync(downloadPath, "utf-8");
    const parsed = JSON.parse(jsonContent);
    expect(parsed.objects).toBeDefined();
    expect(Array.isArray(parsed.objects)).toBe(true);

    // Cleanup
    fs.unlinkSync(downloadPath);
  });

  test("should auto-save changes", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Add a shape
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="rectangle"], button:has-text("Rectangle")');
    
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Wait for debounce (500ms) plus some buffer
    await page.waitForTimeout(1500);

    // Verify database was updated
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const rectangles = canvasData.objects?.filter(
      (obj: any) => obj.type === "rect"
    ) || [];
    expect(rectangles.length).toBeGreaterThan(0);

    // Verify updatedAt timestamp changed
    expect(new Date(updatedProject!.updatedAt).getTime()).toBeGreaterThan(
      new Date(project.updatedAt).getTime()
    );
  });

  test("should persist changes after page refresh", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Add a shape
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="circle"], button:has-text("Circle")');
    
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Wait for auto-save
    await page.waitForTimeout(1500);

    // Refresh page
    await page.reload();
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Verify shape still exists
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const circles = canvasData.objects?.filter(
      (obj: any) => obj.type === "circle"
    ) || [];
    expect(circles.length).toBeGreaterThan(0);
  });
});

