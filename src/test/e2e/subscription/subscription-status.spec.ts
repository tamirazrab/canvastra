import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { createTestSubscription } from "../helpers/subscription-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";
import { assertSuccessResponse } from "../utils/fp-ts-assertions";

/**
 * E2E tests for subscription status checks.
 * Tests use real database and API routes.
 * Zero mocking.
 */

test.describe("Subscription Status", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should return active subscription status", async ({ page }) => {
    const user = await createTestUser();
    await createTestSubscription(user.id, {
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Get subscription status
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/subscriptions/current",
    );

    expect(status).toBe(200);
    const subscription = assertSuccessResponse(status, body, (data) => data !== null);
    expect(subscription).toHaveProperty("data");
    expect(subscription.data).toHaveProperty("status", "active");
    expect(subscription.data).toHaveProperty("active", true);
  });

  test("should return inactive subscription status", async ({ page }) => {
    const user = await createTestUser();
    await createTestSubscription(user.id, {
      status: "canceled",
    });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Get subscription status
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/subscriptions/current",
    );

    expect(status).toBe(200);
    const subscription = assertSuccessResponse(status, body, (data) => data !== null);
    expect(subscription).toHaveProperty("data");
    expect(subscription.data).toHaveProperty("status", "canceled");
    expect(subscription.data).toHaveProperty("active", false);
  });

  test("should return null for user without subscription", async ({ page }) => {
    const user = await createTestUser();

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Get subscription status
    const { status, body } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/subscriptions/current",
    );

    expect(status).toBe(200);
    const subscription = assertSuccessResponse(status, body);
    expect(subscription).toHaveProperty("data");
    expect(subscription.data).toBeNull();
  });

  test("should require authentication for subscription status", async ({ request }) => {
    // Try to get subscription status without authentication
    const { status } = await request.get("/api/subscriptions/current");

    expect(status).toBe(401);
  });
});

