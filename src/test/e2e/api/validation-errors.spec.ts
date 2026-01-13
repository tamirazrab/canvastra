import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";
import { assertFailureResponse, FailureAssertions } from "../utils/fp-ts-assertions";

/**
 * E2E tests for input validation errors.
 * Tests validate that invalid inputs are rejected with appropriate error messages.
 * Zero mocking.
 */

test.describe("Validation Errors", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should reject project creation with missing required fields", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to create project without required fields
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects",
      {
        method: "POST",
        data: {},
      },
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });

  test("should reject project creation with invalid JSON", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to create project with invalid JSON
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects",
      {
        method: "POST",
        data: {
          name: "Test Project",
          json: "not valid json",
          width: 1920,
          height: 1080,
        },
      },
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });

  test("should reject project update with invalid data", async ({ page }) => {
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

    // Try to update project with invalid data
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
      {
        method: "PATCH",
        data: {
          width: -1, // Invalid: negative width
          height: -1, // Invalid: negative height
        },
      },
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });

  test("should reject project creation with invalid dimensions", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to create project with invalid dimensions
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects",
      {
        method: "POST",
        data: {
          name: "Test Project",
          json: JSON.stringify({ objects: [] }),
          width: 0, // Invalid: zero width
          height: 0, // Invalid: zero height
        },
      },
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });

  test("should reject invalid pagination parameters", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Try to get projects with invalid pagination
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=-1&limit=-1",
    );

    expect(status).toBe(400);
    assertFailureResponse(status, body, FailureAssertions.validationError());
  });
});

