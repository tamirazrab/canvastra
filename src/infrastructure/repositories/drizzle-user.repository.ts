import { eq } from "drizzle-orm";
import { User } from "@/core/domain/entities";
import { UserRepository } from "@/core/domain/repositories";
import { db } from "@/infrastructure/db/drizzle";
import { users } from "@/infrastructure/db/schema";

export class DrizzleUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const userData = result[0];
    return new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      password: userData.password,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const userData = result[0];
    return new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      password: userData.password,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async save(user: User): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          password: user.password,
          updatedAt: user.updatedAt,
        },
      })
      .returning();

    const userData = result[0];
    return new User({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      password: userData.password,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  }

  async create(userData: {
    name: string | null;
    email: string;
    password: string | null;
    image?: string | null;
  }): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        image: userData.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const created = result[0];
    return new User({
      id: created.id,
      name: created.name,
      email: created.email,
      emailVerified: created.emailVerified,
      image: created.image,
      password: created.password,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }
}

