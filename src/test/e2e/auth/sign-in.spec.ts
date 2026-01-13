import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser } from "../helpers/db-helper";
import { AuthPage } from "../pages/auth-page";
import { authenticatedApiRequest } from "../helpers/api-helper";

/**
 * E2E tests for sign-in functionality.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Sign In", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should sign in user with valid credentials", async ({ page }) => {
    const user = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.signIn(user.email, user.password);

    await authPage.assertRedirectedToEditor();

    // Verify API access works
    const { status } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=5",
    );
    expect(status).toBe(200);
  });

  test("should fail sign-in with invalid email", async ({ page }) => {
    const user = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.fillEmail("invalid@example.com");
    await authPage.fillPassword(user.password);
    await authPage.submit();

    await authPage.assertErrorVisible();
    const errorText = await authPage.waitForError();
    expect(errorText.toLowerCase()).toMatch(/invalid|error/i);
  });

  test("should fail sign-in with invalid password", async ({ page }) => {
    const user = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.fillEmail(user.email);
    await authPage.fillPassword("wrong-password");
    await authPage.submit();

    await authPage.assertErrorVisible();
    const errorText = await authPage.waitForError();
    expect(errorText.toLowerCase()).toMatch(/invalid|error/i);
  });

  test("should persist session across page reloads", async ({ page }) => {
    const user = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.signIn(user.email, user.password);
    await authPage.assertRedirectedToEditor();

    // Reload page
    await page.reload();
    await expect(page).toHaveURL(/\/editor/);

    // Verify API access still works
    const { status } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=5",
    );
    expect(status).toBe(200);
  });

  test("should navigate to sign-up page from sign-in", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.gotoSignIn();
    await authPage.navigateToSignUp();

    await expect(page).toHaveURL(/\/sign-up/);
  });
});

