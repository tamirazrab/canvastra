import { test, expect } from "@playwright/test";
import { resetDatabase } from "../setup/db-setup";
import { createTestUser, createTestProject, getProjectById, deleteProject } from "../helpers/db-helper";
import { authenticateUser } from "../helpers/auth-helper";

/**
 * E2E tests for project management.
 * Tests use real database, real API routes, and real authentication.
 * Zero mocking.
 */

test.describe("Project Management", () => {
  test.beforeEach(async () => {
    // Reset database before each test for isolation
    await resetDatabase();
  });

  test("should create a new project", async ({ page }) => {
    // Create test user
    const user = await createTestUser();

    // Authenticate user
    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto("/editor");

    // Click "Create Project" button
    await page.click('button:has-text("Create Project")');

    // Wait for redirect to editor with project ID
    await page.waitForURL(/\/editor\/[^/]+$/, { timeout: 10000 });

    // Get project ID from URL
    const url = page.url();
    const projectId = url.split("/").pop();
    expect(projectId).toBeTruthy();

    // Verify project exists in database
    const project = await getProjectById(projectId!);
    expect(project).not.toBeNull();
    expect(project?.userId).toBe(user.id);

    // Verify project appears in projects list
    await page.goto("/editor");
    await expect(page.locator(`text=${project?.name || "New Project"}`)).toBeVisible();
  });

  test("should list all projects for a user", async ({ page }) => {
    // Create test user
    const user = await createTestUser();

    // Create multiple projects
    const project1 = await createTestProject(user.id, { name: "Project 1" });
    const project2 = await createTestProject(user.id, { name: "Project 2" });
    const project3 = await createTestProject(user.id, { name: "Project 3" });

    // Authenticate user
    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto("/editor");

    // Verify all projects are visible
    await expect(page.locator(`text=${project1.name}`)).toBeVisible();
    await expect(page.locator(`text=${project2.name}`)).toBeVisible();
    await expect(page.locator(`text=${project3.name}`)).toBeVisible();
  });

  test("should load project data correctly", async ({ page }) => {
    // Create test user and project with specific data
    const user = await createTestUser();
    const projectData = {
      json: JSON.stringify({
        objects: [
          {
            type: "rect",
            left: 100,
            top: 100,
            width: 200,
            height: 200,
            fill: "red",
          },
        ],
      }),
      width: 1920,
      height: 1080,
    };
    const project = await createTestProject(user.id, projectData);

    // Authenticate user
    await authenticateUser(page, user.email, user.password);

    // Navigate to project editor
    await page.goto(`/editor/${project.id}`);

    // Wait for canvas to load
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Verify canvas is visible
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("should update project on canvas changes", async ({ page }) => {
    // Create test user and project
    const user = await createTestUser();
    const project = await createTestProject(user.id);

    // Authenticate user
    await authenticateUser(page, user.email, user.password);

    // Navigate to project editor
    await page.goto(`/editor/${project.id}`);

    // Wait for canvas to load
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Add a shape to the canvas (click shape tool, then click canvas)
    await page.click('button[aria-label*="shapes"], button:has-text("Shapes")');
    await page.click('button[aria-label*="rectangle"], button:has-text("Rectangle")');
    
    // Click on canvas to add rectangle
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Wait for auto-save (debounce is 500ms, wait a bit longer)
    await page.waitForTimeout(1000);

    // Verify database was updated
    const updatedProject = await getProjectById(project.id);
    expect(updatedProject).not.toBeNull();
    
    // Parse JSON and verify it contains the rectangle
    const canvasData = JSON.parse(updatedProject!.json);
    expect(canvasData.objects).toBeDefined();
    expect(canvasData.objects.length).toBeGreaterThan(0);
  });

  test("should delete a project", async ({ page }) => {
    // Create test user and project
    const user = await createTestUser();
    const project = await createTestProject(user.id, { name: "Project to Delete" });

    // Authenticate user
    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto("/editor");

    // Find project card and click menu
    const projectCard = page.locator(`text=${project.name}`).locator("..");
    await projectCard.hover();
    
    // Click dropdown menu
    await projectCard.locator('button[aria-label*="more"], button:has-text("More")').click();

    // Click delete option
    await page.click('button:has-text("Delete"), [role="menuitem"]:has-text("Delete")');

    // Confirm deletion (if confirmation dialog appears)
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Verify project removed from database
    const deletedProject = await getProjectById(project.id);
    expect(deletedProject).toBeNull();

    // Verify project removed from UI
    await expect(page.locator(`text=${project.name}`)).not.toBeVisible();
  });

  test("should duplicate a project", async ({ page }) => {
    // Create test user and project with content
    const user = await createTestUser();
    const projectData = {
      json: JSON.stringify({
        objects: [{ type: "rect", left: 100, top: 100, width: 200, height: 200 }],
      }),
    };
    const project = await createTestProject(user.id, projectData);

    // Authenticate user
    await authenticateUser(page, user.email, user.password);

    // Navigate to editor page
    await page.goto("/editor");

    // Find project card and click menu
    const projectCard = page.locator(`text=${project.name}`).locator("..");
    await projectCard.hover();
    
    // Click dropdown menu
    await projectCard.locator('button[aria-label*="more"], button:has-text("More")').click();

    // Click duplicate option
    await page.click('button:has-text("Duplicate"), [role="menuitem"]:has-text("Duplicate")');

    // Wait for redirect to new project
    await page.waitForURL(/\/editor\/[^/]+$/, { timeout: 10000 });

    // Get new project ID from URL
    const url = page.url();
    const newProjectId = url.split("/").pop();
    expect(newProjectId).toBeTruthy();
    expect(newProjectId).not.toBe(project.id);

    // Verify new project created with same content
    const duplicatedProject = await getProjectById(newProjectId!);
    expect(duplicatedProject).not.toBeNull();
    expect(duplicatedProject?.json).toBe(projectData.json);

    // Verify original project unchanged
    const originalProject = await getProjectById(project.id);
    expect(originalProject).not.toBeNull();
    expect(originalProject?.json).toBe(projectData.json);
  });
});

