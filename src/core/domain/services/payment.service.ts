export interface CreateCheckoutSessionParams {
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  userId: string;
  priceId: string;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: {
      subscription?: string;
      metadata?: {
        userId?: string;
      };
    };
  };
}

export interface SubscriptionData {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
  items: {
    data: Array<{
      price: {
        product: string;
      };
    }>;
  };
}

export interface PaymentService {
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string>;
  createBillingPortalSession(customerId: string, returnUrl: string): Promise<string>;
  retrieveSubscription(subscriptionId: string): Promise<SubscriptionData>;
  verifyWebhook(body: string, signature: string, secret: string): WebhookEvent;
}

