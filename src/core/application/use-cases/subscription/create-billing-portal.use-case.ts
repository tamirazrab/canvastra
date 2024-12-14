import { PaymentService } from "@/core/domain/services";
import { SubscriptionRepository } from "@/core/domain/repositories";

export interface CreateBillingPortalRequest {
  userId: string;
  appUrl: string;
}

export interface CreateBillingPortalResponse {
  portalUrl: string;
}

export interface ICreateBillingPortalUseCase {
  execute(
    request: CreateBillingPortalRequest
  ): Promise<CreateBillingPortalResponse>;
}

export class CreateBillingPortalUseCase
  implements ICreateBillingPortalUseCase
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentService: PaymentService
  ) {}

  async execute(
    request: CreateBillingPortalRequest
  ): Promise<CreateBillingPortalResponse> {
    const { userId, appUrl } = request;

    const subscription =
      await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      throw new Error("No subscription found");
    }

    const portalUrl = await this.paymentService.createBillingPortalSession(
      subscription.customerId,
      appUrl
    );

    return { portalUrl };
  }
}

