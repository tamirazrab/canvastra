import { ApiEither } from "@/feature/common/data/api-task";
import { diResolve } from "@/feature/common/features.di";
import { imageModuleKey } from "@/feature/core/image/data/image-module-key";
import ImageRepository, {
  UnsplashImage,
  imageRepoKey,
} from "@/feature/core/image/domain/i-repo/image.repository.interface";

export default async function getImagesUseCase(): Promise<
  ApiEither<UnsplashImage[]>
> {
  const repo = diResolve<ImageRepository>(imageModuleKey, imageRepoKey);

  return repo.getImages()();
}
