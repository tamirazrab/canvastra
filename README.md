# Canvastra

## Project Overview

Canvastra is a collaborative design platform built as a SaaS application with subscription-based monetization. The system solves the problem of browser-based graphic design by providing a canvas editor with real-time manipulation of design elements, template management, and multi-user project persistence.

At its core, this is a **multi-layered web application** combining:
- A domain-driven backend architecture for business logic isolation
- A Fabric.js-powered canvas editor for vector and raster graphics manipulation
- A subscription and payment infrastructure for SaaS monetization
- Comprehensive E2E test coverage for production reliability

The system prioritizes architectural correctness and maintainability over rapid prototyping, favoring explicit boundaries, functional error handling, and type safety.

---

## System Architecture

### Architectural Style: **Layered Domain-Driven Design + Clean Architecture**

The architecture follows **Hexagonal Architecture** (Ports and Adapters) with explicit separation between:

```
src/
├── bootstrap/         # Infrastructure layer - DI, DB, configs
│   ├── boundaries/    # External system adapters (DB, auth)
│   ├── configs/       # Environment and app configuration
│   └── di/            # Dependency injection (tsyringe)
├── feature/           # Application and Domain layers
│   ├── core/          # Domain modules (11 bounded contexts)
│   │   ├── project/   # Project aggregate
│   │   ├── user/      # User aggregate
│   │   ├── subscription/ # Subscription aggregate
│   │   ├── editor/    # Canvas editor orchestration
│   │   └── ...        # AI, images, invoices, revenue
│   ├── common/        # Shared kernel (fp-ts helpers, API types)
│   └── generic/       # Cross-cutting concerns
└── app/               # Presentation layer (Next.js app router)
    ├── api/           # Hono API gateway
    └── [lang]/        # Internationalized UI routes
```

### Why This Architecture?

1. **Testability**: Domain logic is isolated from framework code, enabling unit testing without mocking Next.js or React
2. **Scalability**: Each module (`project`, `subscription`, `user`) can evolve independently without cross-contamination
3. **Maintainability**: Clear boundaries enforce dependency rules (domain never imports from app/bootstrap layers)
4. **Framework Independence**: Core business logic (repositories, entities, use cases) is agnostic to Next.js or Hono

### Component Boundaries

| Layer | Responsibility | Ownership |
|-------|---------------|-----------|
| **Domain** (`feature/core/*/domain/`) | Business entities, rules, validation | Pure TypeScript, no framework dependencies |
| **Data** (`feature/core/*/data/`) | Repository implementations, DB queries | Owns Drizzle ORM interaction |
| **Application** (`feature/core/*/application/`) | Use case orchestration, controllers, server-actions | Bridges domain ↔ presentation |
| **Bootstrap** (`bootstrap/`) | Infrastructure setup (DB connection, DI container) | Initializes external dependencies |
| **Presentation** (`app/`) | UI rendering, API routing | Next.js App Router + Hono API |

### Data Flow

1. **API Request** → Hono route handler (`app/api/[[...route]]/projects.ts`)
2. **Validation** → Zod schema validation via `@hono/zod-validator`
3. **Controller** → Domain controller delegates to use case (`feature/core/editor/application/controller/`)
4. **Use Case** → Orchestrates repository calls and domain logic
5. **Repository** → Drizzle ORM query execution (`feature/core/project/data/repository/`)
6. **Response** → Functional error handling via `fp-ts/TaskEither`

---

## Key Design Decisions

### 1. **Functional Error Handling: fp-ts TaskEither**

**Decision**: Use `TaskEither<Failure, Success>` instead of throwing exceptions.

**Why**: 
- Errors become explicit in type signatures
- Forces handling of all failure paths at compile time
- Enables functional composition of async operations

**Trade-off Accepted**: Steeper learning curve for developers unfamiliar with functional programming.

**Example**:
```typescript
// Repository returns TaskEither, not throwing exceptions
getById(id: string, userId: string): ApiTask<Project> {
  return pipe(
    wrapAsync(async () => db.query()),
    chain((project) => 
      project ? right(project) : left(new ProjectNotFoundFailure())
    )
  );
}
```

### 2. **Hono for API Layer (instead of Next.js API Routes)**

**Decision**: Use Hono framework with catch-all Next.js route (`/api/[[...route]]`).

**Alternatives Considered**:
- Native Next.js route handlers
- Express.js in custom server

