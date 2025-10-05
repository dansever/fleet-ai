import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId') || 'demo';

  // Example deterministic fake progress from current time
  const start = Date.now() - 1000 * 60 * 3; // pretend job began 3 minutes ago
  const elapsed = Date.now() - start;
  const pct = Math.min(100, Math.floor((elapsed / (1000 * 60 * 5)) * 100));

  const payload =
    pct >= 100
      ? { status: 'completed', message: 'Analysis complete', progress: 100, jobId }
      : pct > 60
        ? { status: 'processing', message: 'Generating insights...', progress: pct, jobId }
        : pct > 25
          ? { status: 'analyzing', message: 'AI analyzing bid data...', progress: pct, jobId }
          : { status: 'processing', message: 'Processing fuel bids...', progress: pct, jobId };

  return Response.json(payload, { status: 200 });
}
