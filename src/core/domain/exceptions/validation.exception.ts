import { DomainException } from "./domain-exception";

export class ValidationException extends DomainException {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR");
    this.errors = errors || {};
  }

  public addError(field: string, message: string): void {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }

  public hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }
}

