/**
 * Shared fan loadout — forge, lobby, Flex showroom, InventoryCanister.
 * One ID scheme via FanCosmeticCatalog (Rule 19: playlist skins separate).
 */

import {
  FORGE_ACCESSORY_TO_SKU,
  FORGE_OUTFIT_TO_SKU,
  FORGE_PROP_TO_SKU,
  getFanCosmetic,
  getUnifiedFanCosmeticCatalog,
  type FanCosmeticDef,
} from "@/lib/avatars/FanCosmeticCatalog";
import type { SocketAttachmentDef } from "@/components/3d/AvatarSocketAttachment";
import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
// type-only import — avoid runtime cycle with getStarterInventory()

export function cosmeticIdsToAttachments(
  ids: string[],
  opts?: { activePropId?: string },
): SocketAttachmentDef[] {
  const out: SocketAttachmentDef[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id || id === "none" || seen.has(id)) continue;
    const def = getFanCosmetic(id);
    if (!def) continue;
    seen.add(id);
    out.push({
      id: def.id,
      socketId: def.socketId,
      icon: def.icon,
      color: def.accent,
      plateUrl: def.plateUrl,
      animKind: def.animKind,
      layerScale: def.layerScale,
      active: !opts?.activePropId || id === opts.activePropId || def.slot !== "hand",
    });
  }
  return out;
}

export function resolveOutfitTint(ids: string[]): string | undefined {
  for (const id of ids) {
    const def = getFanCosmetic(id);
    if (def?.bodyTint) return def.bodyTint;
  }
  return undefined;
}

export function equippedIdsFromInventory(items: AvatarInventoryItem[]): string[] {
  return items
    .filter((i) => i.equipped && i.owned !== false)
    .map((i) => i.itemId)
    .filter((id) => Boolean(getFanCosmetic(id)));
}

export function forgeSelectionToCosmeticIds(input: {
  outfit?: string;
  propName?: string;
  accessories?: string[];
  equippedCosmeticIds?: string[];
}): string[] {
  const ids = new Set<string>(input.equippedCosmeticIds ?? []);
  if (input.outfit && FORGE_OUTFIT_TO_SKU[input.outfit]) {
    ids.add(FORGE_OUTFIT_TO_SKU[input.outfit]!);
  }
  if (input.propName && FORGE_PROP_TO_SKU[input.propName]) {
    ids.add(FORGE_PROP_TO_SKU[input.propName]!);
  }
  for (const a of input.accessories ?? []) {
    const sku = FORGE_ACCESSORY_TO_SKU[a];
    if (sku) ids.add(sku);
  }
  return [...ids];
}

export function catalogItemToInventorySeed(def: FanCosmeticDef): AvatarInventoryItem {
  const now = Date.now();
  const rarity =
    def.rarity === "free"
      ? "free"
      : def.rarity === "legendary"
        ? "legendary"
        : def.rarity === "epic"
          ? "epic"
          : "rare";
  return {
    itemId: def.id,
    id: def.id,
    avatarId: "",
    type: "cosmetics",
    category: def.inventoryCategory,
    name: def.label,
    rarity,
    owned: def.pointsCost === 0,
    equipped: def.id === "mic" || def.id === "street_fit",
    mintable: false,
    tradeable: false,
    xpRequired: 0,
    unlockRequirement: def.pointsCost === 0 ? "starter" : `points:${def.pointsCost}`,
    metadata: {
      socketId: def.socketId,
      icon: def.icon,
      accent: def.accent,
      pointsCost: def.pointsCost,
      certifiedGlb: false,
      animKind: def.animKind,
      bodyTint: def.bodyTint,
      runtime: "3d_avatar_runtime_v0",
    },
    createdAt: now,
    updatedAt: now,
  };
}

const SEED_IDS = [
  "sparkler",
  "jester_hat",
  "sunglasses",
  "mic",
  "crown",
  "candle",
  "lighter",
  "gold_chain",
  "street_fit",
  "arena_captain",
  "royal_stage",
  "jester_costume",
  "cyber-jacket-neon",
  "glow_stick",
  "diamond-shades-vip",
  "holographic-sneakers-gold",
];

export function fanCosmeticStarterItems(): AvatarInventoryItem[] {
  return getUnifiedFanCosmeticCatalog()
    .filter((c) => SEED_IDS.includes(c.id))
    .map(catalogItemToInventorySeed);
}
