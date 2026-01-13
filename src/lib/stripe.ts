import Stripe from "stripe";
import { env } from "@/bootstrap/configs/env";

// Stripe is optional - only initialize if key is provided
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;
