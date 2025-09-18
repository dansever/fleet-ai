import { and, eq } from 'drizzle-orm';
import { DocumentType } from '../enums';
import { documentsTable } from './schema.documents';

// Helper functions for working with document parent relationships
export class DocumentHelpers {
  constructor(private db: any) {} // Use your actual DB type

  /**
   * Get all documents for a specific parent entity
   */
  async getDocumentsForParent(parentId: string, parentType: DocumentType, orgId: string) {
    return await this.db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.parentId, parentId),
          eq(documentsTable.parentType, parentType),
          eq(documentsTable.orgId, orgId),
        ),
      );
  }
}

// Type definitions for better TypeScript support
export type DocumentWithParent = {
  document: typeof documentsTable.$inferSelect;
  parent: any; // This would be the specific parent type based on parentType
};

export type CreateDocumentInput = {
  title: string;
  fileType?: string;
  documentType?: string;
  storageUrl?: string;
  storagePath?: string;
  rawText?: string;
};
