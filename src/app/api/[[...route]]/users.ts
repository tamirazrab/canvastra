import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signUpHandler, signInHandler } from "@/presentation/controllers/auth.handlers";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    signUpHandler
  )
  .post(
    "/signin",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        password: z.string().min(3).max(20),
      })
    ),
    signInHandler
  );

export default app;
