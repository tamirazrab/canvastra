"use server";

import { isLeft } from "fp-ts/lib/Either";
import getSubscriptionController from "@/app/[lang]/subscription/controller/get-subscription.controller";
import { requireUserId } from "@/bootstrap/helpers/auth-utils";
import Subscription from "@/feature/core/subscription/domain/entity/subscription.entity";

export type SubscriptionActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Server action to get current user's subscription.
 * Handles authentication and ApiEither response.
 */
export async function getSubscriptionAction(
  lang: string = "en",
): Promise<SubscriptionActionResult<Subscription | null>> {
  try {
    const userId = await requireUserId(lang);
    const result = await getSubscriptionController(userId);

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to fetch subscription",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch subscription",
    };
  }
}
