import type { SubscriptionRepository } from "../../domain/repositories";
import type { BillingService } from "../../domain/services/billing.service";

export interface CreateBillingPortalSessionRequest {
	userId: string;
}

export interface CreateBillingPortalSessionResponse {
	url: string;
}

export interface ICreateBillingPortalSessionUseCase {
	execute(
		request: CreateBillingPortalSessionRequest,
	): Promise<CreateBillingPortalSessionResponse>;
}

export class CreateBillingPortalSessionUseCase
	implements ICreateBillingPortalSessionUseCase
{
	constructor(
		private readonly subscriptionRepository: SubscriptionRepository,
		private readonly billingService: BillingService,
	) {}

	async execute(
		request: CreateBillingPortalSessionRequest,
	): Promise<CreateBillingPortalSessionResponse> {
		const { userId } = request;

		const subscription = await this.subscriptionRepository.findByUserId(userId);

		if (!subscription) {
			throw new Error("No subscription found");
		}

		const url = await this.billingService.createBillingPortalSession(
			subscription.customerId,
		);

		return { url };
	}
}
