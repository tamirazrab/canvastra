# Testing Guide

This document describes the testing strategy and how to run tests for Canvastra Next.js.

## Testing Strategy

This project uses a comprehensive testing approach:

- **Unit Tests**: Test domain logic in isolation (Vitest)
- **Integration Tests**: Test repository implementations and API routes
- **E2E Tests**: Test critical user flows end-to-end (Playwright)

## Running Tests

### Unit Tests

Unit tests are located in `packages/core/src/**/*.test.ts` and test domain entities, value objects, and use cases.

```bash
# Run all unit tests
cd packages/core
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

### E2E Tests

E2E tests are located in `tests/e2e/` and test critical user flows.

**Prerequisites:**
- Database must be set up and running
- Environment variables must be configured
- Both server and web apps must be able to start

```bash
# Run all E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Run E2E tests in headed mode (see browser)
bun run test:e2e:headed

# Run specific test file
bunx playwright test tests/e2e/auth.spec.ts
```

### Running All Tests

```bash
# From root directory
bun run test:all
```

## Test Coverage

Current test coverage focuses on the domain layer:

- ✅ Domain entities (Project, User, Subscription)
- ✅ Value objects (Email, ProjectDimensions)
- ✅ Use cases (Project CRUD, User operations)

**Coverage Target**: 80%+ for domain layer

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { Project } from './project.entity';

describe('Project Entity', () => {
  it('should create a project', () => {
    const project = new Project({
      id: 'test-id',
      name: 'Test',
      userId: 'user-123',
      json: '{}',
      width: 1920,
      height: 1080,
    });

    expect(project.name).toBe('Test');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should display login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText(/sign in/i)).toBeVisible();
});
```

## Test Structure

```
canvastra-next-js/
├── packages/core/
│   └── src/
│       ├── domain/
│       │   ├── entities/
│       │   │   └── *.test.ts
│       │   └── value-objects/
│       │       └── *.test.ts
│       └── application/
│           └── use-cases/
│               └── **/*.test.ts
└── tests/
    └── e2e/
        ├── auth.spec.ts
        ├── projects.spec.ts
        ├── editor.spec.ts
        └── ...
```

## CI/CD Integration

Tests run automatically in CI:

- Unit tests run on every PR
- E2E tests run on every PR (requires database)
- Coverage reports are generated
- Tests must pass before merge

## Troubleshooting

### E2E Tests Failing

1. Ensure database is running and accessible
2. Check environment variables are set
3. Verify both server and web apps can start independently
4. Check for port conflicts (3000, 3001)

### Unit Tests Failing

1. Run `bun install` to ensure dependencies are installed
2. Check TypeScript configuration
3. Verify test files are in correct location

## Best Practices

1. **Test Business Logic**: Focus on domain entities and use cases
2. **Mock External Dependencies**: Use mocks for repositories in unit tests
3. **Test Edge Cases**: Include tests for error conditions
4. **Keep Tests Fast**: Unit tests should run quickly
5. **Descriptive Names**: Use clear test descriptions

