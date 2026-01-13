import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { testDb } from "../setup/db-setup";
import { users, accounts } from "@/bootstrap/boundaries/db/schema";
import { eq } from "drizzle-orm";
import { createTestUser } from "../helpers/db-helper";
import { AuthPage } from "../pages/auth-page";
import { authenticatedApiRequest } from "../helpers/api-helper";

/**
 * E2E tests for sign-up functionality.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Sign Up", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should create new user account", async ({ page }) => {
    const authPage = new AuthPage(page);
    const email = `test-${Date.now()}@example.com`;
    const password = "test-password-123";
    const name = "Test User";

    await authPage.gotoSignUp();
    await authPage.signUp(name, email, password);

    await authPage.assertRedirectedToEditor();

    // Verify user was created in database
    const createdUsers = await testDb
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    expect(createdUsers.length).toBe(1);
    expect(createdUsers[0].email).toBe(email);
    expect(createdUsers[0].name).toBe(name);

    // Verify account was created
    const createdAccounts = await testDb
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, email))
      .limit(1);

    expect(createdAccounts.length).toBe(1);
    expect(createdAccounts[0].providerId).toBe("credential");
  });

  test("should fail sign-up with existing email", async ({ page }) => {
    const existingUser = await createTestUser();
    const authPage = new AuthPage(page);

    await authPage.gotoSignUp();
    await authPage.fillName("New User");
    await authPage.fillEmail(existingUser.email);
    await authPage.fillPassword("new-password-123");
    await authPage.submit();

    await authPage.assertErrorVisible();
    const errorText = await authPage.waitForError();
    expect(errorText.toLowerCase()).toMatch(/exists|already|error/i);
  });

  test("should fail sign-up with invalid email format", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.gotoSignUp();
    await authPage.fillName("Test User");
    await authPage.fillEmail("invalid-email");
    await authPage.fillPassword("test-password-123");
    await authPage.submit();

    // Should show validation error
    await authPage.assertErrorVisible();
  });

  test("should fail sign-up with weak password", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.gotoSignUp();
    await authPage.fillName("Test User");
    await authPage.fillEmail(`test-${Date.now()}@example.com`);
    await authPage.fillPassword("123"); // Too short
    await authPage.submit();

    // Should show validation error
    await authPage.assertErrorVisible();
  });

  test("should navigate to sign-in page from sign-up", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.gotoSignUp();
    await authPage.navigateToSignIn();

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should automatically sign in after successful sign-up", async ({ page }) => {
    const authPage = new AuthPage(page);
    const email = `test-${Date.now()}@example.com`;
    const password = "test-password-123";
    const name = "Test User";

    await authPage.gotoSignUp();
    await authPage.signUp(name, email, password);

    await authPage.assertRedirectedToEditor();

    // Verify API access works (user is authenticated)
    const { status } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=5",
    );
    expect(status).toBe(200);
  });
});

