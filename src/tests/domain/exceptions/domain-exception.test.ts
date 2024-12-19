import { describe, it, expect } from "vitest";
import { DomainException } from "@/core/domain/exceptions";

class TestException extends DomainException {
  constructor(message: string) {
    super(message, "TEST_ERROR");
  }
}

describe("DomainException", () => {
  it("should create exception with message and code", () => {
    const error = new TestException("Test message");

    expect(error.message).toBe("Test message");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.name).toBe("TestException");
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it("should have stack trace", () => {
    const error = new TestException("Test message");
    expect(error.stack).toBeDefined();
  });
});

