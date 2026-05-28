export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { EmailQueueEngine } from '@/lib/email/EmailQueueEngine';

/**
 * POST /api/email/queue-flush
 *
 * Drains all queued emails through the provider chain.
 * Called by Vercel Cron every minute.
 * Also callable manually with the flush key for admin testing.
 *
 * Auth: header X-Queue-Flush-Key must match QUEUE_FLUSH_KEY env var,
 * OR request must come from Vercel Cron (Authorization: Bearer vercel-cron header).
 */
export async function POST(req: NextRequest) {
  // Accept either the Vercel cron header or a manual secret key
  const cronHeader  = req.headers.get('authorization');
  const flushKey    = req.headers.get('x-queue-flush-key');
  const configKey   = process.env.QUEUE_FLUSH_KEY?.trim() ?? '';

  if (!configKey && !process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ ok: false, error: 'Queue flush keys are not configured' }, { status: 500 });
  }

  const isVercelCron = cronHeader === 'Bearer ' + (process.env.CRON_SECRET ?? '');
  const isManual     = !!configKey && flushKey === configKey;

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const statsBefore = EmailQueueEngine.getStats();

  // Process up to 200 emails per run (Vercel function timeout is 10s on hobby, 60s on pro)
  const processed = await EmailQueueEngine.processAll(200);

  const sent   = processed.filter(j => j.state === 'sent').length;
  const failed = processed.filter(j => j.state === 'failed').length;
  const statsAfter = EmailQueueEngine.getStats();

  return NextResponse.json({
    ok: true,
    processed: processed.length,
    sent,
    failed,
    remaining: statsAfter.queued,
    before: statsBefore,
    after:  statsAfter,
    runAt:  new Date().toISOString(),
  });
}

/**
 * GET /api/email/queue-flush
 * Returns queue stats without processing (for admin monitoring).
 */
export async function GET(req: NextRequest) {
  const key = req.headers.get('x-queue-flush-key') ?? req.nextUrl.searchParams.get('key') ?? '';
  const configKey = process.env.QUEUE_FLUSH_KEY?.trim() ?? '';

  if (!configKey) {
    return NextResponse.json({ ok: false, error: 'QUEUE_FLUSH_KEY is not configured' }, { status: 500 });
  }

  if (key !== configKey) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    stats: EmailQueueEngine.getStats(),
    timestamp: new Date().toISOString(),
  });
}
