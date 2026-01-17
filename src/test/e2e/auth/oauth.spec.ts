import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { AuthPage } from "../pages/auth-page";
import { testEnvConfig } from "../config/test-env.config";

/**
 * E2E tests for OAuth authentication flows.
 * Tests use real OAuth providers (GitHub/Google) if configured.
 * Zero mocking.
 */

test.describe("OAuth Authentication", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  (!testEnvConfig.auth.github.enabled ? test.skip : test)(
    "should redirect to GitHub OAuth",
    async ({ page }) => {
      const authPage = new AuthPage(page);

      await authPage.gotoSignIn();
      await authPage.clickGithub();

      // Wait for redirect to GitHub
      await page.waitForURL(/github\.com/, { timeout: 10000 }).catch(() => {
        // If redirect doesn't happen, check if we're on an error page
        const currentUrl = page.url();
        if (!currentUrl.includes("github.com")) {
          throw new Error(`Expected GitHub redirect but got: ${currentUrl}`);
        }
      });
    },
  );

  (!testEnvConfig.auth.google.enabled ? test.skip : test)(
    "should redirect to Google OAuth",
    async ({ page }) => {
      const authPage = new AuthPage(page);

      await authPage.gotoSignIn();
      await authPage.clickGoogle();

      // Wait for redirect to Google
      await page.waitForURL(/accounts\.google\.com/, { timeout: 10000 }).catch(() => {
        // If redirect doesn't happen, check if we're on an error page
        const currentUrl = page.url();
        if (!currentUrl.includes("accounts.google.com")) {
          throw new Error(`Expected Google redirect but got: ${currentUrl}`);
        }
      });
    },
  );

  (!testEnvConfig.auth.github.enabled ? test.skip : test)(
    "should show GitHub button on sign-up page",
    async ({ page }) => {
      const authPage = new AuthPage(page);

      await authPage.gotoSignUp();
      await expect(authPage.githubButton).toBeVisible();
    },
  );

  (!testEnvConfig.auth.google.enabled ? test.skip : test)(
    "should show Google button on sign-up page",
    async ({ page }) => {
      const authPage = new AuthPage(page);

      await authPage.gotoSignUp();
      await expect(authPage.googleButton).toBeVisible();
    },
  );
});

