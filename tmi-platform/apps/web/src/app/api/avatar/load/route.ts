export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAvatarPersistenceSnapshot } from "@/lib/avatar/avatarPersistence";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

export async function GET(req: NextRequest) {
  const auth = await requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  try {
    return NextResponse.json({
      ok: true,
      userId: auth.user.id,
      ...(await getAvatarPersistenceSnapshot(auth.user.id)),
    });
  } catch (error) {
    console.error("[api/avatar/load] durable persistence unavailable:", error);
    return NextResponse.json({ ok: false, error: "avatar_persistence_unavailable" }, { status: 503 });
  }
}