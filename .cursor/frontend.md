---
alwaysApply: false
applyTo: ['apps/web/**/*']
---

## FleetAI Frontend Guide (Concise)

This is the short, high-signal guide. For examples/recipes, see `frontend-examples.md`.

### Structure

apps/web/src/

- `app/` App Router: `(auth)`, `(platform)`, `api/`, `landing-page/`, `layout.tsx`
- `modules/` vertical slices by domain: `*.server.ts`, `*.client.ts`, `*.types.ts`, optional `*.queries.ts`, `index.ts`
- `components/` UI primitives (`ui/`) and utilities
- `stories/` Storybook library
- `lib/`, `hooks/`, `middleware.ts`

Platform feature folders follow: `page.tsx` (server), `ClientPage.tsx` (client), `ContextProvider.tsx`, `_components/`, `subpages/`.

### Modules Pattern

- `*.server.ts` server-only DB ops. **Must contain `'use server'` and `import 'server-only'`** at the top.
  - Without these directives, Next.js will try to bundle server code for the client, causing `Module not found: Can't resolve 'fs'` errors from database drivers.
- `*.client.ts` client-safe API callers to Next API routes. No DB imports.
- `*.types.ts` transport DTOs and schemas. Keep small; derive from Drizzle types where useful.
- `*.queries.ts` optional read-optimized aggregations.
- `index.ts` exports:
  ```ts
  export * as server from './<domain>.server';
  export * as client from './<domain>.client';
  export * from './<domain>.types';
  ```

### Core Principles

- Server vs Client: server components fetch/authorize; client components render/interact.
- Multi-tenancy: every query is scoped by `orgId` (enforce in server code and routes).
- Naming: reads use `get*`/`list*`; writes use `create*`/`update*`/`delete*` (avoid domain verbs like approve/reject; use `update*`).

### Data Flow

- Client components: `Component → modules/<domain>.client.ts → /app/api/<domain> → modules/<domain>.server.ts → DB`.
- Server components: `page.tsx → modules/<domain>.server.ts` directly (never from client components).
- Python backend: use `backendApi` only for backend services (e.g., `/api/v1/...`).

### Platform Feature Folders

- Location: `app/(platform)/<feature>/`
- Files and responsibilities:
  - `page.tsx` (server): `getAuthContext()`, fetch initial data in parallel via `modules/<domain>.server.ts`, render `<ContextProvider hasServerData initial*>` wrapping `<ClientPage />`.
  - `ContextProvider.tsx` (client): owns state, caches, and actions; exposes typed context. May call server actions from `modules/<domain>.server.ts` for reads/writes, or use `modules/<domain>.client.ts` when going through API routes.
  - `ClientPage.tsx` (client): consumes context, composes `PageLayout` (sidebar/header/main), orchestrates tabs and routes events to context.
  - `_components/`: feature-local UI (e.g., sidebars, lists, dialogs) that consume context.
  - `subpages/`: tab bodies split by concern; each is a client component using context.
- Patterns:
  - Always pass `hasServerData` when server preloads; set initial lists and selection in an effect.
  - Keep selected entity local to context and reset on parent selection changes.
  - Maintain small in-memory caches keyed by parent id to avoid re-fetching.
  - Provide `refresh*`, `add*`, `update*`, `remove*` actions that update cache and selection predictably.

### API Routes

- Location: `app/api/<domain>/route.ts` (collection) and `app/api/<domain>/[id]/route.ts` (item).
- Responsibilities: auth + validation (Zod) + call server fn. No business logic in routes.
- Validate inputs at the edge; convert ISO strings to `Date` before server calls.

### Context Pattern

- Distinguish loading states:
  - isLoading: initial fetch when no data yet.
  - isRefreshing: update while keeping current data visible.
- Preserve cache during refresh; replace only when fresh results arrive.
- When server provides initial data, set `hasServerData` to prevent duplicate client fetches.

### Auth

- `middleware.ts` protects routes (Clerk).
- Use a server helper (e.g., `getAuthContext()`) in server components; redirect if unauthenticated or missing `orgId`.

### Types & Schema

- Drizzle tables live in `src/drizzle/schema/*`. Domain types exported from `src/drizzle/types`.
- Keep 3 layers distinct:
  - Row: DB rows (Drizzle)
  - DTO: transport types for API (`*.types.ts`)
  - Domain: safe types used in UI (dates as `Date`)
- Never export Drizzle tables to UI; do not import `*.server.ts` into `"use client"` files.

### Dates

- TIMESTAMP: store `Date`; submit ISO with time; display date+time.
- DATE: store `Date`; submit `YYYY-MM-DD`; display date only.
- Prefer shared helpers like `formatDate` and `formatDateForAPI`.

### Performance

- Server-side initial fetch; client caching via contexts.
- Code-split heavy components; lazy-load non-critical UI.

### Quality

- TypeScript strict; ESLint + Prettier; clear names; robust error handling.
- Favor pure functions and reusable utilities; follow module/file naming conventions.

### API Boundaries

- Client components call Next API via `modules/<domain>.client.ts`.
- Use `backendApi` only for Python backend calls; do not mix concerns.
- Prefer server-side fetch in `page.tsx` when SEO/first paint matters.

### Error & Empty States

- Handle loading, empty, data distinctly.
- Full-screen loader only on first load; otherwise prefer inline refresh indicators.

### Security

- Never expose secrets to the client; use server env only.
- Enforce org scoping in every server query; gate UI by role but enforce on server.
- Sanitize and validate all inputs in API routes with Zod.

### Testing & Tooling

- Storybook for components; Vitest for units/integration.
- Keep logs minimal and actionable.

### Observability

- Centralize error reporting; use consistent toast/snackbar patterns.
- Add lightweight timings around expensive client actions where useful.
