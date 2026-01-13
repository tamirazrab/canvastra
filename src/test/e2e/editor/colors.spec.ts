import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for color tools.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Color Tools", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should change fill color of a shape", async ({ page }) => {
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
            fill: "rgba(0,0,0,1)",
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select shape
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 250, box.y + 250);
    }

    await page.waitForTimeout(300);

    // Open fill color sidebar
    await page.click('button[aria-label*="fill"], button:has-text("Fill")');

    // Select a color from palette
    const colorButton = page.locator('[role="button"][aria-label*="red"], button:has-text("#f44336")').first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    } else {
      // Try color picker input
      const colorInput = page.locator('input[type="color"]').first();
      if (await colorInput.isVisible()) {
        await colorInput.fill("#f44336");
      }
    }

    await page.waitForTimeout(1000);

    // Verify fill color changed
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const rect = canvasData.objects?.find((obj: any) => obj.type === "rect");
    expect(rect?.fill).not.toBe("rgba(0,0,0,1)");
  });

  test("should change stroke color of a shape", async ({ page }) => {
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
            stroke: "rgba(0,0,0,1)",
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select shape
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 250, box.y + 250);
    }

    await page.waitForTimeout(300);

    // Open stroke color sidebar
    await page.click('button[aria-label*="stroke"], button:has-text("Stroke")');

    // Select a color
    const colorButton = page.locator('[role="button"][aria-label*="blue"], button:has-text("#2196f3")').first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify stroke color changed
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const rect = canvasData.objects?.find((obj: any) => obj.type === "rect");
    expect(rect?.stroke).not.toBe("rgba(0,0,0,1)");
  });

  test("should change color of multiple selected objects", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 50,
            height: 50,
            fill: "rgba(0,0,0,1)",
          },
          {
            type: "circle",
            left: 200,
            top: 200,
            radius: 25,
            fill: "rgba(0,0,0,1)",
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select first shape
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 125, box.y + 125);
    }

    await page.waitForTimeout(200);

    // Select second shape with Shift
    if (box) {
      await page.mouse.click(box.x + 200, box.y + 200, { modifiers: ["Shift"] });
    }

    await page.waitForTimeout(300);

    // Open fill color sidebar
    await page.click('button[aria-label*="fill"], button:has-text("Fill")');

    // Select a color
    const colorButton = page.locator('[role="button"]').first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify both objects have new color
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const objects = canvasData.objects || [];
    const allHaveNewColor = objects.every(
      (obj: any) => obj.fill !== "rgba(0,0,0,1)"
    );
    expect(allHaveNewColor).toBe(true);
  });
});

