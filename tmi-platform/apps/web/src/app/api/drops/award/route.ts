import { NextResponse } from "next/server";
import { DropEngine } from "@/lib/economy/DropEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { dropId } = body as Record<string, string>;

  if (!dropId) {
    return NextResponse.json({ ok: false, error: "missing_drop_id" }, { status: 400 });
  }

  const drop = DropEngine.getDrop(dropId);
  if (!drop) return NextResponse.json({ ok: false, error: "drop_not_found" }, { status: 404 });
  if (drop.status !== "armed") {
    return NextResponse.json({ ok: false, error: "drop_not_armed" }, { status: 409 });
  }

  const result = DropEngine.fireDrop(dropId, drop.eligibleUserIds);
  if (!result) return NextResponse.json({ ok: false, error: "fire_failed" }, { status: 500 });

  return NextResponse.json({
    ok: true,
    winnerId: result.winnerId,
    auditLog: result.auditLog,
  });
}
