export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils/require-admin";
import { applyCaseAction, type CaseAction } from "@/lib/trustSafety";

const ACTIONS = new Set<CaseAction>([
  "start_review",
  "hide_content",
  "block_dms",
  "restrict_rejoin",
  "remove_from_room",
  "resolve",
  "escalate",
  "close",
]);

function requireStaffOrAdmin(req: NextRequest): NextResponse | null {
  const denied = requireAdmin(req);
  if (!denied) return null;
  const role = (req.cookies.get("tmi_role")?.value ?? "").toLowerCase();
  const cookieHeader = req.headers.get("cookie") || "";
  if (role === "staff" || cookieHeader.includes("tmi_role=staff") || cookieHeader.includes("tmi_role=STAFF")) {
    return null;
  }
  return denied;
}

/**
 * POST /api/trust-safety/cases/[id]/action
 * Scaffold review actions — hide/block/restrict implemented when safe.
 * escalate documents that suspend/ban go through /api/admin/moderation.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const denied = requireStaffOrAdmin(req);
  if (denied) return denied;

  const params = await Promise.resolve(context.params);
  const caseId = params.id;
  if (!caseId) return NextResponse.json({ error: "case id required" }, { status: 400 });

  let body: { action?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action as CaseAction;
  if (!ACTIONS.has(action)) {
    return NextResponse.json(
      {
        error: "Invalid action",
        allowed: [...ACTIONS],
        note: "escalate → use /api/admin/moderation for suspend/ban (human-only permanent ban).",
      },
      { status: 400 },
    );
  }

  const performedBy =
    req.cookies.get("tmi_user_email")?.value ??
    req.cookies.get("tmi_session_id")?.value ??
    "admin";

  try {
    const updated = await applyCaseAction({
      caseId,
      action,
      performedBy,
      note: body.note,
    });
    return NextResponse.json({ ok: true, case: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    const status = message === "Case not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
