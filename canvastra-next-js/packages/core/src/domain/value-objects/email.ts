import { ValueObject } from "./value-object";

export class Email extends ValueObject<string> {
	private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	private readonly _normalizedValue: string;

	constructor(value: string) {
		const normalized = Email.normalize(value);
		super(normalized);
		this._normalizedValue = normalized;
	}

	private static normalize(value: string): string {
		if (!value || value.trim().length === 0) {
			throw new Error("Email cannot be empty");
		}

		const trimmed = value.trim().toLowerCase();

		if (!Email.EMAIL_REGEX.test(trimmed)) {
			throw new Error(`Invalid email format: ${value}`);
		}

		return trimmed;
	}

	protected validate(): void {
		// Validation is done in normalize() during construction
		// This method exists to satisfy the abstract requirement
	}

	public getValue(): string {
		return this._normalizedValue;
	}

	public get value(): string {
		return this._normalizedValue;
	}
}
