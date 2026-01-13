import { db } from "@/bootstrap/boundaries/db/drizzle";
import { subscriptions } from "@/bootstrap/boundaries/db/schema";
import ApiTask from "@/feature/common/data/api-task";
import { wrapAsync } from "@/feature/common/fp-ts-helpers";
import SubscriptionMapper from "@/feature/core/subscription/data/repository/subscription.mapper";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";
import SubscriptionRepository from "@/feature/core/subscription/domain/i-repo/subscription.repository.interface";
import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/lib/function";
import { chain, right } from "fp-ts/lib/TaskEither";

export default class SubscriptionRepositoryImpl implements SubscriptionRepository {
  getByUserId(userId: string): ApiTask<Subscription | null> {
    return pipe(
      wrapAsync(async () => {
        const [data] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId));

        return data ?? null;
      }),
      chain((subscription) =>
        subscription
          ? right(SubscriptionMapper.mapToEntity(subscription))
          : right(null as Subscription | null),
      ),
    ) as ApiTask<Subscription | null>;
  }

  getBySubscriptionId(subscriptionId: string): ApiTask<Subscription | null> {
    return pipe(
      wrapAsync(async () => {
        const [data] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.subscriptionId, subscriptionId));

        return data ?? null;
      }),
      chain((subscription) =>
        subscription
          ? right(SubscriptionMapper.mapToEntity(subscription))
          : right(null as Subscription | null),
      ),
    ) as ApiTask<Subscription | null>;
  }

  create(params: {
    userId: string;
    subscriptionId: string;
    customerId: string;
    priceId: string;
    status: string;
    currentPeriodEnd?: Date;
  }): ApiTask<Subscription> {
    return pipe(
      wrapAsync(async () => {
        const [data] = await db
          .insert(subscriptions)
          .values({
            userId: params.userId,
            subscriptionId: params.subscriptionId,
            customerId: params.customerId,
            priceId: params.priceId,
            status: params.status,
            currentPeriodEnd: params.currentPeriodEnd,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return data;
      }),
      chain((data) => right(SubscriptionMapper.mapToEntity(data))),
    ) as ApiTask<Subscription>;
  }

  update(params: {
    id: string;
    status?: string;
    currentPeriodEnd?: Date;
  }): ApiTask<Subscription> {
    return pipe(
      wrapAsync(async () => {
        const updateData: Partial<typeof subscriptions.$inferInsert> = {
          updatedAt: new Date(),
        };

        if (params.status !== undefined) updateData.status = params.status;
        if (params.currentPeriodEnd !== undefined)
          updateData.currentPeriodEnd = params.currentPeriodEnd;

        const [data] = await db
          .update(subscriptions)
          .set(updateData)
          .where(eq(subscriptions.id, params.id))
          .returning();

        if (!data) {
          throw new Error("Subscription not found");
        }

        return data;
      }),
      chain((data) => right(SubscriptionMapper.mapToEntity(data))),
    ) as ApiTask<Subscription>;
  }
}
