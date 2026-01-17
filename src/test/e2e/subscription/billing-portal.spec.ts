import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { createTestSubscription } from "../helpers/subscription-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";
import { assertSuccessResponse, assertFailureResponse, FailureAssertions } from "../utils/fp-ts-assertions";
import { shouldSkipStripeTest, getStripeSkipReason } from "../helpers/stripe-helper";

/**
 * E2E tests for billing portal access.
 * Tests use real Stripe test mode if configured.
 * Zero mocking of internal components.
 */

test.describe("Billing Portal", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  (shouldSkipStripeTest() ? test.skip : test)(
    "should create billing portal session for user with subscription",
    async ({ page }) => {
      const user = await createTestUser();
      await createTestSubscription(user.id, {
        customerId: "cus_test_123",
        status: "active",
      });

      // Authenticate
      await page.goto("/en/sign-in");
      const emailInput = page.locator("#email");
      const passwordInput = page.locator("#password");
      await emailInput.fill(user.email);
      await passwordInput.fill(user.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/editor/, { timeout: 30000 });

      // Create billing portal session
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/billing",
        {
          method: "POST",
        },
      );

      expect(status).toBe(200);
      const billingUrl = assertSuccessResponse<string>(status, body, (data) => typeof data === "string");
      expect(billingUrl).toContain("billing.stripe.com");
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should return 404 for user without subscription",
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

      // Try to create billing portal session
      const { status, body } = await authenticatedApiRequest(
        page.request,
        page,
        "/api/subscriptions/billing",
        {
          method: "POST",
        },
      );

      expect(status).toBe(404);
      assertFailureResponse(status, body, FailureAssertions.notFound());
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should require authentication for billing portal",
    async ({ request }) => {
      // Try to create billing portal session without authentication
      const response = await request.post("/api/subscriptions/billing");
      const status = response.status();

      expect(status).toBe(401);
    },
  );
});

