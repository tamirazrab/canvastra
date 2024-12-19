import { describe, it, expect } from "vitest";
import { User } from "@/core/domain/entities";

describe("User", () => {
  const createUser = (overrides?: Partial<Parameters<typeof User.prototype.constructor>[0]>) => {
    return new User({
      id: "1",
      email: "test@example.com",
      name: "Test User",
      emailVerified: null,
      image: null,
      password: null,
      ...overrides,
    });
  };

  it("should create a user", () => {
    const user = createUser();

    expect(user.id).toBe("1");
    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
  });

  it("should have default values", () => {
    const user = createUser();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("should check if has password", () => {
    const userWithPassword = createUser({ password: "hashed123" });
    const userWithoutPassword = createUser({ password: null });

    expect(userWithPassword.hasPassword()).toBe(true);
    expect(userWithoutPassword.hasPassword()).toBe(false);
  });

  it("should check if email is verified", () => {
    const verifiedUser = createUser({ emailVerified: new Date() });
    const unverifiedUser = createUser({ emailVerified: null });

    expect(verifiedUser.isEmailVerified()).toBe(true);
    expect(unverifiedUser.isEmailVerified()).toBe(false);
  });
});

