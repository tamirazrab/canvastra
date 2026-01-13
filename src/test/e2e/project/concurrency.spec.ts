import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { makeConcurrentRequests, testRaceCondition } from "../helpers/concurrency-helper";
import { authenticatedApiRequest, getAuthCookieHeader } from "../helpers/api-helper";
import { testEnvConfig } from "../config/test-env.config";

/**
 * E2E tests for concurrent project operations.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Project Concurrency", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should handle concurrent project list requests", async ({ page, request }) => {
    const user = await createTestUser();

    // Create multiple projects
    await createTestProject(user.id, { name: "Project 1" });
    await createTestProject(user.id, { name: "Project 2" });
    await createTestProject(user.id, { name: "Project 3" });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    const authHeaders = {
      Cookie: await getAuthCookieHeader(page),
      "Content-Type": "application/json",
    };

    // Make concurrent requests
    const results = await makeConcurrentRequests(request, {
      url: `${testEnvConfig.app.baseUrl}/api/projects?page=1&limit=5`,
      headers: authHeaders,
      count: 5,
    });

    // All requests should succeed
    expect(results.every((r) => r.status === 200)).toBe(true);

    // All responses should have same data
    const firstData = results[0].body as { data?: unknown[] };
    expect(results.every((r) => {
      const data = r.body as { data?: unknown[] };
      return JSON.stringify(data) === JSON.stringify(firstData);
    })).toBe(true);
  });

  test("should handle concurrent project updates (last write wins)", async ({ page, request }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, { name: "Original Name" });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    const authHeaders = {
      Cookie: await getAuthCookieHeader(page),
      "Content-Type": "application/json",
    };

    // Make concurrent updates with different names
    const updateData = [
      { name: "Update 1" },
      { name: "Update 2" },
      { name: "Update 3" },
    ];

    const { results, finalState } = await testRaceCondition(
      request,
      `${testEnvConfig.app.baseUrl}/api/projects/${project.id}`,
      updateData,
      {
        method: "PATCH",
        headers: authHeaders,
      },
    );

    // At least one update should succeed
    expect(results.some((r) => r.status === 200)).toBe(true);

    // Final state should be one of the updates
    const finalProject = finalState as { data?: { name?: string } };
    expect(finalProject.data?.name).toMatch(/Update \d/);

    // Verify in database
    const dbProject = await getProjectById(project.id);
    expect(dbProject?.name).toMatch(/Update \d/);
  });

  test("should handle concurrent project creation", async ({ page, request }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    const authHeaders = {
      Cookie: await getAuthCookieHeader(page),
      "Content-Type": "application/json",
    };

    // Create multiple projects concurrently
    const projectData = [
      { name: "Concurrent Project 1", json: JSON.stringify({ objects: [] }), width: 1920, height: 1080 },
      { name: "Concurrent Project 2", json: JSON.stringify({ objects: [] }), width: 1920, height: 1080 },
      { name: "Concurrent Project 3", json: JSON.stringify({ objects: [] }), width: 1920, height: 1080 },
    ];

    const results = await makeConcurrentRequests(request, {
      url: `${testEnvConfig.app.baseUrl}/api/projects`,
      method: "POST",
      headers: authHeaders,
      data: projectData[0], // Use first project data for all requests
      count: 3,
    });

    // All requests should succeed
    expect(results.every((r) => r.status === 200 || r.status === 201)).toBe(true);

    // Verify all projects were created
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=10",
    );

    expect(status).toBe(200);
    const projects = body as { data?: unknown[] };
    expect(projects.data?.length).toBeGreaterThanOrEqual(3);
  });
});

