import { describe, it, expect } from "vitest";
import { Email } from "@/core/domain/value-objects";

describe("Email", () => {
  it("should create a valid email", () => {
    const email = new Email("test@example.com");
    expect(email.getValue()).toBe("test@example.com");
  });

  it("should normalize email to lowercase", () => {
    const email = new Email("Test@Example.COM");
    expect(email.getValue()).toBe("test@example.com");
  });

  it("should trim whitespace", () => {
    const email = new Email("  test@example.com  ");
    expect(email.getValue()).toBe("test@example.com");
  });

  it("should throw error for empty email", () => {
    expect(() => new Email("")).toThrow("Email cannot be empty");
    expect(() => new Email("   ")).toThrow("Email cannot be empty");
  });

  it("should throw error for invalid email format", () => {
    expect(() => new Email("invalid")).toThrow("Invalid email format");
    expect(() => new Email("invalid@")).toThrow("Invalid email format");
    expect(() => new Email("@example.com")).toThrow("Invalid email format");
    expect(() => new Email("test@")).toThrow("Invalid email format");
  });

  it("should compare emails correctly", () => {
    const email1 = new Email("test@example.com");
    const email2 = new Email("test@example.com");
    const email3 = new Email("other@example.com");

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
    expect(email1.equals(null as any)).toBe(false);
  });
});

