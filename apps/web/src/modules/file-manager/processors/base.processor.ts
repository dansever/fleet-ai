import { DocumentType } from '@/drizzle/enums';
import { server as extractServer } from '@/modules/ai/extract';
import { server as parseServer } from '@/modules/ai/parse';
import { server as documentsServer } from '@/modules/file-manager/documents';
import {
  FileProcessingRequest,
  FileProcessingResult,
  FileProcessor,
  ProcessingContext,
  ProcessingProgressCallback,
  ProcessorConfig,
} from '../extraction/files.types';
import { server as storageServer } from '../storage';

export abstract class BaseFileProcessor implements FileProcessor {
  abstract readonly documentType: DocumentType;
  abstract readonly config: ProcessorConfig;

  async validate(file: File): Promise<boolean> {
    // Basic file validation
    if (!file || file.size === 0) {
      return false;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Custom validation if provided
    if (this.config.customValidation) {
      return await this.config.customValidation(file);
    }

    return true;
  }

  async process(
    request: FileProcessingRequest,
    onProgress?: ProcessingProgressCallback,
  ): Promise<FileProcessingResult> {
    const startTime = Date.now();

    try {
      const context: ProcessingContext = {
        request,
        onProgress,
      };

      // Step 1: Create document record
      await this.createDocumentRecord(context);

      // Step 2: Upload to storage
      await this.uploadToStorage(context);

      // Step 3: Parse and extract simultaneously
      // await this.parseAndExtract(context);

      // Step 4: Transform data (document-specific)
      // const transformedData = this.transform(context.extractResult?.data);

      // Step 5: Update document with extracted data
      // await this.updateDocumentRecord(context, transformedData);

      // Step 6: Create chunks and embeddings if needed
      if (this.config.requiresChunking || this.config.requiresEmbeddings) {
        await this.createChunksAndEmbeddings(context);
      }

      // Step 7: Final completion step
      context.onProgress?.(
        {
          name: 'complete',
          description: 'Processing completed successfully',
          progress: 100,
        },
        100,
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        documentId: context.documentRecord?.id,
        // extractedData: transformedData,
        extractedData: {
          summary: 'Test summary',
          confidence: 100,
        },
        metadata: {
          fileSize: request.file.size,
          fileName: request.file.name,
          processingTime,
          extractionAgent: this.config.extractionAgent,
        },
      };
    } catch (error) {
      console.error(`Error processing ${this.documentType} file:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error',
      };
    }
  }

  abstract transform(extractedData: any): any;

  protected async createDocumentRecord(context: ProcessingContext): Promise<void> {
    context.onProgress?.(
      {
        name: 'create_document',
        description: 'Creating document record...',
        progress: 10,
      },
      10,
    );

    context.documentRecord = await documentsServer.createDocument({
      orgId: context.request.orgId,
      parentId: context.request.parentId,
      parentType: this.documentType,
      fileName: context.request.file.name,
      fileSize: context.request.file.size,
      fileType: context.request.file.type,
    });
  }

  protected async uploadToStorage(context: ProcessingContext): Promise<void> {
    context.onProgress?.(
      {
        name: 'upload_storage',
        description: 'Uploading file to storage...',
        progress: 20,
      },
      20,
    );

    context.storageResult = await storageServer.uploadFile(
      context.request.file,
      this.documentType,
      context.request.parentId,
    );

    // Update document record with storage info
    await documentsServer.updateDocument(context.documentRecord.id, {
      storageId: context.storageResult.id,
      storagePath: context.storageResult.path,
    });
  }

  protected async parseAndExtract(context: ProcessingContext): Promise<void> {
    context.onProgress?.(
      {
        name: 'parse_extract',
        description: 'Parsing and extracting document data...',
        progress: 40,
      },
      40,
    );

    const [parseResult, extractResult] = await Promise.all([
      parseServer.parseDocument(context.request.file),
      extractServer.fileExtractorOrchestrator(context.request.file, this.config.extractionAgent),
    ]);

    context.parseResult = parseResult;
    context.extractResult = extractResult;
  }

  protected async updateDocumentRecord(
    context: ProcessingContext,
    transformedData: any,
  ): Promise<void> {
    context.onProgress?.(
      {
        name: 'update_document',
        description: 'Updating document record...',
        progress: 70,
      },
      70,
    );

    const parsedTextCombined = context.parseResult?.map((part: any) => part.text).join('\n') || '';

    await documentsServer.updateDocument(context.documentRecord.id, {
      content: parsedTextCombined,
      summary: context.extractResult?.data?.summary,
      extractedData: transformedData,
      confidence: context.extractResult?.data?.confidence,
      extractedAt: new Date(),
    });
  }

  protected async createChunksAndEmbeddings(context: ProcessingContext): Promise<void> {
    context.onProgress?.(
      {
        name: 'create_chunks',
        description: 'Creating chunks and embeddings...',
        progress: 90,
      },
      90,
    );

    // TODO: Implement chunking and embedding creation
    // This would use the existing chunking logic from the documents module
    console.log('Chunking and embedding creation not yet implemented');
  }
}
