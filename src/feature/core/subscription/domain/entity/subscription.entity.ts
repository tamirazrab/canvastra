export type SubscriptionParams = {
  id: string;
  userId: string;
  subscriptionId: string;
  customerId: string;
  priceId: string;
  status: string;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export default class Subscription {
  readonly id: string;

  readonly userId: string;

  readonly subscriptionId: string;

  readonly customerId: string;

  readonly priceId: string;

  readonly status: string;

  readonly currentPeriodEnd?: Date;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  constructor(params: SubscriptionParams) {
    this.id = params.id;
    this.userId = params.userId;
    this.subscriptionId = params.subscriptionId;
    this.customerId = params.customerId;
    this.priceId = params.priceId;
    this.status = params.status;
    this.currentPeriodEnd = params.currentPeriodEnd;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): SubscriptionParams {
    return {
      id: this.id,
      userId: this.userId,
      subscriptionId: this.subscriptionId,
      customerId: this.customerId,
      priceId: this.priceId,
      status: this.status,
      currentPeriodEnd: this.currentPeriodEnd,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  isActive(): boolean {
    return this.status === "active" || this.status === "trialing";
  }
}
