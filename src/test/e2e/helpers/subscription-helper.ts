import { testDb, sqlClient } from "../setup/db-setup";
import { subscriptions } from "@/bootstrap/boundaries/db/schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

/**
 * Subscription helper utilities for E2E tests.
 * Provides functions to create and query subscription test data.
 */

type SubscriptionInsert = InferInsertModel<typeof subscriptions>;
type SubscriptionSelect = InferSelectModel<typeof subscriptions>;

export interface TestSubscription {
  id: string;
  userId: string;
  subscriptionId: string;
  customerId: string;
  priceId: string;
  status: string;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a test subscription in the database.
 */
export async function createTestSubscription(
  userId: string,
  overrides?: Partial<SubscriptionInsert>,
): Promise<TestSubscription> {
  const subscriptionId = overrides?.subscriptionId || `sub_test_${Date.now()}`;
  const customerId = overrides?.customerId || `cus_test_${Date.now()}`;
  const priceId = overrides?.priceId || "price_test_123";

  const subscriptionData: SubscriptionInsert = {
    id: overrides?.id || crypto.randomUUID(),
    userId,
    subscriptionId,
    customerId,
    priceId,
    status: overrides?.status || "active",
    currentPeriodEnd: overrides?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };

  // Prefer raw SQL via sqlClient to avoid Drizzle/neon HTTP visibility issues
  try {
    await sqlClient.unsafe(
      `INSERT INTO "subscription"
        ("id", "userId", "subscriptionId", "customerId", "priceId", "status", "currentPeriodEnd", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        subscriptionData.id,
        subscriptionData.userId,
        subscriptionData.subscriptionId,
        subscriptionData.customerId,
        subscriptionData.priceId,
        subscriptionData.status,
        subscriptionData.currentPeriodEnd,
        subscriptionData.createdAt,
        subscriptionData.updatedAt,
      ],
    );
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to create subscription: ${msg}`);
  }

  return {
    id: subscriptionData.id,
    userId: subscriptionData.userId,
    subscriptionId: subscriptionData.subscriptionId,
    customerId: subscriptionData.customerId,
    priceId: subscriptionData.priceId,
    status: subscriptionData.status,
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    createdAt: subscriptionData.createdAt,
    updatedAt: subscriptionData.updatedAt,
  };
}

/**
 * Get subscription by user ID.
 */
export async function getSubscriptionByUserId(userId: string): Promise<TestSubscription | null> {
  try {
    const result = await sqlClient.unsafe(
      `SELECT "id", "userId", "subscriptionId", "customerId", "priceId", "status",
              "currentPeriodEnd", "createdAt", "updatedAt"
       FROM "subscription"
       WHERE "userId" = $1
       LIMIT 1`,
      [userId],
    );

    const rows = Array.isArray(result) ? result : result ? [result] : [];
    if (rows.length === 0) {
      return null;
    }

    const subscription = rows[0] as any;
    return {
      id: subscription.id,
      userId: subscription.userId,
      subscriptionId: subscription.subscriptionId,
      customerId: subscription.customerId,
      priceId: subscription.priceId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to get subscription by userId: ${msg}`);
  }
}

/**
 * Get subscription by subscription ID (Stripe subscription ID).
 */
export async function getSubscriptionBySubscriptionId(
  subscriptionId: string,
): Promise<TestSubscription | null> {
  try {
    const result = await sqlClient.unsafe(
      `SELECT "id", "userId", "subscriptionId", "customerId", "priceId", "status",
              "currentPeriodEnd", "createdAt", "updatedAt"
       FROM "subscription"
       WHERE "subscriptionId" = $1
       LIMIT 1`,
      [subscriptionId],
    );

    const rows = Array.isArray(result) ? result : result ? [result] : [];
    if (rows.length === 0) {
      return null;
    }

    const subscription = rows[0] as any;
    return {
      id: subscription.id,
      userId: subscription.userId,
      subscriptionId: subscription.subscriptionId,
      customerId: subscription.customerId,
      priceId: subscription.priceId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to get subscription by subscriptionId: ${msg}`);
  }
}

/**
 * Update subscription status.
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  currentPeriodEnd?: Date,
): Promise<void> {
  try {
    await sqlClient.unsafe(
      `UPDATE "subscription"
       SET "status" = $1,
           "currentPeriodEnd" = $2,
           "updatedAt" = $3
       WHERE "subscriptionId" = $4`,
      [status, currentPeriodEnd ?? null, new Date(), subscriptionId],
    );
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to update subscription status: ${msg}`);
  }
}

/**
 * Delete subscription by user ID.
 */
export async function deleteSubscriptionByUserId(userId: string): Promise<void> {
  try {
    await sqlClient.unsafe(
      `DELETE FROM "subscription" WHERE "userId" = $1`,
      [userId],
    );
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`Failed to delete subscription by userId: ${msg}`);
  }
}

/**
 * Check if subscription is active.
 */
export function isSubscriptionActive(subscription: TestSubscription): boolean {
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return false;
  }

  if (subscription.currentPeriodEnd) {
    return subscription.currentPeriodEnd > new Date();
  }

  return true;
}

