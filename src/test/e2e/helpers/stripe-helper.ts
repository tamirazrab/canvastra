import { testEnvConfig } from "../config/test-env.config";
import { isExternalServiceAvailable, shouldSkipTestForService } from "../config/external-services.config";
import crypto from "crypto";

/**
 * Stripe webhook helper utilities for E2E tests.
 * Provides functions to simulate Stripe webhook events.
 */

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

/**
 * Create a Stripe webhook event payload.
 */
export function createStripeWebhookEvent(
  eventType: string,
  data: Record<string, unknown>,
): StripeWebhookEvent {
  return {
    id: `evt_test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: eventType,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
  };
}

/**
 * Create a checkout.session.completed webhook event.
 */
export function createCheckoutSessionCompletedEvent(params: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  priceId?: string;
}): StripeWebhookEvent {
  return createStripeWebhookEvent("checkout.session.completed", {
    id: `cs_test_${Date.now()}`,
    object: "checkout.session",
    mode: "subscription",
    subscription: params.subscriptionId,
    customer: params.customerId,
    metadata: {
      userId: params.userId,
    },
    payment_status: "paid",
  });
}

/**
 * Create an invoice.payment_succeeded webhook event.
 */
export function createInvoicePaymentSucceededEvent(params: {
  subscriptionId: string;
  customerId: string;
  amountPaid?: number;
  periodEnd?: number;
}): StripeWebhookEvent {
  const periodEnd = params.periodEnd || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

  return createStripeWebhookEvent("invoice.payment_succeeded", {
    id: `in_test_${Date.now()}`,
    object: "invoice",
    subscription: params.subscriptionId,
    customer: params.customerId,
    amount_paid: params.amountPaid || 1000,
    period_end: periodEnd,
    status: "paid",
  });
}

/**
 * Sign a Stripe webhook event with the webhook secret.
 * This creates a valid Stripe signature header.
 */
export function signStripeWebhook(
  payload: StripeWebhookEvent | string,
  secret?: string,
): string {
  const webhookSecret = secret || testEnvConfig.externalServices.stripe.webhookSecret || "";
  
  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Cannot sign webhook events.",
    );
  }

  const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payloadString}`;
  const signature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  return `t=${timestamp},v1=${signature}`;
}

/**
 * Create a Stripe signature header for webhook requests.
 */
export function createStripeSignatureHeader(
  payload: StripeWebhookEvent | string,
  secret?: string,
): string {
  return signStripeWebhook(payload, secret);
}

/**
 * Check if Stripe is available for testing.
 */
export function isStripeAvailable(): boolean {
  return isExternalServiceAvailable("stripe");
}

/**
 * Check if test should be skipped due to unavailable Stripe.
 */
export function shouldSkipStripeTest(): boolean {
  return shouldSkipTestForService("stripe");
}

/**
 * Get skip reason for Stripe tests.
 */
export function getStripeSkipReason(): string {
  return `Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables.`;
}

/**
 * Create a mock Stripe subscription object for testing.
 */
export function createMockStripeSubscription(params: {
  id: string;
  customerId: string;
  status?: string;
  priceId?: string;
  currentPeriodEnd?: number;
}): Record<string, unknown> {
  const periodEnd = params.currentPeriodEnd || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  return {
    id: params.id,
    object: "subscription",
    customer: params.customerId,
    status: params.status || "active",
    current_period_end: periodEnd,
    items: {
      data: [
        {
          price: {
            id: params.priceId || "price_test_123",
          },
        },
      ],
    },
  };
}

