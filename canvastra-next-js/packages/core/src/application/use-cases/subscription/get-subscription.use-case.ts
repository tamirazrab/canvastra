import type { Subscription } from "../../domain/entities";
import type { SubscriptionRepository } from "../../domain/repositories";

export interface GetSubscriptionRequest {
	userId: string;
}

export interface GetSubscriptionResponse {
	subscription: Subscription | null;
	isActive: boolean;
}

export interface IGetSubscriptionUseCase {
	execute(request: GetSubscriptionRequest): Promise<GetSubscriptionResponse>;
}

export class GetSubscriptionUseCase implements IGetSubscriptionUseCase {
	constructor(
		private readonly subscriptionRepository: SubscriptionRepository,
	) {}

	async execute(
		request: GetSubscriptionRequest,
	): Promise<GetSubscriptionResponse> {
		const { userId } = request;

		const subscription = await this.subscriptionRepository.findByUserId(userId);

		if (!subscription) {
			return { subscription: null, isActive: false };
		}

		// Check if subscription is active (considering grace period)
		const DAY_IN_MS = 86_400_000;
		let isActive = false;

		if (subscription.currentPeriodEnd) {
			// Active if current period end + 1 day is in the future
			isActive =
				subscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();
		}

		// Also check status
		isActive = isActive && subscription.isActive();

		return { subscription, isActive };
	}
}
