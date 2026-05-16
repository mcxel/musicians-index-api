export type EmailChannel =
  | 'billing'
  | 'security'
  | 'ticketing'
  | 'account'
  | 'news'
  | 'promos'
  | 'artist-alerts'
  | 'venue-alerts'
  | 'event-alerts'
  | 'support-replies'
  | 'invites'
  | 'admin-alerts';

export type EmailDeliveryState =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'bounced'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'replied'
  | 'unsubscribed';

export interface EmailAuditRecord {
  id: string;
  to: string;
  subject: string;
  templateKey: string;
  channel: EmailChannel;
  state: EmailDeliveryState;
  provider: 'resend' | 'sendgrid' | 'dev-stub';
  attempt: number;
  required: boolean;
  createdAt: number;
  metadata?: Record<string, string | number | boolean>;
}

const emailAuditTrail: EmailAuditRecord[] = [];

function nextAuditId(): string {
  return `email-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(to: string): string {
  return to.trim().toLowerCase();
}

export class EmailAuditEngine {
  static log(
    record: Omit<EmailAuditRecord, 'id' | 'createdAt' | 'to'> & { to: string }
  ): EmailAuditRecord {
    const entry: EmailAuditRecord = {
      ...record,
      id: nextAuditId(),
      to: normalize(record.to),
      createdAt: Date.now(),
    };

    emailAuditTrail.unshift(entry);
    if (emailAuditTrail.length > 4000) emailAuditTrail.pop();
    return entry;
  }

  static list(limit = 250): EmailAuditRecord[] {
    return emailAuditTrail.slice(0, Math.max(1, limit));
  }

  static listByState(state: EmailDeliveryState): EmailAuditRecord[] {
    return emailAuditTrail.filter((item) => item.state === state);
  }

  static listByChannel(channel: EmailChannel): EmailAuditRecord[] {
    return emailAuditTrail.filter((item) => item.channel === channel);
  }

  static getMetrics(): Record<EmailDeliveryState | 'total', number> {
    const base: Record<EmailDeliveryState | 'total', number> = {
      total: emailAuditTrail.length,
      queued: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      bounced: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      unsubscribed: 0,
    };

    emailAuditTrail.forEach((item) => {
      base[item.state] += 1;
    });

    return base;
  }
}

export default EmailAuditEngine;
