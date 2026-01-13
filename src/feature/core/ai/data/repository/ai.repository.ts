import ApiTask from "@/feature/common/data/api-task";
import { failureOr } from "@/feature/common/failures/failure-helpers";
import NetworkFailure from "@/feature/common/failures/network.failure";
import AiMapper from "@/feature/core/ai/data/repository/ai.mapper";
import AiRepository from "@/feature/core/ai/domain/i-repo/ai.repository.interface";
import { replicate } from "@/lib/replicate";
import { pipe } from "fp-ts/lib/function";
import { map, tryCatch } from "fp-ts/lib/TaskEither";

export default class AiRepositoryImpl implements AiRepository {
  generateImage(prompt: string): ApiTask<string> {
    return pipe(
      tryCatch(
        async () => {
          if (!replicate) {
            throw new Error("Replicate client not configured");
          }

          const input = {
            cfg: 3.5,
            steps: 28,
            prompt,
            aspect_ratio: "3:2",
            output_format: "webp",
            output_quality: 90,
            negative_prompt: "",
            prompt_strength: 0.85,
          };

          const output = await replicate.run(
            "stability-ai/stable-diffusion-3",
            { input },
          );

          const res = output as Array<string>;
          return res[0];
        },
        (l) => failureOr(l, new NetworkFailure(l as Error)),
      ),
      map(AiMapper.mapImageResponse),
    ) as ApiTask<string>;
  }

  removeBackground(image: string): ApiTask<string> {
    return pipe(
      tryCatch(
        async () => {
          if (!replicate) {
            throw new Error("Replicate client not configured");
          }

          const input = {
            image,
          };

          const output: unknown = await replicate.run(
            "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
            { input },
          );

          const res = output as string;
          return res;
        },
        (l) => failureOr(l, new NetworkFailure(l as Error)),
      ),
      map(AiMapper.mapImageResponse),
    ) as ApiTask<string>;
  }
}
