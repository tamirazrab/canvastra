import { z } from "zod";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";

/**
 * Centralized test environment configuration.
 * 
 * Loads and validates all test environment variables.
 * Ensures test isolation and proper configuration.
 */

// Load environment variables from .env files
// Priority: .env.local > .env.test > .env
const envFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.test"),
  path.resolve(process.cwd(), ".env.local"),
];

let loadedFiles: string[] = [];
for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    const result = config({ path: envFile, override: true });
    if (!result.error) {
      loadedFiles.push(envFile);
    }
  }
}

// CRITICAL: Set DATABASE_URL to TEST_DATABASE_URL for tests
// This ensures Better Auth uses the test database instead of production
if (process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

const testEnvSchema = z.object({
  // Test database URL (required for E2E tests)
  TEST_DATABASE_URL: z.string().url(),

  // Application URL (optional for tests)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Playwright test base URL
  PLAYWRIGHT_TEST_BASE_URL: z.string().url().optional().default("http://localhost:3000"),

  // External services (optional - only required if testing those features)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_PRICE_ID: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  REPLICATE_API_TOKEN: z.string().min(1).optional(),

  // Authentication (optional - only required if testing OAuth)
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("test"),
});

type TestEnvSchema = z.infer<typeof testEnvSchema>;

function validateTestEnv(): TestEnvSchema {
  const result = testEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    const testDbUrl = process.env.TEST_DATABASE_URL;
    const debugInfo = testDbUrl
      ? `\n  Found TEST_DATABASE_URL: ${testDbUrl.substring(0, 20)}... (length: ${testDbUrl.length})`
      : `\n  TEST_DATABASE_URL is undefined or empty`;

    throw new Error(
      `Invalid test environment variables:\n${errorMessages}${debugInfo}\n\n` +
      `Make sure TEST_DATABASE_URL is set in .env, .env.local, or .env.test file.`,
    );
  }

  return result.data;
}

/**
 * Validated test environment variables.
 * Use this in test files instead of process.env directly.
 */
export const testEnv = validateTestEnv();

/**
 * Test environment configuration object.
 * Provides typed access to test environment settings.
 */
export const testEnvConfig = {
  database: {
    url: testEnv.TEST_DATABASE_URL,
  },
  app: {
    baseUrl: testEnv.PLAYWRIGHT_TEST_BASE_URL,
    publicUrl: testEnv.NEXT_PUBLIC_APP_URL || testEnv.PLAYWRIGHT_TEST_BASE_URL,
  },
  externalServices: {
    stripe: {
      secretKey: testEnv.STRIPE_SECRET_KEY,
      priceId: testEnv.STRIPE_PRICE_ID,
      webhookSecret: testEnv.STRIPE_WEBHOOK_SECRET,
      enabled: !!testEnv.STRIPE_SECRET_KEY,
    },
    replicate: {
      apiToken: testEnv.REPLICATE_API_TOKEN,
      enabled: !!testEnv.REPLICATE_API_TOKEN,
    },
  },
  auth: {
    github: {
      clientId: testEnv.GITHUB_CLIENT_ID,
      clientSecret: testEnv.GITHUB_CLIENT_SECRET,
      enabled: !!(testEnv.GITHUB_CLIENT_ID && testEnv.GITHUB_CLIENT_SECRET),
    },
    google: {
      clientId: testEnv.GOOGLE_CLIENT_ID,
      clientSecret: testEnv.GOOGLE_CLIENT_SECRET,
      enabled: !!(testEnv.GOOGLE_CLIENT_ID && testEnv.GOOGLE_CLIENT_SECRET),
    },
  },
  nodeEnv: testEnv.NODE_ENV,
  loadedEnvFiles: loadedFiles,
} as const;

/**
 * Check if external service is available for testing.
 */
export function isServiceAvailable(service: "stripe" | "replicate"): boolean {
  return testEnvConfig.externalServices[service].enabled;
}

/**
 * Get test environment summary for debugging.
 */
export function getTestEnvSummary(): string {
  return `
Test Environment Configuration:
  Database URL: ${testEnvConfig.database.url ? "SET" : "NOT SET"}
  App Base URL: ${testEnvConfig.app.baseUrl}
  Stripe: ${testEnvConfig.externalServices.stripe.enabled ? "ENABLED" : "DISABLED"}
  Replicate: ${testEnvConfig.externalServices.replicate.enabled ? "ENABLED" : "DISABLED"}
  GitHub OAuth: ${testEnvConfig.auth.github.enabled ? "ENABLED" : "DISABLED"}
  Google OAuth: ${testEnvConfig.auth.google.enabled ? "ENABLED" : "DISABLED"}
  Loaded env files: ${testEnvConfig.loadedEnvFiles.join(", ") || "NONE"}
  `.trim();
}

