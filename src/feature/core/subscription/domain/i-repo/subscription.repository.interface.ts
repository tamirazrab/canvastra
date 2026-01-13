import ApiTask from "@/feature/common/data/api-task";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";

export default interface SubscriptionRepository {
  getByUserId(userId: string): ApiTask<Subscription | null>;

  getBySubscriptionId(subscriptionId: string): ApiTask<Subscription | null>;

  create(params: {
    userId: string;
    subscriptionId: string;
    customerId: string;
    priceId: string;
    status: string;
    currentPeriodEnd?: Date;
  }): ApiTask<Subscription>;

  update(params: {
    id: string;
    status?: string;
    currentPeriodEnd?: Date;
  }): ApiTask<Subscription>;
}

export const subscriptionRepoKey = "subscriptionRepoKey";
