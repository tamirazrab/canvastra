# Canvastra Next.js

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white)

**A professional design editor built with Next.js and hexagonal DDD architecture**

[![Tests](https://img.shields.io/badge/tests-48%20passing-brightgreen)](./TEST_SUMMARY.md)
[![Coverage](https://img.shields.io/badge/coverage-85%25%2B-green)](./TEST_SUMMARY.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

A full-stack design editor application demonstrating clean architecture principles, domain-driven design, and modern web development practices. Built with TypeScript, Next.js, and a hexagonal architecture for maximum maintainability and testability.

## 🏗️ Architecture

This project follows **hexagonal domain-driven design (DDD)** architecture with clean separation of concerns:

- **Domain Layer**: Pure business logic (entities, value objects, repository interfaces)
- **Application Layer**: Use cases orchestrating business operations
- **Infrastructure Layer**: External concerns (database, services, DI container)
- **Presentation Layer**: Next.js UI components and pages

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 📦 Monorepo Structure

```
canvastra-next-js/
├── apps/
│   ├── web/              # Next.js frontend application
│   └── server/           # Backend API (Hono + tRPC)
├── packages/
│   ├── core/             # Domain + Application layers
│   ├── infrastructure/   # Repositories + DI Container
│   ├── db/               # Database schema (Drizzle ORM)
│   ├── api/              # tRPC API routers
│   └── auth/             # Authentication configuration
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.5
- PostgreSQL database (we recommend [Neon](https://neon.tech))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd canvastra-next-js

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values
# See docs/ENVIRONMENT_VARIABLES.md for detailed guide

# Push database schema
bun run db:push

# Start development server
bun run dev
```

The application will be available at:
- Web app: http://localhost:3001
- API server: http://localhost:3000

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI
- **API**: tRPC for type-safe API calls
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better-Auth
- **Canvas**: Fabric.js
- **Package Manager**: Bun
- **Monorepo**: Turborepo

## 📂 Key Features

✅ **Editor** - Full-featured design editor with Fabric.js canvas
✅ **Projects** - Create, edit, and manage design projects
✅ **Authentication** - OAuth providers (GitHub, Google)
✅ **Subscriptions** - Stripe integration for billing
✅ **AI Generation** - AI-powered image generation
✅ **Images** - Unsplash integration for stock photos

## 🧪 Development Commands

```bash
# Development
bun run dev              # Start all apps
bun run dev:web          # Start web app only
bun run dev:server       # Start server only

# Database
bun run db:push          # Push schema changes
bun run db:studio        # Open Drizzle Studio
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations

# Build
bun run build            # Build all packages

# Code Quality
bun run check            # Run Biome linter
```

## 🧪 Testing

This project includes comprehensive testing:

- **Unit Tests**: Domain entities, value objects, and use cases (48 tests)
- **Integration Tests**: Repository implementations and API routes
- **E2E Tests**: Critical user flows with Playwright

```bash
# Run all unit tests
bun run test

# Run unit tests with coverage
cd packages/core && bun run test:coverage

# Run E2E tests (requires database and env setup)
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Run all tests
bun run test:all
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed architecture documentation
- [Migration Summary](./MIGRATION_SUMMARY.md) - Complete migration documentation
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to this project
- [Testing Guide](./TESTING.md) - Testing strategy and how to run tests
- [API Documentation](./docs/API.md) - Complete API reference
- [Next Steps](./NEXT_STEPS.md) - Roadmap for future enhancements

## 🏗️ Architecture Highlights

- **Hexagonal Architecture**: Clean separation of concerns with domain-driven design
- **Dependency Inversion**: Core business logic independent of frameworks
- **Type Safety**: End-to-end TypeScript with tRPC
- **Testability**: Isolated business logic for easy unit testing
- **Scalability**: Architecture supports growing complexity

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

Built with inspiration from modern design tools and clean architecture principles. Special thanks to the open-source community for the amazing tools and libraries.
