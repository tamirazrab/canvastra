import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
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

// Use postgres-js for E2E tests against local Postgres.
// This avoids Neon HTTP connection pooling issues.
const sqlClient = postgres(TEST_DATABASE_URL);
export const testDb = drizzle(sqlClient, { schema });
export { sqlClient }; // Export for use in helpers

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

  // Check which tables exist using raw SQL (Drizzle can't see tables due to connection pooling)
  const existingTables: string[] = [];
  for (const table of tables) {
    try {
      // Try a simple query to see if table exists
      await sqlClient.unsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
      existingTables.push(table);
    } catch (error: any) {
      // Table doesn't exist or not visible - skip it
      const errorMsg = error?.message || String(error);
      if (!errorMsg.includes('does not exist') && !errorMsg.includes('relation')) {
        // Some other error - log it but continue
        console.warn(`  ⚠️  Error checking table "${table}": ${errorMsg}`);
      }
    }
  }

  if (existingTables.length === 0) {
    // This is fine - tables might not be visible yet due to connection pooling
    // or migrations just ran. Just continue - tests will create data as needed.
    return;
  }

  try {
    // Try to truncate all existing tables in one statement with CASCADE using raw SQL
    // This is the most efficient approach and handles foreign keys automatically
    const tableList = existingTables.map((t) => `"${t}"`).join(", ");
    await sqlClient.unsafe(`TRUNCATE TABLE ${tableList} CASCADE;`);
    console.log(`  ✅ Truncated ${existingTables.length} table(s): ${existingTables.join(", ")}`);
  } catch (error: any) {
    // If TRUNCATE fails, fall back to DELETE using raw SQL
    const errorMsg = error?.message || String(error);
    console.warn(`  ⚠️  TRUNCATE failed, using DELETE: ${errorMsg}`);

    // Delete in correct order: child tables first, then parent tables
    // Use raw SQL since Drizzle can't see tables
    const deleteOrder = [
      "account", "session", "subscription", "project", "verification", "authenticator", "user"
    ];

    for (const table of deleteOrder) {
      if (existingTables.includes(table)) {
        try {
          await sqlClient.unsafe(`DELETE FROM "${table}"`);
        } catch (deleteError: any) {
          console.warn(`  ⚠️  Failed to delete from ${table}: ${deleteError?.message || deleteError}`);
        }
      }
    }
  }
}

/**
 * Drop all tables in the test database.
 * This ensures a clean state before running migrations.
 * NOTE: We don't actually drop tables - we just truncate them.
 * This avoids connection pooling issues where dropped tables aren't visible
 * to other connections immediately.
 */
