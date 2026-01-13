import { ApiEither } from "@/feature/common/data/api-task";
import removeBackgroundUseCase from "@/feature/core/ai/domain/usecase/remove-background.usecase";

/**
 * Controller for removing background from an image.
 * Called from Hono routes (not Server Actions).
 */
export default async function removeBackgroundController(
  image: string,
): Promise<ApiEither<string>> {
  return removeBackgroundUseCase(image);
}
