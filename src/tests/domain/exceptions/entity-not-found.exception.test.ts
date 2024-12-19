import { describe, it, expect } from "vitest";
import { EntityNotFoundException } from "@/core/domain/exceptions";

describe("EntityNotFoundException", () => {
  it("should create exception with entity name and identifier", () => {
    const error = new EntityNotFoundException("Project", "123");

    expect(error.message).toBe("Project with identifier '123' not found");
    expect(error.code).toBe("ENTITY_NOT_FOUND");
    expect(error.name).toBe("EntityNotFoundException");
  });
});

