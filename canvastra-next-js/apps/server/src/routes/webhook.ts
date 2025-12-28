import { container } from "@canvastra-next-js/infrastructure";
import { Hono } from "hono";

const webhook = new Hono().post("/stripe", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("Stripe-Signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: "Missing signature or webhook secret" }, 400);
  }

  try {
    await container.useCases.subscription.handleWebhook.execute({
      body,
      signature,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    return c.json(null, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Invalid signature") {
      return c.json({ error: message }, 400);
    }
    return c.json({ error: "Failed to handle webhook" }, 500);
  }
});

export default webhook;
