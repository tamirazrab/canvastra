/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: "src/test/setup.ts",
    // Exclude E2E tests (they use Playwright, not Vitest)
    // E2E tests should be run separately with: bun run test:e2e
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/test/e2e/**", // E2E tests use Playwright
      "**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/auth.test.ts", // This file doesn't contain test suites
    ],
    // Include all unit tests (files ending in .test.ts or .spec.ts, excluding e2e directory)
    include: [
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "!**/test/e2e/**", // Explicitly exclude e2e directory
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Mock server-only module for tests (prevents "cannot be imported from Client Component" error)
      "server-only": path.resolve(__dirname, "./src/test/common/mock/server-only-mock.ts"),
    },
  },
});
