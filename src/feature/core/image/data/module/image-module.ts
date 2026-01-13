import ImageRepositoryImpl from "@/feature/core/image/data/repository/image.repository";
import { imageRepoKey } from "@/feature/core/image/domain/i-repo/image.repository.interface";
import { DependencyContainer } from "tsyringe";

export default function imageModule(di: DependencyContainer) {
  di.register(imageRepoKey, ImageRepositoryImpl);

  return di;
}
