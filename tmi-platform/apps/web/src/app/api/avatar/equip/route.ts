import { NextRequest, NextResponse } from "next/server";
import {
  equipAvatarItem,
  getAvatarPersistenceSnapshot,
  validateEquipSlot,
  validateOwnership,
  validateUnlockConditions,
  type AvatarSlot,
} from "@/lib/avatar/avatarPersistence";

type EquipBody = {
  userId?: string;
  itemId?: string;
  slot?: AvatarSlot;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as EquipBody;
  const userId = body.userId ?? "demo-user";
  const itemId = body.itemId;
  const slot = body.slot;

  if (!itemId || !slot) {
    return NextResponse.json({ ok: false, error: "itemId_and_slot_required" }, { status: 400 });
  }

  if (!validateOwnership(userId, itemId)) {
    return NextResponse.json({ ok: false, error: "ownership_validation_failed" }, { status: 403 });
  }
  if (!validateUnlockConditions(userId, itemId)) {
    return NextResponse.json({ ok: false, error: "unlock_validation_failed" }, { status: 403 });
  }
  if (!validateEquipSlot(userId, slot, itemId)) {
    return NextResponse.json({ ok: false, error: "slot_validation_failed" }, { status: 422 });
  }

  const AvatarLoadout = equipAvatarItem(userId, itemId, slot);
  return NextResponse.json({
    ok: true,
    userId,
    equippedLoadout: AvatarLoadout,
    ...getAvatarPersistenceSnapshot(userId),
  });
}
