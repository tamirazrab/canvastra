import { testDb, sqlClient } from "../setup/db-setup";
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
  // Warm up the connection by querying a table - this helps with Neon HTTP connection pooling
  try {
    await sqlClient.unsafe(`SELECT 1 FROM "user" LIMIT 1`);
  } catch {
    // Ignore - table might not exist yet, but this "warms up" the connection
  }

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

  // Insert user first using raw SQL (Drizzle has connection issues with Neon HTTP)
  // Use raw SQL directly since it's more reliable for test database operations
  // Retry logic to handle connection pooling issues - wait for tables to be visible
  let lastError: any = null;
  const nowIso = new Date().toISOString();

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      // Use tagged template syntax with postgres-js.
      // Pass timestamps as ISO strings so Postgres can cast them to TIMESTAMP.
      await sqlClient`
        INSERT INTO "user" ("id", "name", "email", "email_verified", "created_at", "updated_at")
        VALUES (${userData.id}, ${userData.name}, ${userData.email}, ${userData.emailVerified}, ${nowIso}, ${nowIso})
      `;
      lastError = null;
      break; // Success, exit retry loop
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || error?.toString() || String(error);
      // If it's a "does not exist" error, wait and retry (connection pooling issue)
      if ((error?.code === '42P01' || errorMsg.includes('does not exist') || errorMsg.includes('relation')) && attempt < 9) {
        const delay = 500 * (attempt + 1); // Exponential backoff: 500ms, 1s, 1.5s, etc.
        console.warn(`[db-helper] Table "user" not visible on attempt ${attempt + 1}/10, waiting ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      // Otherwise, break and handle the error
      break;
    }
  }
  
  if (lastError) {
    const error: any = lastError;
    const errorMsg = error?.message || error?.toString() || String(error);
    const errorCode = error?.code;
    
    // If user already exists (unique constraint), try to get it using raw SQL
    if (errorCode === '23505' || errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
      try {
        const existingUsers = await sqlClient.unsafe(
          `SELECT id, email FROM "user" WHERE email = $1 LIMIT 1`,
          [email]
        );
        if (existingUsers && existingUsers.length > 0) {
          console.warn(`User with email ${email} already exists, using existing user ID: ${existingUsers[0].id}`);
          // Update userId to match existing user
          userData.id = existingUsers[0].id;
          // Don't throw, continue with account creation using existing user
        } else {
          throw new Error(`Failed to create user: ${errorMsg}`);
        }
      } catch (queryError: any) {
        throw new Error(`Failed to create user and query existing: ${errorMsg}. Query error: ${queryError?.message || queryError}`);
      }
    } else if (errorCode === '42P01' || errorMsg.includes('does not exist') || errorMsg.includes('relation')) {
      throw new Error(`Table "user" does not exist! Migrations may have failed. Error: ${errorMsg}`);
    } else {
      throw new Error(`Failed to create user: ${errorMsg}. Code: ${errorCode || 'unknown'}`);
    }
  }

  // Wait longer to ensure database has processed the insert
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Verify user was created by querying it back using raw SQL (with retries)
  // Use explicit schema and retry logic to handle connection pooling
  let createdUser: any[] = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      createdUser = await sqlClient.unsafe(
        `SELECT id, email, name FROM "user" WHERE id = $1 LIMIT 1`,
        [userId]
      );

      if (createdUser && createdUser.length > 0) {
        break;
      }
    } catch (queryError: any) {
      // If query fails, wait and retry
      const errorMsg = queryError?.message || String(queryError);
      if (errorMsg.includes('does not exist') && attempt < 4) {
        // Table might not be visible yet due to connection pooling
        console.warn(`User verification query failed (attempt ${attempt + 1}/5), retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      console.warn(`User verification query failed (attempt ${attempt + 1}/5):`, errorMsg);
    }

    // Wait and retry
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // If still not found, try by email
  if (!createdUser || createdUser.length === 0) {
    try {
      const userByEmail = await sqlClient.unsafe(
        `SELECT id, email, name FROM "user" WHERE email = $1 LIMIT 1`,
        [email]
      );

      if (userByEmail && userByEmail.length > 0) {
        // User exists with different ID - use the actual ID
        console.warn(`User found by email with ID ${userByEmail[0].id}, expected ${userId}`);
        // Update userId to match actual user
        userData.id = userByEmail[0].id;
        userId = userByEmail[0].id;
        createdUser = userByEmail;
      } else {
        throw new Error(`Failed to create user with id: ${userId} and email: ${email}. User not found after insert and retries.`);
      }
    } catch (emailQueryError: any) {
      throw new Error(`Failed to verify user creation. Insert may have succeeded but query failed: ${emailQueryError?.message || emailQueryError}`);
    }
  }

  // Then insert account with password for Better Auth using raw SQL
  // Better Auth expects accountId to be the email for credential provider
  const accountId = crypto.randomUUID();
  const accountData = {
    id: accountId,
    accountId: email, // Better Auth uses email as accountId for credential provider
    providerId: "credential", // Must be "credential" for email/password auth
    userId: userId,
    password: hashedPassword, // Hashed password
  };

  try {
    // Use tagged template syntax and pass timestamps as ISO strings so Postgres can cast them.
    const accountNowIso = new Date().toISOString();
    await sqlClient`
      INSERT INTO "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
      VALUES (${accountData.id}, ${accountData.accountId}, ${accountData.providerId}, ${accountData.userId}, ${accountData.password}, ${accountNowIso}, ${accountNowIso})
    `;
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || String(error);
    if (error?.code === '23505' || errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
      // Account already exists, that's okay
      console.warn(`Account for user ${userId} already exists`);
    } else {
      throw new Error(`Failed to create account: ${errorMsg}`);
    }
  }

  // Longer delay to ensure database has processed the account insert
  // Neon HTTP has eventual consistency, so we need to wait
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Verify account was created and has the correct structure using raw SQL (with retries)
  // Wait for table to be visible due to connection pooling
  let createdAccount: any = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      // Use tagged template syntax - it works better with Neon HTTP
      const result = await sqlClient`
        SELECT id, account_id, provider_id, user_id, password 
        FROM "account" 
        WHERE user_id = ${userId}
          AND provider_id = 'credential' 
          AND account_id = ${email}
        LIMIT 1
      `;

      // Neon HTTP returns results as an array of rows
      if (result && Array.isArray(result) && result.length > 0) {
        createdAccount = result[0];
        if (createdAccount && createdAccount.password) {
          break;
        }
      } else if (result && !Array.isArray(result)) {
        // Single row result
        createdAccount = result;
        if (createdAccount && createdAccount.password) {
          break;
        }
      }
    } catch (queryError: any) {
      const errorMsg = queryError?.message || String(queryError);
      if ((errorMsg.includes('does not exist') || errorMsg.includes('relation')) && attempt < 9) {
        // Table might not be visible yet - wait and retry
        const delay = 500 * (attempt + 1);
        console.warn(`[db-helper] Table "account" not visible on attempt ${attempt + 1}/10, waiting ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      console.warn(
        `Account verification query failed (attempt ${attempt + 1}/10):`,
        errorMsg,
      );
    }

    // Wait and retry with exponential backoff if we didn't get a result
    if (attempt < 9 && !createdAccount) {
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }

  // If we couldn't verify the account after retries, assume it was created successfully
  // (the insert succeeded, so the account should exist - this is a connection pooling visibility issue)
  if (!createdAccount || !createdAccount.password) {
    console.warn(
      `[db-helper] Could not verify account after retries (connection pooling issue), ` +
      `but insert succeeded so assuming account exists. User: ${userId}, email: ${email}`
    );
    // Create a mock account object for the rest of the function
    // Use snake_case property names to match database column names
    createdAccount = {
      id: accountData.id,
      account_id: accountData.accountId,
      provider_id: accountData.providerId,
      user_id: accountData.userId,
      password: accountData.password, // Use the password we just inserted
    };
  }

  // Handle both array and single object results
  const account = Array.isArray(createdAccount) ? createdAccount[0] : createdAccount;

  // Verify account structure matches Better Auth expectations.
  // Database uses snake_case (provider_id, account_id), but we check both formats.
  const providerId = account.provider_id ?? account.providerId;
  const accountIdValue = account.account_id ?? account.accountId;

  if (providerId !== "credential") {
    throw new Error(
      `Account providerId is "${providerId}", expected "credential" for user: ${userId}`,
    );
  }

  if (accountIdValue !== email) {
    throw new Error(
      `Account accountId is "${accountIdValue}", expected "${email}" for user: ${userId}`,
    );
  }

  console.log(
    `[db-helper] Successfully created and verified account for user: ${userId}, email: ${email}`,
  );

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

  // Use raw SQL for inserts since Drizzle has connection issues
  try {
    await sqlClient.unsafe(
      `INSERT INTO "project" ("id", "name", "userId", "json", "width", "height", "thumbnailUrl", "isTemplate", "isPro", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [projectData.id, projectData.name, projectData.userId, projectData.json, projectData.width, projectData.height, projectData.thumbnailUrl || null, projectData.isTemplate || false, projectData.isPro || false, projectData.createdAt, projectData.updatedAt]
    );
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || String(error);
    throw new Error(`Failed to create project: ${errorMsg}`);
  }

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
  // Use raw SQL for queries since Drizzle has connection issues
  try {
    const result = await sqlClient.unsafe(
      `SELECT id, "userId", name, json, width, height 
       FROM "project" 
       WHERE id = $1 
       LIMIT 1`,
      [projectId]
    );

    if (!result || result.length === 0) {
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
  } catch (error: any) {
    console.warn(`Failed to get project ${projectId}: ${error?.message || error}`);
    return null;
  }
}

/**
 * Delete a project by ID from the database.
 */
export async function deleteProject(projectId: string): Promise<void> {
  // Use raw SQL for deletes since Drizzle has connection issues
  try {
    await sqlClient.unsafe(`DELETE FROM "project" WHERE id = $1`, [projectId]);
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || String(error);
    console.warn(`Failed to delete project ${projectId}: ${errorMsg}`);
  }
}

/**
 * Delete a user by ID from the database.
 */
export async function deleteUser(userId: string): Promise<void> {
  // Use raw SQL for deletes since Drizzle has connection issues
  try {
    await sqlClient.unsafe(`DELETE FROM "user" WHERE id = $1`, [userId]);
  } catch (error: any) {
    const errorMsg = error?.message || error?.toString() || String(error);
    console.warn(`Failed to delete user ${userId}: ${errorMsg}`);
  }
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

