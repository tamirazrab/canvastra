import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the editor page.
 * Encapsulates editor page interactions for maintainable tests.
 */
export class EditorPage {
  readonly page: Page;
  readonly canvas: Locator;
  readonly shapesButton: Locator;
  readonly textButton: Locator;
  readonly fillColorButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator("canvas");
    this.shapesButton = page.locator('button[aria-label*="shapes"], button:has-text("Shapes")');
    this.textButton = page.locator('button[aria-label*="text"], button:has-text("Text")');
    this.fillColorButton = page.locator('button[aria-label*="fill"], button:has-text("Fill")');
    this.saveButton = page.locator('button[aria-label*="save"], button:has-text("Save")');
  }

  async goto(projectId: string): Promise<void> {
    await this.page.goto(`/editor/${projectId}`);
    await this.page.waitForSelector("canvas", { timeout: 10000 });
  }

  async waitForCanvas(): Promise<void> {
    await this.canvas.waitFor({ state: "visible", timeout: 10000 });
  }

  async clickOnCanvas(x: number, y: number): Promise<void> {
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + x, box.y + y);
    }
  }

  async addRectangle(): Promise<void> {
    await this.shapesButton.click();
    await this.page.click('button[aria-label*="rectangle"], button:has-text("Rectangle")');
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    await this.page.waitForTimeout(500);
  }

  async addCircle(): Promise<void> {
    await this.shapesButton.click();
    await this.page.click('button[aria-label*="circle"], button:has-text("Circle")');
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    await this.page.waitForTimeout(500);
  }

  async addText(text: string): Promise<void> {
    await this.textButton.click();
    const box = await this.canvas.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    await this.page.keyboard.type(text);
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(500);
  }

  async selectObject(x: number, y: number): Promise<void> {
    await this.clickOnCanvas(x, y);
    await this.page.waitForTimeout(300);
  }

  async undo(): Promise<void> {
    await this.page.keyboard.press("Control+Z");
    await this.page.waitForTimeout(500);
  }

  async redo(): Promise<void> {
    await this.page.keyboard.press("Control+Shift+Z");
    await this.page.waitForTimeout(500);
  }

  async deleteSelected(): Promise<void> {
    await this.page.keyboard.press("Delete");
    await this.page.waitForTimeout(500);
  }

  async copy(): Promise<void> {
    await this.page.keyboard.press("Control+C");
  }

  async paste(): Promise<void> {
    await this.page.keyboard.press("Control+V");
    await this.page.waitForTimeout(500);
  }
}

