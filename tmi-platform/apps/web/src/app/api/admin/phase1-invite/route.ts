import { NextRequest, NextResponse } from "next/server";
import { buildPhase1Batch } from "@/lib/email/Phase1OnboardingEmail";
import EmailProviderEngine from "@/lib/email/EmailProviderEngine";

/**
 * POST /api/admin/phase1-invite
 * Dispatches Phase 1 controlled invites via Resend.
 *
 * Body:
 *   recipients: Array<{ name: string; email: string; note?: string }>
 *   entryUrl?:  string  — defaults to NEXT_PUBLIC_BASE_URL/rooms/world-dance-party
 *
 * Auth: requires X-Admin-Key header matching ADMIN_API_KEY env var.
 * Hard cap: 20 recipients per call.
 */

const ENTRY_URL_DEFAULT =
  `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://tmi.berntoutglobal.com"}/rooms/world-dance-party`;

interface Recipient {
  name:  string;
  email: string;
  note?: string;
}

export async function POST(req: NextRequest) {
  // Admin key guard
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { recipients?: unknown; entryUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
    return NextResponse.json(
      { error: "recipients must be a non-empty array" },
      { status: 400 },
    );
  }

  const entryUrl = typeof body.entryUrl === "string" ? body.entryUrl : ENTRY_URL_DEFAULT;

  const recipients: Recipient[] = (body.recipients as Recipient[])
    .slice(0, 20)
    .map((r) => ({
      name:  String(r.name  ?? "").trim(),
      email: String(r.email ?? "").trim().toLowerCase(),
      note:  r.note ? String(r.note).trim() : undefined,
    }))
    .filter((r) => r.email.includes("@"));

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No valid email addresses found" }, { status: 400 });
  }

  const messages = buildPhase1Batch(
    recipients.map((r) => ({
      recipientName:  r.name,
      recipientEmail: r.email,
      entryUrl,
      personalNote:   r.note,
    })),
    entryUrl,
  );

  // Dispatch all — sequential to avoid Resend rate limits
  const results: Array<{
    email:      string;
    success:    boolean;
    provider:   string;
    externalId: string;
    error?:     string;
  }> = [];

  for (const msg of messages) {
    const result = await EmailProviderEngine.sendAsync({
      to:      msg.to,
      subject: msg.subject,
      html:    msg.html,
      text:    msg.text,
      tags:    ["phase1-invite", "batch-1"],
    });
    results.push({
      email:      msg.to,
      success:    result.success,
      provider:   result.provider,
      externalId: result.externalId,
      error:      result.error,
    });
  }

  const sent   = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`[phase1-invite] Batch dispatched — sent: ${sent}, failed: ${failed}`);

  return NextResponse.json({
    dispatched: results.length,
    sent,
    failed,
    results,
  });
}
