---
alwaysApply: false
applyTo: ['apps/web/**/*']
---

## FleetAI Frontend Guide (Concise)

This is the short, high-signal guide. For examples/recipes, see `frontend-examples.md`.

### Structure

apps/web/src/

- `app/` App Router: `(auth)`, `(platform)`, `api/`, `landing-page/`, `layout.tsx`
- `components/` UI primitives (`ui/`) and utilities
- `stories/` Storybook library
- `services/` API client services (client-only)
- `db/` server-only db actions
- `lib/`, `hooks/`, `middleware.ts`

Platform feature folders follow: `page.tsx` (server), `ClientPage.tsx` (client), `ContextProvider.tsx`, `_components/`, `subpages/`.

### Core Principles

- Server vs Client: server components fetch/authorize; client components render/interact.
- Multi-tenancy: every query must be scoped by `orgId`.
- Access rules: client components use `services/*-client.ts`; server components can call `db/*-actions.ts`. Never call db actions from client.

### Data Flow

- Client: `Component → services/*-client.ts → /api/*`
- Server: `page.tsx → db/*-actions.ts`

### Context Pattern

- Distinguish loading states:
  - isLoading: initial fetch when no data yet.
  - isRefreshing: update while keeping current data visible.
- Preserve cache during refresh; replace only when fresh results arrive.

### Auth

- `middleware.ts` protects routes (Clerk).
- `authorizeUser()` in server components; redirect if unauthenticated or missing `orgId`.

### UI/UX

- Use `PageLayout` for consistent page composition.
- Prefer Storybook components for complex UI; `shadcn/ui` for primitives.

### Dates

- TIMESTAMP: store Date objects; submit ISO with time; display date+time.
- DATE: store Date objects; submit `YYYY-MM-DD`; display date only.
- Use helpers like `formatDate`, `formatDateForAPI`.

### Performance

- Server-side initial fetch; client caching via contexts.
- Code-split heavy components; lazy-load non-critical UI.

### Quality

- TypeScript strict; ESLint + Prettier; clear names; robust error handling.
- Follow existing patterns and naming; keep functions pure and reusable where possible.

See `frontend-examples.md` for concrete snippets and patterns.

### API Boundaries

- Client components talk to Next.js API routes via `services/*-client.ts`.
- Use `backendApi` only when calling the Python backend; keep a clear boundary.
- Prefer server-side data fetch in `page.tsx` when SEO/first paint matters.

### Routing & Conventions

- App Router with feature folders under `(platform)`; colocate `ContextProvider` and subpages.
- Keep URLs stable; derive state from params/search when possible.
- Avoid client navigation side-effects during initial load; rely on server auth redirect.

### Error & Empty States

- Handle three states distinctly: loading, empty, data.
- Show full-screen loader only on the very first load; otherwise prefer inline refresh indicators.
- When server provides initial data, use a `hasServerData` flag to prevent duplicate client fetches.

### Security

- Never expose secrets to the client; read from server env only.
- Enforce org scoping on every query; gate UI with role checks but enforce on server.
- Sanitize and validate all inputs in API routes.

### Testing & Tooling

- Storybook for component behavior; Vitest for units and simple integration.
- ESLint + Prettier as default quality gates; keep logs minimal and actionable.

### Observability

- Centralize error reporting; prefer consistent toast/snackbar patterns in clients.
- Add lightweight timings around expensive client actions where useful.
