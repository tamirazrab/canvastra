import { Context, Next } from "hono";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import type { AuthUser } from "../types/hono-context";

/**
 * Better-Auth middleware for Hono
 * Verifies session using better-auth and sets user info in context
 * Compatible with existing verifyAuth() usage pattern
 */
export function verifyBetterAuth() {
  return async (c: Context, next: Next): Promise<Response | void> => {
    try {
      // Get cookie header from request
      const cookieHeader = c.req.header("cookie") || "";

      // Get session from better-auth
      const session = await auth.api.getSession({
        headers: {
          cookie: cookieHeader,
          // Include other headers that might be needed
          ...Object.fromEntries(
            Object.entries(c.req.raw.headers).map(([key, value]) => [
              key,
              Array.isArray(value) ? value.join(", ") : value || "",
            ]),
          ),
        },
      });

      // Check if session is valid
      if (!session || !session.user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Set user info in context to match verifyAuth() pattern
      // This allows existing code using c.get("authUser") to work
      const authUser: AuthUser = {
        token: {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "",
        },
        user: session.user,
        session: session.session,
      };

      // Use Hono's context variable system with type assertion
      (c as Context & { set: (key: string, value: unknown) => void }).set(
        "authUser",
        authUser,
      );

      return await next();
    } catch (error) {
      // Log all errors for debugging and monitoring
      logger.error(
        "Auth middleware error",
        error instanceof Error ? error : new Error(String(error)),
        {
          path: c.req.path,
          method: c.req.method,
          requestId: c.req.header("x-request-id") || "unknown",
        },
      );

      // Only return 401 for authentication failures
      // Re-throw unexpected errors to be handled by global error handler
      if (
        error instanceof Error &&
        (error.message.includes("session") ||
          error.message.includes("auth") ||
          error.message.includes("unauthorized"))
      ) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Re-throw system errors to be handled by global error handler
      throw error;
    }
  };
}
