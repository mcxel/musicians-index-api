export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { getMailboxConfigSnapshot } from "@/lib/businessCommunications/MailboxConfig";
import {
  getHostingerMailConfigStatus,
  pollHostingerInbox,
  sanitizeInboxMessages,
  sendHostingerMail,
} from "@/lib/businessCommunications/HostingerMailAdapter";
import { pollInboxIntoTriage } from "@/lib/businessCommunications/BusinessMailIngest";
import { listWorkQueue } from "@/lib/businessCommunications/BusinessMessageTriage";

/** GET /api/admin/business-mail — mailbox status (no secrets). */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const mailbox = getMailboxConfigSnapshot();
  const hostinger = getHostingerMailConfigStatus();

  return NextResponse.json({
    ok: true,
    mailbox,
    hostinger,
    queueSize: listWorkQueue().length,
  });
}

type MailAction = "test-send" | "poll" | "poll-triage";

/** POST /api/admin/business-mail — two-way mail test (admin-gated). */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = body.action as MailAction | undefined;

  if (action === "poll") {
    const limit = typeof body.limit === "number" ? body.limit : 15;
    const poll = await pollHostingerInbox({ limit });
    if (!poll.ok) {
      return NextResponse.json(
        { ok: false, configured: poll.configured, error: poll.error },
        { status: poll.configured ? 502 : 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      polledAt: poll.polledAt,
      count: poll.messages.length,
      messages: sanitizeInboxMessages(poll.messages),
    });
  }

  if (action === "poll-triage") {
    const limit = typeof body.limit === "number" ? body.limit : 25;
    const result = await pollInboxIntoTriage({ limit });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, configured: result.configured, error: result.error },
        { status: result.configured ? 502 : 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      triaged: result.triaged,
      polled: result.polled,
      skippedDuplicates: result.skippedDuplicates,
      polledAt: result.polledAt,
      queueSize: listWorkQueue().length,
    });
  }

  if (action === "test-send") {
    const to = String(body.to ?? "").trim().toLowerCase();
    if (!to.includes("@")) {
      return NextResponse.json({ ok: false, error: "Provide a valid to address." }, { status: 400 });
    }

    const fromIdentity = body.fromIdentity === "admin" ? "admin" : "support";
    const operator =
      (req.cookies.get("tmi_user_email")?.value ?? "admin").trim() || "admin";
    const stamp = new Date().toISOString();

    const send = await sendHostingerMail({
      to,
      fromIdentity,
      subject: `[TMI Mail Test] ${stamp}`,
      html: `<p>TMI Hostinger mail test from <strong>${fromIdentity}</strong>.</p><p>Operator: ${operator}</p><p>Time: ${stamp}</p>`,
      text: `TMI Hostinger mail test (${fromIdentity}) at ${stamp}`,
    });

    if (!send.ok) {
      return NextResponse.json(
        { ok: false, configured: send.configured, error: send.error },
        { status: send.configured ? 502 : 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      messageId: send.messageId,
      provider: send.provider,
      from: send.from,
      to,
      hint: "Reply to this message or run action poll-triage to verify inbound delivery into admin inbox.",
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "invalid_action",
      allowed: ["test-send", "poll", "poll-triage"] satisfies MailAction[],
    },
    { status: 400 },
  );
}
