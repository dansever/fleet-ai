# FleetAI Deployment Guide

## Environment Configuration Strategy

### Overview

FleetAI uses a clean, scalable environment configuration approach:

- **Local Development**: Docker PostgreSQL + development keys
- **Production**: Supabase PostgreSQL + production keys
- **Type Safety**: T3 Env validates all environment variables
- **Security**: Never commit secrets to version control

---

## Environment Files Structure

```
fleet-ai/apps/web/
├── env.example              # Complete reference with all variables
├── env.local.example        # Local development template
├── env.production.example   # Production deployment template
├── .env.local              # Your local development vars (gitignored)
└── .env.production         # Your production vars (gitignored, optional)
```

---

## Setup Instructions

### 1. Local Development Setup

```bash
# Navigate to web app directory
cd fleet-ai/apps/web

# Copy the local development template
cp env.local.example .env.local

# Edit .env.local with your actual values
# - Use Docker PostgreSQL URL
# - Add your Clerk development keys
# - Configure local API endpoints
```

### 2. Production Deployment

#### Option A: Platform Environment Variables (Recommended)

Set these directly in your deployment platform:

**Vercel:**

```bash
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ... add all production variables
```

**Netlify:**

- Go to Site Settings → Environment Variables
- Add each variable from `env.production.example`

**Railway:**

- Go to Variables tab in your project
- Add each variable from `env.production.example`

#### Option B: Production Environment File

```bash
# Copy the production template
cp env.production.example .env.production

# Edit .env.production with your actual production values
# - Use Supabase pooled connection string
# - Add your Clerk production keys
# - Configure production API endpoints

# Deploy with your platform's CLI
```

---

## Database Configuration

### Local Development (Docker)

```env
DATABASE_URL="postgres://dansever:dandan96@localhost:5432/fleetai_db_dev"
```

### Production (Supabase)

```env
# Use the POOLED connection string from Supabase Dashboard
# Project Settings → Database → Connection Info → Pooled
DATABASE_URL="postgresql://postgres.your-project:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

**Why pooled?** Supabase manages connection scaling and limits automatically.

---

## Security Best Practices

### ✅ Do's

- Use different keys for development and production
- Set environment variables directly in deployment platforms
- Use Supabase pooled connections for production
- Validate all environment variables with T3 Env
- Keep `.env` files in `.gitignore`

### ❌ Don'ts

- Never commit `.env` files with real secrets
- Don't use development keys in production
- Don't expose server-side variables to the client
- Don't hardcode secrets in your code

---

## Environment Variables Reference

### Required for All Environments

| Variable                            | Description                  | Example                        |
| ----------------------------------- | ---------------------------- | ------------------------------ |
| `DATABASE_URL`                      | PostgreSQL connection string | `postgres://...`               |
| `CLERK_SECRET_KEY`                  | Clerk server-side secret     | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client-side key        | `pk_test_...` or `pk_live_...` |
| `NEXT_PUBLIC_API_URL`               | Backend API base URL         | `http://localhost:8000`        |

### Optional Variables

| Variable              | Description             | Default                       |
| --------------------- | ----------------------- | ----------------------------- |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL        | `http://localhost:3000`       |
| `BACKEND_URL`         | Server-side backend URL | Same as `NEXT_PUBLIC_API_URL` |
| `NODE_ENV`            | Environment mode        | `development`                 |

---

## Troubleshooting

### Common Issues

1. **"Environment variable not found" error**
   - Check T3 Env validation in `src/lib/env/`
   - Ensure all required variables are set
   - Restart your development server

2. **Database connection fails**
   - Verify `DATABASE_URL` format
   - Check if Docker is running (local)
   - Verify Supabase connection string (production)

3. **Clerk authentication not working**
   - Ensure you're using the correct environment keys
   - Check Clerk dashboard for correct URLs
   - Verify webhook secrets match

### Validation

Your environment setup is validated at build time. If any required variables are missing or invalid, the build will fail with clear error messages.

---

## Migration from Old Setup

If you're migrating from a different environment setup:

1. **Backup existing `.env` files**
2. **Use the new template structure**
3. **Update T3 Env validation** (already done)
4. **Test locally before deploying**

---

## Next Steps

1. Set up your local development environment
2. Configure your production deployment platform
3. Test both environments thoroughly
4. Set up CI/CD with environment validation

For questions or issues, refer to the main README or create an issue in the repository.
