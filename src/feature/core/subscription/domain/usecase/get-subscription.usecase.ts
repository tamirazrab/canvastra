import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { subscriptionModuleKey } from "@/feature/core/subscription/data/subscription-module-key";
import SubscriptionRepository, {
  subscriptionRepoKey,
} from "@/feature/core/subscription/domain/i-repo/subscription.repository.interface";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";

export default async function getSubscriptionUseCase(
  userId: string,
): Promise<ApiEither<Subscription | null>> {
  const repo = diResolve<SubscriptionRepository>(
    subscriptionModuleKey,
    subscriptionRepoKey,
  );

  return repo.getByUserId(userId)();
}
