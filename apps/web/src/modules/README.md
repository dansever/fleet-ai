---
alwaysApply: false
applyTo: ['apps/web/src/modules/**/*']
---

# Modules README

This codebase is organized by **modules** (business domains), not by technology.  
Each module is a vertical slice: server DB ops, API clients, types, and queries for a single domain.

---

## Structure

```

/src/modules/<domain>/ <domain>.server.ts # server-only DB ops (import "server-only") <domain>.client.ts # API callers → /api routes <domain>.types.ts # Zod DTOs, derived from Drizzle where possible <domain>.queries.ts # optional read-optimized queries
index.ts # barrel exports (server, client, types)

```

### File suffix rules

- `*.server.ts` – DB logic only, never imported into client components
- `*.client.ts` – fetch wrappers for routes, no DB imports
- `*.types.ts` – transport DTOs & schemas (keep them small, focused)
- `*.queries.ts` – complex or optimized read models

---

## Naming conventions

- Folders: plural, lowercase (`quotes`, `rfqs`, `vendors`)
- Files: `<domain>.<role>.ts` (`quotes.server.ts`)
- Functions:
  - Reads: `get<Entity>ById` (for single item), `list<Entities>` (for several items),
  - Writes: `create<Entity>`, `update<Entity>`, `delete<Entity>`

---

## Routes

RESTful split in `/app/api/<domain>`:

- `route.ts` – collection (GET list, POST create)
- `[id]/route.ts` – item (GET one, PUT update, DELETE)

Rules:

- Validate with Zod at the edge.
- Convert ISO strings → `Date` before DB calls.
- Route handlers = **auth + validation + call server fn** (no business logic).

---

## Guardrails

- Always `import "server-only"` in `*.server.ts`.
- Never import `*.server.ts` into `"use client"` files.
- Don’t call `db.select` directly in routes – always go through `*.server.ts`.
- Don’t export Drizzle tables from modules.
- Keep `index.ts` exports limited to:
  ```ts
  export * as server from './<domain>.server';
  export * as client from './<domain>.client';
  export * from './<domain>.types';
  ```

```

---

## Types

Keep 3 layers distinct:

- `<Entity>Row` – DB (Drizzle)
- `<Entity>DTO`, `Create<Entity>Input` – transport
- `<Entity>` – domain model (safe, with Dates)

---

## Quick checklist

✅ Organize by module, not tech
✅ Validate at the route boundary
✅ DB ops only in `*.server.ts`
✅ API calls only in `*.client.ts`
✅ Types & DTOs in `*.types.ts`
❌ No raw DB rows or Drizzle exports to UI

---
```
