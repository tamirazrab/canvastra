
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { projects, users } from "../infrastructure/db/schema";
import * as schema from "../infrastructure/db/schema";
import { faker } from "@faker-js/faker";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database with realistic data...");

  // 1. Create a primary user for testing
  const SEED_USER_ID = "seed-user-1";
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, SEED_USER_ID),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: SEED_USER_ID,
      name: "Test User",
      email: "test@example.com",
      emailVerified: new Date(),
      image: faker.image.avatar(),
      password: "", // Password auth might depend on provider
    });
    console.log("Created test user: test@example.com");
  }

  // 2. Create extra users
  const EXTRA_USERS_COUNT = 5;
  const extraUserIds: string[] = [];

  for (let i = 0; i < EXTRA_USERS_COUNT; i++) {
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      emailVerified: new Date(),
      image: faker.image.avatar(),
    });
    extraUserIds.push(id);
  }
  console.log(`Created ${EXTRA_USERS_COUNT} extra users`);

  const allUserIds = [SEED_USER_ID, ...extraUserIds];

  // 3. Create Projects
  // Mix of templates and regular projects
  const PROJECTS_COUNT = 20;

  for (let i = 0; i < PROJECTS_COUNT; i++) {
    const isTemplate = faker.datatype.boolean({ probability: 0.3 }); // 30% chance of being a template
    const userId = isTemplate ? SEED_USER_ID : faker.helpers.arrayElement(allUserIds);

    // Random dimensions for variety
    const width = faker.helpers.arrayElement([1080, 1920, 1200, 800]);
    const height = faker.helpers.arrayElement([1080, 1080, 630, 600]);

    await db.insert(projects).values({
      id: crypto.randomUUID(),
      name: isTemplate ? `Template: ${faker.commerce.productName()}` : faker.company.catchPhrase(),
      userId,
      json: "{}",
      width,
      height,
      isTemplate,
      isPro: faker.datatype.boolean({ probability: 0.2 }),
      thumbnailUrl: "", // Could generate placeholder image
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    });
  }

  console.log(`Created ${PROJECTS_COUNT} projects`);
  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
