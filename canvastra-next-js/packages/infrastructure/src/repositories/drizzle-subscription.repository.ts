import type { Subscription } from "@canvastra-next-js/core/domain/entities";
import { Subscription as SubscriptionEntity } from "@canvastra-next-js/core/domain/entities";
import type { SubscriptionRepository } from "@canvastra-next-js/core/domain/repositories";
import { db } from "@canvastra-next-js/db";
import { subscription as subscriptionTable } from "@canvastra-next-js/db/schema/canvastra";
import { eq } from "drizzle-orm";

export class DrizzleSubscriptionRepository implements SubscriptionRepository {
  async findById(id: string): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, id))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, userId))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findBySubscriptionId(
    subscriptionId: string,
  ): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.subscriptionId, subscriptionId))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const result = await db
      .insert(subscriptionTable)
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
        target: subscriptionTable.id,
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
      .insert(subscriptionTable)
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
      .update(subscriptionTable)
      .set({
        userId: subscription.userId,
        subscriptionId: subscription.subscriptionId,
        customerId: subscription.customerId,
        priceId: subscription.priceId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        updatedAt: subscription.updatedAt,
      })
      .where(eq(subscriptionTable.id, subscription.id))
      .returning();

    if (result.length === 0 || !result[0]) {
      throw new Error(`Subscription with id ${subscription.id} not found`);
    }

    return this.mapToEntity(result[0]);
  }

  private mapToEntity(
    row: typeof subscriptionTable.$inferSelect,
  ): Subscription {
    return new SubscriptionEntity({
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
