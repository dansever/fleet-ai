---
alwaysApply: false
applyTo: ['apps/web/src/modules/**/*']
---

# Codebase Structure Guidelines (Modules Approach)

This project organizes code by **modules** (business domains) instead of by technology (db, services, etc.).
Each module contains all code related to a specific business concept (e.g., quotes, rfqs, vendors, contracts).

---

## Top-level folders

/src
|-- /db
| |-- schema/ # Drizzle table definitions and relations
| |-- index.ts # Drizzle client and connection setup
|
|-- /lib
| |-- http.ts # fetch wrapper with auth, base URL, tracing if used
| |-- queryClient.ts # React Query client
| |-- auth.ts # helpers for tenant and user extraction
|
|-- /modules # business domains (vertical slices)
| |-- /quotes
| |-- /rfqs
| |-- /vendors
| | |-- /contacts # nested module
| |-- /contract-mgmt
| |-- /contracts
| |-- /invoices
|
|-- /app/api # Next.js route handlers
|-- /quotes
| |-- route.ts # collection route (GET list, POST create)
| |-- [id]/route.ts # item route (GET one, PUT, DELETE)
|
|-- /rfqs
|-- route.ts
|-- [id]/route.ts

---

## Inside each module

/src/modules/quotes
|-- quotes.server.ts # server-only Drizzle DB operations (import "server-only")
|-- quotes.client.ts # client-side API callers (fetch → /api)
|-- quotes.types.ts # Zod DTOs and helpers; prefer deriving from Drizzle via drizzle-zod
|-- quotes.queries.ts # optional: complex read models
|-- index.ts # curated exports for the rest of the app

### File suffix conventions

- `*.server.ts` – server-only database code, add `import "server-only"` at the top
- `*.client.ts` – API client functions for calling route handlers from client components
- `*.types.ts` – Zod schemas and TypeScript types shared by server and client
- `*.queries.ts` – optional file for advanced or read-optimized queries
- `index.ts` – barrel file that exposes the module’s public surface

**Barrel pattern to avoid name collisions:**

```ts
// src/modules/quotes/index.ts
export * as server from './quotes.server';
export * as client from './quotes.client';
export * from './quotes.types';
```

````

Usage:

```ts
import { server, client } from '@/modules/quotes';
await server.getQuoteById(...);
await client.createQuote(...);
```

---

## Naming rules

- Folders: plural, lowercase. Examples: `quotes`, `rfqs`, `vendors`, `payment-methods`
- Files: `<domain>.<role>.ts`. Examples: `quotes.server.ts`, `rfqs.types.ts`
- Functions:
  - Reads: `get<Entity>ById`, `list<Entities>`, `search<Entities>`
  - Writes: `create<Entity>`, `update<Entity>`, `delete<Entity>`

---

## Example: quotes module

`quotes.types.ts`

```ts
import { z } from 'zod';
// keep schemas small and focused; server adds tenantId

export const CreateQuoteInput = z.object({
  rfqId: z.string().uuid(),
  vendorId: z.string().uuid(),
  price: z.number().positive(),
});
export type CreateQuoteInput = z.infer<typeof CreateQuoteInput>;
```

`quotes.server.ts`

```ts
import 'server-only';
import { db } from '@/db';
import { quotes } from '@/db/schema/quotes.schema';
import { and, eq, desc } from 'drizzle-orm';
import type { CreateQuoteInput } from './quotes.types';

export async function getQuoteById(tenantId: string, id: string) {
  return db.query.quotes.findFirst({
    where: and(eq(quotes.tenantId, tenantId), eq(quotes.id, id)),
  });
}

export async function listQuotes(tenantId: string) {
  return db.query.quotes.findMany({
    where: eq(quotes.tenantId, tenantId),
    orderBy: desc(quotes.createdAt),
    limit: 100,
  });
}

export async function createQuote(tenantId: string, input: CreateQuoteInput) {
  const [row] = await db
    .insert(quotes)
    .values({ ...input, tenantId })
    .returning();
  return row;
}
```

`quotes.client.ts`

```ts
import { http } from '@/lib/http';
import type { CreateQuoteInput } from './quotes.types';

export async function createQuote(body: CreateQuoteInput) {
  const res = await http.post('/api/quotes', body);
  return res.data;
}
```

---

## Route handlers

Prefer RESTful split: use a collection route and an item route.

- Collection: `/src/app/api/quotes/route.ts` – GET list, POST create
- Item: `/src/app/api/quotes/[id]/route.ts` – GET one, PUT, DELETE

Validate with Zod at the edge. Convert ISO strings to `Date` before DB calls.

---

## Shared code

- `src/db/schema/*.schema.ts` – all Drizzle tables and relations
- `src/lib/http.ts` – fetch wrapper with auth, base URL, tracing
- `src/lib/queryClient.ts` – React Query client setup
- `src/lib/auth.ts` – extract tenant and user IDs from JWT or headers

**Schema reuse without duplication:**
Use `drizzle-zod` to derive Zod schemas from Drizzle tables, then:

- Keep server model schemas with `Date` fields
- Keep transport DTO schemas with ISO `string` fields
- Add small converters between them

---

## Guardrails

- Add `import "server-only"` to every `*.server.ts`
- ESLint rule: forbid importing `*.server.ts` from files with `"use client"`
- Never expose raw DB row types to UI, use DTOs from `*.types.ts`
- Prefer per-module `index.ts` to control public exports
- Optional: accept `AbortSignal` in client functions for cancellation

---

## When modules grow

Start flat, introduce subfolders only when clearly cohesive:

/src/modules/contract-mgmt
\|-- /contracts
\| |-- contracts.server.ts
\| |-- contracts.client.ts
\| |-- contracts.types.ts
\| |-- index.ts
\|-- /invoices
\| |-- invoices.server.ts
\| |-- invoices.client.ts
\| |-- invoices.types.ts
\| |-- index.ts
\|-- index.ts

Nested example for dependent entities:

/src/modules/vendors
\|-- vendors.server.ts
\|-- vendors.client.ts
\|-- vendors.types.ts
\|-- /contacts
\| |-- contacts.server.ts
\| |-- contacts.client.ts
\| |-- contacts.types.ts
\| |-- index.ts
\|-- index.ts

---

## Migration plan (low effort)

1. Create `/src/modules/<domain>/`
2. Move:
   - `db-actions.ts` → `<domain>.server.ts`
   - `*-client.ts` → `<domain>.client.ts`

3. Add `index.ts` per module with `export * as server` and `export * as client`
4. Update imports to `@/modules/<domain>`
5. Apply `import "server-only"` to server files
6. When convenient, split routes into collection and `[id]` item routes

---

## Summary

- Organize by modules
- Split server, client, and types by file suffix
- Validate at the HTTP boundary with Zod, convert transport dates to `Date`
- Derive schemas from Drizzle with `drizzle-zod`
- Add guardrails to prevent cross-environment mistakes
- Refactor incrementally, one module at a time
````
