# Database Schema Documentation

This document describes the database schema for Canvastra Next.js.

## Overview

The application uses **PostgreSQL** with **Drizzle ORM** for type-safe database access. The schema is defined in `packages/db/src/schema/`.

## Schema Files

- `auth.ts` - Authentication tables (managed by Better-Auth)
- `canvastra.ts` - Application tables (projects, subscriptions)

## Tables

### `project`

Stores design projects created by users.

**Columns**:
- `id` (string, PK) - Unique project identifier
- `name` (string) - Project name
- `userId` (string, FK) - Owner user ID
- `json` (string) - Canvas JSON data (Fabric.js format)
- `width` (number) - Canvas width in pixels
- `height` (number) - Canvas height in pixels
- `isTemplate` (boolean) - Whether this is a template
- `isPro` (boolean) - Whether this requires Pro subscription
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Index on `userId` for user queries
- Index on `isTemplate` for template queries

**Relationships**:
- Belongs to `user` via `userId`

### `subscription`

Stores user subscription information (Stripe integration).

**Columns**:
- `id` (string, PK) - Unique subscription identifier
- `userId` (string, FK) - User ID
- `subscriptionId` (string) - Stripe subscription ID
- `customerId` (string) - Stripe customer ID
- `priceId` (string) - Stripe price ID
- `status` (string) - Subscription status (active, canceled, etc.)
- `currentPeriodEnd` (timestamp, nullable) - Current billing period end
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Unique index on `userId` (one subscription per user)
- Index on `subscriptionId` for Stripe lookups

**Relationships**:
- Belongs to `user` via `userId`

### `user` (Better-Auth)

Managed by Better-Auth library. Includes standard authentication fields.

**Columns**:
- `id` (string, PK) - User ID
- `name` (string) - User name
- `email` (string, unique) - User email
- `emailVerified` (timestamp, nullable) - Email verification timestamp
- `image` (string, nullable) - Profile image URL
- `password` (string, nullable) - Hashed password
- `createdAt` (timestamp) - Account creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

## Entity Relationship Diagram

```
┌─────────────┐
│    user     │
│─────────────│
│ id (PK)     │
│ name        │
│ email       │
│ ...         │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│   project   │
│─────────────│
│ id (PK)     │
│ userId (FK) │
│ name        │
│ json        │
│ ...         │
└─────────────┘

┌─────────────┐
│    user     │
│─────────────│
│ id (PK)     │
└──────┬──────┘
       │
       │ 1:1
       │
┌──────▼──────────┐
│  subscription   │
│─────────────────│
│ id (PK)         │
│ userId (FK, UK) │
│ subscriptionId  │
│ status          │
│ ...             │
└─────────────────┘
```

## Migrations

Migrations are managed by Drizzle ORM.

**Generate migration**:
```bash
bun run db:generate
```

**Run migrations**:
```bash
bun run db:migrate
```

**Push schema changes** (development):
```bash
bun run db:push
```

## Database Setup

### Development

1. Create a PostgreSQL database (recommended: [Neon](https://neon.tech))
2. Set `DATABASE_URL` in `.env.local`
3. Run migrations:
   ```bash
   bun run db:push
   ```

### Production

1. Set up PostgreSQL database
2. Configure `DATABASE_URL` environment variable
3. Run migrations before deployment:
   ```bash
   bun run db:migrate
   ```

## Query Examples

### Get user's projects
```typescript
const projects = await db
  .select()
  .from(projectTable)
  .where(eq(projectTable.userId, userId))
  .orderBy(desc(projectTable.updatedAt));
```

### Get user's subscription
```typescript
const subscription = await db
  .select()
  .from(subscriptionTable)
  .where(eq(subscriptionTable.userId, userId))
  .limit(1);
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Use indexes** for frequently queried columns
3. **Validate data** at the domain layer before saving
4. **Use migrations** for schema changes (never modify schema directly)
5. **Backup regularly** in production

## Performance Considerations

- Indexes are automatically created for foreign keys
- Consider adding indexes for frequently filtered columns
- Use pagination for large result sets
- Monitor query performance with database tools

