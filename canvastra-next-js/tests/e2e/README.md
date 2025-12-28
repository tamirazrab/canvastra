# E2E Tests

End-to-end tests using Playwright for critical user flows.

## Test Suites

- **auth.spec.ts** - Authentication flows (sign in, sign up, validation)
- **projects.spec.ts** - Project management (dashboard, creation, templates)
- **editor.spec.ts** - Editor functionality (canvas, toolbar, sidebar)
- **subscriptions.spec.ts** - Subscription and billing flows
- **ai-features.spec.ts** - AI image generation features
- **images.spec.ts** - Image search and integration
- **navigation.spec.ts** - Navigation and routing

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
```

## Prerequisites

- Database must be set up and running
- Environment variables configured
- Both server and web apps must be able to start

Tests will automatically start the servers before running.

