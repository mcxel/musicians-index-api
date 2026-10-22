import { type NextRequest, NextResponse } from "next/server";
import { sendBroadcast, type BroadcastTarget } from "@/lib/email/EmailBroadcastEngine";
import type { EmailType } from "@/lib/email/TMIEmailSystem";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const dynamic = "force-dynamic";

const ALLOWED_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

// SECURITY (2026-09-23, Batch 2): verified DB identity/role via getTmiAuth()
// — the previous tmi_role/tmi_email cookie check was forgeable by any
// caller, letting anyone trigger a mass email broadcast.
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? "").toUpperCase();
  return Boolean(auth) && (role === "ADMIN" || role === "STAFF" || ALLOWED_EMAILS.includes(auth!.user.email));
}

interface BroadcastBody {
  type?: unknown;
  targets?: unknown;
  data?: unknown;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  let body: BroadcastBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const type    = typeof body.type    === "string" ? body.type : null;
  const targets = Array.isArray(body.targets)      ? body.targets : ["ADMIN"];
  const data    = body.data && typeof body.data === "object" ? body.data as Record<string, unknown> : {};

  if (!type) {
    return NextResponse.json({ ok: false, error: "type required" }, { status: 400 });
  }

  const VALID_TARGETS: BroadcastTarget[] = ["ADMIN","TEAM","DIAMOND","PROMOTER","SPONSOR","ADVERTISER","ALL"];
  const safeTargets = (targets as string[])
    .map((t) => t.toUpperCase())
    .filter((t): t is BroadcastTarget => VALID_TARGETS.includes(t as BroadcastTarget));

  if (safeTargets.length === 0) {
    return NextResponse.json({ ok: false, error: "no valid targets" }, { status: 400 });
  }

  try {
    const result = await sendBroadcast(type as EmailType, safeTargets, data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
