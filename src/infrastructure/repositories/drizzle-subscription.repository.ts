import { eq } from "drizzle-orm";
import { Subscription } from "@/core/domain/entities";
import { SubscriptionRepository } from "@/core/domain/repositories";
import { db } from "@/infrastructure/db/drizzle";
import { subscriptions } from "@/infrastructure/db/schema";

export class DrizzleSubscriptionRepository implements SubscriptionRepository {
  async findById(id: string): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findBySubscriptionId(
    subscriptionId: string
  ): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, subscriptionId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const result = await db
      .insert(subscriptions)
      .values({
        id: subscription.id,
        userId: subscription.userId,
        subscriptionId: subscription.subscriptionId,
        customerId: subscription.customerId,
        priceId: subscription.priceId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      })
      .onConflictDoUpdate({
        target: subscriptions.id,
        set: {
          userId: subscription.userId,
          subscriptionId: subscription.subscriptionId,
          customerId: subscription.customerId,
          priceId: subscription.priceId,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          updatedAt: subscription.updatedAt,
        },
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async create(subscriptionData: {
    userId: string;
    subscriptionId: string;
    customerId: string;
    priceId: string;
    status: string;
    currentPeriodEnd?: Date | null;
  }): Promise<Subscription> {
    const now = new Date();
    const result = await db
      .insert(subscriptions)
      .values({
        userId: subscriptionData.userId,
        subscriptionId: subscriptionData.subscriptionId,
        customerId: subscriptionData.customerId,
        priceId: subscriptionData.priceId,
        status: subscriptionData.status,
        currentPeriodEnd: subscriptionData.currentPeriodEnd ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const result = await db
      .update(subscriptions)
      .set({
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        updatedAt: subscription.updatedAt,
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Subscription with id ${subscription.id} not found`);
    }

    return this.mapToEntity(result[0]);
  }

  private mapToEntity(
    row: typeof subscriptions.$inferSelect
  ): Subscription {
    return new Subscription({
      id: row.id,
      userId: row.userId,
      subscriptionId: row.subscriptionId,
      customerId: row.customerId,
      priceId: row.priceId,
      status: row.status,
      currentPeriodEnd: row.currentPeriodEnd,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

