import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "@/bootstrap/boundaries/db/schema";
import {
  accounts,
  sessions,
  subscriptions,
  projects,
  verification,
  authenticators,
  users,
} from "@/bootstrap/boundaries/db/schema";
import { testEnv } from "./test-env";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

/**
 * Test database setup utilities.
 * Uses TEST_DATABASE_URL from environment.
 */

const TEST_DATABASE_URL = testEnv.TEST_DATABASE_URL;

const sqlClient = neon(TEST_DATABASE_URL);
export const testDb = drizzle(sqlClient, { schema });

/**
 * Check if a table exists in the database.
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await testDb.execute(
      sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `,
    );
    return (result.rows[0] as { exists: boolean })?.exists ?? false;
  } catch {
    return false;
  }
}

/**
 * Reset the test database by truncating all tables.
 * This ensures test isolation.
 * 
 * Uses TRUNCATE ... CASCADE which automatically handles foreign key constraints
 * without requiring special permissions like session_replication_role.
 * Falls back to DELETE if TRUNCATE is not supported.
 * Only operates on tables that exist.
 */
export async function resetDatabase(): Promise<void> {
  const tables = [
    "account",
    "session",
    "subscription",
    "project",
    "verification",
    "authenticator",
    "user",
  ];

  // Check which tables exist
  const existingTables: string[] = [];
  for (const table of tables) {
    if (await tableExists(table)) {
      existingTables.push(table);
    }
  }

  if (existingTables.length === 0) {
    console.log("No tables found to reset. Database may be empty or not migrated.");
    return;
  }

  try {
    // Try to truncate all existing tables in one statement with CASCADE
    // This is the most efficient approach and handles foreign keys automatically
    const tableList = existingTables.map((t) => `"${t}"`).join(", ");
    await testDb.execute(sql.raw(`TRUNCATE TABLE ${tableList} CASCADE;`));
  } catch (error) {
    // If TRUNCATE fails (e.g., permission issue), 
    // fall back to DELETE in correct order to respect foreign keys
    console.warn(
      "TRUNCATE CASCADE failed, falling back to DELETE statements:",
      error instanceof Error ? error.message : error,
    );

    // Delete in correct order: child tables first, then parent tables
    // This respects foreign key constraints
    // Use Drizzle ORM for DELETE operations
    const { accounts, sessions, subscriptions, projects, verification, authenticators, users } = schema;

    // Delete in correct order: child tables first, then parent tables
    try {
      await testDb.delete(accounts);
    } catch (deleteError) {
      console.warn(`Failed to delete from accounts:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }

    try {
      await testDb.delete(sessions);
    } catch (deleteError) {
      console.warn(`Failed to delete from sessions:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }

    try {
      await testDb.delete(subscriptions);
    } catch (deleteError) {
      console.warn(`Failed to delete from subscriptions:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }

    try {
      await testDb.delete(projects);
    } catch (deleteError) {
      console.warn(`Failed to delete from projects:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }

    try {
      await testDb.delete(verification);
    } catch (deleteError) {
      console.warn(`Failed to delete from verification:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }

    try {
      await testDb.delete(authenticators);
    } catch (deleteError) {
      console.warn(`Failed to delete from authenticators:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }

    try {
      await testDb.delete(users);
    } catch (deleteError) {
      console.warn(`Failed to delete from users:`, deleteError instanceof Error ? deleteError.message : deleteError);
    }
  }
}

/**
 * Drop all tables in the test database.
 * This ensures a clean state before running migrations.
 */
async function dropAllTables(): Promise<void> {
  console.log("Dropping all existing tables...");

  try {
    // Get all table names from the public schema
    const tablesResult = await testDb.execute(
      sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
    );
    const tables = tablesResult.rows.map((row: any) => row.tablename as string);

    if (tables.length === 0) {
      console.log("  ℹ️  No tables to drop");
      return;
    }

    console.log(`  Found ${tables.length} table(s) to drop: ${tables.join(", ")}`);

    // Drop tables with CASCADE to handle foreign keys
    // Use testDb.execute() with sql.raw() instead of sqlClient.unsafe()
    for (const table of tables) {
      try {
        await testDb.execute(sql.raw(`DROP TABLE IF EXISTS "public"."${table}" CASCADE;`));
        console.log(`  ✅ Dropped table: ${table}`);
      } catch (error: any) {
        console.warn(`  ⚠️  Failed to drop table ${table}: ${error.message}`);
      }
    }

    console.log("✅ All tables dropped");
  } catch (error: any) {
    console.warn(`⚠️  Error dropping tables: ${error.message}`);
    // Don't throw - continue with migrations even if drop fails
  }
}

/**
 * Run database migrations on the test database using drizzle-kit migrate.
 * Drops all existing tables first to ensure a clean state.
 */
export async function runMigrations(): Promise<void> {
  console.log("Running migrations on test database...");
  console.log(`TEST_DATABASE_URL: ${TEST_DATABASE_URL ? "SET" : "NOT SET"}`);

  // Drop all existing tables first for a clean migration
  await dropAllTables();

  console.log("\nRunning drizzle-kit migrate...");

  try {
    // Set TEST_DATABASE_URL as DATABASE_URL for drizzle-kit
    // This way drizzle-kit will use the test database
    const env = {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
    };

    // Run drizzle-kit migrate
    // This will read the drizzle config and apply migrations to TEST_DATABASE_URL
    console.log("Executing: bunx drizzle-kit migrate");
    execSync("bunx drizzle-kit migrate", {
      env,
      stdio: "inherit", // Show output in console
      cwd: process.cwd(),
    });

    console.log("✅ Drizzle-kit migrate completed successfully");

    // Small delay to ensure database processes all changes
    console.log("\nWaiting for database to process changes...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify that key tables were created
    console.log("\nVerifying tables were created...");

    // Check what tables actually exist
    try {
      const allTablesResult = await testDb.execute(
        sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
      );
      const allTables = allTablesResult.rows.map((row: any) => row.table_name);
      console.log(`  📋 All tables in public schema (${allTables.length}): ${allTables.length > 0 ? allTables.join(", ") : "NONE"}`);
    } catch (error: any) {
      console.warn(`  ⚠️  Could not list tables: ${error.message}`);
    }

    const keyTables = ["user", "project", "session", "account"];
    for (const tableName of keyTables) {
      const exists = await tableExists(tableName);
      if (exists) {
        console.log(`  ✅ Table "${tableName}" exists`);
      } else {
        console.error(`  ❌ Table "${tableName}" does NOT exist!`);
        throw new Error(`Migration verification failed: table "${tableName}" was not created`);
      }
    }
    console.log("✅ All key tables verified");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message || error);
    throw error;
  }
}

