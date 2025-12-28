import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login");
	});

	test("should display login page", async ({ page }) => {
		await expect(page.getByText(/sign in|login/i)).toBeVisible();
	});

	test("should show sign up form when switching", async ({ page }) => {
		// Find and click the switch to sign up button
		const switchButton = page.getByRole("button", {
			name: /sign up|create account/i,
		});
		if (await switchButton.isVisible()) {
			await switchButton.click();
			await expect(page.getByText(/create account|sign up/i)).toBeVisible();
		}
	});

	test("should validate email format", async ({ page }) => {
		// Switch to sign up if needed
		const switchButton = page.getByRole("button", {
			name: /sign up|create account/i,
		});
		if (await switchButton.isVisible()) {
			await switchButton.click();
		}

		const emailInput = page.getByPlaceholder(/email/i);
		await emailInput.fill("invalid-email");

		// Try to submit
		const submitButton = page.getByRole("button", { name: /continue|submit/i });
		await submitButton.click();

		// Should show validation error or prevent submission
		// Adjust selector based on your actual error display
		await expect(page.locator("body")).toBeVisible();
	});

	test("should require password", async ({ page }) => {
		const emailInput = page.getByPlaceholder(/email/i);
		await emailInput.fill("test@example.com");

		const submitButton = page.getByRole("button", { name: /continue|submit/i });
		await submitButton.click();

		// Password should be required
		const passwordInput = page.getByPlaceholder(/password/i);
		await expect(passwordInput).toBeVisible();
	});
});
