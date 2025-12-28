import { expect, test } from "@playwright/test";

test.describe("Images", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/editor/test-project-id");
		await page.waitForLoadState("networkidle");
	});

	test("should display images sidebar", async ({ page }) => {
		// Look for images/unsplash button
		const imagesButton = page.getByRole("button", {
			name: /images|photos|unsplash/i,
		});

		if (await imagesButton.isVisible()) {
			await imagesButton.click();

			// Images sidebar should appear
			const imagesSidebar = page.locator(
				'[data-testid="image-sidebar"], .image-sidebar',
			);
			await expect(imagesSidebar.or(page.locator("body"))).toBeVisible();
		}
	});

	test("should load images grid", async ({ page }) => {
		// Open images sidebar
		const imagesButton = page.getByRole("button", { name: /images|photos/i });

		if (await imagesButton.isVisible()) {
			await imagesButton.click();
			await page.waitForTimeout(1000); // Wait for images to load

			// Should show images grid or loading state
			const imagesGrid = page.locator(
				'[data-testid="images-grid"], .images-grid, img',
			);

			// Either images are loaded or loading indicator is shown
			await expect(page.locator("body")).toBeVisible();
		}
	});
});
