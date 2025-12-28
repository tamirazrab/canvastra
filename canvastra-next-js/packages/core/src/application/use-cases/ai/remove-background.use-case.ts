import type { AIService } from "../../domain/services/ai.service";

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
	constructor(private readonly aiService: AIService) {}

	async execute(
		request: RemoveBackgroundRequest,
	): Promise<RemoveBackgroundResponse> {
		const { image } = request;

		if (!image || image.trim().length === 0) {
			throw new Error("Image URL cannot be empty");
		}

		const imageUrl = await this.aiService.removeBackground(image);

		return { imageUrl };
	}
}
