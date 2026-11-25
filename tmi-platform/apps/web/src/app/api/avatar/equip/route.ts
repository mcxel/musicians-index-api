export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  equipAvatarItem,
  getAvatarPersistenceSnapshot,
  isAvatarSlot,
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
  const auth = await requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;
  const body = (await req.json().catch(() => ({}))) as EquipBody;
  const userId = auth.user.id;
  const itemId = body.itemId;
  const slot = body.slot;

  if (typeof itemId !== "string" || !itemId.trim() || !isAvatarSlot(slot)) {
    return NextResponse.json({ ok: false, error: "itemId_and_slot_required" }, { status: 400 });
  }

  try {
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
      durable: true,
      userId,
      equippedLoadout: AvatarLoadout,
      ...(await getAvatarPersistenceSnapshot(userId)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "ownership_validation_failed") {
      return NextResponse.json({ ok: false, error: message }, { status: 403 });
    }
    if (message === "unlock_validation_failed") {
      return NextResponse.json({ ok: false, error: message }, { status: 403 });
    }
    if (message === "slot_validation_failed") {
      return NextResponse.json({ ok: false, error: message }, { status: 422 });
    }
    console.error("[api/avatar/equip] durable persistence failed:", message);
    return NextResponse.json(
      {
        ok: false,
        durable: false,
        code: "AVATAR_PERSISTENCE_FAILED",
        error: "Avatar equip was not durably saved",
      },
      { status: 503 },
    );
  }
}