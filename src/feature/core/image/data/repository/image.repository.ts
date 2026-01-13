import ApiTask from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import ImageMapper from "@/feature/core/image/data/repository/image.mapper";
import ImageRepository, {
  UnsplashImage,
} from "@/feature/core/image/domain/i-repo/image.repository.interface";
import { unsplash } from "@/lib/unsplash";
import { pipe } from "fp-ts/lib/function";
import { map, tryCatch } from "fp-ts/lib/TaskEither";

const DEFAULT_COUNT = 50;
const DEFAULT_COLLECTION_IDS = ["317099"];

export default class ImageRepositoryImpl implements ImageRepository {
  getImages(): ApiTask<UnsplashImage[]> {
    return pipe(
      tryCatch(
        async () => {
          if (!unsplash) {
            throw new Error("Unsplash client not configured");
          }

          const images = await unsplash.photos.getRandom({
            collectionIds: DEFAULT_COLLECTION_IDS,
            count: DEFAULT_COUNT,
          });

          if (images.errors) {
            throw new Error("Failed to fetch images from Unsplash");
          }

          let { response } = images;

          if (!Array.isArray(response)) {
            response = [response];
          }

          return response;
        },
        (l) => failureOr(l, new NetworkFailure(l as Error)),
      ),
      map(ImageMapper.mapToEntityList),
    ) as ApiTask<UnsplashImage[]>;
  }
}
