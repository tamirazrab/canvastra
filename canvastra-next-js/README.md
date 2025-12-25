# Canvastra Next.js

A professional design editor built with Next.js and hexagonal DDD architecture.

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
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your values

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

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed architecture documentation
- [Migration Summary](./MIGRATION_SUMMARY.md) - TanStack to Next.js migration notes

## 🤝 Contributing

This is a learning project demonstrating hexagonal DDD architecture in Next.js. Contributions are welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

Built with inspiration from modern design tools and clean architecture principles.
