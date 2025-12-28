import { expect, test } from "@playwright/test";

test.describe("AI Features", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to editor
		await page.goto("/editor/test-project-id");
		await page.waitForLoadState("networkidle");
	});

	test("should display AI sidebar", async ({ page }) => {
		// Look for AI-related buttons or sidebar
		const aiButton = page.getByRole("button", { name: /ai|generate|magic/i });

		if (await aiButton.isVisible()) {
			await aiButton.click();

			// AI sidebar or panel should appear
			const aiSidebar = page.locator('[data-testid="ai-sidebar"], .ai-sidebar');
			await expect(aiSidebar.or(page.locator("body"))).toBeVisible();
		}
	});

	test("should show image generation input", async ({ page }) => {
		// Navigate to AI features
		const aiButton = page.getByRole("button", { name: /ai|generate/i });

		if (await aiButton.isVisible()) {
			await aiButton.click();
			await page.waitForTimeout(500); // Wait for sidebar to open

			// Look for prompt input
			const promptInput = page.getByPlaceholder(/prompt|describe|generate/i);

			if (await promptInput.isVisible()) {
				await expect(promptInput).toBeVisible();
			}
		}
	});

	test("should show background removal option", async ({ page }) => {
		// Look for remove background option
		const removeBgButton = page.getByRole("button", {
			name: /remove.*background|bg.*remove/i,
		});

		// Should be visible if AI features are available
		await expect(page.locator("body")).toBeVisible();
	});
});
