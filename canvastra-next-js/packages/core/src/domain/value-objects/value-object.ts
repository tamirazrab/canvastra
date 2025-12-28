export abstract class ValueObject<T> {
	protected readonly value: T;

	constructor(value: T) {
		this.value = value;
		this.validate();
	}

	protected abstract validate(): void;

	public getValue(): T {
		return this.value;
	}

	public equals(vo: ValueObject<T>): boolean {
		return JSON.stringify(this.value) === JSON.stringify(vo.value);
	}
}
