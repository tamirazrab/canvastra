import Stripe from "stripe";
import ApiTask from "@/feature/common/data/api-task";
import { wrapAsync } from "@/feature/common/fp-ts-helpers";
import BaseFailure from "@/feature/common/failures/base.failure";
import NetworkFailure from "@/feature/common/failures/network.failure";
import StripeService from "@/feature/core/subscription/domain/i-service/stripe.service.interface";
import { pipe } from "fp-ts/lib/function";
import { chain, left, right } from "fp-ts/lib/TaskEither";

/**
 * Stripe service implementation
 * 
 * Infrastructure layer - handles all Stripe API interactions
 * Uses TaskEither for consistent error handling
 */
export default class StripeServiceImpl implements StripeService {
  private stripe: Stripe;

  constructor(
    secretKey: string,
    apiVersion: string = "2025-12-15.clover",
  ) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: apiVersion as Stripe.LatestApiVersion,
      typescript: true,
    });
  }

  createCheckoutSession(params: {
    userId: string;
    email?: string;
    successUrl: string;
    cancelUrl: string;
    priceId: string;
  }): ApiTask<string> {
    return pipe(
      wrapAsync(
        async () => {
          const session = await this.stripe.checkout.sessions.create({
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            payment_method_types: ["card", "paypal"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: params.email || "",
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

          return session;
        },
        (error) => new NetworkFailure(error as Error),
      ),
      chain((session) =>
        session.url
          ? right(session.url)
          : left(new BaseFailure("Session created but no URL returned", "stripe")),
      ),
    );
  }

  createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): ApiTask<string> {
    return pipe(
      wrapAsync(
        async () => {
          const session = await this.stripe.billingPortal.sessions.create({
            customer: params.customerId,
            return_url: params.returnUrl,
          });

          return session;
        },
        (error) => new NetworkFailure(error as Error),
      ),
      chain((session) =>
        session.url
          ? right(session.url)
          : left(new BaseFailure("Billing portal session created but no URL returned", "stripe")),
      ),
    );
  }

  retrieveSubscription(subscriptionId: string): ApiTask<{
    id: string;
    customerId: string;
    status: string;
    priceId: string;
    currentPeriodEnd: Date | null;
  }> {
    return wrapAsync(
      async () => {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

        return {
          id: subscription.id,
          customerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id || "",
          currentPeriodEnd:
            subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
        };
      },
      (error) => new NetworkFailure(error as Error),
    );
  }

  extractSubscriptionIdFromInvoice(invoice: unknown): string | null {
    const stripeInvoice = invoice as Stripe.Invoice;

    if (!stripeInvoice.subscription) {
      return null;
    }

    if (typeof stripeInvoice.subscription === "string") {
      return stripeInvoice.subscription;
    }

    return stripeInvoice.subscription.id || null;
  }
}

