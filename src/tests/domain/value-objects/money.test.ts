import { describe, it, expect } from "vitest";
import { Money } from "@/core/domain/value-objects";

describe("Money", () => {
  it("should create valid money", () => {
    const money = new Money(100.50);
    expect(money.getValue()).toBe(100.5);
    expect(money.getCurrency()).toBe("USD");
  });

  it("should round to 2 decimal places", () => {
    const money = new Money(100.999);
    expect(money.getValue()).toBe(101);
  });

  it("should throw error for negative amount", () => {
    expect(() => new Money(-10)).toThrow("Money amount cannot be negative");
  });

  it("should throw error for non-finite number", () => {
    expect(() => new Money(Infinity)).toThrow("Money amount must be a finite number");
    expect(() => new Money(NaN)).toThrow("Money amount must be a finite number");
  });

  it("should add money with same currency", () => {
    const money1 = new Money(100, "USD");
    const money2 = new Money(50, "USD");
    const result = money1.add(money2);

    expect(result.getValue()).toBe(150);
    expect(result.getCurrency()).toBe("USD");
  });

  it("should throw error when adding different currencies", () => {
    const money1 = new Money(100, "USD");
    const money2 = new Money(50, "EUR");

    expect(() => money1.add(money2)).toThrow("Cannot add money with different currencies");
  });

  it("should subtract money with same currency", () => {
    const money1 = new Money(100, "USD");
    const money2 = new Money(30, "USD");
    const result = money1.subtract(money2);

    expect(result.getValue()).toBe(70);
  });

  it("should multiply money", () => {
    const money = new Money(100, "USD");
    const result = money.multiply(2.5);

    expect(result.getValue()).toBe(250);
    expect(result.getCurrency()).toBe("USD");
  });

  it("should compare money correctly", () => {
    const money1 = new Money(100, "USD");
    const money2 = new Money(100, "USD");
    const money3 = new Money(100, "EUR");
    const money4 = new Money(50, "USD");

    expect(money1.equals(money2)).toBe(true);
    expect(money1.equals(money3)).toBe(false);
    expect(money1.equals(money4)).toBe(false);
  });
});

