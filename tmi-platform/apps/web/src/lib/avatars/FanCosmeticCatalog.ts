/**
 * FanCosmeticCatalog — single ID scheme for tray + inventory + forge + Fan Store.
 * 3D Avatar Runtime v0: sprites/planes/primitives on sockets. certifiedGlb always false.
 * Playlist skins stay in PlaylistArtifactEngine (Rule 19) — never mixed here.
 * SKU ids stable for later GLB swap (same id → mesh when certified).
 * Colorways = separate SKUs for monetization (Rule 20 honest pricing).
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
  | "feet"
  | "skin"
  | "instrument";

/** Drives AvatarSocketAttachment / LobbyPropEffectLayer animation kind. */
export type PropAnimKind =
  | "none"
  | "flame_flicker"
  | "sparkler_burst"
  | "candle_glow"
  | "mic_pulse"
  | "glow_pulse"
  | "hold_bob"
  | "cannon_burst"
  | "instrument_strum"
  | "heart_float";

export type FanInventoryCategory =
  | "hats"
  | "glasses"
  | "props"
  | "accessories"
  | "emotes"
  | "outfits"
  | "jackets"
  | "jewelry"
  | "mic-skins"
  | "hair"
  | "headphones"
  | "clothing"
  | "shoes"
  | "instruments"
  | "skin"
  | "vfx";

export interface FanCosmeticDef {
  id: string;
  label: string;
  icon: string;
  accent: string;
  slot: FanCosmeticSlot;
  socketId: AvatarSocketId;
  pointsCost: number;
  rarity: FanCosmeticRarity;
  inventoryCategory: FanInventoryCategory;
  equipSlot: "accessory" | "prop" | "outfit" | "hair" | "skin" | "instrument" | "emote";
  plateUrl?: string;
  certifiedGlb: false;
  description: string;
  /** Outfit: tint AvatarRig body capsule. */
  bodyTint?: string;
  /** Hair mesh tint for AvatarRig head/hair cap. */
  hairTint?: string;
  /** Skin override hex when equipSlot=skin (continuous picker also uses continuum). */
  skinHex?: string;
  layerScale?: number;
  animKind?: PropAnimKind;
  ambientDelta?: number;
  /** Stripe product id when cash path exists — null = points-only / honest disabled cash. */
  stripeProductId?: string | null;
  /** Parent style id for colorway SKUs (e.g. tee_basic → tee_basic_cyan). */
  colorwayOf?: string;
  /** USD cents hint for Stripe QuickBuy when product wired; null = points only. */
  usdCents?: number | null;
}

type Colorway = { slug: string; label: string; hex: string; cost: number; rarity: FanCosmeticRarity };

const TEE_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#111111", cost: 0, rarity: "free" },
  { slug: "white", label: "White", hex: "#F0F0F0", cost: 50, rarity: "common" },
  { slug: "cyan", label: "Cyan", hex: "#00FFFF", cost: 99, rarity: "common" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 99, rarity: "common" },
  { slug: "gold", label: "Gold", hex: "#FFD700", cost: 149, rarity: "rare" },
  { slug: "purple", label: "Purple", hex: "#AA2DFF", cost: 99, rarity: "common" },
  { slug: "red", label: "Red", hex: "#CC2222", cost: 99, rarity: "common" },
  { slug: "navy", label: "Navy", hex: "#0A0A40", cost: 50, rarity: "common" },
];

const JACKET_COLORWAYS: Colorway[] = [
  { slug: "leather", label: "Leather", hex: "#1a0a08", cost: 199, rarity: "rare" },
  { slug: "neon", label: "Neon Cyan", hex: "#0a3d4a", cost: 299, rarity: "epic" },
  { slug: "vice", label: "Vice Pink", hex: "#4a1040", cost: 299, rarity: "epic" },
  { slug: "gold", label: "Gold Foil", hex: "#3a2a08", cost: 399, rarity: "legendary" },
];

const PANTS_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#0d0d12", cost: 0, rarity: "free" },
  { slug: "denim", label: "Denim", hex: "#1e3a5f", cost: 80, rarity: "common" },
  { slug: "camo", label: "Camo", hex: "#2a3a22", cost: 120, rarity: "rare" },
  { slug: "neon", label: "Neon", hex: "#003322", cost: 150, rarity: "rare" },
];

