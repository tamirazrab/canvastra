import Stripe from "stripe";
import {
  PaymentService,
  CreateCheckoutSessionParams,
  SubscriptionData,
  WebhookEvent,
} from "@/core/domain/services";

export class StripeService implements PaymentService {
  private readonly client: Stripe;

  constructor() {
    this.client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
  }

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
    const session = await this.client.checkout.sessions.create({
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: params.customerEmail,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: params.userId,
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return session.url;
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<string> {
    const session = await this.client.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    if (!session.url) {
      throw new Error("Failed to create billing portal session");
    }

    return session.url;
  }

  async retrieveSubscription(subscriptionId: string): Promise<SubscriptionData> {
    const subscription = await this.client.subscriptions.retrieve(subscriptionId);
    return {
      id: subscription.id,
      customer: subscription.customer as string,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      items: {
        data: subscription.items.data.map((item) => ({
          price: {
            product: item.price.product as string,
          },
        })),
      },
    };
  }

  verifyWebhook(body: string, signature: string, secret: string): WebhookEvent {
    const event = this.client.webhooks.constructEvent(body, signature, secret);
    const session = event.data.object as Stripe.Checkout.Session;
    return {
      type: event.type,
      data: {
        object: {
          subscription: session.subscription as string | undefined,
          metadata: session.metadata ? {
            userId: session.metadata.userId,
          } : undefined,
        },
      },
    };
  }
}

