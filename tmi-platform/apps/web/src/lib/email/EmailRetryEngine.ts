import EmailAuditEngine, { type EmailChannel } from '@/lib/email/EmailAuditEngine';
import EmailFailureEngine from '@/lib/email/EmailFailureEngine';
import EmailProviderEngine, { type EmailProvider } from '@/lib/email/EmailProviderEngine';

export interface RetryableEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  templateKey: string;
  channel: EmailChannel;
  required: boolean;
  metadata?: Record<string, string | number | boolean>;
}

export interface RetryDeliveryResult {
  success: boolean;
  attempts: number;
  provider: EmailProvider;
  externalId?: string;
  error?: string;
}

const MAX_ATTEMPTS = 3;

export class EmailRetryEngine {
  static deliverWithRetry(payload: RetryableEmailPayload): RetryDeliveryResult {
    const { primary, fallback } = EmailProviderEngine.getProviderConfig();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const provider = attempt < MAX_ATTEMPTS ? primary : fallback;
      const result = EmailProviderEngine.send({
        provider,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      EmailAuditEngine.log({
        to: payload.to,
        templateKey: payload.templateKey,
        subject: payload.subject,
        channel: payload.channel,
        state: result.success ? 'sent' : 'failed',
        provider,
        attempt,
        required: payload.required,
        metadata: {
          ...(payload.metadata ?? {}),
          maxAttempts: MAX_ATTEMPTS,
        },
      });

      if (result.success) {
        return {
          success: true,
          attempts: attempt,
          provider,
          externalId: result.externalId,
        };
      }

      if (attempt === MAX_ATTEMPTS) {
        EmailFailureEngine.recordFailure({
          email: payload.to,
          templateKey: payload.templateKey,
          provider,
          reason: result.error ?? 'Provider send failed.',
          attempts: attempt,
          escalated: true,
        });

        return {
          success: false,
          attempts: attempt,
          provider,
          error: result.error ?? 'Provider send failed.',
        };
      }
    }

    return {
      success: false,
      attempts: MAX_ATTEMPTS,
      provider: primary,
      error: 'Unknown retry state.',
    };
  }
}

export default EmailRetryEngine;
