import { defineConfig, devices } from "@playwright/test";
import * as path from "path";
import { config } from "dotenv";
import * as fs from "fs";

// Load TEST_DATABASE_URL from .env files for webServer
const envFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env.test"),
  path.resolve(process.cwd(), ".env.local"),
];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    config({ path: envFile, override: true });
  }
}

/**
 * Playwright configuration for E2E tests.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */
export default defineConfig({
  testDir: "./src/test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // CRITICAL: Set DATABASE_URL to TEST_DATABASE_URL for the Next.js server
      // This ensures Better Auth uses the test database instead of production
      // TEST_DATABASE_URL is loaded from .env files above
      // IMPORTANT: Set these FIRST, then spread process.env so our values take precedence
      ...(process.env.TEST_DATABASE_URL
        ? {
          DATABASE_URL: process.env.TEST_DATABASE_URL,
          TEST_DATABASE_URL: process.env.TEST_DATABASE_URL, // Also pass TEST_DATABASE_URL so route handler can detect test mode
        }
        : {}),
      // Pass through other env vars that might be needed
      // But our DATABASE_URL and TEST_DATABASE_URL above will override any values in process.env
      ...process.env,
      // Override DATABASE_URL again after spreading to ensure test database is used
      ...(process.env.TEST_DATABASE_URL
        ? {
          DATABASE_URL: process.env.TEST_DATABASE_URL,
        }
        : {}),
    },
  },

  globalSetup: require.resolve("./src/test/e2e/setup/global-setup.ts"),
  globalTeardown: require.resolve("./src/test/e2e/setup/global-teardown.ts"),
});

