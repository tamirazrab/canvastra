import { test as base } from "@playwright/test";

export type TestFixtures = {
  authenticatedPage: void;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Navigate to sign-in page and authenticate
    await page.goto("/sign-in");
    // Add authentication logic here when auth is implemented
    // For now, this is a placeholder
    await use();
  },
});

export { expect } from "@playwright/test";

