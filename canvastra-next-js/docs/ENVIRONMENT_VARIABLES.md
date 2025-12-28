# Environment Variables Guide

This document describes all environment variables used in Canvastra Next.js.

## Quick Start

1. Copy `.env.example` to `.env.local` (for Next.js) or `.env` (for server)
2. Fill in the required values
3. See sections below for detailed descriptions

## Required Variables

These are **required** for the application to run:

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Server
- `PORT` - Backend server port (default: 3000)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:3001)

### Next.js Public
- `NEXT_PUBLIC_APP_URL` - Public app URL for redirects
- `NEXT_PUBLIC_SERVER_URL` - Public server URL for API calls

## Optional Variables

### Authentication
- `BETTER_AUTH_SECRET` - Secret key for Better-Auth (required for production)
- `BETTER_AUTH_URL` - Better-Auth base URL
- `CORS_ORIGIN` - CORS origin for Better-Auth

### OAuth Providers
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Stripe (Subscriptions)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLIC_KEY` - Stripe public key (if needed)
- `STRIPE_PRICE_ID` - Stripe subscription price ID
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### AI Services
- `REPLICATE_API_TOKEN` - Replicate API token for AI features

### Image Services
- `UNSPLASH_ACCESS_KEY` - Unsplash API access key

### Testing
- `PLAYWRIGHT_TEST_BASE_URL` - Base URL for E2E tests
- `CI` - CI environment flag (auto-set in CI/CD)

## Variable Descriptions

### DATABASE_URL
**Type**: String  
**Required**: Yes  
**Example**: `postgresql://user:password@localhost:5432/canvastra`

PostgreSQL connection string. For production, use a managed database like Neon, Supabase, or Railway.

### PORT
**Type**: Number  
**Required**: No (default: 3000)  
**Example**: `3000`

Port for the backend server.

### CLIENT_URL
**Type**: String  
**Required**: Yes  
**Example**: `http://localhost:3001`

Frontend URL used for CORS configuration and redirects.

### NEXT_PUBLIC_APP_URL
**Type**: String  
**Required**: Yes  
**Example**: `http://localhost:3001`

Public app URL exposed to the browser. Used for redirects after Stripe checkout.

### NEXT_PUBLIC_SERVER_URL
**Type**: String  
**Required**: Yes  
**Example**: `http://localhost:3000`

Public server URL exposed to the browser. Used by tRPC client and auth client.

### BETTER_AUTH_SECRET
**Type**: String  
**Required**: For production  
**Example**: `your-secret-key-here`

Secret key for Better-Auth. Generate a random string:
```bash
openssl rand -base64 32
```

### STRIPE_SECRET_KEY
**Type**: String  
**Required**: For subscriptions feature  
**Example**: `sk_test_...`

Stripe secret key from Stripe Dashboard. Use test keys for development.

### STRIPE_PRICE_ID
**Type**: String  
**Required**: For subscriptions feature  
**Example**: `price_1234567890`

Stripe price ID for the subscription product. Found in Stripe Dashboard > Products.

### STRIPE_WEBHOOK_SECRET
**Type**: String  
**Required**: For webhook handling  
**Example**: `whsec_...`

Stripe webhook signing secret. Found in Stripe Dashboard > Webhooks > Signing secret.

### REPLICATE_API_TOKEN
**Type**: String  
**Required**: For AI features  
**Example**: `r8_...`

Replicate API token from https://replicate.com/account/api-tokens

### UNSPLASH_ACCESS_KEY
**Type**: String  
**Required**: For image search feature  
**Example**: `your-access-key`

Unsplash API access key from https://unsplash.com/developers

## Environment-Specific Files

### Development
- `.env.local` - Next.js local environment (gitignored)
- `.env` - Server environment (gitignored)

### Production
Set environment variables in your hosting platform:
- **Vercel**: Project Settings > Environment Variables
- **Railway**: Project Settings > Variables
- **Render**: Environment > Environment Variables

## Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Use different secrets** for development and production
3. **Rotate secrets** regularly in production
4. **Use environment-specific** values
5. **Limit access** to production environment variables

## Getting API Keys

### Stripe
1. Go to https://dashboard.stripe.com
2. Navigate to Developers > API keys
3. Copy test or live keys
4. For webhooks: Developers > Webhooks > Add endpoint > Copy signing secret

### Replicate
1. Go to https://replicate.com
2. Sign up/login
3. Navigate to Account > API tokens
4. Create a new token

### Unsplash
1. Go to https://unsplash.com/developers
2. Create an application
3. Copy the Access Key

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database is accessible
- Ensure SSL is configured if needed

### CORS Errors
- Verify `CLIENT_URL` matches frontend URL
- Check `CORS_ORIGIN` matches frontend URL
- Ensure credentials are included in requests

### Authentication Issues
- Verify `BETTER_AUTH_SECRET` is set
- Check `NEXT_PUBLIC_SERVER_URL` matches server URL
- Ensure OAuth redirect URLs are correct

### Stripe Issues
- Verify keys are from the same mode (test/live)
- Check webhook secret matches endpoint
- Ensure webhook URL is accessible

## Example Configurations

### Minimal (Local Development)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/canvastra
PORT=3000
CLIENT_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Full (With All Features)
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
PORT=3000
CLIENT_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SERVER_URL=https://your-api.railway.app
BETTER_AUTH_SECRET=your-production-secret
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
REPLICATE_API_TOKEN=r8_...
UNSPLASH_ACCESS_KEY=your-key
```

