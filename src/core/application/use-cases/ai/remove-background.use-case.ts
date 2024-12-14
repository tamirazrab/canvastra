import { ImageGenerationService } from "@/core/domain/services";

export interface RemoveBackgroundRequest {
  image: string;
}

export interface RemoveBackgroundResponse {
  imageUrl: string;
}

export interface IRemoveBackgroundUseCase {
  execute(request: RemoveBackgroundRequest): Promise<RemoveBackgroundResponse>;
}

export class RemoveBackgroundUseCase implements IRemoveBackgroundUseCase {
  constructor(private readonly imageGenerationService: ImageGenerationService) {}

  async execute(
    request: RemoveBackgroundRequest
  ): Promise<RemoveBackgroundResponse> {
    const { image } = request;

    const imageUrl = await this.imageGenerationService.removeBackground(image);

    return { imageUrl };
  }
}

