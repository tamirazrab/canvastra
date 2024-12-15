import type { Context, Next } from "hono";
import { auth } from "@/infrastructure/auth/better-auth";

export async function verifyAuth() {
  return async (c: Context, next: Next) => {
    try {
      // Get session from better-auth
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session?.user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      c.set("userId", session.user.id);
      c.set("userEmail", session.user.email || "");
      c.set("session", session);

      await next();
    } catch (error) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
}

