import { describe, it, expect } from "vitest";
import { ImageUrl } from "@/core/domain/value-objects";

describe("ImageUrl", () => {
  it("should create a valid HTTP URL", () => {
    const url = new ImageUrl("http://example.com/image.jpg");
    expect(url.getValue()).toBe("http://example.com/image.jpg");
  });

  it("should create a valid HTTPS URL", () => {
    const url = new ImageUrl("https://example.com/image.jpg");
    expect(url.getValue()).toBe("https://example.com/image.jpg");
  });

  it("should trim whitespace", () => {
    const url = new ImageUrl("  https://example.com/image.jpg  ");
    expect(url.getValue()).toBe("https://example.com/image.jpg");
  });

  it("should throw error for empty URL", () => {
    expect(() => new ImageUrl("")).toThrow("Image URL cannot be empty");
    expect(() => new ImageUrl("   ")).toThrow("Image URL cannot be empty");
  });

  it("should throw error for invalid URL format", () => {
    expect(() => new ImageUrl("not-a-url")).toThrow("Invalid image URL format");
    expect(() => new ImageUrl("ftp://example.com/image.jpg")).toThrow("Invalid image URL format");
    expect(() => new ImageUrl("//example.com/image.jpg")).toThrow("Invalid image URL format");
  });

  it("should compare URLs correctly", () => {
    const url1 = new ImageUrl("https://example.com/image.jpg");
    const url2 = new ImageUrl("https://example.com/image.jpg");
    const url3 = new ImageUrl("https://example.com/other.jpg");

    expect(url1.equals(url2)).toBe(true);
    expect(url1.equals(url3)).toBe(false);
  });
});

