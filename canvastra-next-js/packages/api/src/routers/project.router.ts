import { container } from "@canvastra-next-js/infrastructure";
import { z } from "zod";
import { publicProcedure, router } from "../index";

export const projectRouter = router({
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1),
				userId: z.string(),
				json: z.string(),
				width: z.number().positive(),
				height: z.number().positive(),
			}),
		)
		.mutation(async ({ input }) => {
			const result = await container.useCases.project.create.execute(input);
			return result.project;
		}),

	get: publicProcedure
		.input(
			z.object({
				id: z.string(),
				userId: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			const result = await container.useCases.project.get.execute(input);
			return result.project;
		}),

	list: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				page: z.number().default(1),
				limit: z.number().default(10),
			}),
		)
		.query(async ({ input }) => {
			const result = await container.useCases.project.getAll.execute(input);
			return {
				projects: result.projects,
				nextPage: result.nextPage,
			};
		}),

	templates: publicProcedure
		.input(
			z
				.object({
					page: z.number().default(1),
					limit: z.number().default(10),
				})
				.optional(),
		)
		.query(async ({ input }) => {
			const result = await container.useCases.project.listTemplates.execute({
				page: input?.page ?? 1,
				limit: input?.limit ?? 10,
			});
			return result.projects;
		}),

	duplicate: publicProcedure
		.input(
			z.object({
				id: z.string(),
				userId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const result = await container.useCases.project.duplicate.execute(input);
			return result.project;
		}),

	update: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				projectId: z.string(),
				json: z.string().optional(),
				name: z.string().optional(),
				width: z.number().positive().optional(),
				height: z.number().positive().optional(),
				thumbnailUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const result = await container.useCases.project.update.execute(input);
			return result.project;
		}),

	delete: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				projectId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const result = await container.useCases.project.delete.execute(input);
			return result;
		}),
});

export type ProjectRouter = typeof projectRouter;
