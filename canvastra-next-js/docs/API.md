# API Documentation

This document describes the tRPC API endpoints available in Canvastra Next.js.

## Base URL

- **Development**: `http://localhost:3000/trpc`
- **Production**: `{YOUR_DOMAIN}/trpc`

## Authentication

Some endpoints require authentication. Use Better-Auth session cookies for protected routes.

## Endpoints

### Health Check

#### `healthCheck`
Check if the API is running.

**Type**: Query  
**Auth**: Public

**Response**:
```typescript
string // "OK"
```

**Example**:
```typescript
const result = await trpc.healthCheck.query();
// Returns: "OK"
```

---

### Projects

#### `project.create`
Create a new project.

**Type**: Mutation  
**Auth**: Public

**Input**:
```typescript
{
  name: string;        // Project name (min 1 character)
  userId: string;     // User ID
  json: string;       // Canvas JSON data
  width: number;      // Canvas width (positive number)
  height: number;     // Canvas height (positive number)
}
```

**Response**:
```typescript
{
  id: string;
  name: string;
  userId: string;
  json: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  // ... other fields
}
```

**Example**:
```typescript
const project = await trpc.project.create.mutate({
  name: "My Design",
  userId: "user-123",
  json: "{}",
  width: 1920,
  height: 1080,
});
```

#### `project.get`
Get a project by ID.

**Type**: Query  
**Auth**: Public

**Input**:
```typescript
{
  id: string;         // Project ID
  userId?: string;    // Optional user ID for authorization
}
```

**Response**: Project object

**Example**:
```typescript
const project = await trpc.project.get.query({
  id: "project-123",
  userId: "user-123",
});
```

#### `project.list`
List projects for a user with pagination.

**Type**: Query  
**Auth**: Public

**Input**:
```typescript
{
  userId: string;     // User ID
  page?: number;      // Page number (default: 1)
  limit?: number;     // Items per page (default: 10)
}
```

**Response**:
```typescript
{
  projects: Project[];
  nextPage: number | null;
}
```

**Example**:
```typescript
const result = await trpc.project.list.query({
  userId: "user-123",
  page: 1,
  limit: 10,
});
```

#### `project.templates`
Get project templates.

**Type**: Query  
**Auth**: Public

**Input**:
```typescript
{
  page?: number;      // Page number (default: 1)
  limit?: number;     // Items per page (default: 10)
}
```

**Response**: Array of template projects

**Example**:
```typescript
const templates = await trpc.project.templates.query({
  page: 1,
  limit: 10,
});
```

#### `project.duplicate`
Duplicate an existing project.

**Type**: Mutation  
**Auth**: Public

**Input**:
```typescript
{
  id: string;         // Project ID to duplicate
  userId: string;     // User ID
}
```

**Response**: New project object

**Example**:
```typescript
const duplicated = await trpc.project.duplicate.mutate({
  id: "project-123",
  userId: "user-123",
});
```

#### `project.update`
Update a project.

**Type**: Mutation  
**Auth**: Public

**Input**:
```typescript
{
  userId: string;
  projectId: string;
  json?: string;      // Updated canvas JSON
  width?: number;     // Updated width
  height?: number;    // Updated height
}
```

**Response**: Updated project object

**Example**:
```typescript
const updated = await trpc.project.update.mutate({
  userId: "user-123",
  projectId: "project-123",
  json: '{"objects": []}',
});
```

#### `project.delete`
Delete a project.

**Type**: Mutation  
**Auth**: Public

**Input**:
```typescript
{
  userId: string;
  projectId: string;
}
```

**Response**: Success confirmation

**Example**:
```typescript
await trpc.project.delete.mutate({
  userId: "user-123",
  projectId: "project-123",
});
```

---

### AI Features

#### `ai.generateImage`
Generate an image using AI.

**Type**: Mutation  
**Auth**: Public

**Input**:
```typescript
{
  prompt: string;     // Image generation prompt
}
```

**Response**:
```typescript
string // Image URL
```

**Example**:
```typescript
const imageUrl = await trpc.ai.generateImage.mutate({
  prompt: "A beautiful sunset over mountains",
});
```

#### `ai.removeBg`
Remove background from an image.

**Type**: Mutation  
**Auth**: Public

**Input**:
```typescript
{
  image: string;      // Image URL or base64
}
```

**Response**:
```typescript
string // Processed image URL
```

**Example**:
```typescript
const processedUrl = await trpc.ai.removeBg.mutate({
  image: "https://example.com/image.jpg",
});
```

---

### Images

#### `images.getImages`
Get images from Unsplash.

**Type**: Query  
**Auth**: Public

**Input**:
```typescript
{
  count?: number;              // Number of images (default: 50)
  collectionIds?: string[];     // Collection IDs (default: ["317099"])
}
```

**Response**:
```typescript
Array<{
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  description?: string | null;
  alt_description?: string | null;
}>
```

**Example**:
```typescript
const images = await trpc.images.getImages.query({
  count: 20,
  collectionIds: ["317099"],
});
```

---

### Subscriptions

#### `subscriptions.getCurrent`
Get current user's subscription.

**Type**: Query  
**Auth**: Protected (requires authentication)

**Response**:
```typescript
{
  subscription: Subscription | null;
  isActive: boolean;
}
```

**Example**:
```typescript
const subscription = await trpc.subscriptions.getCurrent.query();
```

#### `subscriptions.checkout`
Create Stripe checkout session.

**Type**: Mutation  
**Auth**: Protected

**Response**:
```typescript
string // Checkout URL
```

**Example**:
```typescript
const checkoutUrl = await trpc.subscriptions.checkout.mutate();
// Redirect user to checkoutUrl
```

#### `subscriptions.billing`
Create Stripe billing portal session.

**Type**: Mutation  
**Auth**: Protected

**Response**:
```typescript
string // Billing portal URL
```

**Example**:
```typescript
const billingUrl = await trpc.subscriptions.billing.mutate();
// Redirect user to billingUrl
```

---

### Protected Data

#### `privateData`
Get private data (example protected endpoint).

**Type**: Query  
**Auth**: Protected

**Response**:
```typescript
{
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    // ... other user fields
  };
}
```

**Example**:
```typescript
const data = await trpc.privateData.query();
```

---

## Error Handling

All endpoints may return tRPC errors:

- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `BAD_REQUEST` (400) - Invalid input
- `INTERNAL_SERVER_ERROR` (500) - Server error

**Example Error Handling**:
```typescript
try {
  const result = await trpc.project.get.query({ id: "invalid" });
} catch (error) {
  if (error.data?.code === 'NOT_FOUND') {
    console.error('Project not found');
  }
}
```

---

## Type Safety

All endpoints are fully type-safe. Use the generated types:

```typescript
import type { AppRouter } from '@canvastra-next-js/api/routers';

// Types are automatically inferred
const project = await trpc.project.get.query({ id: "123" });
// project is typed as Project
```

---

## Rate Limiting

API endpoints may be rate-limited. Check response headers for rate limit information.

---

## Support

For issues or questions, please open an issue on GitHub.

