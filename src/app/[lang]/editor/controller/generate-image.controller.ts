import { ApiEither } from "@/feature/common/data/api-task";
import generateImageUseCase from "@/feature/core/ai/domain/usecase/generate-image.usecase";

/**
 * Controller for generating an image.
 * Called from Hono routes (not Server Actions).
 */
export default async function generateImageController(
  prompt: string,
): Promise<ApiEither<string>> {
  return generateImageUseCase(prompt);
}
