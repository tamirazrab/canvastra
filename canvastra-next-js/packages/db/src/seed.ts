import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { project, user } from "./schema";

async function main() {
  console.log("🌱 Seeding database with realistic data...\n");

  try {
    // 1. Create a primary test user
    const TEST_USER_ID = "test-user-1";
    const testUserEmail = "test@example.com";

    const existingTestUser = await db
      .select()
      .from(user)
      .where(eq(user.id, TEST_USER_ID))
      .limit(1)
      .then((rows) => rows[0]);

    if (!existingTestUser) {
      await db.insert(user).values({
        id: TEST_USER_ID,
        name: "Test User",
        email: testUserEmail,
        emailVerified: true,
        image: faker.image.avatar(),
      });
      console.log(`✅ Created test user: ${testUserEmail} (ID: ${TEST_USER_ID})`);
    } else {
      console.log(`ℹ️  Test user already exists: ${testUserEmail}`);
    }

    // 2. Create additional users
    const EXTRA_USERS_COUNT = 5;
    const extraUserIds: string[] = [];

    for (let i = 0; i < EXTRA_USERS_COUNT; i++) {
      const id = crypto.randomUUID();
      const email = faker.internet.email();

      // Check if user already exists
      const existing = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        await db.insert(user).values({
          id,
          name: faker.person.fullName(),
          email,
          emailVerified: faker.datatype.boolean({ probability: 0.8 }),
          image: faker.image.avatar(),
        });
        extraUserIds.push(id);
      }
    }
    console.log(`✅ Created ${extraUserIds.length} additional users`);

    const allUserIds = [TEST_USER_ID, ...extraUserIds];

    // 3. Create Projects (mix of templates and regular projects)
    const PROJECTS_COUNT = 30;
    let projectsCreated = 0;

    // Common canvas dimensions
    const dimensions = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1080, height: 1080 }, // Square
      { width: 1200, height: 630 }, // Social media
      { width: 800, height: 600 }, // Standard
      { width: 1920, height: 1080 }, // Landscape
    ];

    // Sample project names
    const projectNameTemplates = [
      "Marketing Campaign",
      "Social Media Post",
      "Business Card",
      "Logo Design",
      "Poster Design",
      "Banner Ad",
      "Email Template",
      "Presentation Slide",
      "Infographic",
      "Flyer Design",
    ];

    for (let i = 0; i < PROJECTS_COUNT; i++) {
      const isTemplate = i < 10; // First 10 are templates
      const userId = isTemplate
        ? TEST_USER_ID
        : faker.helpers.arrayElement(allUserIds);

      const dims = faker.helpers.arrayElement(dimensions);

      // Create realistic JSON canvas data
      const canvasJson = JSON.stringify({
        version: "5.3.0",
        objects: [
          {
            type: "rect",
            left: dims.width / 4,
            top: dims.height / 4,
            width: dims.width / 2,
            height: dims.height / 2,
            fill: faker.color.rgb(),
            stroke: faker.color.rgb(),
            strokeWidth: 2,
          },
          {
            type: "textbox",
            left: dims.width / 2,
            top: dims.height / 2,
            width: 200,
            height: 50,
            fill: "#000000",
            text: faker.lorem.words(3),
            fontSize: 24,
          },
        ],
      });

      const projectName = isTemplate
        ? `Template: ${faker.helpers.arrayElement(projectNameTemplates)}`
        : `${faker.helpers.arrayElement(projectNameTemplates)} - ${faker.company.catchPhrase()}`;

      await db.insert(project).values({
        id: crypto.randomUUID(),
        name: projectName,
        userId,
        json: canvasJson,
        width: dims.width,
        height: dims.height,
        isTemplate,
        isPro: faker.datatype.boolean({ probability: 0.2 }),
        thumbnailUrl: faker.image.url({ width: 400, height: 300 }),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent({ days: 30 }),
      });

      projectsCreated++;
    }

    console.log(`✅ Created ${projectsCreated} projects`);
    console.log(`   - ${projectsCreated - 10} regular projects`);
    console.log(`   - 10 templates\n`);

    // 4. Summary
    const totalUsers = await db.select().from(user);
    const totalProjects = await db.select().from(project);
    const templates = totalProjects.filter((p) => p.isTemplate);

    console.log("📊 Database Summary:");
    console.log(`   - Users: ${totalUsers.length}`);
    console.log(`   - Projects: ${totalProjects.length}`);
    console.log(`   - Templates: ${templates.length}`);
    console.log(`   - Regular Projects: ${totalProjects.length - templates.length}\n`);

    console.log("✨ Seeding complete!\n");
    console.log(`💡 Test user credentials:`);
    console.log(`   Email: ${testUserEmail}`);
    console.log(`   User ID: ${TEST_USER_ID}\n`);

    // Show a sample project ID for testing
    const sampleProject = await db
      .select()
      .from(project)
      .where(eq(project.userId, TEST_USER_ID))
      .limit(1)
      .then((rows) => rows[0]);

    if (sampleProject) {
      console.log(`💡 Sample project for testing:`);
      console.log(`   Project ID: ${sampleProject.id}`);
      console.log(`   Name: ${sampleProject.name}`);
      console.log(`   URL: http://localhost:3001/editor/${sampleProject.id}\n`);
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

