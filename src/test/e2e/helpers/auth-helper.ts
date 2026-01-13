import { Page, BrowserContext, Browser } from "@playwright/test";
import { createTestUser } from "./db-helper";
import { verifyAccountExists, getAccountDetails } from "./auth-verify";

/**
 * Authentication helper utilities for E2E tests.
 * Provides functions to authenticate users in tests.
 */

/**
 * Sign in a user via the UI.
 * Navigates to sign-in page and completes authentication flow.
 */
export async function authenticateUser(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  // CRITICAL: Verify account exists before attempting authentication
  // This ensures Better Auth can find the account we created
  console.log(`[auth-helper] Verifying account exists for: ${email}`);
  const accountExists = await verifyAccountExists(email, 5);
  
  if (!accountExists) {
    // Get account details for debugging
    const accountDetails = await getAccountDetails(email);
    throw new Error(
      `Account verification failed for ${email}. ` +
      `Account details: ${JSON.stringify(accountDetails)}. ` +
      `This means Better Auth won't be able to authenticate this user.`,
    );
  }
  
  console.log(`[auth-helper] Account verified, proceeding with authentication`);

  // Navigate to sign-in page (with language prefix)
  await page.goto("/en/sign-in", { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait for the form to be ready - use id selector which is more reliable
  await page.waitForSelector('#email, input[type="email"]', { 
    timeout: 15000,
    state: "visible"
  });

  // Fill in email using id selector
  await page.fill('#email', email);

  // Fill in password using id selector
  await page.fill('#password', password);

  // Wait a bit for form to be ready
  await page.waitForTimeout(200);

  // Submit the form and wait for response
  // Use Promise.all to wait for both the click and the response
  const [apiResponse] = await Promise.all([
    page.waitForResponse(
      (resp) => {
        const url = resp.url();
        return (
          url.includes('/api/auth/sign-in/email') ||
          url.includes('/api/auth/sign-in') ||
          (url.includes('/api/auth') && resp.request().method() === 'POST')
        );
      },
      { timeout: 20000 },
    ).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  
  // Check response status if we got one
  if (apiResponse) {
    const status = apiResponse.status();
    if (status >= 400) {
      const responseBody = await apiResponse.json().catch(() => ({}));
      throw new Error(
        `Authentication API error (${status}): ${responseBody.error || apiResponse.statusText()}`,
      );
    }
    console.log(`[auth-helper] Authentication API response: ${status}`);
  } else {
    console.warn('[auth-helper] Could not capture API response, continuing...');
  }

  // Wait for navigation after sign-in (redirect away from sign-in page)
  // Increased timeout and better error handling
  try {
    await page.waitForURL(
      (url) => !url.pathname.includes("/sign-in") && !url.pathname.includes("/sign-up"),
      {
        timeout: 30000, // Increased from 20000
        waitUntil: "domcontentloaded",
      },
    );
    console.log(`[auth-helper] Successfully authenticated and navigated to: ${page.url()}`);
  } catch (error) {
    // Check if page is still open before trying to interact with it
    let pageClosed = false;
    try {
      pageClosed = page.isClosed();
    } catch {
      pageClosed = true;
    }
    
    if (pageClosed) {
      throw new Error(`Authentication failed: Page was closed. Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Wait a bit for any toast messages to appear (only if page is still open)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch {
      // Ignore errors
    }
    
    // Check if page is still open before checking for errors
    try {
      if (page.isClosed()) {
        throw error; // Re-throw original error if page closed
      }
      
      // Check if there's an error toast or message on the page
      const errorSelectors = [
        'text=/invalid|error|failed/i',
        '[role="alert"]',
        '.toast-error',
        '[data-sonner-toast]',
      ];
      
      for (const selector of errorSelectors) {
        try {
          const errorElement = await page.locator(selector).first().textContent({ timeout: 500 });
          if (errorElement) {
            throw new Error(`Authentication failed: ${errorElement}`);
          }
        } catch (selectorError: any) {
          // If it's our error, re-throw it
          if (selectorError.message.includes('Authentication failed:')) {
            throw selectorError;
          }
          // Otherwise, continue to next selector
        }
      }
      
      // Check the current URL to see if we're still on sign-in
      try {
        const currentUrl = page.url();
        if (currentUrl.includes('/sign-in')) {
          // Take a screenshot for debugging (if possible)
          try {
            await page.screenshot({ path: 'test-results/auth-failed.png', timeout: 1000 });
          } catch {
            // Ignore screenshot errors
          }
          throw new Error(`Authentication failed: Still on sign-in page after submission. URL: ${currentUrl}. Email: ${email}`);
        }
      } catch (urlError: any) {
        // If it's our error, re-throw it
        if (urlError.message.includes('Authentication failed:')) {
          throw urlError;
        }
        // Otherwise, continue
      }
    } catch (pageError: any) {
      // If we found a specific error, throw that
      if (pageError.message.includes('Authentication failed:')) {
        throw pageError;
      }
      // Otherwise, continue to throw original error
    }
    
    // Re-throw the original error if we haven't found a more specific one
    throw error;
  }
}

/**
 * Create an authenticated browser context.
 * Creates a user with password, signs them in, and returns a context with their session.
 */
export async function createAuthenticatedContext(
  browser: Browser,
  userOverrides?: { email?: string; name?: string; password?: string },
): Promise<{ context: BrowserContext; user: { id: string; email: string; name: string; password: string } }> {
  // Create test user with password
  const user = await createTestUser(userOverrides);

  // Create a new context for this user
  const context = await browser.newContext();

  // Sign in the user via UI
  const page = await context.newPage();
  await authenticateUser(page, user.email, user.password);

  // Return context and user info
  return { context, user };
}

/**
 * Get authentication cookies from a page.
 * Useful for transferring auth state between contexts.
 */
export async function getAuthCookies(page: Page): Promise<
  Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>
> {
  return await page.context().cookies();
}

/**
 * Set authentication cookies on a context.
 * Useful for restoring auth state.
 */
export async function setAuthCookies(
  context: BrowserContext,
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
  }>,
): Promise<void> {
  await context.addCookies(cookies);
}

