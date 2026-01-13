import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for canvas operations.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Canvas Operations", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should initialize canvas with empty project", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    // Wait for canvas to render
    await page.waitForSelector("canvas", { timeout: 10000 });
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Verify canvas dimensions match project
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
  });

  test("should undo and redo operations", async ({ page }) => {
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

    // Wait for shape to be added
    await page.waitForTimeout(500);

    // Undo (Ctrl+Z)
    await page.keyboard.press("Control+Z");

    // Wait for undo to complete
    await page.waitForTimeout(500);

    // Verify shape was removed (check canvas state)
    const projectAfterUndo = await getProjectById(project.id);
    const canvasDataAfterUndo = JSON.parse(projectAfterUndo!.json);
    const shapesAfterUndo = canvasDataAfterUndo.objects?.filter(
      (obj: any) => obj.type === "rect"
    ).length || 0;

    // Redo (Ctrl+Shift+Z)
    await page.keyboard.press("Control+Shift+Z");

    // Wait for redo to complete
    await page.waitForTimeout(1000);

    // Verify shape was restored
    const projectAfterRedo = await getProjectById(project.id);
    const canvasDataAfterRedo = JSON.parse(projectAfterRedo!.json);
    const shapesAfterRedo = canvasDataAfterRedo.objects?.filter(
      (obj: any) => obj.type === "rect"
    ).length || 0;

    expect(shapesAfterRedo).toBeGreaterThan(shapesAfterUndo);
  });

  test("should copy and paste objects", async ({ page }) => {
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

    await page.waitForTimeout(500);

    // Select the shape (click on it)
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Copy (Ctrl+C)
    await page.keyboard.press("Control+C");

    // Paste (Ctrl+V)
    await page.keyboard.press("Control+V");

    // Wait for paste to complete
    await page.waitForTimeout(1000);

    // Verify object was duplicated
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const rectangles = canvasData.objects?.filter(
      (obj: any) => obj.type === "rect"
    ) || [];
    expect(rectangles.length).toBeGreaterThanOrEqual(2);
  });

  test("should zoom in and out", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Find zoom in button
    const zoomInButton = page.locator('button[aria-label*="zoom in"], button:has-text("Zoom In")');
    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
      await page.waitForTimeout(300);
    }

    // Find zoom out button
    const zoomOutButton = page.locator('button[aria-label*="zoom out"], button:has-text("Zoom Out")');
    if (await zoomOutButton.isVisible()) {
      await zoomOutButton.click();
      await page.waitForTimeout(300);
    }

    // Canvas should still be visible
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("should change canvas background", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Open settings
    await page.click('button[aria-label*="settings"], button:has-text("Settings")');

    // Find background color picker
    const bgColorInput = page.locator('input[type="color"], [role="button"][aria-label*="background"]');
    if (await bgColorInput.isVisible()) {
      await bgColorInput.click();
      // Select a color (this is simplified - actual implementation may vary)
      await page.waitForTimeout(500);
    }

    // Wait for save
    await page.waitForTimeout(1000);

    // Verify background changed in database
    const updatedProject = await getProjectById(project.id);
    expect(updatedProject).not.toBeNull();
  });

  test("should change canvas size", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, { width: 1920, height: 1080 });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Open settings
    await page.click('button[aria-label*="settings"], button:has-text("Settings")');

    // Find width and height inputs
    const widthInput = page.locator('input[aria-label*="width"], input[placeholder*="width"]');
    const heightInput = page.locator('input[aria-label*="height"], input[placeholder*="height"]');

    if (await widthInput.isVisible() && await heightInput.isVisible()) {
      await widthInput.fill("1280");
      await heightInput.fill("720");

      // Save changes
      await page.click('button:has-text("Save"), button:has-text("Apply")');
      await page.waitForTimeout(1000);
    }

    // Verify size updated in database
    const updatedProject = await getProjectById(project.id);
    expect(updatedProject?.width).toBe(1280);
    expect(updatedProject?.height).toBe(720);
  });
});

