# E2E Tests

This directory contains end-to-end tests using Playwright.

## Test Files

- `auth.spec.ts` - Authentication flows (sign in, sign up, validation)
- `projects.spec.ts` - Project management (dashboard, creation, templates)
- `editor.spec.ts` - Editor functionality (canvas, toolbar, sidebar)
- `subscriptions.spec.ts` - Subscription and billing flows
- `ai-features.spec.ts` - AI image generation features
- `images.spec.ts` - Image search and integration
- `navigation.spec.ts` - Navigation and routing

## Running Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run with UI (recommended for development)
bun run test:e2e:ui

# Run in headed mode (see browser)
bun run test:e2e:headed

# Run specific test file
bunx playwright test tests/e2e/auth.spec.ts

# Run specific browser
bunx playwright test --project=chromium
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:3001` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit
- **Web Servers**: Automatically starts server and web apps before tests

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Use Playwright's test API
3. Follow existing test patterns
4. Use data-testid attributes when possible for reliable selectors

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

## Best Practices

- Use semantic selectors (getByRole, getByText) when possible
- Add data-testid attributes to important UI elements
- Keep tests independent (no shared state)
- Use page object pattern for complex flows
- Handle async operations properly (waitForLoadState, waitForSelector)

