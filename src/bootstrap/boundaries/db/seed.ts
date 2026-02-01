/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

import { users, projects, templates } from "./schema";

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

    const userIds = successful.map((u) => u.id);
    
    console.log(`Seeded ${successful.length} canva users`);
    
    return {
      users: successful,
      userIds
    };
  } catch (error) {
    console.error("Error seeding canva users:", error);
    throw error;
  }
}

async function seedTemplates(db: ReturnType<typeof drizzle>) {
  try {
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
    const templateData = [
      {
        id: "template-001",
        name: "Car Sale Banner",
        json: carSaleJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/car_sale.png",
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "template-002",
        name: "Coming Soon Template",
        json: comingSoonJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/coming_soon.png",
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "template-003",
        name: "Flash Sale Template",
        json: flashSaleJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/flash_sale.png",
        isPro: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "template-004",
        name: "Travel Poster",
        json: travelJson,
        height: 1200,
        width: 900,
        thumbnailUrl: "/travel.png",
        isPro: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const insertedTemplates = await Promise.all(
      templateData.map(async (template) => {
        const existing = await db
          .select()
          .from(templates)
          .where(eq(templates.id, template.id))
          .limit(1);

        if (existing.length > 0) {
          return null;
        }

        const [inserted] = await db
          .insert(templates)
          .values(template)
          .returning();

        return inserted;
      }),
    );

    const successful = insertedTemplates.filter((t) => t !== null);
    console.log(`Seeded ${successful.length} templates`);

    return { templates: successful };
  } catch (error) {
    console.error("Error seeding templates:", error);
    throw error;
  }
}

async function seedCanvaProjects(db: ReturnType<typeof drizzle>, userIds: string[]) {
  try {
    const now = new Date();
    const projectData = [
      {
        id: "project-005",
        name: "My First Design",
        userId: userIds[0],
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

  // Seed templates (no users required), then users and projects
  try {
    await seedTemplates(db);
  } catch (error) {
    console.warn(
      "Warning: Could not seed templates:",
      (error as Error).message,
    );
    console.log(
      "This is expected if tables don't exist yet. Run migrations first.",
    );
  }

  try {
    const users = await seedCanvaUsers(db);
    await seedCanvaProjects(db, users.userIds);
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
