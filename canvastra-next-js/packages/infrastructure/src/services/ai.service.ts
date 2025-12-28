import type { AIService } from "@canvastra-next-js/core/domain/services/ai.service";
import { replicate } from "./replicate";

export class ReplicateAIService implements AIService {
	async generateImage(prompt: string): Promise<string> {
		const output = await replicate.run("stability-ai/stable-diffusion-3", {
			input: {
				cfg: 3.5,
				steps: 28,
				prompt,
				aspect_ratio: "3:2",
				output_format: "webp",
				output_quality: 90,
				negative_prompt: "",
				prompt_strength: 0.85,
			},
		});

		const result = output as string[];
		if (!result || result.length === 0) {
			throw new Error("Failed to generate image");
		}

		return result[0];
	}

	async removeBackground(image: string): Promise<string> {
		const output = await replicate.run(
			"cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
			{
				input: { image },
			},
		);

		if (typeof output !== "string") {
			throw new Error("Failed to remove background");
		}

		return output;
	}
}
