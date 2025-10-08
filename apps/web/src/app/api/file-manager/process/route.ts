// apps/web/src/app/api/file-manager/process/route.ts

import { DocumentType } from '@/drizzle/enums';
import { getAuthContext } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { createJob, getJob, updateJobWithNotification } from '@/modules/core/jobs';
import { extraction } from '@/modules/file-manager';
import { NextRequest, NextResponse } from 'next/server';

const filesServer = extraction.server;

export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, orgId, error } = await getAuthContext();
    if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    const contractId = formData.get('contractId') as string | null;
    const invoiceId = formData.get('invoiceId') as string | null;
    const fuelBidId = formData.get('fuelBidId') as string | null;
    const jobId = formData.get('jobId') as string | null; // Optional job tracking

    if (!file || !documentType) {
      return jsonError('Missing required fields: file, documentType', 400);
    }

    // Validate that at least one parent FK is provided
    if (!contractId && !invoiceId && !fuelBidId) {
      return jsonError(
        'Missing parent reference: contractId, invoiceId, or fuelBidId required',
        400,
      );
    }

    // Update job if provided (create it if it doesn't exist due to serverless instance issues)
    if (jobId) {
      const job = getJob(jobId);
      if (!job) {
        console.warn(`⚠️ Job ${jobId} not found, creating it now (serverless instance issue)`);
        createJob({
          jobId: jobId, // Use the provided jobId
          jobType: 'file_processing',
          message: 'Starting file processing...',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            documentType,
            contractId,
            invoiceId,
            fuelBidId,
          },
        });
      }

      updateJobWithNotification(jobId, {
        status: 'processing',
        message: 'Starting file processing...',
        progress: 5,
      });
    }

    // Process file using unified system with optional progress callback
    const result = await filesServer.processFile(
      {
        file,
        documentType,
        contractId: contractId || undefined,
        invoiceId: invoiceId || undefined,
        fuelBidId: fuelBidId || undefined,
        orgId,
        userId: dbUser.id,
      },
      jobId
        ? (step) => {
            // Update job with processing progress
            updateJobWithNotification(jobId, {
              status: 'processing',
              progress: step.progress,
              message: step.description,
            });
          }
        : undefined,
    );

    // Update job on completion if provided
    if (jobId) {
      if (result.success) {
        updateJobWithNotification(jobId, {
          status: 'completed',
          progress: 100,
          message: 'Document processed successfully',
          documentId: result.documentId,
        });
      } else {
        updateJobWithNotification(jobId, {
          status: 'error',
          message: 'Processing failed',
          error: result.error || 'Unknown error',
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('File processing error:', error);
    return jsonError('File processing failed', 500);
  }
}
