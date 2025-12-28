import type { User } from "../entities";

export interface UserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	save(user: User): Promise<User>;
	create(userData: {
		id?: string;
		name: string | null;
		email: string;
		password: string | null;
		image?: string | null;
	}): Promise<User>;
}
