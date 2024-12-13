import { ValueObject } from "./value-object";

export class Money extends ValueObject<number> {
  private readonly currency: string;

  constructor(value: number, currency: string = "USD") {
    super(value);
    this.currency = currency;
  }

  protected validate(value: number): number {
    if (value < 0) {
      throw new Error("Money amount cannot be negative");
    }
    if (!Number.isFinite(value)) {
      throw new Error("Money amount must be a finite number");
    }
    return Math.round(value * 100) / 100; // Round to 2 decimal places
  }

  public getCurrency(): string {
    return this.currency;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.value + other.value, this.currency);
  }

  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    return new Money(this.value - other.value, this.currency);
  }

  public multiply(factor: number): Money {
    return new Money(this.value * factor, this.currency);
  }

  public equals(other: Money): boolean {
    return (
      super.equals(other) &&
      this.currency === other.currency
    );
  }
}

