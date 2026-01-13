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

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const sql = neon(process.env.DATABASE_URL);

  // Read and execute all migration files in order
  const drizzleFolder = path.join(projectRoot, "drizzle");
  const migrationFiles = fs
    .readdirSync(drizzleFolder)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (migrationFiles.length === 0) {
    console.error("No migration files found in drizzle folder");
    process.exit(1);
  }

  console.log(`Found ${migrationFiles.length} migration file(s)`);

  let totalStatements = 0;

  try {
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
          // Use tagged template syntax for neon
          await sql.unsafe(statement);
          console.log(`  ✅ Success`);
        } catch (error: any) {
          // Ignore "already exists" errors for tables/constraints
          if (
            error?.message?.includes("already exists") ||
            error?.code === "42P07" || // duplicate_table
            error?.code === "42710"
          ) {
            // duplicate_object
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
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("An error occurred while running migrations:", err);
  process.exit(1);
});
