import EmailAuditEngine, { type EmailChannel } from '@/lib/email/EmailAuditEngine';
import EmailRetryEngine from '@/lib/email/EmailRetryEngine';
import EmailTemplateEngine from '@/lib/email/EmailTemplateEngine';
import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';

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

    return job;
  }

  static processNext(): QueuedEmailJob | null {
    const next = queue.find((item) => item.state === 'queued');
    if (!next) return null;

    next.state = 'processing';
    const rendered = EmailTemplateEngine.renderTemplate(next.templateKey, next.variables);

    const delivery = EmailRetryEngine.deliverWithRetry({
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

  static processAll(limit = 100): QueuedEmailJob[] {
    const processed: QueuedEmailJob[] = [];
    for (let index = 0; index < limit; index += 1) {
      const result = this.processNext();
      if (!result) break;
      processed.push(result);
    }
    return processed;
  }

  static listJobs(state?: QueueState): QueuedEmailJob[] {
    if (!state) return [...queue];
    return queue.filter((item) => item.state === state);
  }
}

export default EmailQueueEngine;
