import { container } from "@canvastra-next-js/infrastructure";
import { z } from "zod";
import { publicProcedure, router } from "../index";

const DEFAULT_COUNT = 50;
const DEFAULT_COLLECTION_IDS = ["317099"];

export const imagesRouter = router({
	getImages: publicProcedure
		.input(
			z
				.object({
					count: z.number().optional(),
					collectionIds: z.array(z.string()).optional(),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const result = await container.useCases.images.get.execute({
				count: input?.count ?? DEFAULT_COUNT,
				collectionIds: input?.collectionIds ?? DEFAULT_COLLECTION_IDS,
			});
			return result.images;
		}),
});

export type ImagesRouter = typeof imagesRouter;
