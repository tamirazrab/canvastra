import { Subscription } from "../entities";

export interface SubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findBySubscriptionId(subscriptionId: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<Subscription>;
  create(subscriptionData: {
    userId: string;
    subscriptionId: string;
    customerId: string;
    priceId: string;
    status: string;
    currentPeriodEnd?: Date | null;
  }): Promise<Subscription>;
  update(subscription: Subscription): Promise<Subscription>;
}

