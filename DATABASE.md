# Database README

This app uses PostgreSQL in two environments:

- **Local development**: Dockerized Postgres on your machine.
- **Remote (cloud)**: Supabase Postgres.

Drizzle is used for schema and migrations in both.

## Directory and config

- Drizzle config: `drizzle.config.ts` at repo root.
- Next.js app: `apps/web`.
- Env files:
  - `apps/web/.env.local` → local Docker URL.
  - `apps/web/.env.production` → Supabase URL.

We load env files for CLI commands using `dotenv-cli`.

---

## Environment variables

### Local development (`apps/web/.env.local`)

```
DATABASE_URL=postgres://<local_user>:<local_password>@localhost:5432/<local_db>
# plus any NEXT_PUBLIC_* and server-only keys you need for dev
```

### Production or remote testing (`apps/web/.env.production`)

```
# Use Supabase direct connection for migrations and admin scripts
DATABASE_URL=postgresql://postgres:<SUPABASE_PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require

# Runtime app variables (client and server)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable_or_anon_key>
SUPABASE_SECRET_KEY=<secret_or_service_role_key>   # server-only
```

Notes:

- For the **deployed app**, set `DATABASE_URL` to the **pooled** connection in host env vars. Keep the **direct** URL for migrations and admin tasks only.
- Never expose `SUPABASE_SECRET_KEY` to the browser.

---

## Scripts (run from repo root)

These use `dotenv-cli` to pick the correct env file and point Drizzle at the root config.

```json
{
  "scripts": {
    "db:generate": "dotenv -e apps/web/.env.local -- drizzle-kit generate --config=drizzle.config.ts",

    "db:migrate:local": "dotenv -e apps/web/.env.local -- drizzle-kit migrate --config=drizzle.config.ts",
    "db:push:local": "dotenv -e apps/web/.env.local -- drizzle-kit push --config=drizzle.config.ts",
    "studio:local": "dotenv -e apps/web/.env.local -- drizzle-kit studio --config=drizzle.config.ts",

    "db:migrate:remote": "dotenv -e apps/web/.env.production -- drizzle-kit migrate --config=drizzle.config.ts",
    "db:push:remote": "dotenv -e apps/web/.env.production -- drizzle-kit push --config=drizzle.config.ts",
    "studio:remote": "dotenv -e apps/web/.env.production -- drizzle-kit studio --config=drizzle.config.ts --port=4999",

    "db:seed:local": "dotenv -e apps/web/.env.local -- tsx ./scripts/seed.ts",
    "db:seed:remote": "dotenv -e apps/web/.env.production -- tsx ./scripts/seed.ts"
  }
}
```

---

## What happens automatically vs what you configure

### Automatic

- Drizzle reads `DATABASE_URL` and applies migrations to that target.
- Your app picks up env vars from `.env.local` during `next dev`.
- Drizzle Studio connects to whatever `DATABASE_URL` you load via the chosen script.

### You configure

- Set the correct URLs in `apps/web/.env.local` and `apps/web/.env.production`.
- Decide when to run migrations:
  - `pnpm db:migrate:local` for Docker.
  - `pnpm db:migrate:remote` for Supabase.

- Set runtime env vars on your deploy platform:
  - `DATABASE_URL` → Supabase **pooled** connection string.
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  - `SUPABASE_SECRET_KEY` server-only.

---

## Local vs Supabase usage

### Local development

1. Start Docker Postgres.
2. Ensure `apps/web/.env.local` has your local `DATABASE_URL`.
3. Generate and migrate:

   ```
   pnpm db:generate
   pnpm db:migrate:local
   pnpm studio:local
   pnpm -F @fleet-ai/web dev
   ```

### Remote testing or production

1. Ensure `apps/web/.env.production` has Supabase direct `DATABASE_URL` for maintenance tasks.
2. Migrate and seed:

   ```
   pnpm db:migrate:remote
   pnpm db:seed:remote
   pnpm studio:remote
   ```

3. Deployed app must use the **pooled** Supabase connection as `DATABASE_URL` in host env. Do not use the direct URL for app runtime.

---

## Supabase client usage

- **Browser**: `NEXT_PUBLIC_SUPABASE_URL` + publishable or anon key.
- **Server**: same URL + `SUPABASE_SECRET_KEY` for privileged server actions.
- Enable RLS on user-facing tables and add policies.

---

## Data migration tips

- From Docker to Supabase:
  - Easiest repeatable: `pg_dump` data only → `pg_restore` into Supabase direct URL.
  - Manual: CSV export with `\copy` and import in Supabase Table Editor.

- Run Drizzle migrations on Supabase before importing data so types and tables exist.

---

## Troubleshooting

- Drizzle Studio opens the wrong DB:
  - Use `studio:local` vs `studio:remote`.
  - If port 4983 is taken, use `--port=4999`.

- `DATABASE_URL` undefined:
  - Check the script uses `dotenv -e <path>`.
  - Ensure the file contains `DATABASE_URL`, not `POSTGRES_URL`.

- Enum type missing:
  - Ensure the migration creates it before any table that uses it.
  - One-off fix in Supabase SQL:

    ```sql
    DO $$
    BEGIN
      CREATE TYPE "decision" AS ENUM ('undecided','accepted','rejected','shortlisted');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    ```

---

## Quick checklist

- [ ] `apps/web/.env.local` → Docker `DATABASE_URL`.
- [ ] `apps/web/.env.production` → Supabase `DATABASE_URL` for maintenance and Supabase client keys.
- [ ] Deployed platform → `DATABASE_URL` set to Supabase **pooled** connection, plus Supabase client keys.
- [ ] Use `db:generate`, `db:migrate:*`, and `studio:*` scripts from root.
- [ ] RLS enabled, server secret key never sent to the client.
