// src/modules/rfqs/rfqs.types.ts
/**
 * RFQ Types & Schemas
 *
 * This file defines the Zod schemas, TypeScript types, and converters
 * for handling RFQ data across client, API, and server layers.
 *
 * What it does:
 * - Validates transport (HTTP) payloads for create/update RFQs
 * - Normalizes date fields (ISO string ↔ Date conversion)
 * - Strips/overrides server-managed fields (id, orgId, userId, timestamps)
 * - Provides safe converters from transport DTOs → DB models
 *
 * Types & Schemas:
 * - RfqCreateTransportSchema (Zod): validate incoming create payloads
 * - RfqUpdateTransportSchema (Zod): validate incoming update payloads
 * - RfqCreateTransport (TS): client-facing create DTO type (before conversion)
 * - RfqUpdateTransport (TS): client-facing update DTO type (before conversion)
 *
 * When to use:
 * - In **API routes** (`/app/api/rfqs/...`):
 *   - Use `RfqCreateTransportSchema` / `RfqUpdateTransportSchema` to validate `req.body`
 *   - Pass validated data into `toCreateModel` / `toUpdateModel` before calling DB functions
 *
 * - In **client code** (`rfqs.client.ts`):
 *   - Type request payloads with `RfqCreateTransport` / `RfqUpdateTransport`
 *   - Ensures the client only sends valid, expected fields
 *
 * - In **server DB functions** (`rfqs.server.ts`):
 *   - Accept `NewRfq` (database-ready shape)
 *   - Always feed data through converters so dates & server-managed fields are correct
 */

import type { NewRfq } from '@/drizzle/types';
import { z } from 'zod';

const isoString = z.string().datetime();

/**
 * Transport schema for create:
 * - Validate date-looking fields (string | null | undefined)
 * - Allow other keys for now to avoid listing everything (.passthrough)
 *   (we'll sanitize/override server-managed fields in the converter)
 */
export const RfqCreateTransportSchema = z
  .object({
    sentAt: isoString.nullish(),
  })
  .passthrough();

export const RfqUpdateTransportSchema = RfqCreateTransportSchema.partial();

/** Types derived from schemas (prevents drift) */
export type RfqCreateTransport = z.infer<typeof RfqCreateTransportSchema>;
export type RfqUpdateTransport = z.infer<typeof RfqUpdateTransportSchema>;

/** Helper: normalize ISO -> Date | null */
function toDateOrNull(v: string | null | undefined): Date | null {
  return v ? new Date(v) : null;
}

/**
 * Transport -> DB model
 * - Inject orgId/userId
 * - Convert ISO strings to Date
 * - Sanitize server-managed fields (id/orgId/userId/createdAt/updatedAt)
 */
export function toCreateModel(
  t: RfqCreateTransport,
  ctx: { orgId: string; userId: string },
): Omit<NewRfq, 'id' | 'createdAt' | 'updatedAt'> {
  // explicitly strip server-managed fields if present in transport
  // and spread the rest (safe while you keep passthrough)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, orgId, userId, createdAt, updatedAt, ...rest } = t as Record<string, unknown>;

  return {
    ...(rest as Omit<NewRfq, 'id' | 'orgId' | 'userId' | 'createdAt' | 'updatedAt' | 'sentAt'>),
    orgId: ctx.orgId,
    userId: ctx.userId,
    sentAt: toDateOrNull((t as any).sentAt),
  };
}

/**
 * Transport -> partial DB model for updates
 * - Convert ISO strings to Date
 * - Strip server-managed fields
 */
export function toUpdateModel(
  t: RfqUpdateTransport,
): Partial<Omit<NewRfq, 'id' | 'orgId' | 'userId' | 'createdAt' | 'updatedAt'>> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, orgId, userId, createdAt, updatedAt, ...rest } = t as Record<string, unknown>;

  return {
    ...(rest as Partial<
      Omit<NewRfq, 'id' | 'orgId' | 'userId' | 'createdAt' | 'updatedAt' | 'sentAt'>
    >),
    ...(t.sentAt !== undefined ? { sentAt: toDateOrNull((t as any).sentAt) } : {}),
  };
}
