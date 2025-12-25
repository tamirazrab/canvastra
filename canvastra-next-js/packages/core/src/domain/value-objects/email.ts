import { ValueObject } from "./value-object";

export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  protected validate(value: string): string {
    if (!value || value.trim().length === 0) {
      throw new Error("Email cannot be empty");
    }

    const trimmed = value.trim().toLowerCase();

    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email format: ${value}`);
    }

    return trimmed;
  }
}
