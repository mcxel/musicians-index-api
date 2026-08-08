/**
 * FanCosmeticCatalog — single ID scheme for tray + inventory + forge + Flex apparel.
 * 3D Avatar Runtime v0: sprites/planes/primitives on sockets. certifiedGlb always false.
 * Playlist skins stay in PlaylistArtifactEngine (Rule 19) — never mixed here.
 * SKU ids stable for later GLB swap (same id → mesh when certified).
 */

import type { AvatarSocketId } from "@/lib/avatars/AvatarSocketSystem";
import { LOBBY_INVENTORY_PROPS, type LobbyPropDef } from "@/lib/lobby/LobbyPropRegistry";

export type FanCosmeticRarity = "free" | "common" | "rare" | "epic" | "legendary";

export type FanCosmeticSlot =
  | "head"
  | "face"
  | "hand"
  | "chest"
  | "waist"
  | "emote"
  | "outfit"
  | "hair"
  | "feet";

/** Drives AvatarSocketAttachment / LobbyPropEffectLayer animation kind. */
export type PropAnimKind =
  | "none"
  | "flame_flicker"
  | "sparkler_burst"
  | "candle_glow"
  | "mic_pulse"
  | "glow_pulse"
  | "hold_bob";

export interface FanCosmeticDef {
  id: string;
  label: string;
  icon: string;
  accent: string;
  slot: FanCosmeticSlot;
  socketId: AvatarSocketId;
  pointsCost: number;
  rarity: FanCosmeticRarity;
  inventoryCategory:
    | "hats"
    | "glasses"
    | "props"
    | "accessories"
    | "emotes"
    | "outfits"
    | "jackets"
    | "jewelry"
    | "mic-skins";
  equipSlot: "accessory" | "prop" | "outfit" | "hair" | "skin";
  plateUrl?: string;
  certifiedGlb: false;
  description: string;
  /** Outfit: tint AvatarRig body capsule. */
  bodyTint?: string;
  /** Accessory/outfit layer scale hint for v0 primitives. */
  layerScale?: number;
  animKind?: PropAnimKind;
  /** Brightens (+) or darkens (−) room ambient when held/active. */
  ambientDelta?: number;
}

/** Core battle/cypher/lobby SKUs + costumes aligned to concept costume looks (plane/tint v0). */
export const FAN_COSMETIC_CATALOG: FanCosmeticDef[] = [
  // ── Hand props (animated) ──
  {
    id: "sparkler",
    label: "Sparkler",
    icon: "✨",
    accent: "#FFD700",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 150,
    rarity: "common",
    inventoryCategory: "props",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Animated sparkler particles — v0 plane + point glow",
    animKind: "sparkler_burst",
    ambientDelta: 0.35,
  },
  {
    id: "mic",
    label: "Mic",
    icon: "🎤",
    accent: "#00FFFF",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 0,
    rarity: "free",
    inventoryCategory: "mic-skins",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Starter mic with pulse glow (lobby holdable)",
    animKind: "mic_pulse",
    ambientDelta: 0.08,
  },
  {
    id: "lighter",
    label: "Lighter",
    icon: "🔥",
    accent: "#FF6600",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 0,
    rarity: "free",
    inventoryCategory: "props",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Flame flicker + room warm-up",
    animKind: "flame_flicker",
    ambientDelta: 0.32,
  },
  {
    id: "candle",
    label: "Candle",
    icon: "🕯️",
    accent: "#FFB84A",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 0,
    rarity: "free",
    inventoryCategory: "props",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Soft candle glow + gentle room brighten",
    animKind: "candle_glow",
    ambientDelta: 0.2,
  },
  {
    id: "glow_stick",
    label: "Glow Stick",
    icon: "🪄",
    accent: "#00FF88",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 100,
    rarity: "rare",
    inventoryCategory: "props",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Neon glow pulse holdable",
    animKind: "glow_pulse",
    ambientDelta: 0.22,
  },
  {
    id: "foam_finger",
    label: "Foam Finger",
    icon: "🧤",
    accent: "#00CCFF",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 100,
    rarity: "rare",
    inventoryCategory: "props",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Crowd foam finger — hold bob",
    animKind: "hold_bob",
    ambientDelta: 0.06,
  },
  {
    id: "rose",
    label: "Rose",
    icon: "🌹",
    accent: "#FF2DAA",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 100,
    rarity: "rare",
    inventoryCategory: "props",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Rose hold — soft magenta wash (slight darken)",
    animKind: "hold_bob",
    ambientDelta: -0.1,
  },

  // ── Head / face accessories ──
  {
    id: "jester_hat",
    label: "Jester Hat",
    icon: "🃏",
    accent: "#FF2DAA",
    slot: "head",
    socketId: "socket_head",
    pointsCost: 250,
    rarity: "rare",
    inventoryCategory: "hats",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Concept jester costume hat — head socket plate",
    layerScale: 1.15,
  },
  {
    id: "crown",
    label: "Crown",
    icon: "👑",
    accent: "#FFD700",
    slot: "head",
    socketId: "socket_head",
    pointsCost: 400,
    rarity: "legendary",
    inventoryCategory: "hats",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Crown hat — torus + plate v0",
    layerScale: 1.2,
  },
  {
    id: "sunglasses",
    label: "Sunglasses",
    icon: "🕶️",
    accent: "#00FFFF",
    slot: "face",
    socketId: "socket_face",
    pointsCost: 200,
    rarity: "common",
    inventoryCategory: "glasses",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Face shades plane",
  },
  {
    id: "diamond-shades-vip",
    label: "Diamond VIP Sunglasses",
    icon: "🕶️",
    accent: "#00FF88",
    slot: "face",
    socketId: "socket_face",
    pointsCost: 199,
    rarity: "rare",
    inventoryCategory: "glasses",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Flex apparel SKU — face socket (same id for later GLB)",
  },
  {
    id: "gold_chain",
    label: "Gold Chain",
    icon: "📿",
    accent: "#FFD700",
    slot: "chest",
    socketId: "socket_chest",
    pointsCost: 180,
    rarity: "common",
    inventoryCategory: "jewelry",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Chest chain accessory",
  },

  // ── Outfits / costumes (body tint + chest layer) ──
  {
    id: "cyber-jacket-neon",
    label: "Cyberpunk Neon Jacket",
    icon: "🧥",
    accent: "#00E5FF",
    slot: "outfit",
    socketId: "socket_chest",
    pointsCost: 299,
    rarity: "epic",
    inventoryCategory: "jackets",
    equipSlot: "outfit",
    certifiedGlb: false,
    description: "Flex apparel costume — neon body tint + chest plate",
    bodyTint: "#0a3d4a",
    layerScale: 1.3,
  },
  {
    id: "street_fit",
    label: "Street Fit",
    icon: "👕",
    accent: "#AA2DFF",
    slot: "outfit",
    socketId: "socket_chest",
    pointsCost: 0,
    rarity: "free",
    inventoryCategory: "outfits",
    equipSlot: "outfit",
    certifiedGlb: false,
    description: "Forge starter street costume",
    bodyTint: "#2a1840",
  },
  {
    id: "arena_captain",
    label: "Arena Captain",
    icon: "🎽",
    accent: "#FFD700",
    slot: "outfit",
    socketId: "socket_chest",
    pointsCost: 220,
    rarity: "rare",
    inventoryCategory: "outfits",
    equipSlot: "outfit",
    certifiedGlb: false,
    description: "Arena costume — gold accent torso",
    bodyTint: "#3a2a08",
  },
  {
    id: "royal_stage",
    label: "Royal Stage",
    icon: "🎭",
    accent: "#FF2DAA",
    slot: "outfit",
    socketId: "socket_chest",
    pointsCost: 350,
    rarity: "legendary",
    inventoryCategory: "outfits",
    equipSlot: "outfit",
    certifiedGlb: false,
    description: "Royal stage costume look (concept-aligned tint)",
    bodyTint: "#4a1040",
  },
  {
    id: "jester_costume",
    label: "Jester Costume",
    icon: "🎪",
    accent: "#FF2DAA",
    slot: "outfit",
    socketId: "socket_chest",
    pointsCost: 300,
    rarity: "epic",
    inventoryCategory: "outfits",
    equipSlot: "outfit",
    certifiedGlb: false,
    description: "Full jester costume body tint — pairs with jester_hat",
    bodyTint: "#4a0a28",
    layerScale: 1.25,
  },
  {
    id: "holographic-sneakers-gold",
    label: "Gold Holographic Kicks",
    icon: "👟",
    accent: "#FFD700",
    slot: "feet",
    socketId: "socket_foot_r",
    pointsCost: 99,
    rarity: "common",
    inventoryCategory: "accessories",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Flex footwear SKU — foot socket planes",
  },
];

