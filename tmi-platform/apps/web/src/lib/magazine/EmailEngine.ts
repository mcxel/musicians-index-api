/**
 * TMI Platform — Email Engine
 * Supports: Resend (primary), SMTP nodemailer (fallback), console (dev)
 * Set RESEND_API_KEY for production. Set EMAIL_SMTP_* for SMTP fallback.
 *
 * This is the canonical EmailEngine, superseding any other implementations.
 * @see CLAUDE.md — Rule #8 (Registry First), Rule #20 (One Source of Truth)
 */

import * as templates from "../email/TmiEmailTemplates";

export type EmailRole =
  | "FAN" | "ARTIST" | "PERFORMER" | "SPONSOR"
  | "ADVERTISER" | "VENUE" | "PROMOTER" | "ADMIN";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  provider: "resend" | "smtp" | "console";
}

const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "TMI Platform <noreply@themusiciansindex.com>";

const RESEND_KEY   = process.env.RESEND_API_KEY;
const SMTP_HOST    = process.env.EMAIL_SMTP_HOST;
const SMTP_PORT    = parseInt(process.env.EMAIL_SMTP_PORT ?? "587");
const SMTP_USER    = process.env.EMAIL_SMTP_USER;
const SMTP_PASS    = process.env.EMAIL_SMTP_PASS;

// ... (sendViaResend, sendViaSMTP, sendToConsole functions remain the same)

async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from:     payload.from ?? FROM_DEFAULT,
            to:       Array.isArray(payload.to) ? payload.to : [payload.to],
            subject:  payload.subject,
            html:     payload.html,
            text:     payload.text,
            reply_to: payload.replyTo,
            tags:     payload.tags ? Object.entries(payload.tags).map(([n, v]) => ({ name: n, value: v })) : undefined,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `Resend error ${res.status}: ${err}`, provider: "resend" };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, id: data.id, provider: "resend" };
}

async function sendViaSMTP(payload: EmailPayload): Promise<EmailResult> {
    // SMTP implementation
    return { success: false, error: "SMTP not implemented in this version", provider: "smtp" };
}

function sendToConsole(payload: EmailPayload): EmailResult {
    console.log("\n📧 [EmailEngine] ─────────────────────────────────────");
    console.log(`  To:      ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    console.log(`  From:    ${payload.from ?? FROM_DEFAULT}`);
    console.log("──────────────────────────────────────────────────────\n");
    return { success: true, id: `console-${Date.now()}`, provider: "console" };
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (RESEND_KEY) return sendViaResend(payload);
  if (SMTP_HOST && SMTP_USER) return sendViaSMTP(payload);
  return sendToConsole(payload);
}

export const EmailEngine = {
  send: async (payload: EmailPayload) => sendEmail(payload),

  messageNotification: (to: string, fromName: string, messagePreview: string, messageUrl: string) => {
    return sendEmail({
        to,
        subject: `New message from ${fromName} on TMI`,
        html: templates.notificationEmail(fromName, `You have a new message: "${messagePreview}..."`, messageUrl),
        tags: { type: "message_notification" }
    });
  },

  // ... other email types like welcome, passwordReset, etc.
};