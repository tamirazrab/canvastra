import { describe, it, expect } from "vitest";
import { ValidationException } from "@/core/domain/exceptions";

describe("ValidationException", () => {
  it("should create exception with message", () => {
    const error = new ValidationException("Validation failed");

    expect(error.message).toBe("Validation failed");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.errors).toEqual({});
  });

  it("should create exception with errors", () => {
    const errors = {
      email: ["Email is required", "Email is invalid"],
      password: ["Password must be at least 8 characters"],
    };
    const error = new ValidationException("Validation failed", errors);

    expect(error.errors).toEqual(errors);
  });

  it("should add error to field", () => {
    const error = new ValidationException("Validation failed");
    error.addError("email", "Email is required");
    error.addError("email", "Email is invalid");

    expect(error.errors.email).toEqual(["Email is required", "Email is invalid"]);
  });

  it("should check if has errors", () => {
    const error1 = new ValidationException("Validation failed");
    expect(error1.hasErrors()).toBe(false);

    const error2 = new ValidationException("Validation failed", { email: ["Invalid"] });
    expect(error2.hasErrors()).toBe(true);

    error1.addError("field", "Error");
    expect(error1.hasErrors()).toBe(true);
  });
});