**Why Hono**:
- Edge runtime compatibility (when needed)
- Minimal overhead (faster than Express)
- Type-safe RPC client generation (`export type AppType`)
- Integrated middleware (auth, validation, rate limiting)

**Trade-off**: Additional abstraction layer over Next.js conventions.

### 3. **Fabric.js for Canvas Rendering**

**Decision**: Use Fabric.js v5.3.0 (browser build) for canvas manipulation.

**Why**:
- Mature vector graphics library with object model abstraction
- Built-in serialization/deserialization (critical for project persistence)
- Rich event system for user interactions
- Filter support (Grayscale, Sepia, Blur, etc.)

**Persistence Strategy**: Canvas state serialized to JSON, stored in `projects.json` column (PostgreSQL).

**Trade-off**: Large bundle size (~200KB minified), client-side rendering only.

### 4. **Better-auth over NextAuth.js**

**Decision**: Use `better-auth` library with custom Drizzle adapter.

**Why**:
- Tighter control over session schema
- Direct PostgreSQL integration via Drizzle
- Support for email/password + OAuth (GitHub, Google)
- Server-side session validation via `getSession()` utility

**Trade-off**: Smaller ecosystem compared to NextAuth.js (fewer pre-built providers).

### 5. **Server Actions as Presentation Bridge**

**Decision**: Use Next.js Server Actions for client → server communication (separate from API routes).

**Pattern**:
- Server Actions (`feature/core/editor/application/server-actions/`) call domain controllers
- API routes (`/api/*`) serve external/headless clients
- Both converge on the same domain layer

**Why**:
- Eliminates boilerplate for internal UI → backend calls
- Type-safe by default (no manual fetch typing)
- Reduces client bundle size (no Axios/React Query for server actions)

**Trade-off**: Two entry points into the domain layer (server actions + API routes).

### 6. **Drizzle ORM with Raw SQL Access**

**Decision**: Use Drizzle ORM for type-safe queries, with escape hatches for complex SQL.

**Why**:
- Type inference from schema (no code generation step)
- Minimal runtime overhead
- PostgreSQL-specific features accessible via `sql` template tag

**Trade-off**: Less abstraction than Prisma (no built-in migrations UI, manual relation handling).

---

## Core Features

### 1. Canvas Editor
- **Fabric.js Integration**: Manipulate shapes, text, images on HTML5 canvas
- **Image Filters**: 20+ built-in filters (Grayscale, Vintage, Pixelate, etc.)
- **Serialization**: Projects saved as JSON blobs, restored via `loadFromJSON()`
- **Undo/Redo**: History managed via custom hook (`use-history.ts`)
- **Hotkeys**: Keyboard shortcuts for copy/paste, delete, undo/redo

### 2. Project Management
- **CRUD Operations**: Create, read, update, delete, duplicate projects
- **Template System**: Projects marked as `isTemplate` serve as starting points
- **Pagination**: Offset-based pagination for project lists
- **Ownership**: Projects scoped to user ID, verified on every mutation

### 3. Subscription & Payments
- **Stripe Integration**: Subscription creation, webhook handling
- **Pro Features**: Templates/features gated behind `subscription.status === 'active'`
- **Invoice Tracking**: Separate `invoice` and `customer-invoice` aggregates

### 4. AI Image Generation
- **Replicate API**: Generate images via AI models
- **Unsplash Integration**: Stock photo search and insertion

### 5. Authentication
- **Multi-Provider**: Email/password, GitHub OAuth, Google OAuth
- **Session Management**: Server-side sessions via better-auth
- **Route Protection**: Middleware-based auth checks on protected routes

---

## Data Model & Consistency

### Schema Design

**Primary Aggregates**:
- `users`: Auth principals
- `projects`: Design documents (JSON state + metadata)
- `subscriptions`: Stripe subscription state
- `sessions`: Better-auth session tokens
- `accounts`: OAuth provider linkage

**Relationships**:
```sql
users (1) ──→ (*) projects
users (1) ──→ (*) sessions
users (1) ──→ (0..1) subscriptions
users (1) ──→ (*) accounts
```

### Consistency Guarantees

**Strong Consistency**:
- Project ownership enforced via `WHERE userId = ?` in all queries
- Cascade deletes: User deletion → all projects deleted
- Transactional updates for subscription state changes

