/**
 * POST /api/jobs
 * Create a generic job for tracking async operations
 *
 * This is a generic job tracking endpoint that can be used by any async operation
 * in the system (file processing, document analysis, LLM agents, etc.)
 */

import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { createJob } from '@/modules/core/jobs';
import { JobType } from '@/modules/core/jobs/job.types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { dbUser, error } = await authenticateUser();
    if (error || !dbUser) {
      return jsonError('Unauthorized', 401);
    }

    // Parse JSON body for job creation
    const body = await request.json();
    const { jobType, message, metadata } = body as {
      jobType?: JobType;
      message?: string;
      metadata?: Record<string, any>;
    };

    // Create job with provided options
    const job = createJob({
      jobType: jobType || 'generic',
      message: message || 'Job created',
      metadata,
    });

    // Return job ID immediately
    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      timestamp: job.timestamp,
    });
  } catch (error) {
    console.error('Job creation error:', error);
    return jsonError('Failed to create job', 500);
  }
}
