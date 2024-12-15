import { createAuthClient } from "better-auth/react";

const baseURL = typeof window !== "undefined"
  ? import.meta.env.VITE_APP_URL || "http://localhost:3000"
  : "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: `${baseURL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

