import { BaseEntity } from "./base.entity";

export interface UserProps {
	id: string;
	name: string | null;
	email: string;
	emailVerified: Date | null;
	image: string | null;
	password: string | null;
	createdAt?: Date;
	updatedAt?: Date;
}

export class User extends BaseEntity {
	public readonly name: string | null;
	public readonly email: string;
	public readonly emailVerified: Date | null;
	public readonly image: string | null;
	public readonly password: string | null;

	constructor(props: UserProps) {
		super(props.id, props.createdAt, props.updatedAt);
		this.name = props.name;
		this.email = props.email;
		this.emailVerified = props.emailVerified;
		this.image = props.image;
		this.password = props.password;
	}

	public hasPassword(): boolean {
		return this.password !== null && this.password.length > 0;
	}

	public isEmailVerified(): boolean {
		return this.emailVerified !== null;
	}
}
