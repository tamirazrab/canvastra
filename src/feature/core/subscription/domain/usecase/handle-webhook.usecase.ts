import Stripe from "stripe";
import { diResolve } from "@/feature/common/features.di";
import { isLeft, isRight } from "@/feature/common/fp-ts-helpers";
import { subscriptionModuleKey } from "@/feature/core/subscription/data/subscription-module-key";
import SubscriptionRepository, {
  subscriptionRepoKey,
} from "@/feature/core/subscription/domain/i-repo/subscription.repository.interface";
import StripeService, {
  stripeServiceKey,
} from "@/feature/core/subscription/domain/i-service/stripe.service.interface";
import { pipe } from "fp-ts/lib/function";
import { chain } from "fp-ts/lib/TaskEither";

/**
 * Handles Stripe webhook events for subscription management
 * 
 * Domain usecase - processes webhook events and updates subscription state
 */
export default async function handleWebhookUseCase(
  event: Stripe.Event,
): Promise<void> {
  const repo = diResolve<SubscriptionRepository>(
    subscriptionModuleKey,
    subscriptionRepoKey,
  );
  const stripeService = diResolve<StripeService>(
    subscriptionModuleKey,
    stripeServiceKey,
  );

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event, repo, stripeService);
  } else if (event.type === "invoice.payment_succeeded") {
    await handlePaymentSucceeded(event, repo, stripeService);
  }
}

/**
 * Handles checkout.session.completed event
 * Creates a new subscription record in the database
 */
async function handleCheckoutCompleted(
  event: Stripe.Event,
  repo: SubscriptionRepository,
  stripeService: StripeService,
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.metadata?.userId || !session.subscription) {
    throw new Error("Invalid session metadata: missing userId or subscription");
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const subscriptionResult = await stripeService.retrieveSubscription(subscriptionId)();

  if (isLeft(subscriptionResult)) {
    throw new Error(`Failed to retrieve subscription: ${subscriptionResult.left.message}`);
  }

  const subscription = subscriptionResult.right;
  const createResult = await repo.create({
    userId: session.metadata.userId,
    subscriptionId: subscription.id,
    customerId: subscription.customerId,
    priceId: subscription.priceId,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd || undefined,
  })();

  if (isLeft(createResult)) {
    throw new Error(`Failed to create subscription: ${createResult.left.message}`);
  }
}

/**
 * Handles invoice.payment_succeeded event
 * Updates existing subscription record with new period end
 */
async function handlePaymentSucceeded(
  event: Stripe.Event,
  repo: SubscriptionRepository,
  stripeService: StripeService,
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = stripeService.extractSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) {
    return;
  }

  const subscriptionResult = await stripeService.retrieveSubscription(subscriptionId)();

  if (isLeft(subscriptionResult)) {
    return;
  }

  const subscription = subscriptionResult.right;
  const existingResult = await repo.getBySubscriptionId(subscriptionId)();

  if (isRight(existingResult) && existingResult.right?.id) {
    const updateResult = await repo.update({
      id: existingResult.right.id,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
    })();

    if (isLeft(updateResult)) {
      throw new Error(`Failed to update subscription: ${updateResult.left.message}`);
    }
  }
}
