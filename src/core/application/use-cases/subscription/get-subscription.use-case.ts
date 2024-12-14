import { Subscription } from "@/core/domain/entities";
import { SubscriptionRepository } from "@/core/domain/repositories";

export interface GetSubscriptionRequest {
  userId: string;
}

export interface GetSubscriptionResponse {
  subscription: Subscription | null;
  active: boolean;
}

export interface IGetSubscriptionUseCase {
  execute(request: GetSubscriptionRequest): Promise<GetSubscriptionResponse>;
}

export class GetSubscriptionUseCase implements IGetSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async execute(
    request: GetSubscriptionRequest
  ): Promise<GetSubscriptionResponse> {
    const { userId } = request;

    const subscription = await this.subscriptionRepository.findByUserId(userId);

    const active = subscription
      ? subscription.isActive() && !subscription.isExpired()
      : false;

    return { subscription, active };
  }
}