const SHOE_COLORWAYS: Colorway[] = [
  { slug: "white", label: "White", hex: "#EEEEEE", cost: 0, rarity: "free" },
  { slug: "black", label: "Black", hex: "#111111", cost: 60, rarity: "common" },
  { slug: "gold", label: "Gold Holo", hex: "#FFD700", cost: 99, rarity: "common" },
  { slug: "cyan", label: "Cyan Glow", hex: "#00E5FF", cost: 120, rarity: "rare" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 120, rarity: "rare" },
];

const GLASS_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#111111", cost: 0, rarity: "free" },
  { slug: "cyan", label: "Cyan", hex: "#00FFFF", cost: 200, rarity: "common" },
  { slug: "gold", label: "Gold", hex: "#FFD700", cost: 250, rarity: "rare" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 220, rarity: "rare" },
  { slug: "mirror", label: "Mirror", hex: "#C0C8D0", cost: 280, rarity: "epic" },
  { slug: "vip", label: "VIP Green", hex: "#00FF88", cost: 199, rarity: "rare" },
];

function colorwaySku(
  base: Omit<FanCosmeticDef, "id" | "label" | "accent" | "pointsCost" | "rarity" | "bodyTint" | "certifiedGlb" | "colorwayOf"> & {
    idBase: string;
    labelBase: string;
    icon: string;
  },
  cw: Colorway,
  tintKey: "bodyTint" | "accentOnly" = "bodyTint",
): FanCosmeticDef {
  return {
    id: `${base.idBase}_${cw.slug}`,
    label: `${base.labelBase} · ${cw.label}`,
    icon: base.icon,
    accent: cw.hex,
    slot: base.slot,
    socketId: base.socketId,
    pointsCost: cw.cost,
    rarity: cw.rarity,
    inventoryCategory: base.inventoryCategory,
    equipSlot: base.equipSlot,
    certifiedGlb: false,
    description: `${base.description} · colorway ${cw.label} (separate SKU)`,
    bodyTint: tintKey === "bodyTint" ? cw.hex : base.bodyTint,
    layerScale: base.layerScale,
    animKind: base.animKind,
    ambientDelta: base.ambientDelta,
    stripeProductId: null,
    usdCents: null,
    colorwayOf: base.idBase,
    hairTint: base.hairTint,
    skinHex: base.skinHex,
  };
}

/** Global skin continuum — Fan adjusts shade; not discrete race labels. */
export interface FanSkinToneStop {
  id: string;
  label: string;
  hex: string;
  /** 0–1 position on continuum graph/slider */
  t: number;
}

export const FAN_SKIN_TONE_CONTINUUM: FanSkinToneStop[] = [
  { id: "porcelain", label: "Porcelain", hex: "#FDE8D8", t: 0 },
  { id: "ivory", label: "Ivory", hex: "#FDDBB4", t: 0.08 },
  { id: "fair", label: "Fair", hex: "#F5CBA7", t: 0.16 },
  { id: "light", label: "Light", hex: "#F0C895", t: 0.24 },
  { id: "light-medium", label: "Light Medium", hex: "#E8A87C", t: 0.32 },
  { id: "medium", label: "Medium", hex: "#C68642", t: 0.42 },
  { id: "tan", label: "Tan", hex: "#A0613A", t: 0.52 },
  { id: "brown", label: "Brown", hex: "#7C4019", t: 0.62 },
  { id: "deep", label: "Deep", hex: "#5C3317", t: 0.72 },
  { id: "dark", label: "Dark", hex: "#4A2010", t: 0.82 },
  { id: "ebony", label: "Ebony", hex: "#3B1A00", t: 0.92 },
  { id: "deepest", label: "Deepest", hex: "#2A1208", t: 1 },
];

export const FAN_SKIN_STORAGE_KEY = "tmi_fan_skin_tone_t";

