import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { subscriptionModuleKey } from "@/feature/core/subscription/data/subscription-module-key";
import StripeService, {
  stripeServiceKey,
} from "@/feature/core/subscription/domain/i-service/stripe.service.interface";
import { env } from "@/bootstrap/configs/env";

/**
 * Creates a Stripe checkout session for subscription
 * 
 * Domain usecase - orchestrates subscription checkout creation
 */
export default async function createCheckoutSessionUseCase(
  userId: string,
  email?: string,
): Promise<ApiEither<string>> {
  const stripeService = diResolve<StripeService>(
    subscriptionModuleKey,
    stripeServiceKey,
  );

  return stripeService.createCheckoutSession({
    userId,
    email,
    successUrl: `${env.NEXT_PUBLIC_APP_URL}?success=1`,
    cancelUrl: `${env.NEXT_PUBLIC_APP_URL}?canceled=1`,
    priceId: env.STRIPE_PRICE_ID || "",
  })();
}
