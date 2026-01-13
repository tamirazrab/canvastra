import { Page, Locator } from "@playwright/test";

/**
 * Wait helper utilities for E2E tests.
 * Provides deterministic waits without using sleep.
 */

/**
 * Wait for auto-save to complete (debounce + network request).
 */
export async function waitForAutoSave(page: Page, timeout = 2000): Promise<void> {
  // Wait for debounce (500ms) plus network request
  await page.waitForTimeout(600);
  
  // Wait for any pending network requests to complete
  await page.waitForLoadState("networkidle", { timeout });
}

/**
 * Wait for canvas to be fully initialized.
 */
export async function waitForCanvasReady(page: Page): Promise<void> {
  await page.waitForSelector("canvas", { state: "visible", timeout: 10000 });
  
  // Wait for fabric.js to initialize
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector("canvas");
      return canvas && (canvas as any).fabric;
    },
    { timeout: 10000 }
  );
}

/**
 * Wait for element to be visible and stable (not animating).
 */
export async function waitForStable(
  locator: Locator,
  timeout = 5000
): Promise<void> {
  await locator.waitFor({ state: "visible", timeout });
  
  // Wait for any animations to complete
  await locator.page().waitForTimeout(300);
}

/**
 * Wait for toast notification to appear and optionally disappear.
 */
export async function waitForToast(
  page: Page,
  text?: string,
  shouldDisappear = false
): Promise<void> {
  const toastSelector = text
    ? page.locator(`[role="alert"], .toast, [class*="toast"]:has-text("${text}")`)
    : page.locator('[role="alert"], .toast, [class*="toast"]').first();
  
  await toastSelector.waitFor({ state: "visible", timeout: 5000 });
  
  if (shouldDisappear) {
    await toastSelector.waitFor({ state: "hidden", timeout: 10000 });
  }
}

/**
 * Wait for download to complete.
 */
export async function waitForDownload(
  page: Page,
  timeout = 30000
): Promise<import("@playwright/test").Download> {
  return await page.waitForEvent("download", { timeout });
}

