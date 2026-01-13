/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import { users, projects } from "./schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Canva clone seed data
// Note: Passwords are handled by better-auth, not stored in users table
const canvaUsers = [
  {
    id: "demo-user-001",
    name: "Demo User",
    email: "demo@example.com",
  },
  {
    id: "test-user-002",
    name: "Test User",
    email: "test@example.com",
  },
];

async function seedCanvaUsers(db: ReturnType<typeof drizzle>) {
  try {
    const insertedUsers = await Promise.all(
      canvaUsers.map(async (user) => {
        // Check if user already exists
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        if (existing.length > 0) {
          return null;
        }

        const [inserted] = await db
          .insert(users)
          .values({
            id: user.id,
            name: user.name,
            email: user.email,
            // Password is handled by better-auth through accounts table
          })
          .returning();

        return inserted;
      }),
    );

    const successful = insertedUsers.filter((u) => u !== null);
    console.log(`Seeded ${successful.length} canva users`);

    return {
      users: successful,
    };
  } catch (error) {
    console.error("Error seeding canva users:", error);
    throw error;
  }
}

async function seedCanvaProjects(db: ReturnType<typeof drizzle>) {
  try {
    // Read template JSON files
    const carSaleJson = fs.readFileSync(
      path.join(__dirname, "../../../../public/car_sale.json"),
      "utf8",
    );
    const comingSoonJson = fs.readFileSync(
      path.join(__dirname, "../../../../public/coming_soon.json"),
      "utf8",
    );
    const flashSaleJson = fs.readFileSync(
      path.join(__dirname, "../../../../public/flash_sale.json"),
      "utf8",
    );
    const travelJson = fs.readFileSync(
      path.join(__dirname, "../../../../public/travel.json"),
      "utf8",
    );

    const now = new Date();
    const projectData = [
      {
        id: "project-001",
        name: "Car Sale Banner",
        userId: "demo-user-001",
        json: carSaleJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/car_sale.png",
        isTemplate: true,
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "project-002",
        name: "Coming Soon Template",
        userId: "demo-user-001",
        json: comingSoonJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/coming_soon.png",
        isTemplate: true,
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "project-003",
        name: "Flash Sale Template",
        userId: "demo-user-001",
        json: flashSaleJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/flash_sale.png",
        isTemplate: true,
        isPro: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "project-004",
        name: "Travel Poster",
        userId: "demo-user-001",
        json: travelJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/travel.png",
        isTemplate: true,
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "project-005",
        name: "My First Design",
        userId: "demo-user-001",
        json: JSON.stringify({
          version: "5.3.0",
          objects: [
            {
              type: "rect",
              left: 0,
              top: 0,
              width: 800,
              height: 600,
              fill: "#4A90E2",
            },
            {
              type: "textbox",
              left: 200,
              top: 250,
              width: 400,
              height: 100,
              text: "Welcome!",
              fontSize: 48,
              fill: "#FFFFFF",
            },
          ],
        }),
        height: 600,
        width: 800,
        thumbnailUrl: null,
        isTemplate: false,
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const insertedProjects = await Promise.all(
      projectData.map(async (project) => {
        // Check if project already exists
        const existing = await db
          .select()
          .from(projects)
          .where(eq(projects.id, project.id))
          .limit(1);

        if (existing.length > 0) {
          return null;
        }

        const [inserted] = await db
          .insert(projects)
          .values(project)
          .returning();

        return inserted;
      }),
    );

    const successful = insertedProjects.filter((p) => p !== null);
    console.log(`Seeded ${successful.length} canva projects`);

    return {
      projects: successful,
    };
  } catch (error) {
    console.error("Error seeding canva projects:", error);
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  // Seed canva-clone tables (user, project, subscription)
  try {
    await seedCanvaUsers(db);
    await seedCanvaProjects(db);
  } catch (error) {
    console.warn(
      "Warning: Could not seed canva-clone tables:",
      (error as Error).message,
    );
    console.log(
      "This is expected if tables don't exist yet. Run migrations first.",
    );
  }

  console.log("Seeding completed!");
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err,
  );
  process.exit(1);
});
