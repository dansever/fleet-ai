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
    // Determine which FK field to query based on document type
    const whereClause =
      parentType === 'contract'
        ? and(eq(documentsTable.contractId, parentId), eq(documentsTable.orgId, orgId))
        : parentType === 'invoice'
          ? and(eq(documentsTable.invoiceId, parentId), eq(documentsTable.orgId, orgId))
          : parentType === 'fuel_bid'
            ? and(eq(documentsTable.fuelBidId, parentId), eq(documentsTable.orgId, orgId))
            : eq(documentsTable.orgId, orgId); // Fallback to just orgId

    return await this.db.select().from(documentsTable).where(whereClause);
  }

  /**
   * Get all documents for a contract
   */
  async getDocumentsForContract(contractId: string, orgId: string) {
    return await this.db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.contractId, contractId), eq(documentsTable.orgId, orgId)));
  }

  /**
   * Get all documents for an invoice
   */
  async getDocumentsForInvoice(invoiceId: string, orgId: string) {
    return await this.db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.invoiceId, invoiceId), eq(documentsTable.orgId, orgId)));
  }

  /**
   * Get all documents for a fuel bid
   */
  async getDocumentsForFuelBid(fuelBidId: string, orgId: string) {
    return await this.db
      .select()
      .from(documentsTable)
      .where(and(eq(documentsTable.fuelBidId, fuelBidId), eq(documentsTable.orgId, orgId)));
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
