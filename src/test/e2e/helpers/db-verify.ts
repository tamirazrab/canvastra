import { testDb } from "@/test/e2e/setup/db-setup";
import { testEnv } from "@/test/e2e/setup/test-env";
import { sql } from "drizzle-orm";

/**
 * Verify that the test database connection is working and using the correct database.
 */
export async function verifyTestDatabase(): Promise<void> {
  try {
    // Test database connection
    const result = await testDb.execute(
      sql`SELECT current_database() as db_name, version() as db_version`,
    );

    const dbName = result.rows[0]?.db_name;
    const testDbUrl = testEnv.TEST_DATABASE_URL;

    // Extract database name from TEST_DATABASE_URL for comparison
    const urlDbName = testDbUrl
      ? new URL(testDbUrl).pathname.replace("/", "")
      : null;

    console.log(`[db-verify] Connected to database: ${dbName}`);
    console.log(`[db-verify] Expected database from URL: ${urlDbName || "unknown"}`);

    // Verify we're using the test database (not production)
    if (testDbUrl && !testDbUrl.includes("localhost") && !testDbUrl.includes("127.0.0.1")) {
      // For remote databases (like Neon), we can't easily verify the database name
      // But we can verify the connection works
      console.log(`[db-verify] Test database connection verified (remote database)`);
    } else {
      // For local databases, verify the database name matches
      if (urlDbName && dbName !== urlDbName) {
        throw new Error(
          `Database name mismatch! Connected to: ${dbName}, expected: ${urlDbName}. ` +
          `This suggests Better Auth might be using the wrong database.`,
        );
      }
    }

    // Verify we can query the users table (ensures migrations ran)
    const tableCheck = await testDb.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user', 'account', 'session')`,
    );

    const tables = tableCheck.rows.map((row: any) => row.table_name);
    const requiredTables = ["user", "account", "session"];

    for (const table of requiredTables) {
      if (!tables.includes(table)) {
        throw new Error(
          `Required table "${table}" not found in test database. ` +
          `Tables found: ${tables.join(", ")}. ` +
          `This suggests migrations haven't run or are using the wrong database.`,
        );
      }
    }

    console.log(`[db-verify] All required tables found: ${tables.join(", ")}`);
  } catch (error) {
    console.error("[db-verify] Database verification failed:", error);
    throw error;
  }
}

/**
 * Log which database URL Better Auth is configured to use.
 */
export function logDatabaseConfig(): void {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  const prodDbUrl = process.env.DATABASE_URL;

  console.log("[db-verify] Database configuration:");
  console.log(`  TEST_DATABASE_URL: ${testDbUrl ? "SET" : "NOT SET"}`);
  console.log(`  DATABASE_URL: ${prodDbUrl ? "SET" : "NOT SET"}`);

  if (testDbUrl && prodDbUrl && testDbUrl !== prodDbUrl) {
    console.log(
      `[db-verify] ⚠️  WARNING: TEST_DATABASE_URL and DATABASE_URL are different!`,
    );
    console.log(
      `[db-verify] Better Auth should use TEST_DATABASE_URL when it's set.`,
    );
  } else if (testDbUrl && prodDbUrl === testDbUrl) {
    console.log(`[db-verify] ✅ DATABASE_URL matches TEST_DATABASE_URL (correct for tests)`);
  }
}

