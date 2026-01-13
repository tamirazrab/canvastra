/* eslint-disable no-console */
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "../../../../");

// Load environment variables from project root
const envResult = config({ path: path.join(projectRoot, ".env.local") });
if (envResult.error && !process.env.DATABASE_URL) {
  console.warn("Warning: Could not load .env.local, trying .env");
  config({ path: path.join(projectRoot, ".env") });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  console.log(
    "DATABASE_URL:",
    process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"),
  );

  const sqlClient = neon(process.env.DATABASE_URL);

  try {
    // Check current schema
    console.log("\nChecking current schema...");
    const currentSchema = await sqlClient`SELECT current_schema()`;
    console.log(`Current schema: ${currentSchema[0]?.current_schema}`);

    // Check all schemas
    const schemas = await sqlClient`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    `;
    console.log(
      "Available schemas:",
      schemas.map((s: any) => s.schema_name).join(", "),
    );

    // Check if user table exists in any schema
    console.log("\nChecking for 'user' table...");
    const tablesResult = await sqlClient`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user'
    `;

    if (tablesResult.length === 0) {
      console.log("❌ 'user' table does NOT exist in any schema");
    } else {
      console.log(
        `✅ 'user' table exists in schema(s): ${tablesResult.map((t: any) => `${t.table_schema}.${t.table_name}`).join(", ")}`,
      );

      // Check columns
      const columnsResult = await sqlClient`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'user'
        ORDER BY ordinal_position
      `;
      console.log("\nColumns in 'user' table:");
      columnsResult.forEach((col: any) => {
        console.log(
          `  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`,
        );
      });
    }

    // Check all tables in all schemas
    console.log("\nAll tables in database:");
    const allTables = await sqlClient`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY table_schema, table_name
    `;

    if (allTables.length === 0) {
      console.log("  ❌ No tables found in database!");
    } else {
      allTables.forEach((table: any) => {
        console.log(`  - ${table.table_schema}.${table.table_name}`);
      });
    }

    // Check drizzle schema specifically
    console.log("\nChecking drizzle schema tables...");
    const drizzleTables = await sqlClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'drizzle'
      ORDER BY table_name
    `;
    drizzleTables.forEach((table: any) => {
      console.log(`  - drizzle.${table.table_name}`);
    });

    // Check migration tracking
    console.log("\nChecking migration tracking...");
    const migrationsTable = await sqlClient`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '__drizzle_migrations'
    `;

    if (migrationsTable.length === 0) {
      console.log("❌ Migration tracking table does NOT exist");
    } else {
      console.log("✅ Migration tracking table exists");
      const migrations = await sqlClient`
        SELECT * FROM __drizzle_migrations ORDER BY created_at
      `;
      console.log(`\nApplied migrations (${migrations.length}):`);
      migrations.forEach((m: any) => {
        console.log(`  - ${m.hash} (${m.created_at})`);
      });
    }
  } catch (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});
