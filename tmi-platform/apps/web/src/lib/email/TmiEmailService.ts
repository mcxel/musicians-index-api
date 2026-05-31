/**
 * TmiEmailService
 *
 * Thin transactional email service for TMI.
 * Sends via Resend API (https://resend.com).
 * Falls back to console.log if RESEND_API_KEY is not set (dev mode).
 *
 * Env vars:
 *   RESEND_API_KEY      — Resend API key (re_...)
 *   EMAIL_FROM_ADDRESS  — Sender address (default: noreply@themusiciansindex.com)
 *   EMAIL_FROM_NAME     — Sender display name (default: TMI Platform)
 */

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? 'noreply@themusiciansindex.com';
const FROM_NAME    = process.env.EMAIL_FROM_NAME    ?? 'TMI Platform';
const FROM         = `${FROM_NAME} <${FROM_ADDRESS}>`;

export interface TmiEmail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface TmiEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(email: TmiEmail): Promise<TmiEmailResult> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log('[TmiEmail] DEV MODE — would send:', email.to, email.subject);
    return { ok: true, id: `dev-${Date.now()}` };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     FROM,
        to:       email.to,
        subject:  email.subject,
        html:     email.html,
        reply_to: email.replyTo,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[TmiEmail] Send failed:', res.status, errorText);
      return { ok: false, error: errorText };
    }

    const data = await res.json() as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[TmiEmail] Exception:', e);
    return { ok: false, error: String(e) };
  }
}
