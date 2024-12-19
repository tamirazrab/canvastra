import { z } from "zod";
import { Hono } from "hono";
import { verifyAuth } from "@/presentation/middleware/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import {
  generateImageHandler,
  removeBackgroundHandler,
} from "@/presentation/controllers/ai.handlers";

const app = new Hono()
  .post(
    "/remove-bg",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        image: z.string(),
      }),
    ),
    removeBackgroundHandler
  )
  .post(
    "/generate-image",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    generateImageHandler
  );

export default app;