async function dropAllTables(): Promise<void> {
  console.log("Preparing database for migrations...");

  try {
    // Get all table names from the public schema using raw SQL
    const tablesResult = await sqlClient.unsafe(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    // Handle both array and object results
    const tables = Array.isArray(tablesResult)
      ? tablesResult.map((row: any) => row.tablename || row.tablename)
      : [];

    if (tables.length === 0) {
      console.log("  ℹ️  No existing tables found - will create fresh tables");
      return;
    }

    console.log(`  Found ${tables.length} existing table(s): ${tables.join(", ")}`);
    console.log("  ℹ️  Truncating instead of dropping to avoid connection pooling issues");

    // Truncate all tables instead of dropping them
    // This ensures tables always exist and are visible to all connections
    const tableList = tables.map((t: string) => `"${t}"`).join(", ");
    try {
      await sqlClient.unsafe(`TRUNCATE TABLE ${tableList} CASCADE;`);
      console.log(`  ✅ Truncated ${tables.length} table(s)`);
    } catch (error: any) {
      console.warn(`  ⚠️  Could not truncate tables: ${error.message}`);
      // If truncate fails, try dropping (but this might cause visibility issues)
      console.log("  ⚠️  Falling back to dropping tables (may cause connection issues)...");
      for (const table of tables) {
        try {
          await sqlClient.unsafe(`DROP TABLE IF EXISTS "public"."${table}" CASCADE;`);
        } catch (dropError: any) {
          console.warn(`  ⚠️  Failed to drop table ${table}: ${dropError.message}`);
        }
      }
    }
  } catch (error: any) {
    console.warn(`⚠️  Error preparing database: ${error.message}`);
    // Don't throw - continue with migrations even if this fails
  }
}

/**
 * Run database migrations on the test database by reading SQL files directly.
 * Drops all existing tables first to ensure a clean state.
 * This approach is more reliable than drizzle-kit migrate for test databases.
 */
export async function runMigrations(): Promise<void> {
  console.log("Running migrations on test database...");
  console.log(`TEST_DATABASE_URL: ${TEST_DATABASE_URL ? "SET" : "NOT SET"}`);

  // Drop all existing tables first for a clean migration
  await dropAllTables();

  console.log("\nRunning migrations from SQL files...");

  try {
    // Read and execute all migration files in order
    const drizzleFolder = path.join(process.cwd(), "drizzle");
    const migrationFiles = fs
      .readdirSync(drizzleFolder)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      throw new Error("No migration files found in drizzle folder");
    }

    console.log(`Found ${migrationFiles.length} migration file(s)`);

    let totalStatements = 0;

    for (const migrationFile of migrationFiles) {
      const filePath = path.join(drizzleFolder, migrationFile);
      console.log(`\nReading migration file: ${migrationFile}`);
      const migrationSQL = fs.readFileSync(filePath, "utf-8");

      // Split by statement breakpoints and execute each statement
      const statements = migrationSQL
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      console.log(
        `Found ${statements.length} SQL statements in ${migrationFile}`,
      );
      totalStatements += statements.length;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (!statement) continue;

        console.log(
          `Executing statement ${i + 1}/${statements.length} from ${migrationFile}...`,
        );
        // Show first 100 chars of statement for debugging
        const preview = statement.substring(0, 100).replace(/\s+/g, " ");
        console.log(`  SQL: ${preview}...`);

        try {
          // Execute using the test database connection
          // sqlClient is the neon client - use .unsafe() for raw SQL
          // Ensure we're using the public schema
          await sqlClient.unsafe(statement);
          console.log(`  ✅ Success`);
        } catch (error: any) {
          // Ignore "already exists" errors for tables/constraints
          if (
            error?.message?.includes("already exists") ||
            error?.code === "42P07" || // duplicate_table
            error?.code === "42710" // duplicate_object
          ) {
            console.log(`  ⚠️  Skipped (already exists): ${error.message}`);
            continue;
          }
          console.error(`  ❌ Error: ${error.message}`);
          console.error(`  Code: ${error.code}`);
          throw error;
        }
      }
    }

    console.log(
      `\n✅ All migrations completed successfully! (${totalStatements} statements executed)`,
    );

    // Small delay to ensure database processes all changes
    // Neon HTTP may use connection pooling, so we need to wait for changes to be visible
    console.log("\nWaiting for database to process changes and become visible...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Force a connection refresh by querying the database
    try {
      await sqlClient.unsafe(`SELECT current_database(), current_schema()`);
      console.log("  ✅ Database connection refreshed");
    } catch (error: any) {
      console.warn(`  ⚠️  Could not refresh connection: ${error.message}`);
    }

    // Verify that key tables were created and are accessible
    // Retry with delays to handle Neon HTTP connection pooling
    console.log("\nVerifying tables were created and are accessible...");

    const keyTables = ["user", "account", "session", "project"];
    const maxRetries = 10;
    const retryDelay = 1000; // 1 second

    for (const tableName of keyTables) {
      let verified = false;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Try a simple SELECT to verify table exists and is accessible
          await sqlClient.unsafe(`SELECT 1 FROM "${tableName}" LIMIT 1`);
          console.log(`  ✅ Table "${tableName}" is accessible (attempt ${attempt + 1})`);
          verified = true;
          break;
        } catch (error: any) {
          const errorMsg = error?.message || error?.toString() || "unknown error";
          if (errorMsg.includes("does not exist") || errorMsg.includes("relation") || error?.code === "42P01") {
            if (attempt < maxRetries - 1) {
              console.log(`  ⏳ Table "${tableName}" not visible yet (attempt ${attempt + 1}/${maxRetries}), waiting...`);
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              continue;
            } else {
              throw new Error(
                `Table "${tableName}" is not accessible after ${maxRetries} attempts. ` +
                `This suggests a connection pooling issue with Neon HTTP.`
              );
            }
          } else {
            // Some other error - might be permissions or connection issue
            console.warn(`  ⚠️  Table "${tableName}" query failed: ${errorMsg}`);
            if (attempt < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              continue;
            }
            throw error;
          }
        }
      }
      if (!verified) {
        throw new Error(`Failed to verify table "${tableName}" after ${maxRetries} attempts`);
      }
    }

    console.log("✅ All key tables verified and accessible");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message || error);
    throw error;
  }
}

