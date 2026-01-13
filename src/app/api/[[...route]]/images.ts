import { Hono } from "hono";
import getImagesController from "@/feature/core/editor/application/controller/get-images.controller";
import { verifyBetterAuth } from "./middleware/better-auth";
import { handleApiResult } from "./helpers/handle-api-result";

const app = new Hono().get("/", verifyBetterAuth(), async (c) => {
  const result = await getImagesController();
  return handleApiResult(result, c);
});

export default app;
