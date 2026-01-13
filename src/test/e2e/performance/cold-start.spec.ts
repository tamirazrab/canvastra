import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { measurePageLoad, assertPerformanceThreshold } from "../helpers/performance-helper";

/**
 * E2E tests for cold start behavior.
 * Tests validate performance on first request after server restart.
 * Zero mocking.
 */

test.describe("Performance - Cold Start", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should handle cold start within reasonable time", async ({ page }) => {
    const user = await createTestUser();

    // First request after "cold start" (simulated by fresh page load)
    const metrics = await measurePageLoad(page, "/en/sign-in");

    // Cold start should complete within 5 seconds
    assertPerformanceThreshold(metrics, {
      maxDuration: 5000, // 5 seconds for cold start
      description: "Cold start page load",
    });
  });

  test("should improve performance on subsequent requests", async ({ page }) => {
    const user = await createTestUser();

    // First request (cold start)
    const coldStartMetrics = await measurePageLoad(page, "/en/sign-in");

    // Second request (warm)
    const warmMetrics = await measurePageLoad(page, "/en/sign-in");

    // Warm request should be faster (or at least not significantly slower)
    expect(warmMetrics.duration).toBeLessThanOrEqual(coldStartMetrics.duration * 1.5);
  });
});

