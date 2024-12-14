import { PaymentService } from "@/core/domain/services";
import { SubscriptionRepository } from "@/core/domain/repositories";

export interface HandleWebhookRequest {
  body: string;
  signature: string;
  webhookSecret: string;
}

export interface HandleWebhookResponse {
  success: boolean;
}

export interface IHandleWebhookUseCase {
  execute(request: HandleWebhookRequest): Promise<HandleWebhookResponse>;
}

export class HandleWebhookUseCase implements IHandleWebhookUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentService: PaymentService
  ) { }

  async execute(
    request: HandleWebhookRequest
  ): Promise<HandleWebhookResponse> {
    const { body, signature, webhookSecret } = request;

    // Verify webhook signature
    let event;
    try {
      event = this.paymentService.verifyWebhook(body, signature, webhookSecret);
    } catch (error) {
      throw new Error("Invalid signature");
    }

    const session = event.data.object;

    if (event.type === "checkout.session.completed") {
      if (!session.subscription) {
        throw new Error("Invalid session");
      }

      const subscription = await this.paymentService.retrieveSubscription(
        session.subscription
      );

      if (!session?.metadata?.userId) {
        throw new Error("Invalid session");
      }

      await this.subscriptionRepository.create({
        userId: session.metadata.userId,
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        priceId: subscription.items.data[0].price.product,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      if (!session.subscription) {
        throw new Error("Invalid session");
      }

      const subscription = await this.paymentService.retrieveSubscription(
        session.subscription
      );

      const existingSubscription =
        await this.subscriptionRepository.findBySubscriptionId(subscription.id);

      if (existingSubscription) {
        const updated = existingSubscription
          .updateStatus(subscription.status)
          .updatePeriodEnd(
            new Date(subscription.current_period_end * 1000)
          );

        await this.subscriptionRepository.update(updated);
      }
    }

    return { success: true };
  }
}

