import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for shape tools.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Shape Tools", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should add a rectangle", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select rectangle tool
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="rectangle"], button:has-text("Rectangle")');

    // Click on canvas to add rectangle
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Wait for shape to be added and saved
    await page.waitForTimeout(1000);

    // Verify rectangle added to canvas data
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const rectangles = canvasData.objects?.filter(
      (obj: any) => obj.type === "rect"
    ) || [];
    expect(rectangles.length).toBeGreaterThan(0);
  });

  test("should add a circle", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select circle tool
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="circle"], button:has-text("Circle")');

    // Click on canvas
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    await page.waitForTimeout(1000);

    // Verify circle added
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const circles = canvasData.objects?.filter(
      (obj: any) => obj.type === "circle"
    ) || [];
    expect(circles.length).toBeGreaterThan(0);
  });

  test("should add a triangle", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select triangle tool
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="triangle"], button:has-text("Triangle")');

    // Click on canvas
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    await page.waitForTimeout(1000);

    // Verify triangle added
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const triangles = canvasData.objects?.filter(
      (obj: any) => obj.type === "triangle"
    ) || [];
    expect(triangles.length).toBeGreaterThan(0);
  });

  test("should add a diamond", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select diamond tool
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="diamond"], button:has-text("Diamond")');

    // Click on canvas
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    await page.waitForTimeout(1000);

    // Verify diamond added
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const diamonds = canvasData.objects?.filter(
      (obj: any) => obj.type === "polygon" || obj.points?.length === 4
    ) || [];
    expect(diamonds.length).toBeGreaterThan(0);
  });

  test("should select a shape", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 200,
            top: 200,
            width: 100,
            height: 100,
            fill: "red",
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Click on the shape to select it
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 250, box.y + 250);
    }

    await page.waitForTimeout(500);

    // Verify toolbar shows shape properties (fill color, stroke, etc.)
    const toolbar = page.locator('[role="toolbar"], .toolbar, [class*="toolbar"]');
    await expect(toolbar).toBeVisible();
  });

  test("should delete a shape with Delete key", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 200,
            top: 200,
            width: 100,
            height: 100,
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select the shape
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 250, box.y + 250);
    }

    await page.waitForTimeout(300);

    // Press Delete key
    await page.keyboard.press("Delete");

    // Wait for save
    await page.waitForTimeout(1000);

    // Verify shape removed from database
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const rectangles = canvasData.objects?.filter(
      (obj: any) => obj.type === "rect"
    ) || [];
    expect(rectangles.length).toBe(0);
  });
});

