import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";
import { measurePageLoad, measureApiRequest, assertPerformanceThreshold } from "../helpers/performance-helper";

/**
 * E2E tests for identifying slow operations.
 * Tests measure and assert performance thresholds.
 * Zero mocking.
 */

test.describe("Performance - Slow Paths", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should load project list within 2 seconds", async ({ page }) => {
    const user = await createTestUser();

    // Create multiple projects
    for (let i = 0; i < 5; i++) {
      await createTestProject(user.id, { name: `Project ${i + 1}` });
    }

    await authenticateUser(page, user.email, user.password);

    // Measure page load time
    const metrics = await measurePageLoad(page, "/en/editor");

    // Assert performance threshold
    assertPerformanceThreshold(metrics, {
      maxDuration: 2000, // 2 seconds
      description: "Project list page load",
    });
  });

  test("should initialize canvas within 1 second", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);

    // Measure canvas initialization
    const startTime = Date.now();
    await page.goto(`/en/editor/${project.id}`);
    await page.waitForSelector("canvas", { timeout: 10000 });
    const duration = Date.now() - startTime;

    assertPerformanceThreshold(
      { duration, startTime, endTime: Date.now() },
      {
        maxDuration: 1000, // 1 second
        description: "Canvas initialization",
      },
    );
  });

  test("should complete API requests within reasonable time", async ({ page, request }) => {
    const user = await createTestUser();
    await createTestProject(user.id);

    await authenticateUser(page, user.email, user.password);

    const authHeaders = {
      Cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; "),
      "Content-Type": "application/json",
    };

    // Measure API request time
    const { metrics } = await measureApiRequest(request, "/api/projects?page=1&limit=5", {
      headers: authHeaders,
    });

    assertPerformanceThreshold(metrics, {
      maxDuration: 1000, // 1 second
      description: "Projects API request",
    });
  });
});

