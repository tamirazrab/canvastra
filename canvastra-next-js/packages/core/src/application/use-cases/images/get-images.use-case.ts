import type { ImageService } from "../../../domain/services/image.service";

export interface GetImagesRequest {
  count?: number;
  collectionIds?: string[];
}

export interface GetImagesResponse {
  images: Array<{
    id: string;
    urls: {
      regular: string;
      small: string;
      thumb: string;
    };
    description?: string | null;
    alt_description?: string | null;
  }>;
}

export interface IGetImagesUseCase {
  execute(request: GetImagesRequest): Promise<GetImagesResponse>;
}

export class GetImagesUseCase implements IGetImagesUseCase {
  constructor(private readonly imageService: ImageService) { }

  async execute(request: GetImagesRequest): Promise<GetImagesResponse> {
    const { count, collectionIds } = request;

    const images = await this.imageService.getImages(count, collectionIds);

    return { images };
  }
}
