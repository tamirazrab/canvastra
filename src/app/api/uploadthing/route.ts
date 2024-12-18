import { Hono } from "hono";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// UploadThing route handler - adapts Next.js handler to Hono
const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

const app = new Hono();

// Adapt Next.js route handlers to Hono
app.get("*", async (c) => {
  try {
    const request = c.req.raw;
    const response = await GET(request);
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      c.header(key, value);
    });
    
    // Handle different response types
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return c.json(await response.json(), response.status);
    } else {
      return c.body(await response.blob(), response.status);
    }
  } catch (error) {
    console.error("UploadThing GET error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("*", async (c) => {
  try {
    const request = c.req.raw;
    const response = await POST(request);
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      c.header(key, value);
    });
    
    // Handle different response types
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return c.json(await response.json(), response.status);
    } else {
      return c.body(await response.blob(), response.status);
    }
  } catch (error) {
    console.error("UploadThing POST error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
