import { Hono } from "hono";
import { verifyAuth } from "@/presentation/middleware/auth.middleware";
import { getImagesHandler } from "@/presentation/controllers/image.handlers";

const app = new Hono().get("/", verifyAuth(), getImagesHandler);

export default app;
