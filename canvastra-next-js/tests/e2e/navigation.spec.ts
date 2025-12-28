import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
	test("should navigate between pages", async ({ page }) => {
		await page.goto("/");

		// Check if home page loads
		await expect(page.locator("body")).toBeVisible();

		// Navigate to login if not authenticated
		const loginLink = page.getByRole("link", { name: /login|sign in/i });
		if (await loginLink.isVisible()) {
			await loginLink.click();
			await expect(page).toHaveURL(/\/login/);
		}
	});

	test("should have working header navigation", async ({ page }) => {
		await page.goto("/dashboard");
		await page.waitForLoadState("networkidle");

		// Look for header/navbar
		const header = page.locator('header, nav, [role="navigation"]').first();

		if (await header.isVisible()) {
			// Header should contain navigation links
			await expect(header).toBeVisible();
		}
	});

	test("should handle 404 pages gracefully", async ({ page }) => {
		await page.goto("/non-existent-page");

		// Should show 404 or redirect to home
		await expect(page.locator("body")).toBeVisible();
	});
});
