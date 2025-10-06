/**
 * GET /api/jobs/[jobId]/stream
 * SSE endpoint for real-time job status updates
 */

import { getJob, subscribeToJob } from '@/modules/core/jobs';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  if (!jobId) {
    return new Response('Job ID is required', { status: 400 });
  }

  // Check if job exists
  const initialJob = getJob(jobId);
  if (!initialJob) {
    return new Response('Job not found', { status: 404 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE message
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial state immediately
      sendEvent({
        status: initialJob.status,
        message: initialJob.message,
        progress: initialJob.progress,
        documentId: initialJob.documentId,
        timestamp: initialJob.timestamp,
      });

      // If job is already terminal, close immediately
      if (initialJob.status === 'completed' || initialJob.status === 'error') {
        controller.close();
        return;
      }

      // Subscribe to job updates
      const unsubscribe = subscribeToJob(jobId, (job) => {
        try {
          sendEvent({
            status: job.status,
            message: job.message,
            progress: job.progress,
            documentId: job.documentId,
            timestamp: job.timestamp,
          });

          // Close stream on terminal status
          if (job.status === 'completed' || job.status === 'error') {
            setTimeout(() => {
              try {
                controller.close();
              } catch (e) {
                // Controller already closed
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error sending SSE event:', error);
        }
      });

      // Handle client disconnect
      const cleanup = () => {
        unsubscribe();
        try {
          controller.close();
        } catch (e) {
          // Controller already closed
        }
      };

      // Listen for abort signal
      request.signal?.addEventListener('abort', cleanup);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          clearInterval(heartbeat);
          cleanup();
        }
      }, 15000); // Every 15 seconds

      // Clean up heartbeat on close
      const originalClose = controller.close.bind(controller);
      controller.close = () => {
        clearInterval(heartbeat);
        originalClose();
      };
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
