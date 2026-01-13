import { ApiEither } from "@/feature/common/data/api-task";
import createBillingPortalUseCase from "@/feature/core/subscription/domain/usecase/create-billing-portal.usecase";

/**
 * Controller for creating billing portal session.
 * Called from Hono routes (not Server Actions).
 * 
 * Note: This is a thin wrapper. Consider calling usecase directly from API route.
 */
export default async function createBillingController(
  customerId: string,
): Promise<ApiEither<string>> {
  return createBillingPortalUseCase(customerId);
}
