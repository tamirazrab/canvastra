"use server";

import { isLeft } from "fp-ts/lib/Either";
import generateImageController from "@/feature/core/editor/application/controller/generate-image.controller";

export type GenerateImageActionResult =
  | { success: true; data: string }
  | { success: false; error: string };

/**
 * Server action to generate an image using AI.
 * Handles ApiEither response and returns user-friendly result.
 */
export async function generateImageAction(
  prompt: string,
): Promise<GenerateImageActionResult> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return {
        success: false,
        error: "Prompt is required",
      };
    }

    const result = await generateImageController(prompt);

    if (isLeft(result)) {
      return {
        success: false,
        error: result.left.message || "Failed to generate image",
      };
    }

    return { success: true, data: result.right };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}

