export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAvatarPersistenceSnapshot } from "@/lib/avatar/avatarPersistence";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

export async function GET(req: NextRequest) {
  const auth = requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  return NextResponse.json({
    ok: true,
    userId: auth.user.id,
    ...(await getAvatarPersistenceSnapshot(auth.user.id)),
  });
}