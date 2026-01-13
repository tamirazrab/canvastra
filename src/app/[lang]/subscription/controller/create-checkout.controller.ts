import { ApiEither } from "@/feature/common/data/api-task";
import createCheckoutSessionUseCase from "@/feature/core/subscription/domain/usecase/create-checkout-session.usecase";

/**
 * Controller for creating checkout session.
 * Called from Hono routes (not Server Actions).
 * 
 * Note: This is a thin wrapper. Consider calling usecase directly from API route.
 */
export default async function createCheckoutController(
  userId: string,
  email?: string,
): Promise<ApiEither<string>> {
  return createCheckoutSessionUseCase(userId, email);
}
