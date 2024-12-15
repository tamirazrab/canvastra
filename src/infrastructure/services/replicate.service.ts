import Replicate from "replicate";
import { ImageGenerationService } from "@/core/domain/services";

export class ReplicateService implements ImageGenerationService {
  private readonly client: Replicate;

  constructor() {
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  async removeBackground(image: string): Promise<string> {
    const input = {
      image: image,
    };

    const output: unknown = await this.client.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      { input }
    );

    return output as string;
  }

  async generateImage(prompt: string): Promise<string> {
    const input = {
      cfg: 3.5,
      steps: 28,
      prompt: prompt,
      aspect_ratio: "3:2",
      output_format: "webp",
      output_quality: 90,
      negative_prompt: "",
      prompt_strength: 0.85,
    };

    const output = await this.client.run("stability-ai/stable-diffusion-3", {
      input,
    });

    const res = output as Array<string>;
    return res[0];
  }
}

