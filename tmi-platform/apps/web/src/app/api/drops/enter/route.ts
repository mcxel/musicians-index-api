import { NextResponse } from "next/server";
import { DropEngine } from "@/lib/economy/DropEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { dropId, userId } = body as Record<string, string>;

  if (!dropId || !userId) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const drop = DropEngine.getDrop(dropId);
  if (!drop) return NextResponse.json({ ok: false, error: "drop_not_found" }, { status: 404 });
  if (drop.status !== "armed" && drop.status !== "fired") {
    return NextResponse.json({ ok: false, error: "drop_not_active" }, { status: 409 });
  }

  // Register the user as eligible — they self-report via this call
  if (!drop.eligibleUserIds.includes(userId)) {
    drop.eligibleUserIds.push(userId);
  }

  return NextResponse.json({ ok: true, entered: true, dropId });
}
