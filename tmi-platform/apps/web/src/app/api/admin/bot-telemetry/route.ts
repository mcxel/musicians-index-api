export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getRecentBotEvents, getBotEventsByType, getBotSummary, type BotEventType } from '@/lib/bots/bot-telemetry-store';

const VALID_EVENT_TYPES: BotEventType[] = [
  'campaign_started', 'campaign_paused', 'campaign_completed', 'campaign_failed',
  'rate_limit_hit', 'approval_required', 'approved', 'rejected', 'escalated',
  'opt_out_suppressed', 'send_success', 'send_failure',
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const eventType = searchParams.get('eventType');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);

  const events =
    eventType && VALID_EVENT_TYPES.includes(eventType as BotEventType)
      ? getBotEventsByType(eventType as BotEventType, limit)
      : getRecentBotEvents(limit);

  const summary = getBotSummary();

  return NextResponse.json({ events, summary });
}
