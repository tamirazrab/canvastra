import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testDb } from "@/test/e2e/setup/db-setup";
import {
  users,
  sessions,
  accounts,
  verificationTokens,
  authenticators,
} from "@/bootstrap/boundaries/db/schema";
import { testEnv } from "@/test/e2e/setup/test-env";

/**
 * Test-specific Better Auth configuration.
 * Uses test database instead of production database.
 * Only used when TEST_DATABASE_URL is set.
 */
export const testAuth = betterAuth({
  database: drizzleAdapter(testDb, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verificationToken: verificationTokens,
      authenticator: authenticators,
    },
  }),
  baseURL: testEnv.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [testEnv.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});

