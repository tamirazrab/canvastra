# Contributing to Canvastra Next.js

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canvastra-next-js
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Set up database**
   ```bash
   bun run db:push
   ```

5. **Start development servers**
   ```bash
   bun run dev
   ```

## Code Style

- We use [Biome](https://biomejs.dev/) for linting and formatting
- Run `bun run check` before committing
- Follow TypeScript best practices
- Write self-documenting code with clear variable names

## Architecture Guidelines

This project follows **hexagonal architecture** principles:

1. **Domain Layer** (`packages/core/src/domain/`)
   - Pure business logic
   - No framework dependencies
   - Entities, value objects, repository interfaces

2. **Application Layer** (`packages/core/src/application/`)
   - Use cases orchestrate domain objects
   - Depends only on domain layer

3. **Infrastructure Layer** (`packages/infrastructure/`)
   - Implements domain interfaces
   - Database, external services, DI container

4. **API Layer** (`packages/api/`)
   - tRPC routers
   - Uses use cases from application layer

5. **Presentation Layer** (`apps/web/`)
   - Next.js components
   - Uses tRPC client

## Adding a New Feature

1. **Define Domain Entity** (if needed)
   - Create entity in `packages/core/src/domain/entities/`
   - Add business logic methods

2. **Create Repository Interface**
   - Define in `packages/core/src/domain/repositories/`

3. **Implement Use Cases**
   - Create in `packages/core/src/application/use-cases/`
   - Test with mocked repositories

4. **Implement Repository**
   - Create in `packages/infrastructure/src/repositories/`
   - Implement domain interface

5. **Create tRPC Router**
   - Add router in `packages/api/src/routers/`
   - Use use cases from DI container

6. **Update Frontend**
   - Create hooks in `apps/web/src/features/`
   - Use tRPC client

7. **Register in DI Container**
   - Update `packages/infrastructure/src/di/container.ts`

## Testing

- Write unit tests for domain logic
- Write integration tests for repositories
- Write E2E tests for critical flows
- Aim for 80%+ coverage on domain layer

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: update documentation
test: add tests
refactor: refactor code
chore: maintenance tasks
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Run `bun run check` and `bun run check-types`
6. Create a pull request with a clear description
7. Address review feedback

## Questions?

Feel free to open an issue for questions or discussions!

