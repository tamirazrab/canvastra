import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticatedApiRequest, unauthenticatedApiRequest } from "../helpers/api-helper";
import {
  assertFailureResponse,
  assertSuccessResponse,
  FailureAssertions,
} from "../utils/fp-ts-assertions";

/**
 * E2E tests for API failure propagation.
 * Tests validate that domain failures (fp-ts Either/TaskEither) are correctly
 * propagated to HTTP responses with appropriate status codes.
 * Zero mocking.
 */

test.describe("API Failure Propagation", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should propagate ProjectNotFoundFailure as 404", async ({ page }) => {
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

  test("should propagate ProjectUnauthorizedFailure as 403", async ({ page }) => {
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

  test("should propagate validation errors as 400", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to create project with invalid data
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects",
      {
        method: "POST",
        data: {
          // Missing required fields
          name: "",
        },
      },
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });

  test("should propagate authentication errors as 401", async ({ request }) => {
    // Try to access protected route without authentication
    const { status, body } = await unauthenticatedApiRequest(request, "/api/projects?page=1&limit=5");

    expect(status).toBe(401);
    assertFailureResponse(status, body, FailureAssertions.unauthorized());
  });

  test("should return success response for valid requests", async ({ page }) => {
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
    assertSuccessResponse(status, body, (data) => data !== null);
  });
});

