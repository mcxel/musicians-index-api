export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { runCleanupSweep } from '@/lib/broadcast/LiveSessionCleanupGovernor';

/**
 * GET /api/live/cleanup
 * Sweeps stale sessions and orphaned audience entries.
 * Call from admin cron job, health check endpoint, or observatory.
 */
export async function GET() {
  try {
    const report = runCleanupSweep();
    return NextResponse.json({ ok: true, ...report });
  } catch {
    return NextResponse.json({ ok: false, error: 'Cleanup failed' }, { status: 500 });
  }
}
