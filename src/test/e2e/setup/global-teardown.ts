import { FullConfig } from "@playwright/test";
import { resetDatabase } from "./db-setup";

/**
 * Global teardown runs once after all tests.
 * Cleans up test database.
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log("Running global teardown...");

  // Optionally reset database after all tests
  // Uncomment if you want a clean database after test run
  // await resetDatabase();

  console.log("Global teardown complete.");
}

export default globalTeardown;

