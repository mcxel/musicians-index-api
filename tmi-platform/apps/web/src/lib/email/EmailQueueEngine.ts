import EmailAuditEngine, { type EmailChannel } from '@/lib/email/EmailAuditEngine';
import EmailRetryEngine from '@/lib/email/EmailRetryEngine';
import EmailTemplateEngine from '@/lib/email/EmailTemplateEngine';
import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';
import { sendEmail, type EmailType as TMIEmailType } from '@/lib/email/TMIEmailSystem';

export type QueueState = 'queued' | 'processing' | 'sent' | 'failed' | 'blocked';

export interface QueuedEmailJob {
  id: string;
  to: string;
  userId?: string;
  channel: EmailChannel;
  templateKey: string;
  variables: Record<string, string | number | boolean>;
  required: boolean;
  state: QueueState;
  attempts: number;
  createdAt: number;
  processedAt?: number;
  metadata?: Record<string, string | number | boolean>;
}

const queue: QueuedEmailJob[] = [];

// TMIEmailSystem template keys that map to rich branded templates
const TMI_TEMPLATE_KEYS = new Set<string>([
  'welcome_artist', 'welcome_fan', 'welcome_venue',
  'verify_email', 'password_reset',
  'battle_invite', 'contest_win', 'contest_loss',
  'ticket_confirmation', 'nft_receipt', 'beat_receipt',
  'tip_received', 'new_follower', 'room_went_live',
  'security_alert', 'new_login',
  'subscription_start', 'subscription_renew', 'subscription_cancel', 'subscription_upgrade',
  'weekly_digest', 'magazine_drop',
  'payout_queued', 'payout_approved',
]);

function nextQueueId(): string {
  return `email-queue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class EmailQueueEngine {
  static enqueue(input: {
    to: string;
    userId?: string;
    channel: EmailChannel;
    templateKey: string;
    variables: Record<string, string | number | boolean>;
    required?: boolean;
    metadata?: Record<string, string | number | boolean>;
  }): QueuedEmailJob {
    const required = input.required ?? false;
    const allowed = NewsSubscriptionEngine.canReceive(input.userId, input.channel, required);
    const job: QueuedEmailJob = {
      id: nextQueueId(),
      to: normalizeEmail(input.to),
      userId: input.userId,
      channel: input.channel,
      templateKey: input.templateKey,
      variables: input.variables,
      required,
      state: allowed ? 'queued' : 'blocked',
      attempts: 0,
      createdAt: Date.now(),
      metadata: input.metadata,
    };

    queue.unshift(job);
    if (queue.length > 3000) queue.pop();

    EmailAuditEngine.log({
      to: job.to,
      templateKey: job.templateKey,
      subject: `[queued] ${job.templateKey}`,
      channel: job.channel,
      state: allowed ? 'queued' : 'unsubscribed',
      provider: 'resend',
      attempt: 0,
      required: job.required,
      metadata: {
        ...(job.metadata ?? {}),
        queueId: job.id,
      },
    });

    // Auto-drain: fire-and-forget so the caller doesn't block
    if (allowed) {
      void EmailQueueEngine.processNext();
    }

    return job;
  }

  static async processNext(): Promise<QueuedEmailJob | null> {
    const next = queue.find((item) => item.state === 'queued');
    if (!next) return null;

    next.state = 'processing';

    // Use TMIEmailSystem rich templates when the key matches; fall back to stub engine
    if (TMI_TEMPLATE_KEYS.has(next.templateKey)) {
      try {
        // Convert variables to the data shape TMIEmailSystem expects
        const data: Record<string, unknown> = { ...next.variables };
        const result = await sendEmail({
          to: next.to,
          type: next.templateKey as TMIEmailType,
          data,
        });
        next.attempts = 1;
        next.processedAt = Date.now();
        next.state = result.success ? 'sent' : 'failed';
        return next;
      } catch {
        // Fall through to retry engine on unexpected error
      }
    }

    // Default path: EmailTemplateEngine + RetryEngine
    const rendered = EmailTemplateEngine.renderTemplate(next.templateKey, next.variables);

    const delivery = await EmailRetryEngine.deliverWithRetry({
      to: next.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      templateKey: next.templateKey,
      channel: next.channel,
      required: next.required,
      metadata: {
        ...(next.metadata ?? {}),
        queueId: next.id,
      },
    });

    next.attempts = delivery.attempts;
    next.processedAt = Date.now();
    next.state = delivery.success ? 'sent' : 'failed';
    return next;
  }

  static async processAll(limit = 100): Promise<QueuedEmailJob[]> {
    const processed: QueuedEmailJob[] = [];
    for (let index = 0; index < limit; index += 1) {
      const result = await EmailQueueEngine.processNext();
      if (!result) break;
      processed.push(result);
    }
    return processed;
  }

  static listJobs(state?: QueueState): QueuedEmailJob[] {
    if (!state) return [...queue];
    return queue.filter((item) => item.state === state);
  }

  static getStats(): { queued: number; processing: number; sent: number; failed: number; blocked: number; total: number } {
    return {
      queued:     queue.filter(j => j.state === 'queued').length,
      processing: queue.filter(j => j.state === 'processing').length,
      sent:       queue.filter(j => j.state === 'sent').length,
      failed:     queue.filter(j => j.state === 'failed').length,
      blocked:    queue.filter(j => j.state === 'blocked').length,
      total:      queue.length,
    };
  }
}

export default EmailQueueEngine;
