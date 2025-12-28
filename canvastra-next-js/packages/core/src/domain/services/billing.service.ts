import type Stripe from "stripe";

export interface BillingService {
	createCheckoutSession(userId: string, email?: string): Promise<string>;
	createBillingPortalSession(customerId: string): Promise<string>;
	verifyWebhook(body: string, signature: string, secret: string): Stripe.Event;
	retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
}