/** Interpolate continuum by t ∈ [0,1] for slider/graph. */
export function sampleFanSkinTone(t: number): FanSkinToneStop {
  const clamped = Math.min(1, Math.max(0, t));
  const stops = FAN_SKIN_TONE_CONTINUUM;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    if (clamped >= a.t && clamped <= b.t) {
      const u = (clamped - a.t) / Math.max(0.0001, b.t - a.t);
      return {
        id: `blend-${a.id}-${b.id}`,
        label: u < 0.5 ? a.label : b.label,
        hex: lerpHex(a.hex, b.hex, u),
        t: clamped,
      };
    }
  }
  return stops[stops.length - 1]!;
}

function lerpHex(a: string, b: string, u: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255,
    ag = (pa >> 8) & 255,
    ab = pa & 255;
  const br = (pb >> 16) & 255,
    bg = (pb >> 8) & 255,
    bb = pb & 255;
  const r = Math.round(ar + (br - ar) * u);
  const g = Math.round(ag + (bg - ag) * u);
  const bl = Math.round(ab + (bb - ab) * u);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

export function readPersistedFanSkinT(): number {
  if (typeof window === "undefined") return 0.42;
  try {
    const raw = window.sessionStorage.getItem(FAN_SKIN_STORAGE_KEY);
    if (raw == null) return 0.42;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.42;
  } catch {
    return 0.42;
  }
}

export function persistFanSkinT(t: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FAN_SKIN_STORAGE_KEY, String(Math.min(1, Math.max(0, t))));
  } catch {
    /* ignore */
  }
}

const HAIR_STYLES: Array<{ id: string; label: string; icon: string; cost: number; rarity: FanCosmeticRarity; tint: string }> = [
  { id: "hair_fade_short", label: "Short Fade", icon: "💇", cost: 0, rarity: "free", tint: "#111111" },
  { id: "hair_afro", label: "Afro", icon: "🌀", cost: 120, rarity: "common", tint: "#1a0a00" },
  { id: "hair_locs", label: "Locs", icon: "🪢", cost: 150, rarity: "common", tint: "#2a1500" },
  { id: "hair_braids", label: "Braids", icon: "🎀", cost: 150, rarity: "common", tint: "#111111" },
  { id: "hair_curls", label: "Curls", icon: "💫", cost: 100, rarity: "common", tint: "#3d2000" },
  { id: "hair_buzz", label: "Buzz", icon: "✂️", cost: 0, rarity: "free", tint: "#0a0a0a" },
  { id: "hair_ponytail", label: "Ponytail", icon: "🏇", cost: 80, rarity: "common", tint: "#6B3A2A" },
  { id: "hair_mohawk", label: "Mohawk", icon: "🦅", cost: 200, rarity: "rare", tint: "#111111" },
  { id: "hair_undercut", label: "Undercut", icon: "🔪", cost: 100, rarity: "common", tint: "#111111" },
  { id: "hair_waves", label: "Waves", icon: "🌊", cost: 130, rarity: "common", tint: "#1a0a00" },
  { id: "hair_blonde_bob", label: "Blonde Bob", icon: "👱", cost: 180, rarity: "rare", tint: "#D4A843" },
  { id: "hair_neon_spikes", label: "Neon Spikes", icon: "⚡", cost: 250, rarity: "epic", tint: "#00FFFF" },
  { id: "hair_fuchsia_bangs", label: "Fuchsia Bangs", icon: "💗", cost: 250, rarity: "epic", tint: "#FF2DAA" },
  { id: "hair_silver", label: "Silver Flow", icon: "🩶", cost: 220, rarity: "rare", tint: "#B0B0C0" },
  { id: "hair_dreads_long", label: "Long Dreads", icon: "🎸", cost: 160, rarity: "common", tint: "#2a1500" },
  { id: "hair_topknot", label: "Top Knot", icon: "🥋", cost: 90, rarity: "common", tint: "#111111" },
];

