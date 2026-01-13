import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";

const DAY_IN_MS = 86_400_000;

export default function checkIsActiveUseCase(
  subscription: Subscription | null,
): boolean {
  if (!subscription || !subscription.currentPeriodEnd) {
    return false;
  }

  return subscription.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();
}
