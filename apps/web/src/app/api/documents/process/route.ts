import { DocumentParentType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as contractsServer } from '@/modules/contracts';
import { server as chunksServer } from '@/modules/documents/chunks';
import { server as documentsServer } from '@/modules/documents/documents';
import { server as extractServer, utils as extractUtils } from '@/modules/documents/extract';
import { types as documentProcessorTypes } from '@/modules/documents/orchastration';
import { server as parseServer } from '@/modules/documents/parse';
import { server as storageServer } from '@/modules/storage';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ parentType: DocumentParentType; parentId: string }>;
};

/**
 * POST /api/documents/process
 * Process a document - from upload to complete
 * @param request request with multipart/form-data containing 'file', 'parentType', and 'parentId'
 * @returns the document
 * Steps:
 * 1. Upload file to storage
 * 2. Parse document with LlamaParse
 * 3. Extract document data with LlamaExtract
 * 4. Update parent record with extracted data
 * 5. Save document record to database
 * 6. Create chunks and embeddings
 * 7. Complete
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Prepare the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const parentType = formData.get('parentType') as DocumentParentType;
    const parentId = formData.get('parentId') as string;
    if (!file || !parentType || !parentId)
      return jsonError('No file, parent type, or parent id uploaded', 400);

    const onProgress = (
      step: documentProcessorTypes.DocumentProcessorTypes.ProcessingStep,
      progress: number,
    ) => {
      console.log(`${step} - ${progress}%`);
    };

    // =====================================
    // 1. Upload file to storage
    // =====================================
    onProgress?.({ name: 'upload', description: 'Uploading file to storage...', progress: 20 }, 20);
    const storageResult = await storageServer.uploadFile(file, parentType, parentId);
    console.log('✅ Storage upload completed:', storageResult);

    // =====================================
    // 2. Parse document with LlamaParse
    // =====================================
    onProgress?.({ name: 'parse', description: 'Parsing document...', progress: 30 }, 30);
    const parseResult = await parseServer.parseDocument(file);
    const parsedTextCombined = parseResult.map((part: any) => part.text).join('\n');
    console.log('✅ Parsed text: ', parsedTextCombined.slice(0, 80) + '...');

    // =====================================
    // 3. Extract document data with LlamaExtract
    // =====================================
    onProgress?.({ name: 'extract', description: 'Extracting document data...', progress: 40 }, 40);
    const extractResult = await extractServer.fileExtractorOrchestrator(
      file,
      extractUtils.getExtractionAgentName(parentType),
    );
    console.log('✅ Extraction completed: ', extractResult);

    // =====================================
    // 4. Update parent record with extracted data
    // =====================================
    onProgress?.({ name: 'update', description: 'Updating contract record...', progress: 50 }, 50);
    const updateResult = await contractsServer.updateContract(parentId, {
      summary: extractResult.data.summary,
      terms: extractResult.data.terms,
    });
    console.log('✅ Contract record updated: ', updateResult);

    // =====================================
    // 5. Save document record to database
    // =====================================
    onProgress?.({ name: 'save', description: 'Saving document record...', progress: 70 }, 70);
    const saveResult = await documentsServer.createDocument({
      orgId,
      parentId,
      parentType,
      storageId: storageResult.id,
      storagePath: storageResult.path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      content: parsedTextCombined,
    });
    console.log('✅ Document record saved: ', saveResult);

    // =====================================
    // 6. Create chunks and embeddings
    // =====================================
    onProgress?.(
      { name: 'chunk', description: 'Creating text chunks and embeddings...', progress: 80 },
      80,
    );
    const chunksResult = await chunksServer.createDocumentChunks(saveResult);
    console.log('✅ Chunks created: ', chunksResult);

    // =====================================
    // 7. Complete
    // =====================================
    onProgress?.({ name: 'complete', description: 'Processing complete!', progress: 100 }, 100);

    // Return the document
    return NextResponse.json(storageResult);
  } catch (error) {
    console.error('Failed to process document', error);
    return jsonError('Failed to process document', 500);
  }
}