const CORE_PROPS: FanCosmeticDef[] = [
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
    stripeProductId: null,
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
    description: "Starter mic with pulse glow",
    animKind: "mic_pulse",
    ambientDelta: 0.08,
    stripeProductId: null,
  },
  {
    id: "mic_gold",
    label: "Gold Mic",
    icon: "🎤",
    accent: "#FFD700",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 220,
    rarity: "rare",
    inventoryCategory: "mic-skins",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Gold mic skin — colorway SKU",
    animKind: "mic_pulse",
    ambientDelta: 0.1,
    colorwayOf: "mic",
    stripeProductId: null,
  },
  {
    id: "mic_fuchsia",
    label: "Fuchsia Mic",
    icon: "🎤",
    accent: "#FF2DAA",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 220,
    rarity: "rare",
    inventoryCategory: "mic-skins",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Fuchsia mic skin — colorway SKU",
    animKind: "mic_pulse",
    colorwayOf: "mic",
    stripeProductId: null,
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
    stripeProductId: null,
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
    description: "Soft candle glow",
    animKind: "candle_glow",
    ambientDelta: 0.2,
    stripeProductId: null,
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
    stripeProductId: null,
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
    description: "Crowd foam finger",
    animKind: "hold_bob",
    stripeProductId: null,
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
    description: "Rose hold",
    animKind: "hold_bob",
    ambientDelta: -0.1,
    stripeProductId: null,
  },
  {
    id: "heart_prop",
    label: "Heart Prop",
    icon: "❤️",
    accent: "#FF2DAA",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 80,
    rarity: "common",
    inventoryCategory: "vfx",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Floating heart VFX holdable",
    animKind: "heart_float",
    ambientDelta: 0.12,
    stripeProductId: null,
  },
  {
    id: "flame_burst",
    label: "Flame Burst",
    icon: "🔥",
    accent: "#FF4500",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 180,
    rarity: "rare",
    inventoryCategory: "vfx",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Crowd flame VFX",
    animKind: "flame_flicker",
    ambientDelta: 0.4,
    stripeProductId: null,
  },
  {
    id: "money_cannon",
    label: "Money Cannon",
    icon: "💸",
    accent: "#00FF88",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 350,
    rarity: "epic",
    inventoryCategory: "vfx",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Shoots cash burst into venue — procedural VFX (no GLB yet)",
    animKind: "cannon_burst",
    ambientDelta: 0.25,
    stripeProductId: null,
    usdCents: null,
  },
  {
    id: "sky_cannon",
    label: "Sky Cannon",
    icon: "🎆",
    accent: "#FFD700",
    slot: "hand",
    socketId: "socket_primary_hand",
    pointsCost: 400,
    rarity: "legendary",
    inventoryCategory: "vfx",
    equipSlot: "prop",
    certifiedGlb: false,
    description: "Sky firework cannon into venue atmosphere",
    animKind: "cannon_burst",
    ambientDelta: 0.45,
    stripeProductId: null,
    usdCents: null,
  },
];

const CORE_ACCESSORIES: FanCosmeticDef[] = [
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
    description: "Jester costume hat",
    layerScale: 1.15,
    stripeProductId: null,
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
    description: "Crown hat",
    layerScale: 1.2,
    stripeProductId: null,
  },
  {
    id: "backwards_cap",
    label: "Backwards Cap",
    icon: "🧢",
    accent: "#111111",
    slot: "head",
    socketId: "socket_head",
    pointsCost: 0,
    rarity: "free",
    inventoryCategory: "hats",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Urban headwear",
    layerScale: 1.1,
    stripeProductId: null,
  },
  {
    id: "street_beanie",
    label: "Street Beanie",
    icon: "🧶",
    accent: "#222222",
    slot: "head",
    socketId: "socket_head",
    pointsCost: 0,
    rarity: "free",
    inventoryCategory: "hats",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Street beanie",
    layerScale: 1.12,
    stripeProductId: null,
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
    description: "Chest chain",
    stripeProductId: null,
  },
  {
    id: "neck_headphones",
    label: "Neck Headphones",
    icon: "🎧",
    accent: "#00E5FF",
    slot: "chest",
    socketId: "socket_chest",
    pointsCost: 150,
    rarity: "common",
    inventoryCategory: "headphones",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Neck headphones",
    stripeProductId: null,
  },
  {
    id: "studio_headset",
    label: "Studio Headset",
    icon: "🎧",
    accent: "#AA2DFF",
    slot: "head",
    socketId: "socket_head",
    pointsCost: 220,
    rarity: "rare",
    inventoryCategory: "headphones",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Over-ear studio headset — head socket",
    layerScale: 1.18,
    stripeProductId: null,
  },
  {
    id: "dj_cans_gold",
    label: "DJ Cans · Gold",
    icon: "🎧",
    accent: "#FFD700",
    slot: "head",
    socketId: "socket_head",
    pointsCost: 280,
    rarity: "epic",
    inventoryCategory: "headphones",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Gold DJ cans colorway",
    colorwayOf: "studio_headset",
    stripeProductId: null,
  },
];

