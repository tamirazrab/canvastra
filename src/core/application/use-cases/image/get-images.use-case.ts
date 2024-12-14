import { ImageSearchService } from "@/core/domain/services";

export interface GetImagesRequest {
  collectionIds?: string[];
  count?: number;
}

export interface GetImagesResponse {
  images: unknown[];
}

export interface IGetImagesUseCase {
  execute(request?: GetImagesRequest): Promise<GetImagesResponse>;
}

export class GetImagesUseCase implements IGetImagesUseCase {
  constructor(private readonly imageSearchService: ImageSearchService) {}

  async execute(
    request: GetImagesRequest = {}
  ): Promise<GetImagesResponse> {
    const { collectionIds = ["317099"], count = 50 } = request;

    const result = await this.imageSearchService.getRandomPhotos(collectionIds, count);

    if (result.errors) {
      throw new Error("Failed to fetch images from Unsplash");
    }

    let response = result.response;
    if (!Array.isArray(response)) {
      response = [response];
    }

    return { images: response as unknown[] };
  }
}

