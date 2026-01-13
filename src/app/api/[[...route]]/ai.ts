import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import generateImageController from "@/feature/core/editor/application/controller/generate-image.controller";
import removeBackgroundController from "@/feature/core/editor/application/controller/remove-background.controller";
import { verifyBetterAuth } from "./middleware/better-auth";
import { rateLimiters } from "./middleware/rate-limit";
import { handleApiResult } from "./helpers/handle-api-result";

// AI endpoints are expensive - use stricter rate limiting
const app = new Hono()
  .use("*", rateLimiters.expensive())
  .post(
    "/remove-bg",
    verifyBetterAuth(),
    zValidator(
      "json",
      z.object({
        image: z.string(),
      }),
    ),
    async (c) => {
      const { image } = c.req.valid("json");
      const result = await removeBackgroundController(image);
      return handleApiResult(result, c);
    },
  )
  .post(
    "/generate-image",
    verifyBetterAuth(),
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    async (c) => {
      const { prompt } = c.req.valid("json");
      const result = await generateImageController(prompt);
      return handleApiResult(result, c);
    },
  );

export default app;
