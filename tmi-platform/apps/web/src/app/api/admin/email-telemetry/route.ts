export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getRecentEmailEvents, getEmailEventsByStatus, getEmailSummary, type DeliveryStatus } from '@/lib/email/email-telemetry-store';

const VALID_STATUSES: DeliveryStatus[] = ['delivered', 'bounced', 'pending', 'failed', 'throttled', 'expired'];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);

  const events =
    status && VALID_STATUSES.includes(status as DeliveryStatus)
      ? getEmailEventsByStatus(status as DeliveryStatus, limit)
      : getRecentEmailEvents(limit);

  const summary = getEmailSummary();

  return NextResponse.json({ events, summary });
}
