import ApiTask from "@/feature/common/data/api-task";
import BaseFailure from "@/feature/common/failures/base.failure";

/**
 * Stripe service interface for subscription operations
 * 
 * Domain layer interface - no Stripe-specific types exposed
 * Uses TaskEither for consistent error handling
 */
export default interface StripeService {
  /**
   * Creates a checkout session for subscription
   */
  createCheckoutSession(params: {
    userId: string;
    email?: string;
    successUrl: string;
    cancelUrl: string;
    priceId: string;
  }): ApiTask<string>;

  /**
   * Creates a billing portal session
   */
  createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }): ApiTask<string>;

  /**
   * Retrieves a subscription by ID
   */
  retrieveSubscription(subscriptionId: string): ApiTask<{
    id: string;
    customerId: string;
    status: string;
    priceId: string;
    currentPeriodEnd: Date | null;
  }>;

  /**
   * Extracts subscription ID from invoice event
   */
  extractSubscriptionIdFromInvoice(invoice: unknown): string | null;
}

export const stripeServiceKey = "stripeServiceKey";