const INSTRUMENTS: FanCosmeticDef[] = [
  {
    id: "inst_acoustic_guitar",
    label: "Acoustic Guitar",
    icon: "🎸",
    accent: "#C68642",
    slot: "instrument",
    socketId: "socket_primary_hand",
    pointsCost: 250,
    rarity: "rare",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Fan lobby camp-band guitar — play together (procedural socket)",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_electric_guitar",
    label: "Electric Guitar",
    icon: "🎸",
    accent: "#00FFFF",
    slot: "instrument",
    socketId: "socket_primary_hand",
    pointsCost: 350,
    rarity: "epic",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Electric guitar for Fan lobby jam circles",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_bass",
    label: "Bass",
    icon: "🎸",
    accent: "#AA2DFF",
    slot: "instrument",
    socketId: "socket_primary_hand",
    pointsCost: 300,
    rarity: "epic",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Bass for Fan social band",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_drums",
    label: "Hand Drums",
    icon: "🥁",
    accent: "#FF6600",
    slot: "instrument",
    socketId: "socket_secondary_hand",
    pointsCost: 280,
    rarity: "rare",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Drums for Fan lobby camp band",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_keys",
    label: "Keys / Synth",
    icon: "🎹",
    accent: "#FF2DAA",
    slot: "instrument",
    socketId: "socket_chest",
    pointsCost: 320,
    rarity: "epic",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Synth keys for lobby jam",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_sax",
    label: "Sax",
    icon: "🎷",
    accent: "#FFD700",
    slot: "instrument",
    socketId: "socket_primary_hand",
    pointsCost: 340,
    rarity: "epic",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Sax for Fan social band",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_trumpet",
    label: "Trumpet",
    icon: "🎺",
    accent: "#FFD700",
    slot: "instrument",
    socketId: "socket_primary_hand",
    pointsCost: 300,
    rarity: "rare",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Trumpet for lobby jam",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
  {
    id: "inst_ukulele",
    label: "Ukulele",
    icon: "🪕",
    accent: "#F0C895",
    slot: "instrument",
    socketId: "socket_primary_hand",
    pointsCost: 180,
    rarity: "common",
    inventoryCategory: "instruments",
    equipSlot: "instrument",
    certifiedGlb: false,
    description: "Ukulele — chill lobby circle",
    animKind: "instrument_strum",
    stripeProductId: null,
  },
];

const EMOTES: FanCosmeticDef[] = [
  { id: "emote_wave", label: "Wave", icon: "👋", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Wave emote — EmoteEngine", stripeProductId: null },
  { id: "emote_clap", label: "Clap", icon: "👏", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Clap emote", stripeProductId: null },
  { id: "emote_dance", label: "Dance", icon: "💃", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Base dance emote", stripeProductId: null },
  { id: "emote_dance_hiphop", label: "Hip-Hop Dance", icon: "🕺", accent: "#AA2DFF", slot: "emote", socketId: "socket_chest", pointsCost: 120, rarity: "common", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Hip-hop dance emote", stripeProductId: null },
  { id: "emote_dance_wave", label: "Wave Dance", icon: "🌊", accent: "#00E5FF", slot: "emote", socketId: "socket_chest", pointsCost: 120, rarity: "common", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Wave dance emote", stripeProductId: null },
  { id: "emote_dance_robot", label: "Robot Dance", icon: "🤖", accent: "#00FF88", slot: "emote", socketId: "socket_chest", pointsCost: 150, rarity: "rare", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Robot dance", stripeProductId: null },
  { id: "emote_dance_shuffle", label: "Shuffle", icon: "👟", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 150, rarity: "rare", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Shuffle dance", stripeProductId: null },
  { id: "emote_dance_spin", label: "Spin Out", icon: "🌀", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 180, rarity: "rare", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Spin dance", stripeProductId: null },
  { id: "emote_jump", label: "Jump", icon: "🦘", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Jump emote", stripeProductId: null },
  { id: "emote_heart", label: "Heart", icon: "❤️", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 50, rarity: "common", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Heart emote", stripeProductId: null },
  { id: "emote_encore", label: "Encore", icon: "🙌", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 80, rarity: "common", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Encore cheer", stripeProductId: null },
  { id: "emote_headbang", label: "Headbang", icon: "🤘", accent: "#FF6600", slot: "emote", socketId: "socket_chest", pointsCost: 140, rarity: "rare", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Headbang dance", stripeProductId: null },
  { id: "emote_cheer", label: "Cheer", icon: "📣", accent: "#00FF88", slot: "emote", socketId: "socket_chest", pointsCost: 60, rarity: "common", inventoryCategory: "emotes", equipSlot: "emote", certifiedGlb: false, description: "Cheer emote", stripeProductId: null },
];

const LEGACY_OUTFITS: FanCosmeticDef[] = [
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
    description: "Neon body tint + chest plate",
    bodyTint: "#0a3d4a",
    layerScale: 1.3,
    stripeProductId: null,
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
    stripeProductId: null,
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
    description: "Arena costume",
    bodyTint: "#3a2a08",
    stripeProductId: null,
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
    description: "Royal stage costume",
    bodyTint: "#4a1040",
    stripeProductId: null,
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
    description: "Full jester costume",
    bodyTint: "#4a0a28",
    layerScale: 1.25,
    stripeProductId: null,
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
    inventoryCategory: "shoes",
    equipSlot: "accessory",
    certifiedGlb: false,
    description: "Flex footwear",
    stripeProductId: null,
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
    description: "Face shades",
    stripeProductId: null,
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
    description: "VIP shades",
    stripeProductId: null,
  },
];

function buildHairCatalog(): FanCosmeticDef[] {
  return HAIR_STYLES.map((h) => ({
    id: h.id,
    label: h.label,
    icon: h.icon,
    accent: h.tint,
    slot: "hair" as const,
    socketId: "socket_head" as const,
    pointsCost: h.cost,
    rarity: h.rarity,
    inventoryCategory: "hair" as const,
    equipSlot: "hair" as const,
    certifiedGlb: false as const,
    description: `Hairstyle · ${h.label} — AvatarRig hair tint`,
    hairTint: h.tint,
    layerScale: 1.05,
    stripeProductId: null,
  }));
}

function buildGlassColorways(): FanCosmeticDef[] {
  return GLASS_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "glasses",
        labelBase: "Glasses",
        icon: "👓",
        slot: "face",
        socketId: "socket_face",
        inventoryCategory: "glasses",
        equipSlot: "accessory",
        description: "Eyewear colorway",
        layerScale: 1,
      },
      cw,
      "accentOnly",
    ),
  );
}

function buildClothingColorways(): FanCosmeticDef[] {
  const tees = TEE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "tee_basic",
        labelBase: "Basic Tee",
        icon: "👕",
        slot: "outfit",
        socketId: "socket_chest",
        inventoryCategory: "clothing",
        equipSlot: "outfit",
        description: "Shirt colorway",
        layerScale: 1.05,
      },
      cw,
    ),
  );
  const jackets = JACKET_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "jacket_street",
        labelBase: "Street Jacket",
        icon: "🧥",
        slot: "outfit",
        socketId: "socket_chest",
        inventoryCategory: "jackets",
        equipSlot: "outfit",
        description: "Jacket colorway",
        layerScale: 1.2,
      },
      cw,
    ),
  );
  const pants = PANTS_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "pants_fit",
        labelBase: "Fit Pants",
        icon: "👖",
        slot: "waist",
        socketId: "socket_waist",
        inventoryCategory: "clothing",
        equipSlot: "outfit",
        description: "Pants colorway (waist socket tint hint)",
        layerScale: 1.05,
      },
      cw,
    ),
  );
  const shoes = SHOE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "kicks",
        labelBase: "Kicks",
        icon: "👟",
        slot: "feet",
        socketId: "socket_foot_r",
        inventoryCategory: "shoes",
        equipSlot: "accessory",
        description: "Shoe colorway",
        layerScale: 1,
      },
      cw,
      "accentOnly",
    ),
  );
  return [...tees, ...jackets, ...pants, ...shoes];
}

