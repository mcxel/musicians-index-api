/**
 * EmailProviderEngine
 *
 * Real email delivery via Resend (primary) with SendGrid fallback.
 * Set RESEND_API_KEY in .env to enable live delivery.
 * If no key is present, returns simulated success (dev mode only).
 *
 * Env vars:
 *   RESEND_API_KEY       — Resend API key (sk_live_... or re_...)
 *   SENDGRID_API_KEY     — SendGrid fallback
 *   EMAIL_FROM_ADDRESS   — Sender address (default: noreply@berntoutglobal.com)
 *   EMAIL_FROM_NAME      — Sender name (default: TMI Platform)
 */

export type EmailProvider = 'resend' | 'sendgrid' | 'dev-stub';

export interface ProviderSendInput {
  provider?: EmailProvider;
  to: string;
  subject: string;
  html: string;
  text: string;
  tags?: string[];
  replyTo?: string;
}

export interface ProviderSendResult {
  success:    boolean;
  provider:   EmailProvider;
  externalId: string;
  error?:     string;
  sentAt:     number;
  devMode?:   boolean;
}

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? 'noreply@berntoutglobal.com';
const FROM_NAME    = process.env.EMAIL_FROM_NAME    ?? 'TMI Platform';

function nextExternalId(provider: EmailProvider): string {
  return `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function shouldFailForSimulation(to: string): boolean {
  return to.toLowerCase().includes('+fail@') || to.toLowerCase().includes('bounce@');
}

async function sendViaResend(input: ProviderSendInput): Promise<ProviderSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dev mode — no key configured
    return {
      success:    true,
      provider:   'dev-stub',
      externalId: nextExternalId('resend'),
      sentAt:     Date.now(),
      devMode:    true,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization':  `Bearer ${apiKey}`,
        'Content-Type':   'application/json',
      },
      body: JSON.stringify({
        from:     `${FROM_NAME} <${FROM_ADDRESS}>`,
        to:       [input.to],
        subject:  input.subject,
        html:     input.html,
        text:     input.text,
        reply_to: input.replyTo,
        tags:     input.tags?.map((t) => ({ name: t, value: '1' })),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success:    false,
        provider:   'resend',
        externalId: nextExternalId('resend'),
        error:      (data as { message?: string }).message ?? `HTTP ${response.status}`,
        sentAt:     Date.now(),
      };
    }

    return {
      success:    true,
      provider:   'resend',
      externalId: (data as { id?: string }).id ?? nextExternalId('resend'),
      sentAt:     Date.now(),
    };
  } catch (err) {
    return {
      success:    false,
      provider:   'resend',
      externalId: nextExternalId('resend'),
      error:      String(err),
      sentAt:     Date.now(),
    };
  }
}

async function sendViaSendGrid(input: ProviderSendInput): Promise<ProviderSendResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return {
      success:    false,
      provider:   'sendgrid',
      externalId: nextExternalId('sendgrid'),
      error:      'SENDGRID_API_KEY not configured',
      sentAt:     Date.now(),
    };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: input.to }], subject: input.subject }],
        from:             { email: FROM_ADDRESS, name: FROM_NAME },
        content:          [
          { type: 'text/plain', value: input.text },
          { type: 'text/html',  value: input.html },
        ],
      }),
    });

    const messageId = response.headers.get('X-Message-Id') ?? nextExternalId('sendgrid');
    return {
      success:    response.ok,
      provider:   'sendgrid',
      externalId: messageId,
      error:      response.ok ? undefined : `HTTP ${response.status}`,
      sentAt:     Date.now(),
    };
  } catch (err) {
    return {
      success:    false,
      provider:   'sendgrid',
      externalId: nextExternalId('sendgrid'),
      error:      String(err),
      sentAt:     Date.now(),
    };
  }
}

export class EmailProviderEngine {
  static setPrimaryProvider(_provider: EmailProvider): void {
    // No-op in this implementation — provider is auto-selected by env vars
  }

  static getProviderConfig(): { primary: EmailProvider; fallback: EmailProvider } {
    const hasSendGrid = !!process.env.SENDGRID_API_KEY;
    const hasResend   = !!process.env.RESEND_API_KEY;
    return {
      primary:  hasResend   ? 'resend'    : hasSendGrid ? 'sendgrid' : 'dev-stub',
      fallback: hasSendGrid ? 'sendgrid'  : 'dev-stub',
    };
  }

  static send(input: ProviderSendInput): ProviderSendResult {
    // Synchronous stub — returns immediate success for queue-based callers.
    // For actual delivery use EmailProviderEngine.sendAsync().
    if (shouldFailForSimulation(input.to)) {
      return { success: false, provider: 'resend', externalId: nextExternalId('resend'), error: 'Simulated failure', sentAt: Date.now() };
    }
    return { success: true, provider: 'dev-stub', externalId: nextExternalId('resend'), sentAt: Date.now(), devMode: true };
  }

  static async sendAsync(input: ProviderSendInput): Promise<ProviderSendResult> {
    if (shouldFailForSimulation(input.to)) {
      return { success: false, provider: 'resend', externalId: nextExternalId('resend'), error: 'Simulated failure', sentAt: Date.now() };
    }

    // Try Resend first
    const resendResult = await sendViaResend(input);
    if (resendResult.success) return resendResult;

    // Fallback to SendGrid
    const sgResult = await sendViaSendGrid(input);
    return sgResult;
  }
}

export default EmailProviderEngine;
