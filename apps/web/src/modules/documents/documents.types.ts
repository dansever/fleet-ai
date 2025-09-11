import { NewDocument } from '@/drizzle/types';

/**
 * For creating documents from forms - excludes server-managed fields
 */
export type DocumentCreateInput = Omit<NewDocument, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>;

/**
 * For updating documents from forms - all fields optional
 */
export type DocumentUpdateInput = Partial<DocumentCreateInput>;
