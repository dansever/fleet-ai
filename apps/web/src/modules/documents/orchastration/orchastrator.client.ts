import { DocumentParentType } from '@/drizzle/schema';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';
import { client as chunksClient } from '@/modules/documents/chunks';
import { client as documentsClient } from '@/modules/documents/documents';
import { client as extractClient } from '@/modules/documents/extract';
import { client as parseClient } from '@/modules/documents/parse';
import { client as storageClient } from '@/modules/storage';
import { DocumentProcessorTypes } from './orchastrator.types';

/**
 * Complete document processing orchestrator
 * Handles: Upload → Extract → Save (Document) → Chunk → Embed -> Save (Chunks)
 */
export async function processDocument(
  file: File,
  options: DocumentProcessorTypes.DocumentProcessingOptions,
): Promise<DocumentProcessorTypes.DocumentProcessingResult> {
  const { parentId, parentType, onProgress } = options;

  function getExtractionAgentName(parentType: DocumentParentType): ExtractionAgentName {
    switch (parentType) {
      case 'contract':
        return ExtractionAgentName.CONTRACT_EXTRACTOR;
      case 'rfq':
        return ExtractionAgentName.RFQ_EXTRACTOR;
      case 'quote':
        return ExtractionAgentName.QUOTE_EXTRACTOR;
      case 'fuel_bid':
        return ExtractionAgentName.FUEL_BID_EXTRACTOR;
      default:
        throw new Error(`Unsupported parent type: ${parentType}`);
    }
  }

  try {
    // =====================================
    // Step 1: Upload file to storage (20%)
    // =====================================
    onProgress?.({ name: 'upload', description: 'Uploading file to storage...', progress: 20 }, 20);
    const storageResult = await storageClient.uploadFile(file, parentType);
    console.log('✅ Storage upload completed', storageResult);

    // =====================================
    // Step 2: Parse document with LlamaParse (30%)
    // =====================================
    onProgress?.({ name: 'parse', description: 'Parsing document...', progress: 30 }, 30);
    const parseResult = await parseClient.parseFile(file);
    const parsedTextCombined = parseResult.map((part: any) => part.text).join('\n');
    console.log('✅✅✅✅ Parsed combined text', parsedTextCombined.slice(0, 80));

    // =====================================
    // Step 3: Extract document data with LlamaExtract (40%)
    // =====================================
    onProgress?.({ name: 'extract', description: 'Extracting document data...', progress: 40 }, 40);
    const extractionResult = await extractClient.fileExtractorOrchestrator(
      file,
      getExtractionAgentName(parentType),
    );
    console.log('✅ Extraction completed', extractionResult);

    // =====================================
    // Step 4: Save document record to database (70%)
    // =====================================
    onProgress?.({ name: 'save', description: 'Saving document record...', progress: 70 }, 70);
    const document = await documentsClient.createDocument({
      parentId,
      parentType: options.parentType as DocumentParentType,
      storageId: storageResult.id, // Storage id
      storagePath: storageResult.path, // Storage path
      fileName: file.name, // File name
      fileSize: file.size, // File size
      fileType: file.type, // File type
      content: parsedTextCombined, // Extracted text content
    });
    console.log('✅ Document created in database', document);

    // =====================================
    // Step 5: Create chunks and embeddings (90%)
    // =====================================
    onProgress?.(
      {
        name: 'chunk',
        description: 'Creating text chunks and embeddings...',
        progress: 90,
      },
      90,
    );
    const chunksResult = await chunksClient.requestCreateDocumentChunks(document.id);

    if (!chunksResult.ok) {
      console.warn('Failed to create chunks:', chunksResult.error);
    }

    console.log('✅ Chunks created', chunksResult);

    // =====================================
    // Step 6: Complete (100%)
    // =====================================
    onProgress?.({ name: 'complete', description: 'Processing complete!', progress: 100 }, 100);

    return {
      document: document as any,
      extractedData: extractionResult.data,
      chunksCreated: chunksResult.ok ? chunksResult.inserted : 0,
      success: true,
    };
  } catch (error) {
    console.error('Document processing failed:', error);
    return {
      document: null as any,
      extractedData: null,
      chunksCreated: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
