import { z } from "zod";
import { publicProcedure, router } from "../index";
import { replicate } from "@canvastra-next-js/infrastructure";

export const aiRouter = router({
  removeBg: publicProcedure
    .input(z.object({ image: z.string() }))
    .mutation(async ({ input }) => {
      const output = await replicate.run(
        "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
        {
          input: { image: input.image },
        }
      );
      return output as string;
    }),

  generateImage: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const output = await replicate.run(
        "stability-ai/stable-diffusion-3",
        {
          input: {
            cfg: 3.5,
            steps: 28,
            prompt: input.prompt,
            aspect_ratio: "3:2",
            output_format: "webp",
            output_quality: 90,
            negative_prompt: "",
            prompt_strength: 0.85,
          },
        }
      );
      return (output as string[])[0];
    }),
});

export type AiRouter = typeof aiRouter;
