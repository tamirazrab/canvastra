/* eslint-disable no-console */
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "../../../../");

// Load environment variables from project root
const envResult = config({ path: path.join(projectRoot, ".env.local") });
if (envResult.error && !process.env.DATABASE_URL) {
  console.warn("Warning: Could not load .env.local, trying .env");
  config({ path: path.join(projectRoot, ".env") });
}

async function dropAllTables(sql: ReturnType<typeof neon>) {
  console.log("Dropping all tables...");

  try {
    // Get all table names - Neon works better with individual DROP statements
    const tablesResult = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    const tables = Array.isArray(tablesResult) ? tablesResult : [];

    if (tables.length === 0) {
      console.log("  ℹ️  No tables to drop");
      return;
    }

    console.log(`  Found ${tables.length} table(s) to drop:`);
    tables.forEach((t) => {
      const table = t as { tablename: string };
      console.log(`    - ${table.tablename}`);
    });

    // Drop tables individually - this works reliably with Neon
    console.log("  Dropping tables individually...");
    // eslint-disable-next-line no-await-in-loop
    for (const tableItem of tables) {
      const table = tableItem as { tablename: string };
      try {
        // eslint-disable-next-line no-await-in-loop
        await sql.unsafe(
          `DROP TABLE IF EXISTS "public"."${table.tablename}" CASCADE;`,
        );
        console.log(`    ✅ Dropped ${table.tablename}`);
        // Small delay to ensure Neon processes the drop
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error(
          `    ❌ Failed to drop ${table.tablename}: ${error.message || String(err)}`,
        );
      }
    }

    // Drop sequences
    const sequencesResult = await sql`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `;
    const sequences = Array.isArray(sequencesResult) ? sequencesResult : [];

    if (sequences.length > 0) {
      console.log(`  Dropping ${sequences.length} sequence(s)...`);
      // eslint-disable-next-line no-await-in-loop
      for (const seqItem of sequences) {
        const seq = seqItem as { sequence_name: string };
        try {
          // eslint-disable-next-line no-await-in-loop
          await sql.unsafe(
            `DROP SEQUENCE IF EXISTS "public"."${seq.sequence_name}" CASCADE;`,
          );
        } catch (err: unknown) {
          const error = err as { message?: string };
          console.log(
            `    ⚠️  Could not drop sequence ${seq.sequence_name}: ${error.message || String(err)}`,
          );
        }
      }
    }

    // Wait a bit longer for Neon to fully process all drops
    console.log("  Waiting for drops to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Final verification
    const verifyResult = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    const remainingTables = Array.isArray(verifyResult) ? verifyResult : [];

    if (remainingTables.length > 0) {
      console.warn(
        `  ⚠️  Warning: ${remainingTables.length} table(s) may still exist:`,
      );
      remainingTables.forEach((t) => {
        const table = t as { tablename: string };
        console.warn(`    - ${table.tablename}`);
      });
      console.warn(
        "  This might be a caching issue with Neon. Tables should be dropped.",
      );
    } else {
      console.log(`  ✅ All tables dropped successfully`);
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("  ❌ Error dropping tables:", err.message || String(error));
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  // Safety check - warn if not in development
  if (process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: This script should NOT be run in production!");
    console.error("   It will DROP ALL TABLES in your database!");
    process.exit(1);
  }

  console.log("⚠️  WARNING: This will DROP ALL TABLES in your database!");
  console.log(
    "   Database:",
    process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"),
  );
  console.log("   Environment:", process.env.NODE_ENV || "development");
  console.log("\n   Press Ctrl+C within 5 seconds to cancel...\n");

  // Give user 5 seconds to cancel
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Connecting to database...");
  // Use neon with explicit typing to avoid type issues
  const sql = neon(process.env.DATABASE_URL) as ReturnType<typeof neon>;

  try {
    // Step 1: Drop all tables
    await dropAllTables(sql);

    // Step 2: Run migrations
    const separator = "=".repeat(60);
    console.log(`\n${separator}`);
    console.log("Running migrations...");
    console.log(separator);

    // Read and execute all migration files in order
    const drizzleFolder = path.join(projectRoot, "drizzle");
    const migrationFiles = fs
      .readdirSync(drizzleFolder)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.warn("⚠️  No migration files found in drizzle folder");
    } else {
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

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < statements.length; i += 1) {
          const statement = statements[i].trim();
          if (!statement) {
            // eslint-disable-next-line no-continue
            continue;
          }

          console.log(
            `Executing statement ${i + 1}/${statements.length} from ${migrationFile}...`,
          );
          const preview = statement.substring(0, 80).replace(/\s+/g, " ");
          console.log(`  SQL: ${preview}...`);

          try {
            // eslint-disable-next-line no-await-in-loop
            await sql.unsafe(statement);
            console.log(`  ✅ Success`);
            // eslint-disable-next-line no-plusplus
            totalStatements += 1;
          } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            if (
              err?.message?.includes("already exists") ||
              err?.code === "42P07" || // duplicate_table
              err?.code === "42710"
            ) {
              // duplicate_object
              console.log(
                `  ⚠️  Skipped (already exists): ${err.message || String(error)}`,
              );
              // eslint-disable-next-line no-continue
              continue;
            }
            console.error(`  ❌ Error: ${err.message || String(error)}`);
            console.error(`  Code: ${err.code || "unknown"}`);
            throw error;
          }
        }
      }

      console.log(
        `\n✅ All migrations completed! (${totalStatements} statements executed)`,
      );
    }

    console.log("\n✅ Database reset and migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during database reset:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});
