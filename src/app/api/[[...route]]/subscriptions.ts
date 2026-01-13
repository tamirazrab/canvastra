import Stripe from "stripe";
import { Hono } from "hono";
import { isLeft } from "fp-ts/lib/Either";

import getSubscriptionUseCase from "@/feature/core/subscription/domain/usecase/get-subscription.usecase";
import createCheckoutSessionUseCase from "@/feature/core/subscription/domain/usecase/create-checkout-session.usecase";
import createBillingPortalUseCase from "@/feature/core/subscription/domain/usecase/create-billing-portal.usecase";
import handleWebhookUseCase from "@/feature/core/subscription/domain/usecase/handle-webhook.usecase";
import checkIsActiveUseCase from "@/feature/core/subscription/domain/usecase/check-is-active.usecase";
import { env } from "@/bootstrap/configs/env";
import { verifyBetterAuth } from "./middleware/better-auth";
import { handleApiResult } from "./helpers/handle-api-result";
import type { AuthUser } from "./types/hono-context";

const app = new Hono()
  .post("/billing", verifyBetterAuth(), async (c) => {
    const auth = c.get("authUser") as unknown as AuthUser;

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const subscriptionResult = await getSubscriptionUseCase(auth.token.id);

    if (isLeft(subscriptionResult) || !subscriptionResult.right) {
      return c.json({ error: "No subscription found" }, 404);
    }

    const urlResult = await createBillingPortalUseCase(subscriptionResult.right.customerId);

    return handleApiResult(urlResult, c);
  })
  .get("/current", verifyBetterAuth(), async (c) => {
    const auth = c.get("authUser") as unknown as AuthUser;

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const result = await getSubscriptionUseCase(auth.token.id);

    if (isLeft(result)) {
      return handleApiResult(result, c);
    }

    const subscription = result.right;
    const active = checkIsActiveUseCase(subscription);

    return c.json({
      data: subscription
        ? {
            ...subscription,
            active,
          }
        : null,
    });
  })
  .post("/checkout", verifyBetterAuth(), async (c) => {
    const auth = c.get("authUser") as unknown as AuthUser;

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const result = await createCheckoutSessionUseCase(
      auth.token.id,
      auth.token.email || undefined,
    );

    return handleApiResult(result, c);
  })
  .post("/webhook", async (c) => {
    const body = await c.req.text();
    const signature = c.req.header("Stripe-Signature") as string;

    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: "Stripe not configured" }, 500);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      return c.json({ error: "Invalid signature" }, 400);
    }

    try {
      await handleWebhookUseCase(event);
      return c.json(null, 200);
    } catch {
      return c.json({ error: "Webhook handling failed" }, 500);
    }
  });

export default app;
