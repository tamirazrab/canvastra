import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for dashboard pages.
 * Encapsulates dashboard page interactions for maintainable tests.
 */
export class DashboardPage {
  readonly page: Page;
  readonly revenueChart: Locator;
  readonly latestInvoices: Locator;
  readonly summaryCards: Locator;
  readonly createInvoiceButton: Locator;
  readonly invoiceTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.revenueChart = page.locator('[data-revenue-chart], .revenue-chart, canvas');
    this.latestInvoices = page.locator('[data-latest-invoices], .latest-invoices');
    this.summaryCards = page.locator('[data-summary-card], .summary-card');
    this.createInvoiceButton = page.locator('button:has-text("Create Invoice"), button[aria-label*="create"]');
    this.invoiceTable = page.locator('table, [role="table"]');
  }

  /**
   * Navigate to dashboard page.
   */
  async goto(lang = "en"): Promise<void> {
    await this.page.goto(`/${lang}/dashboard`, { waitUntil: "domcontentloaded" });
  }

  /**
   * Wait for dashboard to load.
   */
  async waitForLoad(timeout = 10000): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  /**
   * Get revenue chart element.
   */
  getRevenueChart(): Locator {
    return this.revenueChart;
  }

  /**
   * Assert that revenue chart is visible.
   */
  async assertRevenueChartVisible(): Promise<void> {
    await expect(this.revenueChart).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get latest invoices section.
   */
  getLatestInvoices(): Locator {
    return this.latestInvoices;
  }

  /**
   * Assert that latest invoices are visible.
   */
  async assertLatestInvoicesVisible(): Promise<void> {
    await expect(this.latestInvoices).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get summary cards.
   */
  getSummaryCards(): Locator {
    return this.summaryCards;
  }

  /**
   * Assert that summary cards are visible.
   */
  async assertSummaryCardsVisible(): Promise<void> {
    await expect(this.summaryCards.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get count of summary cards.
   */
  async getSummaryCardCount(): Promise<number> {
    return await this.summaryCards.count();
  }

  /**
   * Click create invoice button.
   */
  async clickCreateInvoice(): Promise<void> {
    await this.createInvoiceButton.click();
  }

  /**
   * Get invoice table.
   */
  getInvoiceTable(): Locator {
    return this.invoiceTable;
  }

  /**
   * Assert that invoice table is visible.
   */
  async assertInvoiceTableVisible(): Promise<void> {
    await expect(this.invoiceTable).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get invoice rows from table.
   */
  async getInvoiceRows(): Promise<Locator> {
    return this.invoiceTable.locator("tbody tr, [role="row"]");
  }

  /**
   * Get invoice count.
   */
  async getInvoiceCount(): Promise<number> {
    const rows = await this.getInvoiceRows();
    return await rows.count();
  }

  /**
   * Assert that invoice count matches expected.
   */
  async assertInvoiceCount(expected: number): Promise<void> {
    const count = await this.getInvoiceCount();
    expect(count).toBe(expected);
  }

  /**
   * Wait for data to load (network idle).
   */
  async waitForDataLoad(timeout = 10000): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout });
  }
}

