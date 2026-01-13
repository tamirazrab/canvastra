import { ApiEither } from "@/feature/common/data/api-task";
import getSubscriptionUseCase from "@/feature/core/subscription/domain/usecase/get-subscription.usecase";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";

/**
 * Controller for getting subscription.
 * Called from Hono routes (not Server Actions).
 */
export default async function getSubscriptionController(
  userId: string,
): Promise<ApiEither<Subscription | null>> {
  return getSubscriptionUseCase(userId);
}
