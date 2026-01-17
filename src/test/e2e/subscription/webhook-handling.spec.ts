import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import {
  createCheckoutSessionCompletedEvent,
  createInvoicePaymentSucceededEvent,
  createStripeSignatureHeader,
} from "../helpers/stripe-helper";
import { getSubscriptionByUserId, getSubscriptionBySubscriptionId } from "../helpers/subscription-helper";
import { shouldSkipStripeTest, getStripeSkipReason } from "../helpers/stripe-helper";
import { testEnvConfig } from "../config/test-env.config";

/**
 * E2E tests for Stripe webhook handling.
 * Tests use real webhook signature validation if configured.
 * Zero mocking of internal components.
 */

test.describe("Stripe Webhook Handling", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  (shouldSkipStripeTest() ? test.skip : test)(
    "should handle checkout.session.completed webhook",
    async ({ request }) => {
      const user = await createTestUser();
      const subscriptionId = `sub_test_${Date.now()}`;
      const customerId = `cus_test_${Date.now()}`;

      // Create webhook event
      const webhookEvent = createCheckoutSessionCompletedEvent({
        userId: user.id,
        subscriptionId,
        customerId,
      });

      // Sign webhook
      const signature = createStripeSignatureHeader(
        webhookEvent,
        testEnvConfig.externalServices.stripe.webhookSecret,
      );

      // Send webhook
      const response = await request.post("/api/subscriptions/webhook", {
        headers: {
          "Stripe-Signature": signature,
          "Content-Type": "application/json",
        },
        data: webhookEvent,
      });

      expect(response.status()).toBe(200);

      // Verify subscription was created in database
      const subscription = await getSubscriptionByUserId(user.id);
      expect(subscription).not.toBeNull();
      expect(subscription?.subscriptionId).toBe(subscriptionId);
      expect(subscription?.customerId).toBe(customerId);
      expect(subscription?.status).toBe("active");
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should handle invoice.payment_succeeded webhook",
    async ({ request }) => {
      const user = await createTestUser();
      const subscriptionId = `sub_test_${Date.now()}`;
      const customerId = `cus_test_${Date.now()}`;

      // First create subscription via checkout.session.completed
      const checkoutEvent = createCheckoutSessionCompletedEvent({
        userId: user.id,
        subscriptionId,
        customerId,
      });

      const checkoutSignature = createStripeSignatureHeader(
        checkoutEvent,
        testEnvConfig.externalServices.stripe.webhookSecret,
      );

      await request.post("/api/subscriptions/webhook", {
        headers: {
          "Stripe-Signature": checkoutSignature,
          "Content-Type": "application/json",
        },
        data: checkoutEvent,
      });

      // Now send invoice.payment_succeeded event
      const invoiceEvent = createInvoicePaymentSucceededEvent({
        subscriptionId,
        customerId,
        periodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      });

      const invoiceSignature = createStripeSignatureHeader(
        invoiceEvent,
        testEnvConfig.externalServices.stripe.webhookSecret,
      );

      const response = await request.post("/api/subscriptions/webhook", {
        headers: {
          "Stripe-Signature": invoiceSignature,
          "Content-Type": "application/json",
        },
        data: invoiceEvent,
      });

      expect(response.status()).toBe(200);

      // Verify subscription was updated
      const subscription = await getSubscriptionBySubscriptionId(subscriptionId);
      expect(subscription).not.toBeNull();
      expect(subscription?.currentPeriodEnd).not.toBeNull();
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should reject webhook with invalid signature",
    async ({ request }) => {
      const webhookEvent = createCheckoutSessionCompletedEvent({
        userId: "user_123",
        subscriptionId: "sub_123",
        customerId: "cus_123",
      });

      // Use invalid signature
      const response = await request.post("/api/subscriptions/webhook", {
        headers: {
          "Stripe-Signature": "invalid_signature",
          "Content-Type": "application/json",
        },
        data: webhookEvent,
      });

      expect(response.status()).toBe(400);
    },
  );

  (shouldSkipStripeTest() ? test.skip : test)(
    "should reject webhook without signature",
    async ({ request }) => {
      const webhookEvent = createCheckoutSessionCompletedEvent({
        userId: "user_123",
        subscriptionId: "sub_123",
        customerId: "cus_123",
      });

      // Send without signature
      const response = await request.post("/api/subscriptions/webhook", {
        headers: {
          "Content-Type": "application/json",
        },
        data: webhookEvent,
      });

      expect(response.status()).toBe(400);
    },
  );
});

