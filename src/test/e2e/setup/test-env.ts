import { z } from "zod";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";

/**
 * Test-specific environment variable access.
 * This file does NOT use "server-only" because test files run in Node.js,
 * not in Next.js server component context.
 * 
 * Loads environment variables from .env.local, .env.test, or .env files.
 * Playwright doesn't automatically load .env files, so we do it here.
 */

// Load environment variables from .env files
// Priority: .env.local > .env.test > .env
// Load in reverse order so .env.local overrides everything
const envFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.test"),
  path.resolve(process.cwd(), ".env.local"),
];

// Load all existing .env files (later files override earlier ones)
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
  console.log('[test-env] Set DATABASE_URL to TEST_DATABASE_URL for Better Auth');
}

// Debug: Log which files were loaded (only in development)
if (process.env.NODE_ENV !== "production" && loadedFiles.length > 0) {
  console.log(`[test-env] Loaded environment files: ${loadedFiles.join(", ")}`);
}

const testEnvSchema = z.object({
  // Test database URL (required for E2E tests)
  TEST_DATABASE_URL: z.string().url(),

  // Application URL (optional for tests)
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

type TestEnvSchema = z.infer<typeof testEnvSchema>;

function validateTestEnv(): TestEnvSchema {
  const result = testEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    // Debug: Show what was actually found
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
 * Use this in test setup files instead of the main env.ts.
 */
export const testEnv = validateTestEnv();

