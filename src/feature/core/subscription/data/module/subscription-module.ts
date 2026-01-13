import SubscriptionRepositoryImpl from "@/feature/core/subscription/data/repository/subscription.repository";
import { subscriptionRepoKey } from "@/feature/core/subscription/domain/i-repo/subscription.repository.interface";
import StripeServiceImpl from "@/feature/core/subscription/data/service/stripe.service";
import { stripeServiceKey } from "@/feature/core/subscription/domain/i-service/stripe.service.interface";
import { DependencyContainer } from "tsyringe";
import { env } from "@/bootstrap/configs/env";

export default function subscriptionModule(
  di: DependencyContainer,
): DependencyContainer {
  di.register(subscriptionRepoKey, SubscriptionRepositoryImpl);
  
  // Register Stripe service with configuration from environment
  di.register(stripeServiceKey, {
    useFactory: () => {
      return new StripeServiceImpl(
        env.STRIPE_SECRET_KEY,
        "2025-12-15.clover",
      );
    },
  });

  return di;
}
