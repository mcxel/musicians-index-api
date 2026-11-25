export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAvatarInventory, saveAvatarInventory } from "@/lib/avatar/avatarPersistence";
import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

type InventoryBody = {
  items?: AvatarInventoryItem[];
};

export async function GET(req: NextRequest) {
  const auth = await requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  return NextResponse.json({
    ok: true,
    userId: auth.user.id,
    AvatarInventory: await getAvatarInventory(auth.user.id),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as InventoryBody;
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ ok: false, durable: false, error: "items_required" }, { status: 400 });
  }
  try {
    return NextResponse.json({
      ok: true,
      durable: true,
      userId: auth.user.id,
      AvatarInventory: await saveAvatarInventory(auth.user.id, body.items),
    });
  } catch (err) {
    console.error("[avatar/inventory POST] Durable persistence failed", err);
    return NextResponse.json(
      {
        ok: false,
        durable: false,
        code: "AVATAR_PERSISTENCE_FAILED",
        error: "Avatar inventory was not durably saved",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    );
  }
}