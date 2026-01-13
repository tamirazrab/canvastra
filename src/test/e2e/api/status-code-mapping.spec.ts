import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject } from "../helpers/db-helper";
import { authenticatedApiRequest, unauthenticatedApiRequest } from "../helpers/api-helper";
import { assertFailureResponse, FailureAssertions } from "../utils/fp-ts-assertions";

/**
 * E2E tests for HTTP status code mapping.
 * Tests validate that domain failures map to correct HTTP status codes.
 * Zero mocking.
 */

test.describe("Status Code Mapping", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should map ProjectNotFoundFailure to 404", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects/non-existent-id",
    );

    expect(status).toBe(404);
    assertFailureResponse(status, body, FailureAssertions.projectNotFound());
  });

  test("should map ProjectUnauthorizedFailure to 403", async ({ page }) => {
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

    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
    );

    expect(status).toBe(403);
    assertFailureResponse(status, body, FailureAssertions.projectUnauthorized());
  });

  test("should map validation errors to 400", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects",
      {
        method: "POST",
        data: {
          name: "",
          json: "invalid",
          width: -1,
          height: -1,
        },
      },
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });

  test("should map unauthenticated requests to 401", async ({ request }) => {
    const { status, body } = await unauthenticatedApiRequest(request, "/api/projects?page=1&limit=5");

    expect(status).toBe(401);
    assertFailureResponse(status, body, FailureAssertions.unauthorized());
  });

  test("should return 200 for successful requests", async ({ page }) => {
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

    const { status } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
    );

    expect(status).toBe(200);
  });
});

