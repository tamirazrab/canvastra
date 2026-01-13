import { testDb } from "../setup/db-setup";
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

  await testDb.insert(subscriptions).values(subscriptionData);

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
  const result = await testDb
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const subscription = result[0];
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
}

/**
 * Get subscription by subscription ID (Stripe subscription ID).
 */
export async function getSubscriptionBySubscriptionId(
  subscriptionId: string,
): Promise<TestSubscription | null> {
  const result = await testDb
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subscriptionId, subscriptionId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const subscription = result[0];
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
}

/**
 * Update subscription status.
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  currentPeriodEnd?: Date,
): Promise<void> {
  await testDb
    .update(subscriptions)
    .set({
      status,
      currentPeriodEnd: currentPeriodEnd || undefined,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.subscriptionId, subscriptionId));
}

/**
 * Delete subscription by user ID.
 */
export async function deleteSubscriptionByUserId(userId: string): Promise<void> {
  await testDb.delete(subscriptions).where(eq(subscriptions.userId, userId));
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

