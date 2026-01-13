import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for subscription pages.
 * Encapsulates subscription page interactions for maintainable tests.
 */
export class SubscriptionPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly billingButton: Locator;
  readonly subscriptionStatus: Locator;
  readonly successModal: Locator;
  readonly failModal: Locator;
  readonly subscriptionAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('button:has-text("Subscribe"), button:has-text("Checkout"), button[aria-label*="checkout"]');
    this.billingButton = page.locator('button:has-text("Billing"), button:has-text("Manage"), button[aria-label*="billing"]');
    this.subscriptionStatus = page.locator('[data-subscription-status], .subscription-status');
    this.successModal = page.locator('[data-success-modal], .success-modal');
    this.failModal = page.locator('[data-fail-modal], .fail-modal');
    this.subscriptionAlert = page.locator('[data-subscription-alert], .subscription-alert');
  }

  /**
   * Navigate to subscription page.
   */
  async goto(lang = "en"): Promise<void> {
    await this.page.goto(`/${lang}/subscription`, { waitUntil: "domcontentloaded" });
  }

  /**
   * Click checkout button to create subscription.
   */
  async clickCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Click billing button to access billing portal.
   */
  async clickBilling(): Promise<void> {
    await this.billingButton.click();
  }

  /**
   * Wait for Stripe checkout redirect.
   */
  async waitForStripeCheckout(timeout = 10000): Promise<void> {
    await this.page.waitForURL(/checkout\.stripe\.com/, { timeout });
  }

  /**
   * Wait for billing portal redirect.
   */
  async waitForBillingPortal(timeout = 10000): Promise<void> {
    await this.page.waitForURL(/billing\.stripe\.com/, { timeout });
  }

  /**
   * Get subscription status text.
   */
  async getSubscriptionStatus(): Promise<string> {
    return await this.subscriptionStatus.textContent() || "";
  }

  /**
   * Assert that subscription status is active.
   */
  async assertSubscriptionActive(): Promise<void> {
    const status = await this.getSubscriptionStatus();
    expect(status.toLowerCase()).toMatch(/active|trialing/i);
  }

  /**
   * Assert that subscription status is inactive.
   */
  async assertSubscriptionInactive(): Promise<void> {
    const status = await this.getSubscriptionStatus();
    expect(status.toLowerCase()).toMatch(/inactive|cancelled|canceled|none/i);
  }

  /**
   * Wait for success modal to appear.
   */
  async waitForSuccessModal(timeout = 5000): Promise<void> {
    await this.successModal.waitFor({ state: "visible", timeout });
  }

  /**
   * Wait for fail modal to appear.
   */
  async waitForFailModal(timeout = 5000): Promise<void> {
    await this.failModal.waitFor({ state: "visible", timeout });
  }

  /**
   * Assert that success modal is visible.
   */
  async assertSuccessModalVisible(): Promise<void> {
    await expect(this.successModal).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that fail modal is visible.
   */
  async assertFailModalVisible(): Promise<void> {
    await expect(this.failModal).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that subscription alert is visible.
   */
  async assertSubscriptionAlertVisible(): Promise<void> {
    await expect(this.subscriptionAlert).toBeVisible({ timeout: 5000 });
  }

  /**
   * Close success modal.
   */
  async closeSuccessModal(): Promise<void> {
    const closeButton = this.successModal.locator('button:has-text("Close"), button[aria-label*="close"]');
    if (await closeButton.isVisible({ timeout: 1000 })) {
      await closeButton.click();
    }
  }

  /**
   * Close fail modal.
   */
  async closeFailModal(): Promise<void> {
    const closeButton = this.failModal.locator('button:has-text("Close"), button[aria-label*="close"]');
    if (await closeButton.isVisible({ timeout: 1000 })) {
      await closeButton.click();
    }
  }
}

