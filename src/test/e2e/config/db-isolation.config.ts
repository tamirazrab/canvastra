import { testDb } from "../setup/db-setup";
import { resetDatabase } from "../setup/db-setup";

/**
 * Database isolation configuration and utilities.
 * 
 * Ensures test isolation through database state management.
 * Each test run uses an isolated test database.
 */

export interface DatabaseIsolationConfig {
  /**
   * Strategy for database isolation.
   * - "reset": Reset database before each test (default)
   * - "transaction": Use transactions (not supported by Neon HTTP)
   * - "schema": Use separate schema per test (not implemented)
   */
  strategy: "reset" | "transaction" | "schema";

  /**
   * Whether to reset database before each test.
   * Default: true
   */
  resetBeforeEach: boolean;

  /**
   * Whether to reset database after each test.
   * Default: false
   */
  resetAfterEach: boolean;

  /**
   * Tables to exclude from reset (if any).
   * Useful for seed data that should persist.
   */
  excludeFromReset: string[];
}

/**
 * Default database isolation configuration.
 */
export const defaultDbIsolationConfig: DatabaseIsolationConfig = {
  strategy: "reset",
  resetBeforeEach: true,
  resetAfterEach: false,
  excludeFromReset: [],
};

/**
 * Database isolation manager.
 * Handles database state management for test isolation.
 */
export class DatabaseIsolationManager {
  private config: DatabaseIsolationConfig;

  constructor(config: DatabaseIsolationConfig = defaultDbIsolationConfig) {
    this.config = config;
  }

  /**
   * Setup database isolation before test.
   * Called in beforeEach hooks.
   */
  async setup(): Promise<void> {
    if (this.config.resetBeforeEach) {
      await resetDatabase();
    }
  }

  /**
   * Teardown database isolation after test.
   * Called in afterEach hooks.
   */
  async teardown(): Promise<void> {
    if (this.config.resetAfterEach) {
      await resetDatabase();
    }
  }

  /**
   * Reset database manually.
   * Useful for test setup or cleanup.
   */
  async reset(): Promise<void> {
    await resetDatabase();
  }

  /**
   * Get current isolation strategy.
   */
  getStrategy(): DatabaseIsolationConfig["strategy"] {
    return this.config.strategy;
  }

  /**
   * Update isolation configuration.
   */
  updateConfig(config: Partial<DatabaseIsolationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Global database isolation manager instance.
 * Use this in test files for consistent isolation.
 */
export const dbIsolation = new DatabaseIsolationManager();

/**
 * Helper function to reset database before test.
 * Use this in beforeEach hooks.
 */
export async function setupDatabaseIsolation(): Promise<void> {
  await dbIsolation.setup();
}

/**
 * Helper function to reset database after test.
 * Use this in afterEach hooks.
 */
export async function teardownDatabaseIsolation(): Promise<void> {
  await dbIsolation.teardown();
}

/**
 * Verify database isolation is working correctly.
 * Checks that database is empty or reset.
 */
export async function verifyDatabaseIsolation(): Promise<void> {
  const { users, projects, subscriptions } = await import("@/bootstrap/boundaries/db/schema");
  const { eq, count } = await import("drizzle-orm");

  const userCount = await testDb.select({ count: count() }).from(users);
  const projectCount = await testDb.select({ count: count() }).from(projects);
  const subscriptionCount = await testDb.select({ count: count() }).from(subscriptions);

  if (userCount[0]?.count > 0 || projectCount[0]?.count > 0 || subscriptionCount[0]?.count > 0) {
    console.warn(
      `Database isolation warning: Found existing data. ` +
      `Users: ${userCount[0]?.count}, Projects: ${projectCount[0]?.count}, Subscriptions: ${subscriptionCount[0]?.count}`,
    );
  }
}

