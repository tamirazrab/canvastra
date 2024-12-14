export interface ImageGenerationService {
  generateImage(prompt: string): Promise<string>;
  removeBackground(image: string): Promise<string>;
}

