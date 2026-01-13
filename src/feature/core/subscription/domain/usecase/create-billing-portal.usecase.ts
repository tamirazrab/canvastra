import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { subscriptionModuleKey } from "@/feature/core/subscription/data/subscription-module-key";
import StripeService, {
  stripeServiceKey,
} from "@/feature/core/subscription/domain/i-service/stripe.service.interface";
import { env } from "@/bootstrap/configs/env";

/**
 * Creates a Stripe billing portal session
 * 
 * Domain usecase - orchestrates billing portal access
 */
export default async function createBillingPortalUseCase(
  customerId: string,
): Promise<ApiEither<string>> {
  const stripeService = diResolve<StripeService>(
    subscriptionModuleKey,
    stripeServiceKey,
  );

  return stripeService.createBillingPortalSession({
    customerId,
    returnUrl: env.NEXT_PUBLIC_APP_URL,
  })();
}
