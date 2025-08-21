# Environment Variables

> **📋 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

This project uses a clean, scalable environment configuration with **type-safe validation** using T3 Env.

---

## Quick Start

### Local Development

```bash
cd fleet-ai/apps/web
cp env.local.example .env.local
# Edit .env.local with your actual values
```

### Production Deployment

```bash
# Option 1: Use deployment platform environment variables (recommended)
# Set variables directly in Vercel/Netlify/Railway dashboard

# Option 2: Use production environment file
cp env.production.example .env.production
# Edit .env.production with your actual values
```

---

## Core Variables

### Database

- **`DATABASE_URL`**: PostgreSQL connection string
  - **Local**: Docker Postgres (`postgres://dansever:dandan96@localhost:5432/fleetai_db_dev`)
  - **Production**: Supabase pooled connection string

### Authentication (Clerk)

- **`CLERK_SECRET_KEY`**: Server-side secret key
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**: Client-side publishable key
- **`CLERK_WEBHOOK_SECRET`**: Webhook validation secret

### API Configuration

- **`NEXT_PUBLIC_API_URL`**: Backend API base URL
- **`NEXT_PUBLIC_APP_URL`**: Frontend application URL

---

## Environment Files

```
fleet-ai/apps/web/
├── env.example              # Complete reference
├── env.local.example        # Local development template
├── env.production.example   # Production template
├── .env.local              # Your local vars (gitignored)
└── .env.production         # Your production vars (gitignored)
```

---

## Type Safety

All environment variables are validated using T3 Env:

- **Client variables**: `src/lib/env/client.ts`
- **Server variables**: `src/lib/env/server.ts`
- **Build-time validation**: Invalid variables cause build failures

---

## Security Best Practices

✅ **Do's**

- Use different keys for development and production
- Set environment variables in deployment platforms
- Use Supabase pooled connections for production
- Keep `.env` files in `.gitignore`

❌ **Don'ts**

- Never commit `.env` files with real secrets
- Don't use development keys in production
- Don't expose server-side variables to the client

---

## Migration Guide

If you have existing `.env` files:

1. **Backup your current files**
2. **Use the new template structure**
3. **Copy your values to the appropriate templates**
4. **Test locally before deploying**

For complete setup instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
