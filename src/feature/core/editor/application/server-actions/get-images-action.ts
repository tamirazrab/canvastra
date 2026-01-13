"use server";

import { isLeft } from "fp-ts/lib/Either";
import getImagesController from "@/feature/core/editor/application/controller/get-images.controller";
import { UnsplashImage } from "@/feature/core/image/domain/i-repo/image.repository.interface";

export type GetImagesActionResult =
  | { success: true; data: UnsplashImage[] }
  | { success: false; error: string };

/**
 * Server action to get images from Unsplash.
 * Handles ApiEither response and returns user-friendly result.
 */
export async function getImagesAction(): Promise<GetImagesActionResult> {
  try {
    const result = await getImagesController();

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to fetch images",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch images",
    };
  }
}

