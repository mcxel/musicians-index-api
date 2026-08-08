export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  getUnifiedFanCosmeticCatalog,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";

function toShopItem(def: FanCosmeticDef) {
  const category =
    def.slot === "outfit"
      ? "CLOTHING"
      : def.equipSlot === "prop" || def.slot === "hand"
        ? "PROP"
        : def.slot === "emote"
          ? "EMOTE"
          : "CLOTHING";
  return {
    id: def.id,
    name: def.label,
    price: def.pointsCost > 0 ? Number((def.pointsCost / 100).toFixed(2)) : 0,
    pointsCost: def.pointsCost,
    category,
    emoji: def.icon,
    rarity:
      def.rarity === "free"
        ? "COMMON"
        : def.rarity === "legendary"
          ? "LEGENDARY"
          : def.rarity === "epic"
            ? "EPIC"
            : "RARE",
    accent: def.accent,
    socketId: def.socketId,
    animKind: def.animKind ?? "none",
    certifiedGlb: false,
    runtime: "3d_avatar_runtime_v0",
    description: def.description,
  };
}

/** Fan cosmetics shop — FanCosmeticCatalog SKUs (points unlock via /api/avatar/unlock). */
export async function GET() {
  const items = getUnifiedFanCosmeticCatalog()
    .filter((c) => c.slot !== "emote" || c.equipSlot === "prop")
    .map(toShopItem);
  return NextResponse.json(items);
}
