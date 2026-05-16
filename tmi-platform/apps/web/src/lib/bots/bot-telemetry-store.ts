/**
 * Bot Telemetry Store
 *
 * In-memory buffer for bot campaign activity events.
 * Wire to campaign execution engine to populate.
 * Max 500 events retained.
 */

export type BotCampaignKind =
  | 'outreach_dm'
  | 'follow_campaign'
  | 'comment_campaign'
  | 'repost_campaign'
  | 'announcement'
  | 'welcome_sequence'
  | 're_engagement'
  | 'contest_reminder'
  | 'beat_promotion'
  | 'sponsor_outreach';

export type BotEventType =
  | 'campaign_started'
  | 'campaign_paused'
  | 'campaign_completed'
  | 'campaign_failed'
  | 'rate_limit_hit'
  | 'approval_required'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'opt_out_suppressed'
  | 'send_success'
  | 'send_failure';

export interface BotTelemetryEvent {
  id: string;
  campaignId: string;
  kind: BotCampaignKind;
  eventType: BotEventType;
  owner: string;
  ts: number;
  targetCount?: number;
  sentCount?: number;
  failCount?: number;
  optOutCount?: number;
  errorMsg?: string | null;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface BotTelemetrySummary {
  total: number;
  pendingApproval: number;
  running: number;
  rateLimited: number;
  failed: number;
  completed: number;
  totalSent: number;
  totalOptOuts: number;
}

const MAX_EVENTS = 500;
const store: BotTelemetryEvent[] = [];
let seq = 0;

export function recordBotEvent(
  campaignId: string,
  kind: BotCampaignKind,
  eventType: BotEventType,
  meta: Partial<Omit<BotTelemetryEvent, 'id' | 'campaignId' | 'kind' | 'eventType' | 'ts'>> = {},
): void {
  const event: BotTelemetryEvent = {
    id: `bot-${++seq}-${Date.now()}`,
    campaignId,
    kind,
    eventType,
    owner: meta.owner ?? 'system',
    ts: Date.now(),
    ...meta,
  };
  store.push(event);
  if (store.length > MAX_EVENTS) store.shift();
}

export function getRecentBotEvents(limit = 100): BotTelemetryEvent[] {
  return store.slice(-limit).reverse();
}

export function getBotEventsByType(eventType: BotEventType, limit = 50): BotTelemetryEvent[] {
  return store.filter((e) => e.eventType === eventType).slice(-limit).reverse();
}

export function getBotSummary(): BotTelemetrySummary {
  const summary: BotTelemetrySummary = {
    total: 0, pendingApproval: 0, running: 0,
    rateLimited: 0, failed: 0, completed: 0,
    totalSent: 0, totalOptOuts: 0,
  };

  const campaignStates = new Map<string, BotEventType>();
  for (const e of store) {
    campaignStates.set(e.campaignId, e.eventType);
    summary.totalSent += e.sentCount ?? 0;
    summary.totalOptOuts += e.optOutCount ?? 0;
  }

  summary.total = campaignStates.size;
  for (const state of campaignStates.values()) {
    if (state === 'approval_required') summary.pendingApproval++;
    else if (state === 'campaign_started') summary.running++;
    else if (state === 'rate_limit_hit') summary.rateLimited++;
    else if (state === 'campaign_failed') summary.failed++;
    else if (state === 'campaign_completed') summary.completed++;
  }

  return summary;
}
