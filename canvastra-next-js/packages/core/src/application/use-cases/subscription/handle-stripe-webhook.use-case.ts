import type Stripe from "stripe";
import type { SubscriptionRepository } from "../../domain/repositories";
import type { BillingService } from "../../domain/services/billing.service";

export interface HandleStripeWebhookRequest {
	body: string;
	signature: string;
	webhookSecret: string;
}

export interface HandleStripeWebhookResponse {
	success: boolean;
}

export interface IHandleStripeWebhookUseCase {
	execute(
		request: HandleStripeWebhookRequest,
	): Promise<HandleStripeWebhookResponse>;
}

export class HandleStripeWebhookUseCase implements IHandleStripeWebhookUseCase {
	constructor(
		private readonly subscriptionRepository: SubscriptionRepository,
		private readonly billingService: BillingService,
	) {}

	async execute(
		request: HandleStripeWebhookRequest,
	): Promise<HandleStripeWebhookResponse> {
		const { body, signature, webhookSecret } = request;

		// Verify webhook signature
		let event: Stripe.Event;
		try {
			event = this.billingService.verifyWebhook(body, signature, webhookSecret);
		} catch (error) {
			throw new Error("Invalid signature");
		}

		const session = event.data.object as Stripe.Checkout.Session;

		if (event.type === "checkout.session.completed") {
			if (!session.subscription) {
				throw new Error("Invalid session");
			}

			const subscription = await this.billingService.retrieveSubscription(
				session.subscription as string,
			);

			if (!session?.metadata?.userId) {
				throw new Error("Invalid session");
			}

			// Check if subscription already exists
			const existing = await this.subscriptionRepository.findBySubscriptionId(
				subscription.id,
			);

			if (!existing) {
				await this.subscriptionRepository.create({
					userId: session.metadata.userId,
					subscriptionId: subscription.id,
					customerId: subscription.customer as string,
					priceId: subscription.items.data[0].price.product as string,
					status: subscription.status,
					currentPeriodEnd: new Date(subscription.current_period_end * 1000),
				});
			}
		}

		if (event.type === "invoice.payment_succeeded") {
			if (!session.subscription) {
				throw new Error("Invalid session");
			}

			const subscription = await this.billingService.retrieveSubscription(
				session.subscription as string,
			);

			const existing = await this.subscriptionRepository.findBySubscriptionId(
				subscription.id,
			);

			if (existing) {
				const updated = existing
					.updateStatus(subscription.status)
					.updatePeriodEnd(new Date(subscription.current_period_end * 1000));

				await this.subscriptionRepository.update(updated);
			}
		}

		return { success: true };
	}
}