**Eventual Consistency**:
- Stripe webhooks update subscription status asynchronously
- No distributed transactions (single PostgreSQL database)

**Conflict Resolution**:
- Last-write-wins for project updates (no optimistic concurrency control)
- No real-time collaboration (future enhancement needed for CRDT-based merging)

---

## Real-Time / Async Behavior

**No Real-Time Sync**: Current implementation is **request-response only** (no WebSockets or Server-Sent Events).

**Async Operations**:
1. **Stripe Webhooks**: Background job handles `subscription.updated` events
2. **AI Image Generation**: Client polls Replicate API for completion

**Future Considerations**:
- Real-time collaboration requires CRDT or operational transform
- Canvas state synchronization via WebSockets or Partykit

---

## Testing Strategy

### Test Coverage

| Type | Location | Count | Purpose |
|------|----------|-------|---------|
| **E2E** | `src/test/e2e/` | 59 files | Full user flows (auth, editor, subscription) |
| **Unit** | `src/**/*.test.ts` | 1 file | Minimal (auth utility test) |

### Testing Philosophy: **Zero Mocking**

**E2E Tests**:
- Use **real database** (separate test DB via `TEST_DATABASE_URL`)
- Use **real authentication** (better-auth in test mode)
- Use **real API routes** (Playwright starts Next.js dev server)
- **Playwright Configuration**: Global setup/teardown for DB seeding

**What Is Tested**:
- Auth flows (sign-up, sign-in, OAuth)
- Project CRUD (create, edit, delete)
- Subscription purchase flow
- Editor canvas interactions

**What Is Not Tested**:
- Repository layer (no isolated unit tests)
- Domain entities (validated implicitly via E2E)
- Edge cases (focus on happy paths + critical failures)

### Gaps & Future Improvements

1. **Unit Test Coverage**: Repository and use case layers lack isolated tests
2. **Performance Tests**: No load testing or canvas rendering benchmarks
3. **Visual Regression**: No snapshot testing for UI components
4. **Contract Tests**: API schema validation not automated

---

## Scalability & Performance Considerations

### Current Scaling Characteristics

**Vertical Scaling**:
- Single Next.js Node.js process (runtime: `nodejs`)
- PostgreSQL database (Neon serverless recommended)
- Stateless API layer (horizontal scaling possible)

**Bottlenecks**:
1. **Database Queries**: N+1 queries for project lists (no eager loading of users)
2. **Canvas JSON Size**: Large projects (>1MB JSON) cause slow load/save
3. **Fabric.js Rendering**: Client-side rendering blocks main thread on complex canvases

### What Would Break First Under Load?

1. **Database Connections**: Drizzle connection pool exhaustion (default: 10 connections)
2. **Fabric.js Performance**: Canvases with >500 objects lag on user interactions
3. **Stripe Webhook Processing**: Sequential webhook handling (no queue)

### How to Scale

**Immediate Optimizations**:
- Enable PostgreSQL connection pooling (PgBouncer)
- Add Redis caching for templates list
- Implement pagination cursors (replace offset-based pagination)

**Architectural Changes**:
- Move webhook processing to background queue (BullMQ, Inngest)
- Split canvas rendering to Web Workers (offload Fabric.js from main thread)
- Add CDN for static project thumbnails (S3 + CloudFront)

**Database Sharding** (if >100k users):
- Shard projects by `userId` hash
- Keep users table in single shard for auth lookups

---

## Security & Reliability Notes

### Authentication Boundaries

**Trust Model**:
- **Client**: Untrusted (all input sanitized)
- **API Layer**: Validates session token on every request
- **Domain Layer**: Assumes caller is authenticated (delegates auth to API layer)

**Session Validation**: `verifyBetterAuth()` middleware extracts user ID from session cookie.

### Authorization

**Row-Level Security** (manual):
```typescript
// Every project query includes userId check
db.select().from(projects)
  .where(and(eq(projects.id, id), eq(projects.userId, userId)));
```

**No Role-Based Access Control**: All authenticated users have identical permissions (future: add admin role).

### Input Sanitization

**XSS Prevention**:
- Canvas JSON sanitized via `sanitizeProjectJson()` before storage
- Zod schemas validate all API inputs

**SQL Injection**:
- Drizzle uses parameterized queries (immune to injection)

### External Dependencies

