import { container } from "@canvastra-next-js/infrastructure";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../index";

export const subscriptionsRouter = router({
	getCurrent: protectedProcedure.query(async ({ ctx }) => {
		const result = await container.useCases.subscription.get.execute({
			userId: ctx.session.user.id,
		});
		return {
			subscription: result.subscription,
			isActive: result.isActive,
		};
	}),

	checkout: protectedProcedure.mutation(async ({ ctx }) => {
		const result =
			await container.useCases.subscription.createCheckoutSession.execute({
				userId: ctx.session.user.id,
				email: ctx.session.user.email || undefined,
			});
		return result.url;
	}),

	billing: protectedProcedure.mutation(async ({ ctx }) => {
		const result =
			await container.useCases.subscription.createBillingPortalSession.execute({
				userId: ctx.session.user.id,
			});
		return result.url;
	}),
});

export type SubscriptionsRouter = typeof subscriptionsRouter;
