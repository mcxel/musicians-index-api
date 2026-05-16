import { NextRequest, NextResponse } from "next/server";
import { getAvatarPersistenceSnapshot } from "@/lib/avatar/avatarPersistence";

function resolveUserId(req: NextRequest): string {
  return req.nextUrl.searchParams.get("userId") ?? "demo-user";
}

export async function GET(req: NextRequest) {
  const userId = resolveUserId(req);
  return NextResponse.json({
    ok: true,
    userId,
    ...getAvatarPersistenceSnapshot(userId),
  });
}