/** Core battle/cypher/lobby SKUs + expanded Fan economy. */
export const FAN_COSMETIC_CATALOG: FanCosmeticDef[] = [
  ...CORE_PROPS,
  ...CORE_ACCESSORIES,
  ...LEGACY_OUTFITS,
  ...buildHairCatalog(),
  ...buildGlassColorways(),
  ...buildClothingColorways(),
  ...INSTRUMENTS,
  ...EMOTES,
];

const CORE_IDS = new Set(FAN_COSMETIC_CATALOG.map((c) => c.id));

export function lobbyPropAsCosmetic(prop: LobbyPropDef): FanCosmeticDef {
  const isHold = prop.effect === "hold";
  const isInstrument = prop.id.startsWith("inst_");
  return {
    id: prop.id,
    label: prop.label,
    icon: prop.icon,
    accent: prop.accent,
    slot: isInstrument ? "instrument" : isHold ? "hand" : "emote",
    socketId: isHold || isInstrument ? "socket_primary_hand" : "socket_chest",
    pointsCost: prop.minTier === "free" ? 0 : prop.minTier === "pro" ? 100 : 300,
    rarity: prop.minTier === "gold" ? "epic" : prop.minTier === "pro" ? "rare" : "free",
    inventoryCategory: isInstrument ? "instruments" : isHold ? "props" : "emotes",
    equipSlot: isInstrument ? "instrument" : isHold ? "prop" : "emote",
    certifiedGlb: false,
    description: `Lobby tray item · ${prop.effect}`,
    animKind: isInstrument ? "instrument_strum" : isHold ? "hold_bob" : "none",
    stripeProductId: null,
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

export function listFanCosmeticsByCategory(cat: FanInventoryCategory): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.inventoryCategory === cat);
}

