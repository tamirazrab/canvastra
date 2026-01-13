"use server";

import { isLeft } from "fp-ts/lib/Either";
import removeBackgroundController from "@/feature/core/editor/application/controller/remove-background.controller";

export type RemoveBackgroundActionResult =
  | { success: true; data: string }
  | { success: false; error: string };

/**
 * Server action to remove background from an image using AI.
 * Handles ApiEither response and returns user-friendly result.
 */
export async function removeBackgroundAction(
  image: string,
): Promise<RemoveBackgroundActionResult> {
  try {
    if (!image || image.trim().length === 0) {
      return {
        success: false,
        error: "Image URL is required",
      };
    }

    const result = await removeBackgroundController(image);

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to remove background",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove background",
    };
  }
}

