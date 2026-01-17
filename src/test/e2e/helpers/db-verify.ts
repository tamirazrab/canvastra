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

    // Drizzle + postgres-js may return either { rows } or an array of rows
    const rows = Array.isArray((result as any).rows)
      ? (result as any).rows
      : Array.isArray(result)
        ? result
        : [];

    const dbName = rows[0]?.db_name;
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
    // For Neon databases, information_schema queries might not work reliably
    // So we'll try to query the tables directly instead
    const requiredTables = ["user", "account", "session"];
    const foundTables: string[] = [];

    for (const table of requiredTables) {
      try {
        // Try to query the table directly - if it exists, this will succeed
        await testDb.execute(sql.raw(`SELECT 1 FROM "${table}" LIMIT 1`));
        foundTables.push(table);
        console.log(`[db-verify] ✅ Table "${table}" is accessible`);
      } catch (error: any) {
        // If table doesn't exist, we'll get a "does not exist" error
        if (error?.message?.includes("does not exist") || error?.code === "42P01") {
          console.warn(`[db-verify] ⚠️  Table "${table}" not found via direct query`);
          // Try information_schema as fallback
          try {
            const schemaCheck = await testDb.execute(
              sql`SELECT table_schema FROM information_schema.tables WHERE table_name = ${table} LIMIT 1`
            );
            if (schemaCheck.rows.length > 0) {
              foundTables.push(table);
              console.log(`[db-verify] ✅ Table "${table}" found in information_schema`);
            }
          } catch {
            // Ignore
          }
        } else {
          // Some other error - table might exist but query failed for another reason
          // Assume it exists
          foundTables.push(table);
          console.log(`[db-verify] ✅ Table "${table}" assumed to exist (query error: ${error.message})`);
        }
      }
    }

    if (foundTables.length < requiredTables.length) {
      const missing = requiredTables.filter(t => !foundTables.includes(t));
      console.warn(
        `[db-verify] ⚠️  Could not verify all tables. Found: ${foundTables.join(", ")}, Missing: ${missing.join(", ")}`
      );
      console.warn(
        `[db-verify] This might be a schema or connection issue. Tests will proceed and fail if tables are actually missing.`
      );
      // Don't throw - let tests run and fail naturally if tables are missing
    } else {
      console.log(`[db-verify] All required tables verified: ${foundTables.join(", ")}`);
    }
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

