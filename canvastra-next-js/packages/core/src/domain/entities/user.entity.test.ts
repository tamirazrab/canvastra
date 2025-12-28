import { describe, expect, it } from "vitest";
import { User } from "./user.entity";

describe("User Entity", () => {
	const baseUserData = {
		id: "user-123",
		name: "Test User",
		email: "test@example.com",
		emailVerified: null,
		image: null,
		password: "hashed-password",
	};

	it("should create a user with required fields", () => {
		const user = new User(baseUserData);

		expect(user.id).toBe("user-123");
		expect(user.name).toBe("Test User");
		expect(user.email).toBe("test@example.com");
	});

	it("should check if user has password", () => {
		const userWithPassword = new User({
			...baseUserData,
			password: "password123",
		});
		const userWithoutPassword = new User({ ...baseUserData, password: null });

		expect(userWithPassword.hasPassword()).toBe(true);
		expect(userWithoutPassword.hasPassword()).toBe(false);
	});

	it("should check if email is verified", () => {
		const verifiedUser = new User({
			...baseUserData,
			emailVerified: new Date(),
		});
		const unverifiedUser = new User({
			...baseUserData,
			emailVerified: null,
		});

		expect(verifiedUser.isEmailVerified()).toBe(true);
		expect(unverifiedUser.isEmailVerified()).toBe(false);
	});
});
