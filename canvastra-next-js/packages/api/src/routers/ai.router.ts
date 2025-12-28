import { container } from "@canvastra-next-js/infrastructure";
import { z } from "zod";
import { publicProcedure, router } from "../index";

export const aiRouter = router({
	removeBg: publicProcedure
		.input(z.object({ image: z.string() }))
		.mutation(async ({ input }) => {
			const result = await container.useCases.ai.removeBackground.execute({
				image: input.image,
			});
			return result.imageUrl;
		}),

	generateImage: publicProcedure
		.input(z.object({ prompt: z.string() }))
		.mutation(async ({ input }) => {
			const result = await container.useCases.ai.generateImage.execute({
				prompt: input.prompt,
			});
			return result.imageUrl;
		}),
});

export type AiRouter = typeof aiRouter;
