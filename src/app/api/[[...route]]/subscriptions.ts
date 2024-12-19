import { Hono } from "hono";
import { verifyAuth } from "@/presentation/middleware/auth.middleware";
import {
  getSubscriptionHandler,
  createCheckoutHandler,
  createBillingPortalHandler,
  handleWebhookHandler,
} from "@/presentation/controllers/subscription.handlers";

const app = new Hono()
  .post("/billing", verifyAuth(), createBillingPortalHandler)
  .get("/current", verifyAuth(), getSubscriptionHandler)
  .post("/checkout", verifyAuth(), createCheckoutHandler)
  .post("/webhook", handleWebhookHandler);

export default app;
