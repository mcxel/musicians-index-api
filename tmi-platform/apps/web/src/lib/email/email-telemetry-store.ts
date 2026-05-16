/**
 * Email Telemetry Store
 *
 * In-memory circular buffer for email delivery events.
 * Wire to your email provider (SendGrid/Postmark/Resend) webhook to populate.
 * Max 500 events retained; oldest are evicted.
 */

export type EmailKind =
  | 'signup_confirmation'
  | 'magic_link'
  | 'password_reset'
  | 'admin_invite'
  | 'performer_invite'
  | 'diamond_welcome'
  | 'ticket_receipt'
  | 'payment_receipt'
  | 'subscription_renewal'
  | 'beat_purchase'
  | 'support_reply';

export type DeliveryStatus = 'delivered' | 'bounced' | 'pending' | 'failed' | 'throttled' | 'expired';

export interface EmailTelemetryEvent {
  id: string;
  kind: EmailKind;
  recipient: string;
  status: DeliveryStatus;
  ts: number;
  latencyMs: number | null;
  attempts: number;
  errorMsg: string | null;
  tokenExpired?: boolean;
}

export interface EmailTelemetrySummary {
  total: number;
  delivered: number;
  bounced: number;
  failed: number;
  pending: number;
  throttled: number;
  expired: number;
  deliveryRatePct: number;
}

const MAX_EVENTS = 500;
const store: EmailTelemetryEvent[] = [];
let seq = 0;

export function recordEmailEvent(
  kind: EmailKind,
  recipient: string,
  status: DeliveryStatus,
  meta: Partial<Pick<EmailTelemetryEvent, 'latencyMs' | 'attempts' | 'errorMsg' | 'tokenExpired'>> = {},
): void {
  const event: EmailTelemetryEvent = {
    id: `email-${++seq}-${Date.now()}`,
    kind,
    recipient,
    status,
    ts: Date.now(),
    latencyMs: meta.latencyMs ?? null,
    attempts: meta.attempts ?? 1,
    errorMsg: meta.errorMsg ?? null,
    tokenExpired: meta.tokenExpired,
  };
  store.push(event);
  if (store.length > MAX_EVENTS) store.shift();
}

export function getRecentEmailEvents(limit = 100): EmailTelemetryEvent[] {
  return store.slice(-limit).reverse();
}

export function getEmailEventsByStatus(status: DeliveryStatus, limit = 50): EmailTelemetryEvent[] {
  return store.filter((e) => e.status === status).slice(-limit).reverse();
}

export function getEmailSummary(): EmailTelemetrySummary {
  const total = store.length;
  const counts = { delivered: 0, bounced: 0, failed: 0, pending: 0, throttled: 0, expired: 0 };
  for (const e of store) counts[e.status] = (counts[e.status] ?? 0) + 1;
  return {
    total,
    ...counts,
    deliveryRatePct: total > 0 ? Math.round((counts.delivered / total) * 100) : 0,
  };
}
