import type { AIService } from "../../domain/services/ai.service";

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
	constructor(private readonly aiService: AIService) {}

	async execute(request: GenerateImageRequest): Promise<GenerateImageResponse> {
		const { prompt } = request;

		if (!prompt || prompt.trim().length === 0) {
			throw new Error("Prompt cannot be empty");
		}

		const imageUrl = await this.aiService.generateImage(prompt);

		return { imageUrl };
	}
}
