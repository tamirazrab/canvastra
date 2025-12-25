import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { stripe } from "@canvastra-next-js/infrastructure";
import { TRPCError } from "@trpc/server";

export const subscriptionsRouter = router({
  billing: protectedProcedure.mutation(async ({ ctx }) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: ctx.session.user.id, // In real app, fetch customerId from DB
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    if (!session.url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create session",
      });
    }

    return session.url;
  }),

  checkout: protectedProcedure.mutation(async ({ ctx }) => {
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=1`,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: ctx.session.user.email || "",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: ctx.session.user.id,
      },
    });

    const url = session.url;

    if (!url) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create session",
      });
    }

    return url;
  }),
});

export type SubscriptionsRouter = typeof subscriptionsRouter;
