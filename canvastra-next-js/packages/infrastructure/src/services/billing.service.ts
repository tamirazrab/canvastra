import type { BillingService } from "@canvastra-next-js/core/domain/services/billing.service";
import type Stripe from "stripe";
import { stripe } from "./stripe";

export class StripeBillingService implements BillingService {
	async createCheckoutSession(userId: string, email?: string): Promise<string> {
		const session = await stripe.checkout.sessions.create({
			success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL}?success=1`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL}?canceled=1`,
			payment_method_types: ["card", "paypal"],
			mode: "subscription",
			billing_address_collection: "auto",
			customer_email: email,
			line_items: [
				{
					price: process.env.STRIPE_PRICE_ID!,
					quantity: 1,
				},
			],
			metadata: {
				userId,
			},
		});

		if (!session.url) {
			throw new Error("Failed to create checkout session");
		}

		return session.url;
	}

	async createBillingPortalSession(customerId: string): Promise<string> {
		const session = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.CLIENT_URL}`,
		});

		if (!session.url) {
			throw new Error("Failed to create billing portal session");
		}

		return session.url;
	}

	verifyWebhook(body: string, signature: string, secret: string): Stripe.Event {
		return stripe.webhooks.constructEvent(body, signature, secret);
	}

	async retrieveSubscription(
		subscriptionId: string,
	): Promise<Stripe.Subscription> {
		return await stripe.subscriptions.retrieve(subscriptionId);
	}
}
