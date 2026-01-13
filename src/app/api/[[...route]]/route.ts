/**
 * API Route Handler
 *
 * This is the main API route handler using Hono framework.
 * All API routes are handled through this catch-all route: /api/[[...route]]
 *
 * Route Structure:
 * - /api/ai - AI-related endpoints
 * - /api/images - Image management endpoints
 * - /api/projects - Project CRUD operations
 * - /api/subscriptions - Subscription and billing endpoints
 * - /api/users - User management endpoints
 *
 * All routes are prefixed with /api via basePath configuration.
 * Authentication middleware is applied to all routes via initAuthConfig.
 *
 * HTTP Methods Supported: GET, POST, PATCH, DELETE
 */
import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";
import { logger } from "@/lib/logger";
import { rateLimiters } from "./middleware/rate-limit";
import ai from "./ai";
import images from "./images";
import projects from "./projects";
import subscriptions from "./subscriptions";
import users from "./users";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

function getAuthConfig(): AuthConfig {
  // Import env only when needed (lazy import to avoid circular dependencies)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require("@/bootstrap/configs/env");
  return {
    secret: env.AUTH_SECRET,
    providers: [], // Empty providers array - authentication is handled by better-auth
  };
}

const app = new Hono().basePath("/api");

// Add request/response logging middleware
// Use multiple checks to ensure we're truly in development mode
// This prevents accidental information leakage in production
const isDevelopment =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_ENV !== "production" &&
  !process.env.VERCEL_ENV; // Vercel sets this in production
app.use(
  "*",
  honoLogger((message, ...rest) => {
    logger.info(message, {
      context: "hono",
      additional: rest.length > 0 ? rest : undefined,
    });
  }),
);

// Generate or use existing request ID
app.use("*", async (c, next) => {
  const existingRequestId = c.req.header("x-request-id");
  const requestId =
    existingRequestId ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Set request ID in response header for traceability
  c.res.headers.set("x-request-id", requestId);

  // Request ID is available in headers for logging
  // Note: Hono 4 context API changed, removed c.set() call

  return next();
});

// Apply rate limiting to all routes (can be overridden per route)
// Use stricter limits for specific routes (auth, expensive operations)
app.use("*", rateLimiters.api());

// Add error handling middleware with logging
app.onError((err, c) => {
  const { path } = c.req;
  const { method } = c.req;
  const requestId = c.req.header("x-request-id") || "unknown";

  const errorDetails = {
    path,
    method,
    requestId,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
  };

  logger.error(`API Error: ${method} ${path}`, err, errorDetails);

  // Log request body in development for debugging
  if (isDevelopment) {
    try {
      const { body } = c.req.raw;
      if (body) {
        logger.debug("Request body on error", {
          path,
          method,
          requestId,
          body: body.toString(),
        });
      }
    } catch {
      // Ignore body parsing errors
    }
  }

  // Standardized error response format
  const status = (err as any).status || 500;
  const errorResponse = {
    error: {
      code: err.name || "INTERNAL_ERROR",
      message: isDevelopment ? err.message : "Internal server error",
      ...(isDevelopment && { stack: err.stack, details: errorDetails }),
    },
    requestId,
  };

  return c.json(errorResponse, status);
});

// Apply authentication middleware to all routes
app.use(
  "*",
  initAuthConfig(() => getAuthConfig()),
);

// Register all API route handlers
app
  .route("/ai", ai)
  .route("/images", images)
  .route("/projects", projects)
  .route("/subscriptions", subscriptions)
  .route("/users", users);

// Export HTTP method handlers for Next.js App Router
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// Export AppType for type-safe client usage
export type AppType = typeof app;
