import ResponseFailure from "@/feature/common/failures/dev/response.failure";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";
import { subscriptions } from "@/bootstrap/boundaries/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type SubscriptionDbResponse = InferSelectModel<typeof subscriptions>;

export default class SubscriptionMapper {
  static mapToEntity(dbSubscription: SubscriptionDbResponse): Subscription {
    try {
      return new Subscription({
        id: dbSubscription.id,
        userId: dbSubscription.userId,
        subscriptionId: dbSubscription.subscriptionId,
        customerId: dbSubscription.customerId,
        priceId: dbSubscription.priceId,
        status: dbSubscription.status,
        currentPeriodEnd: dbSubscription.currentPeriodEnd ?? undefined,
        createdAt: dbSubscription.createdAt,
        updatedAt: dbSubscription.updatedAt,
      });
    } catch (e) {
      throw new ResponseFailure(e);
    }
  }
}
