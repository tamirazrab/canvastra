import Stripe from "stripe";
import { Hono } from "hono";
import { eq } from "drizzle-orm";

import { stripe } from "@canvastra-next-js/infrastructure/services/stripe";
import { db } from "@canvastra-next-js/db";
import { subscription } from "@canvastra-next-js/db/schema/canvastra";
import { auth } from "@canvastra-next-js/auth";

const DAY_IN_MS = 86_400_000;

const checkIsActive = (
  sub: typeof subscription.$inferSelect,
) => {
  let active = false;

  if (
    sub &&
    sub.priceId &&
    sub.currentPeriodEnd
  ) {
    active = sub.currentPeriodEnd.getTime() + DAY_IN_MS > Date.now();
  }

  return active;
};

const subscriptions = new Hono()
  .post("/billing", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const [sub] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id));

    if (!sub) {
      return c.json({ error: "No subscription found" }, 404);
    }

    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: sub.customerId,
      return_url: `${process.env.CLIENT_URL}`,
    });

    if (!stripeSession.url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: stripeSession.url });
  })
  .get("/current", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const [sub] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id));

    const active = sub ? checkIsActive(sub) : false;

    return c.json({
      data: {
        ...sub,
        active,
      },
    });
  })
  .post("/checkout", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.CLIENT_URL}?success=1`,
      cancel_url: `${process.env.CLIENT_URL}?canceled=1`,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: session.user.email || "",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
    });

    const url = stripeSession.url;

    if (!url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: url });
  })
  .post(
    "/webhook",
    async (c) => {
      const body = await c.req.text();
      const signature = c.req.header("Stripe-Signature") as string;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (error) {
        return c.json({ error: "Invalid signature" }, 400);
      }

      const session = event.data.object as Stripe.Checkout.Session;

      if (event.type === "checkout.session.completed") {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        if (!session?.metadata?.userId) {
          return c.json({ error: "Invalid session" }, 400);
        }

        await db
          .insert(subscription)
          .values({
            status: sub.status,
            userId: session.metadata.userId,
            subscriptionId: sub.id,
            customerId: sub.customer as string,
            priceId: sub.items.data[0].price.product as string,
            currentPeriodEnd: new Date(
              sub.current_period_end * 1000
            ),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
      }

      if (event.type === "invoice.payment_succeeded") {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        if (!session?.metadata?.userId) {
          return c.json({ error: "Invalid session" }, 400);
        }

        await db
          .update(subscription)
          .set({
            status: sub.status,
            currentPeriodEnd: new Date(
              sub.current_period_end * 1000,
            ),
            updatedAt: new Date(),
          })
          .where(eq(subscription.id, sub.id))
      }

      return c.json(null, 200);
    },
  );

export default subscriptions;
