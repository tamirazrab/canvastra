# Setup Guide

This guide will help you set up the project after the architecture improvements.

## Prerequisites

- Node.js 18+ or Bun
- Git

## Installation Steps

### 1. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using pnpm
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth (if using Better Auth)
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# External Services (optional for development)
REPLICATE_API_TOKEN="your-replicate-token"
STRIPE_SECRET_KEY="your-stripe-key"
VITE_UNSPLASH_ACCESS_KEY="your-unsplash-key"
```

### 3. Set Up Database

```bash
# Generate database schema
bun run db:generate

# Run migrations
bun run db:migrate

# Or push schema directly (development only)
bunx drizzle-kit push
```

### 4. Initialize Git Hooks

```bash
bun run prepare
```

This will set up Husky for pre-commit hooks.

### 5. Verify Installation

```bash
# Run linting
bun run lint

# Run type checking
bunx tsc --noEmit

# Run tests
bun run test:run

# Check formatting
bun run format:check
```

## Development Workflow

### Running the Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### Running Tests

```bash
# Unit tests (watch mode)
bun run test

# Unit tests (single run)
bun run test:run

# Unit tests with coverage
bun run test:coverage

# E2E tests
bun run test:e2e

# E2E tests with UI
bun run test:e2e:ui
```

### Running Storybook

```bash
# Start Storybook dev server
bun run storybook

# Build static Storybook
bun run build-storybook
```

### Code Quality

```bash
# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Check formatting
bun run format:check
```

## Project Structure

```
src/
├── core/                    # Core business logic
│   ├── domain/             # Domain layer (entities, repositories, services)
│   │   ├── entities/       # Business entities
│   │   ├── repositories/   # Repository interfaces
│   │   ├── services/       # Service interfaces
│   │   ├── events/         # Domain events
│   │   ├── value-objects/ # Value objects
│   │   └── exceptions/    # Domain exceptions
│   └── application/        # Application layer
│       ├── use-cases/      # Use cases
│       ├── services/       # Application services
│       └── dtos/           # Data Transfer Objects
├── infrastructure/         # Infrastructure layer
│   ├── repositories/       # Repository implementations
│   ├── services/           # Service implementations
│   ├── events/             # Event dispatcher implementations
│   └── di/                 # Dependency Injection
├── presentation/           # Presentation layer
│   └── controllers/       # HTTP handlers
├── components/             # React components
├── features/               # Feature modules
├── hooks/                  # React hooks
├── routes/                 # TanStack Router routes
└── tests/                  # Test files
```

## Architecture Principles

### Dependency Rule

Dependencies always point inward:
- Presentation → Application → Domain
- Infrastructure → Application → Domain
- Infrastructure → Domain (for repository implementations)

### Key Principles

1. **Domain Layer**: No dependencies on outer layers
2. **Application Layer**: Depends only on Domain layer
3. **Infrastructure Layer**: Implements interfaces from Domain/Application
4. **Presentation Layer**: Depends on Application and Infrastructure

## Testing Strategy

### Unit Tests
- **Domain**: Pure business logic, no mocks
- **Application**: Mock repositories and services
- **Infrastructure**: Mock external dependencies
- **Presentation**: Mock use cases

### Integration Tests
- Test repository implementations with test database
- Test use cases with real repository implementations

### E2E Tests
- Critical user journeys
- Cross-browser testing

## Git Workflow

### Commit Messages

Follow conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

Example:
```
feat: add user authentication
fix: resolve project deletion issue
docs: update README with setup instructions
```

### Pre-commit Hooks

The following checks run automatically on commit:
- ESLint
- Prettier formatting
- Commit message validation

## CI/CD

The GitHub Actions workflow runs on push/PR:
1. Lint and type check
2. Unit tests with coverage
3. E2E tests
4. Build verification

## Troubleshooting

### Storybook Type Errors

If you see type errors in Storybook, make sure dependencies are installed:
```bash
bun install
```

### Husky Hooks Not Working

Make sure Husky is initialized:
```bash
bun run prepare
```

### Test Failures

1. Check that test database is set up
2. Verify environment variables are configured
3. Run `bun run test:run` to see detailed errors

### Import Errors

Make sure TypeScript path aliases are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Additional Resources

- [Clean Architecture Documentation](./CLEAN_ARCHITECTURE.md)
- [Architecture Improvements](./ARCHITECTURE_IMPROVEMENTS.md)
- [TanStack Start Docs](https://tanstack.com/start)
- [Storybook Docs](https://storybook.js.org/)

