import { Hono } from "hono";
import { auth } from "@/infrastructure/auth/better-auth";

const app = new Hono();

// Better-auth provides a handler that works with standard Request/Response
// We need to adapt it for Hono
app.all("*", async (c) => {
  try {
    const request = c.req.raw;
    const response = await auth.handler(request);
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      c.header(key, value);
    });
    
    // Handle different response types
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return c.json(await response.json(), response.status);
    } else if (contentType?.includes("text")) {
      return c.text(await response.text(), response.status);
    } else {
      // For binary or other types, return as blob
      return c.body(await response.blob(), response.status);
    }
  } catch (error) {
    console.error("Better-auth handler error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;

