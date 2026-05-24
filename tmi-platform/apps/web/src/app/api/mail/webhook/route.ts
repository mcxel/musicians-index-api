// api/mail/webhook/route.ts — Inbound mail provider webhooks (bounces, complaints, opens)

import { NextRequest, NextResponse } from "next/server";
import { updatePreferences } from "@/lib/mail/MailPreferenceEngine";

interface ResendWebhookEvent {
  type: string;
  data?: { email_id?: string; to?: string[] };
}

interface SendGridWebhookEvent {
  event: string;
  email?: string;
  sg_message_id?: string;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider") ?? "resend";
  const body = await req.json().catch(() => ({}));

  if (provider === "resend") {
    const event = body as ResendWebhookEvent;
    // Bounce or complaint → suppress future sends (would update preference by email in production)
    if (event.type === "email.bounced" || event.type === "email.complained") {
      console.log(`[MailWebhook] Resend ${event.type} for email_id: ${event.data?.email_id}`);
      // In production: look up userId by email and call unsubscribeAll(userId)
    }
  }

  if (provider === "sendgrid") {
    const events = Array.isArray(body) ? body as SendGridWebhookEvent[] : [body as SendGridWebhookEvent];
    for (const ev of events) {
      if (ev.event === "bounce" || ev.event === "spamreport") {
        console.log(`[MailWebhook] SendGrid ${ev.event} for ${ev.email}`);
        // In production: look up userId by email and call unsubscribeAll(userId)
      }
    }
  }

  return NextResponse.json({ ok: true });
}
