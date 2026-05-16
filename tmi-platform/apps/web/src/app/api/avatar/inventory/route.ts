export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getAvatarInventory, saveAvatarInventory } from "@/lib/avatar/avatarPersistence";
import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";

type InventoryBody = {
  userId?: string;
  items?: AvatarInventoryItem[];
};

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "demo-user";
  return NextResponse.json({
    ok: true,
    userId,
    AvatarInventory: getAvatarInventory(userId),
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as InventoryBody;
  const userId = body.userId ?? "demo-user";
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ ok: false, error: "items_required" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    userId,
    AvatarInventory: saveAvatarInventory(userId, body.items),
  });
}
