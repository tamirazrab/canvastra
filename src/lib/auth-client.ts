"use client";

import { createAuthClient } from "better-auth/react";

// Get base URL - use window.location.origin in browser, env var in server
// This is a client component, so we can safely use process.env.NEXT_PUBLIC_APP_URL
const getAuthBaseURL = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  // Fallback for SSR (shouldn't happen in client component, but safe fallback)
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  basePath: "/api/auth",
});
