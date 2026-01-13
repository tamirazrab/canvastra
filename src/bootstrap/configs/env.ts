import "server-only";
import { z } from "zod";

/**
 * Centralized environment variable validation
 *
 * This ensures all required environment variables are present and valid at startup.
 * Fails fast in development, logs errors in production.
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  // Database
  DATABASE_URL: z.string().url(),

  // Test database URL (optional - only required for E2E tests)
  TEST_DATABASE_URL: z.string().url().optional(),

  // Authentication providers
  GITHUB_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // External services (optional - only required if using these features)
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_PRICE_ID: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  REPLICATE_API_TOKEN: z.string().min(1).optional(),
  UNSPLASH_ACCESS_KEY: z.string().min(1).optional(),
  UPLOADTHING_TOKEN: z.string().min(1).optional(),
  DISABLE_UPLOADTHING: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),

  // Rate limiting (optional - defaults provided)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute default
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100), // 100 requests per window default

  // Optional IDP config (if using external identity provider)
  IDP_URL: z.string().url().optional(),
  IDP_CLIENT_ID: z.string().min(1).optional(),
  IDP_CLIENT_SECRET: z.string().min(1).optional(),

  // Optional backend API config
  BACKEND_BASE_HOST: z.string().url().optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test";

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    const errorMessage = `Invalid environment variables:\n${errorMessages}`;

    if (isDevelopment || isTest) {
      // Fail fast in development/test
      throw new Error(errorMessage);
    }

    // In production, log and throw (will crash the process)
    console.error(errorMessage);
    throw new Error("Invalid environment configuration");
  }

  return result.data;
}

/**
 * Validated environment variables
 *
 * Access this instead of process.env directly for type safety and validation.
 *
 * @example
 * import { env } from "@/bootstrap/configs/env";
 * const url = env.NEXT_PUBLIC_APP_URL;
 */
export const env = validateEnv();
