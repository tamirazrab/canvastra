import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { createTestSubscription } from "../helpers/subscription-helper";
import { updateSubscriptionStatus } from "../helpers/subscription-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";
import { assertFailureResponse, FailureAssertions } from "../utils/fp-ts-assertions";
import { shouldSkipStripeTest, getStripeSkipReason } from "../helpers/stripe-helper";

/**
 * E2E tests for payment failure scenarios.
 * Tests use real database and API routes.
 * Zero mocking.
 */

test.describe("Payment Failures", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  (shouldSkipStripeTest() ? test.skip : test)(
    "should handle expired subscription",
    async ({ page }) => {
      const user = await createTestUser();
      const subscription = await createTestSubscription(user.id, {
        status: "active",
        currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      // Update subscription to past_due
      await updateSubscriptionStatus(subscription.subscriptionId, "past_due");

      // Authenticate
      await page.goto("/en/sign-in");
      const emailInput = page.locator("#email");
      const passwordInput = page.locator("#password");
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/editor/, { timeout: 30000 });

      // Get subscription status
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/current",
      );

      expect(status).toBe(200);
      const subscriptionData = body as { data?: { status?: string; active?: boolean } };
      expect(subscriptionData.data?.status).toBe("past_due");
      expect(subscriptionData.data?.active).toBe(false);
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should handle canceled subscription",
    async ({ page }) => {
      const user = await createTestUser();
      await createTestSubscription(user.id, {
        status: "canceled",
      });

      // Authenticate
      await page.goto("/en/sign-in");
      const emailInput = page.locator("#email");
      const passwordInput = page.locator("#password");
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/editor/, { timeout: 30000 });

      // Get subscription status
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/current",
      );

      expect(status).toBe(200);
      const subscriptionData = body as { data?: { status?: string; active?: boolean } };
      expect(subscriptionData.data?.status).toBe("canceled");
      expect(subscriptionData.data?.active).toBe(false);
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should handle incomplete subscription",
    async ({ page }) => {
      const user = await createTestUser();
      await createTestSubscription(user.id, {
        status: "incomplete",
      });

      // Authenticate
      await page.goto("/en/sign-in");
      const emailInput = page.locator("#email");
      const passwordInput = page.locator("#password");
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/editor/, { timeout: 30000 });

      // Get subscription status
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/current",
      );

      expect(status).toBe(200);
      const subscriptionData = body as { data?: { status?: string; active?: boolean } };
      expect(subscriptionData.data?.status).toBe("incomplete");
      expect(subscriptionData.data?.active).toBe(false);
    },
  );
});

