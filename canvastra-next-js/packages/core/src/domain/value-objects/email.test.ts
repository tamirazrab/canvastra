import { describe, expect, it } from "vitest";
import { Email } from "./email";

describe("Email Value Object", () => {
	it("should create a valid email", () => {
		const email = new Email("test@example.com");
		expect(email.value).toBe("test@example.com");
	});

	it("should trim whitespace", () => {
		const email = new Email("  test@example.com  ");
		expect(email.value).toBe("test@example.com");
	});

	it("should convert to lowercase", () => {
		const email = new Email("TEST@EXAMPLE.COM");
		expect(email.value).toBe("test@example.com");
	});

	it("should throw error for empty email", () => {
		expect(() => {
			try {
				new Email("");
			} catch (e) {
				throw e;
			}
		}).toThrow();

		expect(() => {
			try {
				new Email("   ");
			} catch (e) {
				throw e;
			}
		}).toThrow();
	});

	it("should throw error for invalid email format", () => {
		expect(() => {
			try {
				new Email("invalid-email");
			} catch (e) {
				throw e;
			}
		}).toThrow();

		expect(() => {
			try {
				new Email("test@");
			} catch (e) {
				throw e;
			}
		}).toThrow();

		expect(() => {
			try {
				new Email("@example.com");
			} catch (e) {
				throw e;
			}
		}).toThrow();
	});

	it("should accept valid email formats", () => {
		expect(() => new Email("user@example.com")).not.toThrow();
		expect(() => new Email("user.name@example.com")).not.toThrow();
		expect(() => new Email("user+tag@example.co.uk")).not.toThrow();
	});
});
