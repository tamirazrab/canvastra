import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for text tools.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Text Tools", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should add text to canvas", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select text tool
    await page.click('button[aria-label*="text"], button:has-text("Text")');

    // Click on canvas to add text
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Type text
    await page.keyboard.type("Hello World");

    // Press Escape or click outside to finish editing
    await page.keyboard.press("Escape");

    await page.waitForTimeout(1000);

    // Verify text added to canvas
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const textObjects = canvasData.objects?.filter(
      (obj: any) => obj.type === "textbox" || obj.type === "i-text" || obj.type === "text"
    ) || [];
    expect(textObjects.length).toBeGreaterThan(0);
    expect(textObjects[0].text).toContain("Hello");
  });

  test("should edit text content", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "textbox",
            left: 200,
            top: 200,
            text: "Original Text",
            fontSize: 32,
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Double-click on text to edit
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + 200, box.y + 200);
    }

    // Clear and type new text
    await page.keyboard.press("Control+A");
    await page.keyboard.type("Edited Text");
    await page.keyboard.press("Escape");

    await page.waitForTimeout(1000);

    // Verify text updated
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const textObject = canvasData.objects?.find(
      (obj: any) => obj.type === "textbox" || obj.type === "i-text"
    );
    expect(textObject?.text).toBe("Edited Text");
  });

  test("should change font family", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "textbox",
            left: 200,
            top: 200,
            text: "Test Text",
            fontFamily: "Arial",
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select text
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 200, box.y + 200);
    }

    await page.waitForTimeout(300);

    // Open font sidebar
    await page.click('button[aria-label*="font"], button:has-text("Font")');

    // Select different font
    const fontSelect = page.locator('select[aria-label*="font"], select[name*="font"]');
    if (await fontSelect.isVisible()) {
      await fontSelect.selectOption({ label: "Times New Roman" });
    } else {
      // Try clicking font option directly
      await page.click('button:has-text("Times New Roman"), [role="option"]:has-text("Times New Roman")');
    }

    await page.waitForTimeout(1000);

    // Verify font changed
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const textObject = canvasData.objects?.find(
      (obj: any) => obj.type === "textbox"
    );
    expect(textObject?.fontFamily).toBe("Times New Roman");
  });

  test("should change font size", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "textbox",
            left: 200,
            top: 200,
            text: "Test Text",
            fontSize: 32,
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select text
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 200, box.y + 200);
    }

    await page.waitForTimeout(300);

    // Find font size input
    const fontSizeInput = page.locator('input[aria-label*="font size"], input[name*="fontSize"], input[type="number"]').first();
    if (await fontSizeInput.isVisible()) {
      await fontSizeInput.fill("48");
      await page.keyboard.press("Enter");
    }

    await page.waitForTimeout(1000);

    // Verify font size changed
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const textObject = canvasData.objects?.find(
      (obj: any) => obj.type === "textbox"
    );
    expect(textObject?.fontSize).toBe(48);
  });

  test("should toggle text bold", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "textbox",
            left: 200,
            top: 200,
            text: "Test Text",
            fontWeight: 400,
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select text
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 200, box.y + 200);
    }

    await page.waitForTimeout(300);

    // Click bold button
    const boldButton = page.locator('button[aria-label*="bold"], button:has-text("Bold")');
    if (await boldButton.isVisible()) {
      await boldButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify font weight changed
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const textObject = canvasData.objects?.find(
      (obj: any) => obj.type === "textbox"
    );
    expect(textObject?.fontWeight).toBeGreaterThan(400);
  });

  test("should change text alignment", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, {
      json: JSON.stringify({
        objects: [
          {
            type: "textbox",
            left: 200,
            top: 200,
            text: "Test Text",
            textAlign: "left",
          },
        ],
      }),
    });

    await authenticateUser(page, user.email, user.password);
    await page.goto(`/editor/${project.id}`);

    await page.waitForSelector("canvas", { timeout: 10000 });

    // Select text
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 200, box.y + 200);
    }

    await page.waitForTimeout(300);

    // Click center align button
    const centerAlignButton = page.locator('button[aria-label*="center"], button:has-text("Center")');
    if (await centerAlignButton.isVisible()) {
      await centerAlignButton.click();
    }

    await page.waitForTimeout(1000);

    // Verify alignment changed
    const updatedProject = await getProjectById(project.id);
    const canvasData = JSON.parse(updatedProject!.json);
    const textObject = canvasData.objects?.find(
      (obj: any) => obj.type === "textbox"
    );
    expect(textObject?.textAlign).toBe("center");
  });
});

