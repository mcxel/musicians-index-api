// api/mail/webhook/route.ts — Inbound mail provider webhooks (bounces, complaints, opens)

import { NextRequest, NextResponse } from "next/server";
import { updatePreferences } from "@/lib/mail/MailPreferenceEngine";
import { prisma } from "@/lib/prisma";

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

async function suppressByEmail(email: string | undefined): Promise<void> {
  if (!email) return;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } }).catch(() => null);
  if (user) {
    updatePreferences(user.id, { unsubscribedAll: true });
  }
}

export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider") ?? "resend";
  const body = await req.json().catch(() => ({}));

  if (provider === "resend") {
    const event = body as ResendWebhookEvent;
    if (event.type === "email.bounced" || event.type === "email.complained") {
      await suppressByEmail(event.data?.to?.[0]);
    }
  }

  if (provider === "sendgrid") {
    const events = Array.isArray(body) ? body as SendGridWebhookEvent[] : [body as SendGridWebhookEvent];
    for (const ev of events) {
      if (ev.event === "bounce" || ev.event === "spamreport") {
        await suppressByEmail(ev.email);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
