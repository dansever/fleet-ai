import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId') || 'demo';

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Utility to send an SSE message
      const push = (obj: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      // Example: send a few steps, then complete. Replace with your queue/worker events.
      let step = 0;
      const steps = [
        { status: 'queued', message: 'Queued for processing', progress: 0, jobId },
        { status: 'processing', message: 'Processing fuel bids...', progress: 25, jobId },
        { status: 'analyzing', message: 'AI analyzing bid data...', progress: 60, jobId },
        { status: 'processing', message: 'Generating insights...', progress: 85, jobId },
        { status: 'completed', message: 'Analysis complete', progress: 100, jobId },
      ];

      const interval = setInterval(() => {
        push(steps[Math.min(step, steps.length - 1)]);
        step++;
        if (step >= steps.length) {
          clearInterval(interval);
          controller.close();
        }
      }, 3000);

      // Close handler
      const close = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      };

      // @ts-ignore - not in type defs
      req.signal?.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx proxy hint
    },
  });
}
