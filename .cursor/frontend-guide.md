---
alwaysApply: false
applyTo: ['apps/web/**/*']
---

# FleetAI Frontend Guide

This guide applies to the **FleetAI frontend** (`apps/web`) and defines key architectural and coding conventions.
For detailed recipes or examples, see `frontend-examples.md`.

---

## Folder Structure

`apps/web/src/`

- `app/` – Next.js App Router (folders like `(auth)`, `(platform)`, `api/`, `landing-page/`, `layout.tsx`)
- `modules/` – vertical slices by domain (`*.server.ts`, `*.client.ts`, `*.types.ts`, optional `*.queries.ts`, `index.ts`)
- `components/` – UI primitives (`ui/`) and shared utilities
- `stories/` – Storybook stories
- `lib/`, `hooks/`, `middleware.ts`

Each platform feature folder follows:

```

app/(platform)/<feature>/
├─ page.tsx (server)
├─ ClientPage.tsx (client)
├─ ContextProvider.tsx
├─ \_components/
└─ subpages/

```

---

## Modules Pattern

**File Roles**

- `*.server.ts` – server-only DB operations.
  Must include both `'use server'` and `import 'server-only'` at the top.
  Without these, Next.js may bundle server code into the client, causing `Module not found: Can't resolve 'fs'` errors.
- `*.client.ts` – client-safe API callers to Next API routes. No DB imports.
- `*.types.ts` – transport DTOs and schemas. Keep concise; derive from Drizzle types where possible.
- `*.queries.ts` – optional read-optimized aggregations.
- `index.ts` – exports:
  ```ts
  export * as server from './<domain>.server';
  export * as client from './<domain>.client';
  export * from './<domain>.types';
  ```

```

---

## Core Principles

- **Server vs Client** – server components fetch/authorize; client components render/interact.
- **Multi-tenancy** – every query must be scoped by `orgId`. Enforce this in all server code and routes.
- **Naming** –
  - Reads: `get*`, `list*`
  - Writes: `create*`, `update*`, `delete*`
    Avoid domain-specific verbs like `approve`/`reject`; use `update*`.

---

## Data Flow

**Client components:**
`Component → modules/<domain>.client.ts → /app/api/<domain> → modules/<domain>.server.ts → DB`

**Server components:**
`page.tsx → modules/<domain>.server.ts` (direct, never from client components)

Use `backendApi` only for calls to the Python backend (`/api/v1/...`).

---

## Platform Feature Folder Pattern

**Location:** `app/(platform)/<feature>/`

**Typical Files:**

| File                  | Responsibility                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `page.tsx`            | Server component; calls `getAuthContext()`, fetches initial data in parallel via server modules, renders `<ContextProvider hasServerData initial*>` wrapping `<ClientPage />`. |
| `ContextProvider.tsx` | Client component managing state, caches, and actions. May call server actions or use client modules for API routes.                                                            |
| `ClientPage.tsx`      | Consumes context, composes layout (sidebar/header/main), orchestrates subpages and routes events.                                                                              |
| `_components/`        | Feature-local UI (lists, dialogs, etc.) consuming context.                                                                                                                     |
| `subpages/`           | Tab bodies split by concern; all client components using context.                                                                                                              |

**Patterns**

- Pass `hasServerData` when preloading data on the server.
- Keep selection state local to context; reset when parent changes.
- Maintain small in-memory caches keyed by parent ID.
- Expose `refresh*`, `add*`, `update*`, `remove*` actions to mutate cache predictably.

---

## API Routes

**Location:**
`app/api/<domain>/route.ts` (collection)
`app/api/<domain>/[id]/route.ts` (item)

**Responsibilities:**

- Auth + validation (Zod)
- Call the relevant `modules/<domain>.server.ts` function
- Never implement business logic in routes
- Validate inputs at the edge; convert ISO strings to `Date` before passing to server code

---

## Context Pattern

- `isLoading` → initial fetch when no data yet
- `isRefreshing` → updating data while keeping current state visible
- Preserve cache during refresh; replace only after fresh results arrive
- When the server provides initial data, set `hasServerData` to avoid duplicate fetches

---

## Auth

- Route protection via `middleware.ts` (Clerk)
- Use a server helper like `getAuthContext()` to validate auth in server components
- Redirect unauthenticated users or those missing `orgId`

---

## Types & Schema

- Drizzle schema: `src/drizzle/schema/*`
- Export domain-safe types from `src/drizzle/types`
- Maintain clear layers:
  1. **Row** – database rows (Drizzle)
  2. **DTO** – API transport types (`*.types.ts`)
  3. **Domain** – UI-safe types (`Date` objects, formatted data)

- Never import Drizzle tables or `*.server.ts` inside `"use client"` files

---

## Dates

- **TIMESTAMP:** store `Date`; submit ISO string with time; display date + time
- **DATE:** store `Date`; submit `YYYY-MM-DD`; display date only
- Prefer shared helpers like `formatDate()` and `formatDateForAPI()`

---

## Performance

- Fetch initial data on the server; cache and revalidate on the client
- Code-split heavy components; lazy-load non-critical UI
- Use Suspense and streaming where possible

---

## Quality & Standards

- TypeScript strict mode
- ESLint + Prettier required
- Use descriptive names and early returns
- Strong error handling and predictable side effects
- Prefer pure functions and reusable utilities
- Follow consistent module and file naming conventions

---

## API Boundaries

- Client components → Next API routes via `modules/<domain>.client.ts`
- Use `backendApi` only for Python backend calls
- For SEO or faster first paint, fetch data in `page.tsx` server components

---

## Error & Empty States

- Clearly separate loading, empty, and data states
- Use full-screen loaders only on first load
- Use inline refresh indicators for subsequent fetches

---

## Security

- Never expose secrets to the client; use only server environment variables
- Enforce org-level scoping in all queries
- UI gating by role is helpful, but server enforcement is mandatory
- Sanitize and validate all user input in API routes with Zod

---

## Testing & Tooling

- **Storybook** – for visual component testing
- **Vitest** – for unit/integration tests
- Keep logs minimal, structured, and actionable

---

## Observability

- Centralized error reporting with consistent toast/snackbar pattern
- Add lightweight timings for expensive client actions
- Use telemetry hooks for key user interactions

---
```
