export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import {
  executeBigAceBusinessDirective,
  type BigAceBusinessDirective,
} from "@/lib/businessCommunications/BigAceBusinessCommunicationsRuntime";

/** POST /api/admin/business-comms/directive — Big Ace business comms execute-within-authority. */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const operatorId =
    (req.cookies.get("tmi_user_email")?.value ?? "admin").trim().toLowerCase() || "admin";

  const action = body.action;
  if (action !== "triage_inbox" && action !== "process_sponsor_inquiry" && action !== "work_queue") {
    return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
  }

  let directive: BigAceBusinessDirective;
  if (action === "triage_inbox") {
    directive = {
      action: "triage_inbox",
      messages: Array.isArray(body.messages)
        ? (body.messages as Array<{ from: string; subject: string; body: string }>)
        : undefined,
    };
  } else if (action === "work_queue") {
    const priority = body.priority;
    directive = {
      action: "work_queue",
      priority:
        priority === "P0" ||
        priority === "P1" ||
        priority === "P2" ||
        priority === "P3" ||
        priority === "P4"
          ? priority
          : undefined,
      limit: typeof body.limit === "number" ? body.limit : undefined,
    };
  } else {
    directive = {
      action: "process_sponsor_inquiry",
      from: String(body.from ?? ""),
      subject: String(body.subject ?? ""),
      body: String(body.body ?? ""),
      contactName: typeof body.contactName === "string" ? body.contactName : undefined,
      organization: typeof body.organization === "string" ? body.organization : undefined,
      preferredZone: typeof body.preferredZone === "string" ? body.preferredZone : undefined,
      sendDraft: body.sendDraft === true,
    };
  }
  const result = await executeBigAceBusinessDirective(operatorId, directive);
  const status = result.ok ? 200 : 422;
  return NextResponse.json(result, { status });
}
