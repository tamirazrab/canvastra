import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { AuthPage } from "../pages/auth-page";
import { authenticatedApiRequest } from "../helpers/api-helper";

/**
 * E2E tests for session management.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Session Management", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should maintain session across multiple page navigations", async ({ page }) => {
    const user = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.signIn(user.email, user.password);
    await authPage.assertRedirectedToEditor();

    // Navigate to different pages
    await page.goto("/en/editor");
    await expect(page).toHaveURL(/\/editor/);

    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify API access still works
    const { status } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=5",
    );
    expect(status).toBe(200);
  });

  test("should maintain session after browser refresh", async ({ page }) => {
    const user = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.signIn(user.email, user.password);
    await authPage.assertRedirectedToEditor();

    // Refresh page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await expect(page).toHaveURL(/\/editor/);
    }

    // Verify API access still works
    const { status } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=5",
    );
    expect(status).toBe(200);
  });

  test("should require authentication for protected routes", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/en/editor");

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should require authentication for protected API routes", async ({ request }) => {
    // Try to access protected API route without authentication
    const response = await request.get("/api/projects?page=1&limit=5");

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });
});

