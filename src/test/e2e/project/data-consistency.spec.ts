import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById } from "../helpers/db-helper";
import { authenticatedApiRequest } from "../helpers/api-helper";

/**
 * E2E tests for project data consistency.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Project Data Consistency", () => {
  test.beforeEach(async () => {
    await resetDatabase();
  });

  test("should maintain consistent project list across requests", async ({ page }) => {
    const user = await createTestUser();

    // Create projects
    const project1 = await createTestProject(user.id, { name: "Project 1" });
    const project2 = await createTestProject(user.id, { name: "Project 2" });
    const project3 = await createTestProject(user.id, { name: "Project 3" });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Get project list multiple times
    const responses = await Promise.all([
      authenticatedApiRequest(page.request, page, "/api/projects?page=1&limit=5"),
      authenticatedApiRequest(page.request, page, "/api/projects?page=1&limit=5"),
      authenticatedApiRequest(page.request, page, "/api/projects?page=1&limit=5"),
    ]);

    // All responses should be consistent
    const projectIds = responses.map((r) => {
      const data = r.body as { data?: Array<{ id?: string }> };
      return data.data?.map((p) => p.id).sort();
    });

    expect(projectIds[0]).toEqual(projectIds[1]);
    expect(projectIds[1]).toEqual(projectIds[2]);

    // Should include all created projects
    const allProjectIds = projectIds[0] || [];
    expect(allProjectIds).toContain(project1.id);
    expect(allProjectIds).toContain(project2.id);
    expect(allProjectIds).toContain(project3.id);
  });

  test("should maintain consistent project data after update", async ({ page }) => {
    const user = await createTestUser();
    const project = await createTestProject(user.id, { name: "Original Name" });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Update project
    const { status: updateStatus } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project.id}`,
      {
        method: "PATCH",
        data: { name: "Updated Name" },
      },
    );

    expect(updateStatus).toBe(200);

    // Get project multiple times - should be consistent
    const responses = await Promise.all([
      authenticatedApiRequest(page.request, page, `/api/projects/${project.id}`),
      authenticatedApiRequest(page.request, page, `/api/projects/${project.id}`),
      authenticatedApiRequest(page.request, page, `/api/projects/${project.id}`),
    ]);

    // All responses should have same data
    const projectNames = responses.map((r) => {
      const data = r.body as { data?: { name?: string } };
      return data.data?.name;
    });

    expect(projectNames[0]).toBe("Updated Name");
    expect(projectNames[0]).toEqual(projectNames[1]);
    expect(projectNames[1]).toEqual(projectNames[2]);

    // Verify in database
    const dbProject = await getProjectById(project.id);
    expect(dbProject?.name).toBe("Updated Name");
  });

  test("should maintain consistent project list pagination", async ({ page }) => {
    const user = await createTestUser();

    // Create more projects than page size
    for (let i = 0; i < 10; i++) {
      await createTestProject(user.id, { name: `Project ${i + 1}` });
    }

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Get first page
    const page1Response = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=5",
    );

    const page1Data = page1Response.body as { data?: unknown[]; nextPage?: number | null };
    expect(page1Data.data?.length).toBe(5);
    expect(page1Data.nextPage).toBe(2);

    // Get second page
    const page2Response = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=2&limit=5",
    );

    const page2Data = page2Response.body as { data?: unknown[]; nextPage?: number | null };
    expect(page2Data.data?.length).toBe(5);
    expect(page2Data.nextPage).toBeNull();

    // Verify no overlap between pages
    const page1Ids = (page1Data.data as Array<{ id?: string }>).map((p) => p.id);
    const page2Ids = (page2Data.data as Array<{ id?: string }>).map((p) => p.id);
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap.length).toBe(0);
  });

  test("should maintain data consistency after project deletion", async ({ page }) => {
    const user = await createTestUser();
    const project1 = await createTestProject(user.id, { name: "Project 1" });
    const project2 = await createTestProject(user.id, { name: "Project 2" });

    // Authenticate
    await page.goto("/en/sign-in");
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/editor/, { timeout: 30000 });

    // Delete project1
    const { status: deleteStatus } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project1.id}`,
      {
        method: "DELETE",
      },
    );

    expect(deleteStatus).toBe(200);

    // Verify project1 is deleted
    const deletedProject = await getProjectById(project1.id);
    expect(deletedProject).toBeNull();

    // Verify project2 still exists
    const { status: getStatus, body } = await authenticatedApiRequest(
      page.request,
      page,
      `/api/projects/${project2.id}`,
    );

    expect(getStatus).toBe(200);
    const project2Data = body as { data?: { id?: string } };
    expect(project2Data.data?.id).toBe(project2.id);

    // Verify project list doesn't include deleted project
    const { body: listBody } = await authenticatedApiRequest(
      page.request,
      page,
      "/api/projects?page=1&limit=10",
    );

    const listData = listBody as { data?: Array<{ id?: string }> };
    const projectIds = listData.data?.map((p) => p.id) || [];
    expect(projectIds).not.toContain(project1.id);
    expect(projectIds).toContain(project2.id);
  });
});

