import { DocumentType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as extractServer, utils as extractUtils } from '@/modules/ai/extract';
import { server as parseServer } from '@/modules/ai/parse';
import { server as documentsServer } from '@/modules/documents/documents';
import { types as documentProcessorTypes } from '@/modules/documents/orchastration';
import { server as storageServer } from '@/modules/storage';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ parentType: DocumentType; parentId: string }>;
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
    const parentType = formData.get('parentType') as DocumentType;
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
    // 1. Save document record to database
    // =====================================
    onProgress?.({ name: 'save', description: 'Saving document record...', progress: 10 }, 10);
    const documentRecord = await documentsServer.createDocument({
      orgId,
      parentId,
      parentType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    console.log('✅ Document record saved');

    // =====================================
    // 2. Upload file to storage
    // =====================================
    onProgress?.({ name: 'upload', description: 'Uploading file to storage...', progress: 20 }, 20);
    const storageResult = await storageServer.uploadFile(file, parentType, parentId);
    console.log('✅ Storage upload completed');

    // =====================================
    // 2.1 Update document record with storage data
    // =====================================
    onProgress?.(
      {
        name: 'update',
        description: 'Updating document record with storage data...',
        progress: 25,
      },
      25,
    );
    await documentsServer.updateDocument(documentRecord.id, {
      storageId: storageResult.id,
      storagePath: storageResult.path,
    });
    console.log('✅ Document record updated with storage data');

    // =====================================
    // 3 & 4. Parse document AND Extract data simultaneously
    // =====================================
    onProgress?.(
      {
        name: 'parse_extract',
        description: 'Parsing document and extracting data...',
        progress: 30,
      },
      30,
    );

    const [parseResult, extractResult] = await Promise.all([
      parseServer.parseDocument(file),
      extractServer.fileExtractorOrchestrator(
        file,
        extractUtils.getExtractionAgentName(parentType),
      ),
    ]);

    const parsedTextCombined = parseResult.map((part: any) => part.text).join('\n');
    console.log('✅ Parsing and extraction completed simultaneously');

    // =====================================
    // 5. Update document record with extracted data
    // =====================================
    onProgress?.({ name: 'update', description: 'Updating document record...', progress: 50 }, 50);
    await documentsServer.updateDocument(documentRecord.id, {
      content: parsedTextCombined,
      summary: extractResult.data.summary,
      extractedData: extractResult.data.terms,
      confidence: extractResult.data.confidence,
      extractedAt: new Date(),
    });
    console.log('✅ Document record updated');

    // // =====================================
    // // 6. Create chunks and embeddings
    // // =====================================
    // onProgress?.(
    //   { name: 'chunk', description: 'Creating text chunks and embeddings...', progress: 80 },
    //   80,
    // );
    // const chunksResult = await chunksServer.createDocumentChunks(documentRecord);
    // console.log('✅ Chunks created');

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
