import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";
import { assertSuccessResponse } from "../utils/fp-ts-assertions";
import { shouldSkipStripeTest, getStripeSkipReason } from "../helpers/stripe-helper";
import { testEnvConfig } from "../config/test-env.config";

/**
 * E2E tests for subscription checkout flow.
 * Tests use real Stripe test mode if configured.
 * Zero mocking of internal components.
 */

test.describe("Subscription Checkout Flow", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test.skip(shouldSkipStripeTest(), getStripeSkipReason())(
    "should create checkout session",
    async ({ page }) => {
      const user = await createTestUser();

      // Authenticate
      await page.goto("/en/sign-in");
      const emailInput = page.locator("#email");
      const passwordInput = page.locator("#password");
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/editor/, { timeout: 30000 });

      // Create checkout session
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/checkout",
        {
          method: "POST",
        },
      );

      expect(status).toBe(200);
      const checkoutUrl = assertSuccessResponse<string>(status, body, (data) => typeof data === "string");
      expect(checkoutUrl).toContain("checkout.stripe.com");
    },
  );

  test.skip(shouldSkipStripeTest(), getStripeSkipReason())(
    "should require authentication for checkout",
    async ({ request }) => {
      // Try to create checkout session without authentication
      const { status, body } = await request.post("/api/subscriptions/checkout");

      expect(status).toBe(401);
      expect(body).toHaveProperty("error");
    },
  );

  test.skip(shouldSkipStripeTest(), getStripeSkipReason())(
    "should create checkout session with user email",
    async ({ page }) => {
      const user = await createTestUser({ email: `test-${Date.now()}@example.com` });

      // Authenticate
      await page.goto("/en/sign-in");
      const emailInput = page.locator("#email");
      const passwordInput = page.locator("#password");
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/editor/, { timeout: 30000 });

      // Create checkout session
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/checkout",
        {
          method: "POST",
        },
      );

      expect(status).toBe(200);
      const checkoutUrl = assertSuccessResponse<string>(status, body, (data) => typeof data === "string");
      expect(checkoutUrl).toContain("checkout.stripe.com");
    },
  );
});

