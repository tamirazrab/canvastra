import type { BillingService } from "../../domain/services/billing.service";

export interface CreateCheckoutSessionRequest {
  userId: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}

export interface ICreateCheckoutSessionUseCase {
  execute(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse>;
}

export class CreateCheckoutSessionUseCase implements ICreateCheckoutSessionUseCase {
  constructor(private readonly billingService: BillingService) { }

  async execute(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    const { userId } = request;

    const url = await this.billingService.createCheckoutSession(userId);

    return { url };
  }
}
