import type { User } from "@canvastra-next-js/core/domain/entities";
import { User as UserEntity } from "@canvastra-next-js/core/domain/entities";
import type { UserRepository } from "@canvastra-next-js/core/domain/repositories";
import { db } from "@canvastra-next-js/db";
import { user as userTable } from "@canvastra-next-js/db/schema/auth";
import { eq } from "drizzle-orm";

export class DrizzleUserRepository implements UserRepository {
	async findById(id: string): Promise<User | null> {
		const result = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, id))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		return this.mapToEntity(result[0]);
	}

	async findByEmail(email: string): Promise<User | null> {
		const result = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		return this.mapToEntity(result[0]);
	}

	async save(user: User): Promise<User> {
		const result = await db
			.insert(userTable)
			.values({
				id: user.id,
				name: user.name,
				email: user.email,
				emailVerified: user.emailVerified ? true : false,
				password: user.password,
				image: user.image,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			})
			.onConflictDoUpdate({
				target: userTable.id,
				set: {
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified ? true : false,
					password: user.password,
					image: user.image,
					updatedAt: user.updatedAt,
				},
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	async create(userData: {
		id?: string;
		name: string | null;
		email: string;
		password: string | null;
		image?: string | null;
	}): Promise<User> {
		const now = new Date();
		const result = await db
			.insert(userTable)
			.values({
				id: userData.id ?? crypto.randomUUID(),
				name: userData.name,
				email: userData.email,
				password: userData.password,
				image: userData.image ?? null,
				emailVerified: false,
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		return this.mapToEntity(result[0]);
	}

	private mapToEntity(row: typeof userTable.$inferSelect): User {
		// Map boolean emailVerified to Date | null
		// If verified, use updatedAt or createdAt as verification date
		// If not verified, use null
		const emailVerified =
			row.emailVerified && row.updatedAt ? row.updatedAt : null;

		return new UserEntity({
			id: row.id,
			name: row.name,
			email: row.email,
			emailVerified,
			password: row.password,
			image: row.image,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		});
	}
}
