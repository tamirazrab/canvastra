import { chromium, FullConfig } from "@playwright/test";
import { resetDatabase, runMigrations } from "./db-setup";
import { verifyTestDatabase, logDatabaseConfig } from "../helpers/db-verify";

/**
 * Global setup runs once before all tests.
 * Sets up the test database and prepares the test environment.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log("=".repeat(60));
  console.log("Running global setup...");
  console.log("=".repeat(60));

  try {
    // Log database configuration
    console.log("\n[0/3] Checking database configuration...");
    logDatabaseConfig();
    console.log("✅ Database configuration logged\n");

    // Run migrations on test database
    console.log("[1/3] Running migrations...");
    await runMigrations();
    console.log("✅ Migrations completed\n");

    // Verify test database connection and structure
    console.log("[2/3] Verifying test database...");
    await verifyTestDatabase();
    console.log("✅ Test database verified\n");

    // Reset database to ensure clean state
    console.log("[3/3] Resetting database...");
    await resetDatabase();
    console.log("✅ Database reset completed\n");
  } catch (error) {
    console.error("\n❌ Global setup failed:");
    console.error(error);
    throw error;
  }

  console.log("=".repeat(60));
  console.log("Global setup complete.");
  console.log("=".repeat(60));
}

export default globalSetup;

