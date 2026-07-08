import { NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { getBigAceOperationsSnapshot } from "@/lib/ops/BigAceOperationsCenter";
import { getExecutiveAgentRuntimeSnapshot } from "@/lib/ops/ExecutiveAgentRuntime";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getTmiAuth();
  if (!session) return null;
  const role = (session.user as { role?: string }).role ?? "";
  if (role !== "ADMIN" && role !== "STAFF") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }

  const runtime = getExecutiveAgentRuntimeSnapshot();

  return NextResponse.json({
    ok: true,
    snapshot: getBigAceOperationsSnapshot(),
    agent: runtime.agents.bigAce,
  });
}
