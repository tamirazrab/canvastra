import { ApiEither } from "@/feature/common/data/api-task";
import getImagesUseCase from "@/feature/core/image/domain/usecase/get-images.usecase";
import { UnsplashImage } from "@/feature/core/image/domain/i-repo/image.repository.interface";

/**
 * Controller for getting images from Unsplash.
 * Called from Hono routes (not Server Actions).
 */
export default async function getImagesController(): Promise<
  ApiEither<UnsplashImage[]>
> {
  return getImagesUseCase();
}

