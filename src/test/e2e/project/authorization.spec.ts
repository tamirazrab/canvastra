import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";
import { assertFailureResponse, FailureAssertions } from "../utils/fp-ts-assertions";

/**
 * E2E tests for project authorization.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Project Authorization", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should prevent user from accessing another user's project via API", async ({ page }) => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const project = await createTestProject(user1.id);

    // Authenticate as user2
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user2.email);
    await passwordInput.fill(user2.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to access user1's project
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
    );

    expect(status).toBe(403);
    assertFailureResponse(status, body, FailureAssertions.projectUnauthorized());
  });

  test("should prevent user from updating another user's project", async ({ page }) => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const project = await createTestProject(user1.id);

    // Authenticate as user2
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user2.email);
    await passwordInput.fill(user2.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to update user1's project
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
      {
        method: "PATCH",
        data: { name: "Hacked Project" },
      },
    );

    expect(status).toBe(403);
    assertFailureResponse(status, body, FailureAssertions.projectUnauthorized());
  });

  test("should prevent user from deleting another user's project", async ({ page }) => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const project = await createTestProject(user1.id);

    // Authenticate as user2
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user2.email);
    await passwordInput.fill(user2.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to delete user1's project
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
      {
        method: "DELETE",
      },
    );

    expect(status).toBe(403);
    assertFailureResponse(status, body, FailureAssertions.projectUnauthorized());
  });

  test("should prevent user from duplicating another user's project", async ({ page }) => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const project = await createTestProject(user1.id);

    // Authenticate as user2
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user2.email);
    await passwordInput.fill(user2.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to duplicate user1's project
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}/duplicate`,
      {
        method: "POST",
      },
    );

    expect(status).toBe(403);
    assertFailureResponse(status, body, FailureAssertions.projectUnauthorized());
  });

  test("should allow user to access their own projects", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Access own project
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
    );

    expect(status).toBe(200);
    expect(body).toHaveProperty("data");
  });

  test("should return 404 for non-existent project", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to access non-existent project
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects/non-existent-id",
    );

    expect(status).toBe(404);
    assertFailureResponse(status, body, FailureAssertions.projectNotFound());
  });
});

