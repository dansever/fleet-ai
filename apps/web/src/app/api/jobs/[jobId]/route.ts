/**
 * GET /api/jobs/[jobId]
 * Polling endpoint to get current job state
 */

import { jsonError } from '@/lib/core/errors';
import { getJob } from '@/modules/core/jobs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return jsonError('Job ID is required', 400);
    }

    const job = getJob(jobId);

    if (!job) {
      return jsonError('Job not found', 404);
    }

    // Return job state in the format expected by clients
    return NextResponse.json({
      status: job.status,
      message: job.message,
      progress: job.progress,
      documentId: job.documentId,
      timestamp: job.timestamp,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return jsonError('Failed to fetch job', 500);
  }
}
