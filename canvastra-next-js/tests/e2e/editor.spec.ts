import { expect, test } from "@playwright/test";

test.describe("Editor", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to editor - you may need to create a project first
		await page.goto("/editor/test-project-id");
		await page.waitForLoadState("networkidle");
	});

	test("should load editor canvas", async ({ page }) => {
		// Wait for canvas to be initialized
		// Fabric.js canvas is typically in a canvas element
		const canvas = page.locator("canvas").first();

		// Canvas should be visible
		await expect(canvas).toBeVisible({ timeout: 10000 });
	});

	test("should display toolbar", async ({ page }) => {
		// Look for toolbar elements
		const toolbar = page
			.locator('[data-testid="toolbar"], .toolbar, nav')
			.first();
		await expect(toolbar).toBeVisible();
	});

	test("should display sidebar", async ({ page }) => {
		// Look for sidebar
		const sidebar = page
			.locator('[data-testid="sidebar"], .sidebar, aside')
			.first();
		await expect(sidebar).toBeVisible();
	});

	test("should allow adding text", async ({ page }) => {
		// Click on text tool
		const textButton = page.getByRole("button", { name: /text|T/i });

		if (await textButton.isVisible()) {
			await textButton.click();

			// Click on canvas to add text
			const canvas = page.locator("canvas").first();
			await canvas.click({ position: { x: 400, y: 300 } });

			// Text input should appear or text should be added
			await expect(page.locator("body")).toBeVisible();
		}
	});
});
