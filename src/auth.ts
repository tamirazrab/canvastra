import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/bootstrap/boundaries/db/drizzle";
import { headers } from "next/headers";
import { cache } from "react";
import {
  users,
  sessions,
  accounts,
  verificationTokens,
  authenticators,
} from "@/bootstrap/boundaries/db/schema";
import { env } from "@/bootstrap/configs/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verificationToken: verificationTokens,
      authenticator: authenticators,
    },
  }),
  baseURL: env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
});

// Helper function to get session in server components
// Returns the better-auth session response wrapped in a data property
// Cached per request to avoid multiple database queries
export const getSession = cache(
  async (): Promise<{ data: { user: any; session: any } | null }> => {
    try {
      const headersList = await headers();

      // Get cookie header directly from headers - better-auth expects this format
      const cookieHeader = headersList.get("cookie") || "";

      // Better-auth's getSession expects headers in a specific format
      // We need to pass the cookie header and optionally other headers
      const response = await auth.api.getSession({
        headers: {
          cookie: cookieHeader,
          // Include other headers that better-auth might need
          ...Object.fromEntries(headersList.entries()),
        },
      });

      // Better-auth's getSession returns { user, session } directly when authenticated
      // or null/undefined when not authenticated
      // Wrap it in a data property for consistency with our codebase
      if (!response || !response.user) {
        return { data: null };
      }

      return { data: response };
    } catch (error) {
      // If there's an error getting the session, return null
      // This ensures the app doesn't crash and can handle unauthenticated state
      console.error("Error getting session:", error);
      return { data: null };
    }
  },
);

export type Session = typeof auth.$Infer.Session;