| Dependency | Risk | Mitigation |
|------------|------|-----------|
| Stripe API | Payment data exposure | Webhooks require signature verification |
| Replicate API | API key leakage | Keys stored in environment vars (never in client code) |
| Unsplash API | Rate limit exhaustion | Client-side debouncing on search |

### Known Risks

1. **Canvas JSON Injection**: Malicious JSON could exploit Fabric.js deserialization (needs CSP hardening)
2. **Subscription Bypass**: Client-side checks for `isPro` (must re-verify server-side)
3. **No Rate Limiting on Canvas Saves**: User can spam save endpoint

---

## Project Status

**Maturity Level**: **MVP / Production-Ready Prototype**

**Production-Ready Aspects**:
- ✅ Comprehensive E2E test coverage (59 tests)
- ✅ Database migrations (Drizzle)
- ✅ Session management (better-auth)
- ✅ Payment integration (Stripe)
- ✅ Deployment configuration (Dockerfile, `output: standalone`)

**Not Production-Ready**:
- ❌ Insufficient error monitoring (no Sentry/DataDog integration)
- ❌ Missing unit test coverage for domain layer
- ❌ No horizontal scaling validation
- ❌ Subscription webhook failures lack retry mechanism

**Recommended Next Steps Before Production**:
1. Add observability (Sentry for errors, PostHog for analytics)
2. Implement retry logic for Stripe webhooks (use Inngest or SQS)
3. Load test with 1000+ concurrent users
4. Add database read replicas for analytics queries

---

## Tech Stack

### Backend
- **Framework**: Next.js 16 (App Router)
- **API Layer**: Hono 4.11.3
- **Runtime**: Node.js (not Edge)
- **Language**: TypeScript 5.9

### Database & ORM
- **Database**: PostgreSQL (Neon recommended)
- **ORM**: Drizzle ORM 0.45.1
- **Migrations**: Drizzle Kit

### Authentication
- **Library**: better-auth 1.4.10
- **Providers**: Email/password, GitHub, Google
- **Session Storage**: PostgreSQL (via Drizzle adapter)

### Payments
- **Provider**: Stripe 20.1.2
- **Webhook Handling**: Native Stripe webhook endpoints

### Canvas Editor
- **Library**: Fabric.js 5.3.0 (browser build)
- **State Management**: Zustand 5.0.9 (canvas state)
- **Persistence**: JSON serialization to PostgreSQL

### Testing
- **E2E Framework**: Playwright 1.57.0
- **Unit Testing**: Vitest 4.0.16
- **Test Runner**: Bun 1.2.19

### UI/UX
- **UI Components**: Radix UI (headless components)
- **Styling**: TailwindCSS 3.4.19
- **Internationalization**: next-i18n-router 5.5.6, react-i18next 16.5.1
- **Icons**: Lucide React 0.562.0

### DevOps
- **Package Manager**: Bun 1.2.19
- **Containerization**: Docker (multi-stage build)
- **Deployment Target**: Standalone Next.js (`output: standalone`)
- **CI/CD**: Husky for pre-commit hooks

### Utilities
- **Functional Programming**: fp-ts 2.16.9
- **Dependency Injection**: tsyringe 4.8.0
- **Validation**: Zod 3.23.8
- **Logging**: Pino 9.5.0

---

## Architecture Diagram

[Placeholder: Hexagonal architecture diagram showing layers]

**Suggested Diagram**:
- Center: Domain Layer (entities, use cases)
- Middle: Application Layer (controllers, repositories)
- Outer: Infrastructure Layer (DB, Auth, Stripe)
- Ports: Hono API routes, Server Actions
- Adapters: Drizzle ORM, better-auth, Fabric.js

---

## Feature Screenshots

[Placeholder: Canvas editor with toolbar]
[Placeholder: Project dashboard with templates]
[Placeholder: Subscription checkout page]

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup.

**Development Setup**:
```bash
bun install
bun run db:setup           # Run migrations + seed
bun run dev                # Start Next.js dev server
bun run test:e2e          # Run Playwright tests
```

**Code Organization Principles**:
1. Domain logic never imports from `app/` or `bootstrap/`
2. All database access goes through repository interfaces
3. Use `TaskEither` for error handling (no thrown exceptions in domain layer)
4. Server Actions and API routes both delegate to controllers

---

## License

MIT License - See [LICENSE](./LICENSE)
