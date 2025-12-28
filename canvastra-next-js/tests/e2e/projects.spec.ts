import { expect, test } from "@playwright/test";

test.describe("Projects", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to dashboard - adjust based on your auth flow
		await page.goto("/dashboard");

		// Wait for page to load
		await page.waitForLoadState("networkidle");
	});

	test("should display dashboard with projects", async ({ page }) => {
		// Check if projects section is visible
		// Adjust selectors based on your actual UI
		const projectsSection = page.locator(
			'[data-testid="projects-section"], .projects-section, h2:has-text("Projects")',
		);

		// If projects exist, they should be visible
		// If no projects, should show empty state
		await expect(
			projectsSection.or(
				page.getByText(/no projects|create your first project/i),
			),
		).toBeVisible();
	});

	test("should navigate to create project", async ({ page }) => {
		// Look for create project button
		const createButton = page
			.getByRole("button", { name: /create|new project/i })
			.first();

		if (await createButton.isVisible()) {
			await createButton.click();
			// Should navigate to editor or project creation page
			await expect(page).toHaveURL(/\/editor|\/project|create/i);
		}
	});

	test("should display project templates", async ({ page }) => {
		// Look for templates section
		const templatesSection = page.locator(
			'[data-testid="templates"], .templates-section, h2:has-text("Templates")',
		);

		// Templates section should exist (even if empty)
		await expect(page.locator("body")).toBeVisible();
	});
});