export function listEquippableCostumes(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === "outfit" || c.equipSlot === "outfit");
}

export function listEquippableProps(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === "hand" || c.equipSlot === "prop");
}

export function listEquippableAccessories(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter(
    (c) => c.slot === "head" || c.slot === "face" || c.slot === "chest" || c.slot === "feet",
  );
}

export function listEquippableHair(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === "hair" || c.equipSlot === "hair");
}

export function listEquippableInstruments(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.equipSlot === "instrument" || c.slot === "instrument");
}

export function listEquippableEmotes(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === "emote" || c.equipSlot === "emote");
}

/** Catalog size snapshot for assembly directors / store HUD. */
export function getFanCosmeticCatalogStats() {
  const all = getUnifiedFanCosmeticCatalog();
  const count = (pred: (c: FanCosmeticDef) => boolean) => all.filter(pred).length;
  return {
    total: all.length,
    hair: count((c) => c.inventoryCategory === "hair"),
    glasses: count((c) => c.inventoryCategory === "glasses"),
    clothing: count((c) => c.inventoryCategory === "clothing" || c.inventoryCategory === "jackets" || c.inventoryCategory === "outfits"),
    shoes: count((c) => c.inventoryCategory === "shoes"),
    headphones: count((c) => c.inventoryCategory === "headphones"),
    mics: count((c) => c.inventoryCategory === "mic-skins"),
    emotes: count((c) => c.inventoryCategory === "emotes"),
    props: count((c) => c.inventoryCategory === "props" || c.inventoryCategory === "vfx"),
    instruments: count((c) => c.inventoryCategory === "instruments"),
    skinStops: FAN_SKIN_TONE_CONTINUUM.length,
    colorwaySkus: count((c) => Boolean(c.colorwayOf)),
    stripeWired: count((c) => Boolean(c.stripeProductId)),
  };
}

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
