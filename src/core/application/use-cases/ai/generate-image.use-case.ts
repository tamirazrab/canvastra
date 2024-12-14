import { ImageGenerationService } from "@/core/domain/services";

export interface GenerateImageRequest {
  prompt: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
}

export interface IGenerateImageUseCase {
  execute(request: GenerateImageRequest): Promise<GenerateImageResponse>;
}

export class GenerateImageUseCase implements IGenerateImageUseCase {
  constructor(private readonly imageGenerationService: ImageGenerationService) { }

  async execute(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    const { prompt } = request;

    const imageUrl = await this.imageGenerationService.generateImage(prompt);

    return { imageUrl };
  }
}

