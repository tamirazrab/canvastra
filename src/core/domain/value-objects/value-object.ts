export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = this.validate(value);
  }

  protected abstract validate(value: T): T;

  public equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this.value === other.value;
  }

  public getValue(): T {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }
}

