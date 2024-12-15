import type { Context } from "hono";
import { container } from "@/infrastructure/di";

export async function getSubscriptionHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const useCase = container.getGetSubscriptionUseCase();
    const result = await useCase.execute({ userId });

    if (!result.subscription) {
      return c.json({
        data: {
          subscription: null,
          active: false,
        },
      });
    }

    return c.json({
      data: {
        ...result.subscription,
        active: result.active,
      },
    });
  } catch (error) {
    return c.json({ error: "Failed to get subscription" }, 500);
  }
}

export async function createCheckoutHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    const userEmail = c.get("userEmail") as string | undefined;
    if (!userId || !userEmail) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const appUrl = process.env.VITE_APP_URL || process.env.APP_URL || "http://localhost:3000";
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return c.json({ error: "Stripe price ID not configured" }, 500);
    }

    const useCase = container.getCreateCheckoutUseCase();
    const result = await useCase.execute({
      userId,
      userEmail,
      appUrl,
      priceId,
    });

    return c.json({ data: result.checkoutUrl });
  } catch (error) {
    return c.json({ error: "Failed to create checkout session" }, 500);
  }
}

export async function createBillingPortalHandler(c: Context) {
  try {
    const userId = c.get("userId") as string | undefined;
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const appUrl = process.env.VITE_APP_URL || process.env.APP_URL || "http://localhost:3000";

    const useCase = container.getCreateBillingPortalUseCase();
    const result = await useCase.execute({ userId, appUrl });

    return c.json({ data: result.portalUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "No subscription found") {
      return c.json({ error: message }, 404);
    }
    return c.json({ error: "Failed to create billing portal session" }, 500);
  }
}

export async function handleWebhookHandler(c: Context) {
  try {
    const body = await c.req.text();
    const signature = c.req.header("Stripe-Signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return c.json({ error: "Missing signature or webhook secret" }, 400);
    }

    const useCase = container.getHandleWebhookUseCase();
    await useCase.execute({
      body,
      signature,
      webhookSecret,
    });

    return c.json(null, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Invalid signature") {
      return c.json({ error: message }, 400);
    }
    return c.json({ error: "Failed to handle webhook" }, 500);
  }
}

