import { protectedProcedure, publicProcedure, router } from "../index";
import { aiRouter } from "./ai.router";
import { imagesRouter } from "./images.router";
import { projectRouter } from "./project.router";
import { subscriptionsRouter } from "./subscriptions.router";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	project: projectRouter,
	ai: aiRouter,
	images: imagesRouter,
	subscriptions: subscriptionsRouter,
});

export type AppRouter = typeof appRouter;
