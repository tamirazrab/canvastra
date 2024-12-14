import { PaymentService } from "@/core/domain/services";

export interface CreateCheckoutRequest {
  userId: string;
  userEmail: string;
  appUrl: string;
  priceId: string;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export interface ICreateCheckoutUseCase {
  execute(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse>;
}

export class CreateCheckoutUseCase implements ICreateCheckoutUseCase {
  constructor(private readonly paymentService: PaymentService) { }

  async execute(
    request: CreateCheckoutRequest
  ): Promise<CreateCheckoutResponse> {
    const { userId, userEmail, appUrl, priceId } = request;

    const checkoutUrl = await this.paymentService.createCheckoutSession({
      successUrl: `${appUrl}?success=1`,
      cancelUrl: `${appUrl}?canceled=1`,
      customerEmail: userEmail,
      userId,
      priceId,
    });

    return { checkoutUrl };
  }
}

