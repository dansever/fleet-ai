import { timestamp } from 'drizzle-orm/pg-core';

// Shared timestamps
export const createdAt = timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
export const updatedAt = timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();
