import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";
import { appRouter } from "@canvastra-next-js/api/routers/index";
import { auth } from "@canvastra-next-js/auth";
import { trpcServer } from "@hono/trpc-server";

import webhook from "./routes/webhook";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    allowMethods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE", "PUT"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Better-Auth
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// tRPC
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  }),
);

// Webhook routes (need raw body access, not suitable for tRPC)
app.basePath("/api").route("/webhook", webhook);

app.get("/", (c) => {
  return c.text("OK");
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: err.message,
    },
    500,
  );
});

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server starting on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
