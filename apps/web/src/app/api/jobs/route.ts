/**
 * POST /api/jobs
 * Create a job, upload file, and start processing
 */

import { DocumentType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { completeJob, createJob, failJob, updateJobWithNotification } from '@/modules/core/jobs';
import { extraction } from '@/modules/file-manager';
import { NextRequest, NextResponse } from 'next/server';

const filesServer = extraction.server;

export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    const parentId = formData.get('parentId') as string;

    if (!file || !documentType || !parentId) {
      return jsonError('Missing required fields: file, documentType, parentId', 400);
    }

    // Create job
    const job = createJob({
      message: 'Upload queued',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        documentType,
        parentId,
      },
    });

    // Return job ID immediately
    const response = NextResponse.json({ jobId: job.jobId });

    // Start processing asynchronously (don't await)
    processFileAsync(job.jobId, file, documentType, parentId, orgId, dbUser.id).catch((err) => {
      console.error('Async processing error:', err);
      failJob(job.jobId, err instanceof Error ? err.message : 'Unknown error');
    });

    return response;
  } catch (error) {
    console.error('Job creation error:', error);
    return jsonError('Failed to create job', 500);
  }
}

/**
 * Process file asynchronously and update job state
 */
async function processFileAsync(
  jobId: string,
  file: File,
  documentType: DocumentType,
  parentId: string,
  orgId: string,
  userId: string,
) {
  try {
    // Update to processing
    updateJobWithNotification(jobId, {
      status: 'processing',
      message: 'Starting file processing...',
      progress: 5,
    });

    // Process file with progress callback that directly updates job
    const result = await filesServer.processFile(
      {
        file,
        documentType,
        parentId,
        orgId,
        userId,
      },
      (step) => {
        // Direct mapping from file processing steps to job updates
        updateJobWithNotification(jobId, {
          status: 'processing',
          progress: step.progress,
          message: step.description,
        });
      },
    );

    if (!result.success) {
      failJob(jobId, result.error || 'Processing failed');
      return;
    }

    // Complete job
    completeJob(jobId, result.documentId, 'Document processed successfully');
  } catch (error) {
    console.error('File processing error:', error);
    failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
  }
}
