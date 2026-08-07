export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  equipAvatarItem,
  getAvatarPersistenceSnapshot,
  validateEquipSlot,
  validateOwnership,
  validateUnlockConditions,
  type AvatarSlot,
} from "@/lib/avatar/avatarPersistence";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

type EquipBody = {
  itemId?: string;
  slot?: AvatarSlot;
};

export async function POST(req: NextRequest) {
  const auth = requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as EquipBody;
  const userId = auth.user.id;
  const itemId = body.itemId;
  const slot = body.slot;

  if (!itemId || !slot) {
    return NextResponse.json({ ok: false, error: "itemId_and_slot_required" }, { status: 400 });
  }

  if (!(await validateOwnership(userId, itemId))) {
    return NextResponse.json({ ok: false, error: "ownership_validation_failed" }, { status: 403 });
  }
  if (!(await validateUnlockConditions(userId, itemId))) {
    return NextResponse.json({ ok: false, error: "unlock_validation_failed" }, { status: 403 });
  }
  if (!(await validateEquipSlot(userId, slot, itemId))) {
    return NextResponse.json({ ok: false, error: "slot_validation_failed" }, { status: 422 });
  }

  const AvatarLoadout = await equipAvatarItem(userId, itemId, slot);
  return NextResponse.json({
    ok: true,
    userId,
    equippedLoadout: AvatarLoadout,
    ...(await getAvatarPersistenceSnapshot(userId)),
  });
}