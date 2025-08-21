# Environment Variables

This project uses different environment setups for **local development** and **production**.  
Keep secrets safe, and never commit them directly into version control.

---

## Variables

### `DATABASE_URL`

- **Purpose**: Used by Drizzle / backend code to connect to the database.
- **Local**: Your Docker Postgres URL  
  Example: `postgres://dan@localhost:5432/fleetai_db_dev`
- **Production**: Supabase **pooled connection string** (from Supabase dashboard → Project Settings → Database → Connection Info → Pooled).
- **Why pooled**: Supabase manages scaling and connection limits.

### `NEXT_PUBLIC_SUPABASE_URL`

- **Purpose**: Base URL of your Supabase project.
- **Safe to expose** (prefixed with `NEXT_PUBLIC_`).
- Example: `https://abc123.supabase.co`

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Purpose**: Public API key for the frontend to talk to Supabase.
- **Safe to expose**.
- Example: `eyJhbGci...`

### `SUPABASE_SECRET_KEY`

- **Purpose**: Private, server-only API key with elevated permissions.
- **Never expose to the browser**.
- Use only in server-side code (Next.js API routes, server components).
- Example: `eyJhbGci... (longer than publishable key)`

---

## Loading Environments

### Local Development

- Place your variables in `apps/web/.env.local`.
- Typical setup:
  ```env
  DATABASE_URL=postgres://dan@localhost:5432/fleetai_db_dev
  NEXT_PUBLIC_SUPABASE_URL=https://localhost.dev
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
  SUPABASE_SECRET_KEY=...
  ```

```

- Next.js will automatically load `.env.local` when running `pnpm dev`.

### Production (Deploy Platform)

- Set environment variables in your deploy platform (e.g. Vercel, Netlify, Railway).
- These **override** `.env.*` files.
- Example mapping:
  - `DATABASE_URL` → Supabase pooled connection string
  - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → publishable key
  - `SUPABASE_SECRET_KEY` → secret key (server-only)

---

## Summary

- **Local**: `.env.local` → Docker Postgres + local keys.
- **Production**: Deploy platform env vars → Supabase pooled DB + project keys.
- **Never commit `.env` files** with secrets.
- **Frontend uses `NEXT_PUBLIC_*`, backend uses private vars.**
```
