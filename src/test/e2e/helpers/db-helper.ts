import { testDb } from "../setup/db-setup";
import { users, projects, accounts } from "@/bootstrap/boundaries/db/schema";
import { eq, sql, and, like } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import bcrypt from "bcryptjs";

type UserInsert = InferInsertModel<typeof users>;
type ProjectInsert = InferInsertModel<typeof projects>;
type AccountInsert = InferInsertModel<typeof accounts>;

/**
 * Database helper utilities for E2E tests.
 * Provides functions to create test data.
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
}

export interface TestProject {
  id: string;
  userId: string;
  name: string;
  json: string;
  width: number;
  height: number;
}

/**
 * Create a test user in the database with Better Auth account and password.
 * This creates both the user and account entries needed for authentication.
 */
export async function createTestUser(
  overrides?: Partial<UserInsert> & { password?: string },
): Promise<TestUser & { password: string }> {
  const userId = overrides?.id || crypto.randomUUID();
  const email = overrides?.email || `test-${Date.now()}@example.com`;
  const password = overrides?.password || "test-password-123";

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  const userData: UserInsert = {
    id: userId,
    email,
    name: overrides?.name || `Test User ${Date.now()}`,
    emailVerified: overrides?.emailVerified ?? false,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };

  // Insert user first (neon-http doesn't support transactions)
  try {
    await testDb.insert(users).values(userData);
  } catch (error: any) {
    // If user already exists (unique constraint), try to get it
    if (error?.code === '23505' || error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
      const existingUser = await testDb
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        // User exists, use existing ID - update userId to match
        console.warn(`User with email ${email} already exists, using existing user ID: ${existingUser[0].id}`);
        // Don't throw, continue with account creation using existing user
      } else {
        throw new Error(`Failed to create user: ${error.message}`);
      }
    } else {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Wait longer to ensure database has processed the insert
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Verify user was created by querying it back (with retries)
  let createdUser: any[] = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      createdUser = await testDb
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (createdUser.length > 0) {
        break;
      }
    } catch (queryError) {
      // If query fails, wait and retry
      console.warn(`User verification query failed (attempt ${attempt + 1}/5):`, queryError);
    }

    // Wait and retry
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // If still not found, try by email
  if (createdUser.length === 0) {
    try {
      const userByEmail = await testDb
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userByEmail.length > 0) {
        // User exists with different ID - use the actual ID
        console.warn(`User found by email with ID ${userByEmail[0].id}, expected ${userId}`);
        // Update userId to match actual user
        // But this shouldn't happen - throw error to investigate
        throw new Error(`User exists with different ID. Expected: ${userId}, Found: ${userByEmail[0].id}. This suggests a race condition.`);
      } else {
        throw new Error(`Failed to create user with id: ${userId} and email: ${email}. User not found after insert and retries.`);
      }
    } catch (emailQueryError: any) {
      if (emailQueryError.message.includes('User exists with different ID')) {
        throw emailQueryError;
      }
      throw new Error(`Failed to verify user creation. Insert may have succeeded but query failed: ${emailQueryError.message}`);
    }
  }

  // Then insert account with password for Better Auth
  // Better Auth expects accountId to be the email for credential provider
  const accountData: AccountInsert = {
    id: crypto.randomUUID(),
    accountId: email, // Better Auth uses email as accountId for credential provider
    providerId: "credential", // Must be "credential" for email/password auth
    userId: userId,
    password: hashedPassword, // Hashed password
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await testDb.insert(accounts).values(accountData);

  // Longer delay to ensure database has processed the account insert
  // Neon HTTP has eventual consistency, so we need to wait
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Verify account was created and has the correct structure (with retries)
  let createdAccount: any[] = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      createdAccount = await testDb
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, userId),
            eq(accounts.providerId, "credential"),
            eq(accounts.accountId, email),
          ),
        )
        .limit(1);

      if (createdAccount.length > 0 && createdAccount[0].password) {
        break;
      }
    } catch (queryError) {
      console.warn(
        `Account verification query failed (attempt ${attempt + 1}/5):`,
        queryError,
      );
    }

    // Wait and retry with exponential backoff
    if (attempt < 4) {
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }

  if (createdAccount.length === 0) {
    throw new Error(
      `Failed to create account for user: ${userId}, email: ${email}. ` +
      `Account not found after insert and retries.`,
    );
  }

  const account = createdAccount[0];
  if (!account.password) {
    throw new Error(
      `Account created but password is missing for user: ${userId}, email: ${email}`,
    );
  }

  // Verify account structure matches Better Auth expectations
  if (account.providerId !== "credential") {
    throw new Error(
      `Account providerId is "${account.providerId}", expected "credential"`,
    );
  }

  if (account.accountId !== email) {
    throw new Error(
      `Account accountId is "${account.accountId}", expected "${email}"`,
    );
  }

  console.log(
    `[db-helper] Successfully created and verified account for user: ${userId}, email: ${email}`,
  );

  if (account.providerId !== "credential") {
    throw new Error(`Account providerId is "${account.providerId}", expected "credential" for user: ${userId}`);
  }

  if (account.accountId !== email) {
    throw new Error(`Account accountId is "${account.accountId}", expected "${email}" for user: ${userId}`);
  }

  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    password, // Return plain password for use in tests
  };
}

/**
 * Create a test project in the database.
 */
export async function createTestProject(
  userId: string,
  overrides?: Partial<ProjectInsert>,
): Promise<TestProject> {
  const projectId = overrides?.id || crypto.randomUUID();
  const projectData: ProjectInsert = {
    id: projectId,
    userId,
    name: overrides?.name || `Test Project ${Date.now()}`,
    json: overrides?.json || JSON.stringify({ objects: [] }),
    width: overrides?.width || 1920,
    height: overrides?.height || 1080,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };

  await testDb.insert(projects).values(projectData);

  return {
    id: projectId,
    userId: userId,
    name: projectData.name,
    json: projectData.json,
    width: projectData.width,
    height: projectData.height,
  };
}

/**
 * Get a project by ID from the database.
 */
export async function getProjectById(
  projectId: string,
): Promise<TestProject | null> {
  const result = await testDb
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const project = result[0];
  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    json: project.json,
    width: project.width,
    height: project.height,
  };
}

/**
 * Delete a project by ID from the database.
 */
export async function deleteProject(projectId: string): Promise<void> {
  await testDb.delete(projects).where(eq(projects.id, projectId));
}

/**
 * Delete a user by ID from the database.
 */
export async function deleteUser(userId: string): Promise<void> {
  await testDb.delete(users).where(eq(users.id, userId));
}

/**
 * Cleanup test data - removes all test users and projects.
 */
export async function cleanupTestData(): Promise<void> {
  // Delete all test users (identified by email pattern)
  // Use Drizzle's like() function instead of raw SQL
  await testDb
    .delete(users)
    .where(like(users.email, "test-%@example.com"));

  // Projects will be cascade deleted
}

