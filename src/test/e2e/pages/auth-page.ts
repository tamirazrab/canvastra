import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for authentication pages.
 * Encapsulates authentication page interactions for maintainable tests.
 */
export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly githubButton: Locator;
  readonly googleButton: Locator;
  readonly errorMessage: Locator;
  readonly signUpLink: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#email, input[type='email']");
    this.passwordInput = page.locator("#password, input[type='password']");
    this.nameInput = page.locator("#name, input[name='name']");
    this.submitButton = page.locator('button[type="submit"]');
    this.githubButton = page.locator('button:has-text("GitHub"), button[aria-label*="GitHub"]');
    this.googleButton = page.locator('button:has-text("Google"), button[aria-label*="Google"]');
    this.errorMessage = page.locator('[role="alert"], .toast-error, [data-sonner-toast]');
    this.signUpLink = page.locator('a:has-text("Sign up"), a[href*="sign-up"]');
    this.signInLink = page.locator('a:has-text("Sign in"), a[href*="sign-in"]');
  }

  /**
   * Navigate to sign-in page.
   */
  async gotoSignIn(lang = "en"): Promise<void> {
    await this.page.goto(`/${lang}/sign-in`, { waitUntil: "domcontentloaded" });
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Navigate to sign-up page.
   */
  async gotoSignUp(lang = "en"): Promise<void> {
    await this.page.goto(`/${lang}/sign-up`, { waitUntil: "domcontentloaded" });
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Fill email input.
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password input.
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill name input (for sign-up).
   */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Submit the form.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Sign in with email and password.
   */
  async signIn(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();

    // Wait for navigation away from sign-in page
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/sign-in") && !url.pathname.includes("/sign-up"),
      { timeout: 30000 },
    );
  }

  /**
   * Sign up with email, password, and name.
   */
  async signUp(name: string, email: string, password: string): Promise<void> {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();

    // Wait for navigation away from sign-up page
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/sign-in") && !url.pathname.includes("/sign-up"),
      { timeout: 30000 },
    );
  }

  /**
   * Click GitHub OAuth button.
   */
  async clickGithub(): Promise<void> {
    await this.githubButton.click();
  }

  /**
   * Click Google OAuth button.
   */
  async clickGoogle(): Promise<void> {
    await this.googleButton.click();
  }

  /**
   * Wait for error message to appear.
   */
  async waitForError(timeout = 5000): Promise<string> {
    await this.errorMessage.first().waitFor({ state: "visible", timeout });
    return await this.errorMessage.first().textContent() || "";
  }

  /**
   * Assert that error message is visible.
   */
  async assertErrorVisible(): Promise<void> {
    await expect(this.errorMessage.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that error message contains text.
   */
  async assertErrorContains(text: string): Promise<void> {
    await this.assertErrorVisible();
    const errorText = await this.errorMessage.first().textContent();
    expect(errorText).toContain(text);
  }

  /**
   * Navigate to sign-up from sign-in page.
   */
  async navigateToSignUp(): Promise<void> {
    await this.signUpLink.click();
    await this.page.waitForURL(/\/sign-up/, { timeout: 5000 });
  }

  /**
   * Navigate to sign-in from sign-up page.
   */
  async navigateToSignIn(): Promise<void> {
    await this.signInLink.click();
    await this.page.waitForURL(/\/sign-in/, { timeout: 5000 });
  }

  /**
   * Wait for successful authentication (redirect away from auth pages).
   */
  async waitForAuthenticationSuccess(): Promise<void> {
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/sign-in") && !url.pathname.includes("/sign-up"),
      { timeout: 30000 },
    );
  }

  /**
   * Assert that user is redirected to editor after sign-in.
   */
  async assertRedirectedToEditor(): Promise<void> {
    await expect(this.page).toHaveURL(/\/editor/, { timeout: 30000 });
  }
}

