export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";
import { getFanCosmetic } from "@/lib/avatars/FanCosmeticCatalog";
import { catalogItemToInventorySeed } from "@/lib/avatars/fanAvatarLoadout";
import {
  equipAvatarItem,
  getAvatarInventory,
  grantAvatarCosmetic,
  type AvatarSlot,
} from "@/lib/avatar/avatarPersistence";
import { spendFanCredits, getFanCreditsBalance } from "@/lib/points/pointsFulfillment";

type UnlockBody = {
  itemId?: string;
  /** points = spend fanCredits; grant_free = only if catalog pointsCost === 0 */
  payment?: "points" | "grant_free";
  equip?: boolean;
};

/**
 * POST /api/avatar/unlock
 * Real entitlement for Fan cosmetics (Rule 20). Points path when Stripe not wired.
 */
export async function POST(req: NextRequest) {
  const auth = requireFanAvatarSession(req);
  if ("error" in auth) return auth.error;

  const body = (await req.json().catch(() => ({}))) as UnlockBody;
  const itemId = body.itemId?.trim();
  if (!itemId) {
    return NextResponse.json({ ok: false, error: "itemId_required" }, { status: 400 });
  }

  const def = getFanCosmetic(itemId);
  if (!def) {
    return NextResponse.json({ ok: false, error: "unknown_cosmetic" }, { status: 404 });
  }

  const inventory = await getAvatarInventory(auth.user.id);
  const already = inventory.items.find((i) => i.itemId === itemId && i.owned !== false);
  if (already) {
    if (body.equip) {
      const loadout = await equipAvatarItem(auth.user.id, itemId, def.equipSlot as AvatarSlot);
      return NextResponse.json({
        ok: true,
        alreadyOwned: true,
        equippedLoadout: loadout,
        AvatarInventory: await getAvatarInventory(auth.user.id),
        balance: await getFanCreditsBalance(auth.user.id),
      });
    }
    return NextResponse.json({
      ok: true,
      alreadyOwned: true,
      AvatarInventory: inventory,
      balance: await getFanCreditsBalance(auth.user.id),
    });
  }

  const payment = body.payment ?? (def.pointsCost === 0 ? "grant_free" : "points");

  if (payment === "grant_free") {
    if (def.pointsCost > 0) {
      return NextResponse.json(
        { ok: false, error: "not_free", pointsCost: def.pointsCost },
        { status: 402 },
      );
    }
  } else {
    const spent = await spendFanCredits({
      userId: auth.user.id,
      points: def.pointsCost,
      category: "DEBIT_AVATAR_COSMETIC",
      referenceId: `avatar_unlock_${itemId}_${auth.user.id}`,
      note: `Unlock ${def.label} (−${def.pointsCost} pts)`,
    });
    if (!spent.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: spent.error,
          balance: spent.balance,
          required: def.pointsCost,
          buyPointsHref: "/store/points",
        },
        { status: 402 },
      );
    }
  }

  const seed = catalogItemToInventorySeed(def);
  seed.owned = true;
  seed.metadata = {
    ...seed.metadata,
    entitlementSource: payment === "grant_free" ? "starter" : "points",
    cosmeticEntitlement: true,
  };
  const next = await grantAvatarCosmetic(auth.user.id, seed);

  let equippedLoadout = null;
  if (body.equip) {
    try {
      equippedLoadout = await equipAvatarItem(auth.user.id, itemId, def.equipSlot as AvatarSlot);
    } catch {
      equippedLoadout = null;
    }
  }

  return NextResponse.json({
    ok: true,
    itemId,
    AvatarInventory: body.equip ? await getAvatarInventory(auth.user.id) : next,
    equippedLoadout,
    balance: await getFanCreditsBalance(auth.user.id),
    runtime: "3d_avatar_runtime_v0",
  });
}