const CORE_IDS = new Set(FAN_COSMETIC_CATALOG.map((c) => c.id));

export function lobbyPropAsCosmetic(prop: LobbyPropDef): FanCosmeticDef {
  const isHold = prop.effect === "hold";
  return {
    id: prop.id,
    label: prop.label,
    icon: prop.icon,
    accent: prop.accent,
    slot: isHold ? "hand" : "emote",
    socketId: isHold ? "socket_primary_hand" : "socket_chest",
    pointsCost: prop.minTier === "free" ? 0 : prop.minTier === "pro" ? 100 : 300,
    rarity: prop.minTier === "gold" ? "epic" : prop.minTier === "pro" ? "rare" : "free",
    inventoryCategory: isHold ? "props" : "emotes",
    equipSlot: isHold ? "prop" : "accessory",
    certifiedGlb: false,
    description: `Lobby tray item · ${prop.effect}`,
    animKind: isHold ? "hold_bob" : "none",
  };
}

export function getUnifiedFanCosmeticCatalog(): FanCosmeticDef[] {
  const extras = LOBBY_INVENTORY_PROPS.filter((p) => !CORE_IDS.has(p.id)).map(lobbyPropAsCosmetic);
  return [...FAN_COSMETIC_CATALOG, ...extras];
}

export function getFanCosmetic(id: string): FanCosmeticDef | undefined {
  return getUnifiedFanCosmeticCatalog().find((c) => c.id === id);
}

export function listFanCosmeticsBySlot(slot: FanCosmeticSlot): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === slot);
}

export function listEquippableCostumes(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === "outfit");
}

export function listEquippableProps(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === "hand" || c.equipSlot === "prop");
}

export function listEquippableAccessories(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter(
    (c) => c.slot === "head" || c.slot === "face" || c.slot === "chest" || c.slot === "feet",
  );
}

/** Resolve forge outfit label → catalog SKU. */
export const FORGE_OUTFIT_TO_SKU: Record<string, string> = {
  "Street Fit": "street_fit",
  "Arena Captain": "arena_captain",
  "Studio Coder": "cyber-jacket-neon",
  "Royal Stage": "royal_stage",
};

export const FORGE_ACCESSORY_TO_SKU: Record<string, string> = {
  "Gold Chain": "gold_chain",
  "Retro Glasses": "sunglasses",
  "Face Stripe": "sunglasses",
  "Ear Monitors": "mic",
};

export const FORGE_PROP_TO_SKU: Record<string, string> = {
  "Neon Mic": "mic",
  "Laptop Rig": "sparkler",
  Turntable: "glow_stick",
  "Holo Flag": "jester_hat",
};
