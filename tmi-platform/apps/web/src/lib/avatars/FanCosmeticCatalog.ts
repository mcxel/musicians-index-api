/**
 * FanCosmeticCatalog — single expandable ID scheme for tray + inventory + forge + Fan Store.
 * 3D Avatar Runtime v0: sprites/planes/primitives on sockets. certifiedGlb true only via AvatarGlbRegistry.
 * Playlist skins stay in PlaylistArtifactEngine (Rule 19) — never mixed here.
 * SKU ids stable for later GLB swap (same id → mesh when certified).
 * Colorways = separate SKUs for monetization (Rule 20 honest pricing).
 * Dance Emotes = AvatarRig body animation · Action Emotes = VFX reaction (cooldown + perf budget).
 * Ownership = CosmeticEntitlement via avatarPersistence.grantAvatarCosmetic (no parallel ledger).
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
  | "instrument"
  | "aura"
  | "entrance";

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
  | "heart_float"
  | "lightning_strike"
  | "smoke_haze"
  | "confetti_burst"
  | "neon_burst"
  | "coin_toss"
  | "mic_drop"
  | "aura_pulse"
  | "entrance_trail";

export type CosmeticCapability = "HELD" | "PLACED" | "ANIMATED" | "INTERACTIVE";

/** Dance = body anim on AvatarRig · Action = button-launched VFX · Gesture = short hand/face. */
export type EmoteKind = "dance" | "action" | "gesture";

export type CosmeticEntitlementKind = "free" | "owned" | "points" | "tier" | "season";

/** Store rail filters on /store/fan — Rule 14 every filter resolves to real SKUs or honest empty. */
export type FanStoreFilterId =
  | "NEW"
  | "FEATURED"
  | "HAIR"
  | "HEADWEAR"
  | "EYEWEAR"
  | "TOPS"
  | "BOTTOMS"
  | "OUTFITS"
  | "SHOES"
  | "JEWELRY"
  | "ACCESSORIES"
  | "INSTRUMENTS"
  | "PROPS"
  | "DANCES"
  | "EMOTES"
  | "ACTION_EMOTES"
  | "AURAS"
  | "ENTRANCES"
  | "SETS"
  | "LEGENDARY";

export const FAN_STORE_FILTERS: { id: FanStoreFilterId; label: string }[] = [
  { id: "NEW", label: "NEW" },
  { id: "FEATURED", label: "FEATURED" },
  { id: "HAIR", label: "HAIR" },
  { id: "HEADWEAR", label: "HEADWEAR" },
  { id: "EYEWEAR", label: "EYEWEAR" },
  { id: "TOPS", label: "TOPS" },
  { id: "BOTTOMS", label: "BOTTOMS" },
  { id: "OUTFITS", label: "OUTFITS" },
  { id: "SHOES", label: "SHOES" },
  { id: "JEWELRY", label: "JEWELRY" },
  { id: "ACCESSORIES", label: "ACCESSORIES" },
  { id: "INSTRUMENTS", label: "INSTRUMENTS" },
  { id: "PROPS", label: "PROPS" },
  { id: "DANCES", label: "DANCES" },
  { id: "EMOTES", label: "EMOTES" },
  { id: "ACTION_EMOTES", label: "ACTION EMOTES" },
  { id: "AURAS", label: "AURAS" },
  { id: "ENTRANCES", label: "ENTRANCES" },
  { id: "SETS", label: "SETS" },
  { id: "LEGENDARY", label: "LEGENDARY" },
];

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
  | "tops"
  | "bottoms"
  | "shoes"
  | "instruments"
  | "skin"
  | "vfx"
  | "action-emotes"
  | "dances"
  | "gestures"
  | "auras"
  | "entrances"
  | "sets";

export interface FanCosmeticPrice {
  points: number;
  /** null / omitted = Stripe N/A (Rule 20 honesty) */
  stripeProductId?: string | null;
}

/**
 * Canonical ownership row — persist with account via grantAvatarCosmetic / AvatarInventory.
 * Do not invent a parallel ownership store.
 */
export interface CosmeticEntitlement {
  userId: string;
  cosmeticId: string;
  grantedAt: number;
  source: "starter" | "points" | "grant" | "stripe";
  owned: true;
}

export interface FanCosmeticDef {
  id: string;
  label: string;
  icon: string;
  accent: string;
  /** Schema category (normalized from inventoryCategory when omitted on seed). */
  category?: FanInventoryCategory;
  slot: FanCosmeticSlot;
  /** Socket attachment point (legacy name kept for consumers). */
  socketId: AvatarSocketId;
  /** Schema alias of socketId — filled by normalizeFanCosmetic. */
  rigAnchor?: AvatarSocketId;
  pointsCost: number;
  rarity: FanCosmeticRarity;
  inventoryCategory: FanInventoryCategory;
  equipSlot: "accessory" | "prop" | "outfit" | "hair" | "skin" | "instrument" | "emote" | "aura" | "entrance";
  plateUrl?: string;
  /** True only when a QA'd GLB exists in AvatarGlbRegistry — catalog seeds stay false. */
  certifiedGlb: boolean;
  /** Optional public GLB path when certifiedGlb (see AvatarGlbRegistry). */
  glbUrl?: string | null;
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
  /** AvatarRig animation clip id (dance/gesture stubs OK as procedural bounce). */
  animationId?: string;
  /** VFX / particle effect id for Action Emotes. */
  effectId?: string;
  /** Embedded colorway metadata for AI-assisted expandColorways (published SKUs stay separate). */
  colorways?: Colorway[];
  price?: FanCosmeticPrice;
  entitlement?: CosmeticEntitlementKind;
  season?: string;
  compatibleAvatarRig?: "AvatarRig_v0" | "bobblehead_v0";
  collisionProfile?: string;
  /** 0–10 FPS budget weight; auras/action stricter (mass-fire throttle). */
  performanceCost?: number;
  /** Allow curated AI variant factory — never auto-publish junk. */
  AIExpansionAllowed?: boolean;
  capability?: CosmeticCapability;
  emoteKind?: EmoteKind;
  durationMs?: number;
  cooldownMs?: number;
  visibilityRadius?: number;
  /** Curated publish gate — starter set defaults true. */
  published?: boolean;
  featured?: boolean;
  isNew?: boolean;
  storeFilters?: FanStoreFilterId[];
}

type Colorway = { slug: string; label: string; hex: string; cost: number; rarity: FanCosmeticRarity };

/** Multi-channel tint palette for material-mask variant factory. */
export const MATERIAL_TINT_MASKS: Colorway[] = [
  { slug: "neon_acid", label: "Neon Acid Green", hex: "#B8FF00", cost: 149, rarity: "rare" },
  { slug: "midnight_obsidian", label: "Midnight Obsidian", hex: "#0A0A12", cost: 99, rarity: "common" },
  { slug: "gold_chrome", label: "Gold Chrome", hex: "#FFD700", cost: 199, rarity: "epic" },
  { slug: "sunset_pink", label: "Sunset Pink", hex: "#FF6B9D", cost: 149, rarity: "rare" },
  { slug: "electric_cyan", label: "Electric Cyan", hex: "#00FFFF", cost: 149, rarity: "rare" },
  { slug: "vice_fuchsia", label: "Vice Fuchsia", hex: "#FF2DAA", cost: 149, rarity: "rare" },
  { slug: "royal_purple", label: "Royal Purple", hex: "#AA2DFF", cost: 129, rarity: "common" },
  { slug: "blood_red", label: "Blood Red", hex: "#CC2222", cost: 99, rarity: "common" },
  { slug: "arctic_white", label: "Arctic White", hex: "#F0F0F0", cost: 50, rarity: "common" },
  { slug: "void_navy", label: "Void Navy", hex: "#0A0A40", cost: 50, rarity: "common" },
];

const TEE_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#111111", cost: 0, rarity: "free" },
  { slug: "white", label: "White", hex: "#F0F0F0", cost: 50, rarity: "common" },
  { slug: "cyan", label: "Cyan", hex: "#00FFFF", cost: 99, rarity: "common" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 99, rarity: "common" },
  { slug: "gold", label: "Gold", hex: "#FFD700", cost: 149, rarity: "rare" },
  { slug: "purple", label: "Purple", hex: "#AA2DFF", cost: 99, rarity: "common" },
  { slug: "red", label: "Red", hex: "#CC2222", cost: 99, rarity: "common" },
  { slug: "navy", label: "Navy", hex: "#0A0A40", cost: 50, rarity: "common" },
  ...MATERIAL_TINT_MASKS.filter((m) => !["black", "white", "cyan", "fuchsia", "gold", "purple", "red", "navy"].includes(m.slug)),
];

const JACKET_COLORWAYS: Colorway[] = [
  { slug: "leather", label: "Leather", hex: "#1a0a08", cost: 199, rarity: "rare" },
  { slug: "neon", label: "Neon Cyan", hex: "#0a3d4a", cost: 299, rarity: "epic" },
  { slug: "vice", label: "Vice Pink", hex: "#4a1040", cost: 299, rarity: "epic" },
  { slug: "gold", label: "Gold Foil", hex: "#3a2a08", cost: 399, rarity: "legendary" },
  { slug: "neon_acid", label: "Neon Acid Green", hex: "#1a2a08", cost: 320, rarity: "epic" },
  { slug: "midnight_obsidian", label: "Midnight Obsidian", hex: "#080810", cost: 280, rarity: "rare" },
];

const PANTS_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#0d0d12", cost: 0, rarity: "free" },
  { slug: "denim", label: "Denim", hex: "#1e3a5f", cost: 80, rarity: "common" },
  { slug: "camo", label: "Camo", hex: "#2a3a22", cost: 120, rarity: "rare" },
  { slug: "neon", label: "Neon", hex: "#003322", cost: 150, rarity: "rare" },
  { slug: "gold_chrome", label: "Gold Chrome", hex: "#3a2a08", cost: 200, rarity: "epic" },
  { slug: "sunset_pink", label: "Sunset Pink", hex: "#4a1830", cost: 160, rarity: "rare" },
];

const SHOE_COLORWAYS: Colorway[] = [
  { slug: "white", label: "White", hex: "#EEEEEE", cost: 0, rarity: "free" },
  { slug: "black", label: "Black", hex: "#111111", cost: 60, rarity: "common" },
  { slug: "gold", label: "Gold Holo", hex: "#FFD700", cost: 99, rarity: "common" },
  { slug: "cyan", label: "Cyan Glow", hex: "#00E5FF", cost: 120, rarity: "rare" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 120, rarity: "rare" },
  { slug: "neon_acid", label: "Neon Acid Green", hex: "#B8FF00", cost: 140, rarity: "rare" },
  { slug: "midnight_obsidian", label: "Midnight Obsidian", hex: "#0A0A12", cost: 80, rarity: "common" },
];

const GLASS_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#111111", cost: 0, rarity: "free" },
  { slug: "cyan", label: "Cyan", hex: "#00FFFF", cost: 200, rarity: "common" },
  { slug: "gold", label: "Gold", hex: "#FFD700", cost: 250, rarity: "rare" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 220, rarity: "rare" },
  { slug: "mirror", label: "Mirror", hex: "#C0C8D0", cost: 280, rarity: "epic" },
  { slug: "vip", label: "VIP Green", hex: "#00FF88", cost: 199, rarity: "rare" },
  { slug: "neon_acid", label: "Neon Acid Green", hex: "#B8FF00", cost: 240, rarity: "rare" },
  { slug: "gold_chrome", label: "Gold Chrome", hex: "#FFE566", cost: 300, rarity: "epic" },
];

const HOODIE_COLORWAYS: Colorway[] = [
  { slug: "midnight_obsidian", label: "Midnight Obsidian", hex: "#0A0A12", cost: 0, rarity: "free" },
  { slug: "neon_acid", label: "Neon Acid Green", hex: "#1a2a08", cost: 180, rarity: "rare" },
  { slug: "sunset_pink", label: "Sunset Pink", hex: "#4a1830", cost: 180, rarity: "rare" },
  { slug: "electric_cyan", label: "Electric Cyan", hex: "#0a3d4a", cost: 180, rarity: "rare" },
  { slug: "gold_chrome", label: "Gold Chrome", hex: "#3a2a08", cost: 280, rarity: "epic" },
];

const BEANIE_COLORWAYS: Colorway[] = [
  { slug: "black", label: "Black", hex: "#111111", cost: 0, rarity: "free" },
  { slug: "cyan", label: "Cyan", hex: "#00FFFF", cost: 80, rarity: "common" },
  { slug: "fuchsia", label: "Fuchsia", hex: "#FF2DAA", cost: 80, rarity: "common" },
  { slug: "gold", label: "Gold", hex: "#FFD700", cost: 120, rarity: "rare" },
  { slug: "neon_acid", label: "Neon Acid Green", hex: "#B8FF00", cost: 100, rarity: "rare" },
];

function colorwaySku(
  base: Omit<
    FanCosmeticDef,
    "id" | "label" | "accent" | "pointsCost" | "rarity" | "certifiedGlb" | "colorwayOf"
  > & {
    idBase: string;
    labelBase: string;
    icon: string;
    /** Kept explicit so tintKey="accentOnly" can inherit without Omit regressions. */
    bodyTint?: string;
  },
  cw: Colorway,
  tintKey: "bodyTint" | "accentOnly" = "bodyTint",
): FanCosmeticDef {
  const inheritedBodyTint = base.bodyTint;
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
    bodyTint: tintKey === "bodyTint" ? cw.hex : inheritedBodyTint,
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

/** Gesture emotes — short AvatarRig hand/face animations (not VFX cannons). */
const GESTURE_EMOTES: FanCosmeticDef[] = [
  { id: "emote_wave", label: "Wave", icon: "👋", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Wave gesture — EmoteEngine", emoteKind: "gesture", animationId: "anim_wave", durationMs: 3000, cooldownMs: 500, performanceCost: 1, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_clap", label: "Clap", icon: "👏", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Clap gesture", emoteKind: "gesture", animationId: "anim_clap", durationMs: 3500, cooldownMs: 500, performanceCost: 1, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_point", label: "Point", icon: "☝️", accent: "#00E5FF", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Point gesture", emoteKind: "gesture", animationId: "anim_point", durationMs: 2500, cooldownMs: 400, performanceCost: 1, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_peace", label: "Peace", icon: "✌️", accent: "#00FF88", slot: "emote", socketId: "socket_chest", pointsCost: 40, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Peace hands", emoteKind: "gesture", animationId: "anim_peace", durationMs: 2500, cooldownMs: 500, performanceCost: 1, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_thumbs", label: "Thumbs Up", icon: "👍", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 40, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Thumbs up", emoteKind: "gesture", animationId: "anim_thumbs", durationMs: 2200, cooldownMs: 400, performanceCost: 1, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_flex", label: "Flex", icon: "💪", accent: "#FF6600", slot: "emote", socketId: "socket_chest", pointsCost: 80, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Flex pose", emoteKind: "gesture", animationId: "anim_flex", durationMs: 3000, cooldownMs: 800, performanceCost: 1, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_heart_hands", label: "Heart Hands", icon: "🫶", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 60, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Heart hands gesture", emoteKind: "gesture", animationId: "anim_heart_hands", durationMs: 3000, cooldownMs: 600, performanceCost: 1, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_jump", label: "Jump", icon: "🦘", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Jump gesture", emoteKind: "gesture", animationId: "anim_jump", durationMs: 2000, cooldownMs: 600, performanceCost: 2, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_heart", label: "Heart", icon: "❤️", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 50, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Heart gesture (body — not Action VFX)", emoteKind: "gesture", animationId: "anim_heart", durationMs: 3000, cooldownMs: 500, performanceCost: 1, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_encore", label: "Encore", icon: "🙌", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 80, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Encore cheer", emoteKind: "gesture", animationId: "anim_encore", durationMs: 5000, cooldownMs: 1000, performanceCost: 2, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_cheer", label: "Cheer", icon: "📣", accent: "#00FF88", slot: "emote", socketId: "socket_chest", pointsCost: 60, rarity: "common", inventoryCategory: "gestures", equipSlot: "emote", certifiedGlb: false, description: "Cheer gesture", emoteKind: "gesture", animationId: "anim_cheer", durationMs: 4000, cooldownMs: 800, performanceCost: 1, capability: "ANIMATED", stripeProductId: null },
];

/**
 * Dance Emotes — body animation on AvatarRig (procedural bounce loops honest until certified clips).
 * Distinct from Action Emotes (VFX cannons).
 */
const DANCE_EMOTES: FanCosmeticDef[] = [
  { id: "emote_dance", label: "Two-Step / Vibe", icon: "💃", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 0, rarity: "free", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Starter vibe loop — procedural bounce on AvatarRig", emoteKind: "dance", animationId: "dance_twostep", durationMs: 6000, cooldownMs: 500, performanceCost: 2, capability: "ANIMATED", featured: true, stripeProductId: null },
  { id: "emote_dance_bounce", label: "Bounce", icon: "🏀", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 80, rarity: "common", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Bounce loop — procedural", emoteKind: "dance", animationId: "dance_bounce", durationMs: 6000, cooldownMs: 500, performanceCost: 2, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_dance_wave", label: "Wave Dance", icon: "🌊", accent: "#00E5FF", slot: "emote", socketId: "socket_chest", pointsCost: 120, rarity: "common", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Wave dance — AvatarRig stub", emoteKind: "dance", animationId: "dance_wave", durationMs: 6500, cooldownMs: 600, performanceCost: 2, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_dance_shuffle", label: "Shuffle", icon: "👟", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 150, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Shuffle — procedural foot bounce", emoteKind: "dance", animationId: "dance_shuffle", durationMs: 6500, cooldownMs: 600, performanceCost: 3, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_dance_hype", label: "Hype-Man", icon: "📢", accent: "#FF6600", slot: "emote", socketId: "socket_chest", pointsCost: 160, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Hype-man bounce — procedural", emoteKind: "dance", animationId: "dance_hype", durationMs: 7000, cooldownMs: 800, performanceCost: 3, capability: "ANIMATED", isNew: true, featured: true, stripeProductId: null },
  { id: "emote_dance_hiphop", label: "Groove / Hip-Hop", icon: "🕺", accent: "#AA2DFF", slot: "emote", socketId: "socket_chest", pointsCost: 120, rarity: "common", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Hip-hop groove — AvatarRig stub", emoteKind: "dance", animationId: "dance_hiphop", durationMs: 7000, cooldownMs: 600, performanceCost: 3, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_dance_robot", label: "Robot", icon: "🤖", accent: "#00FF88", slot: "emote", socketId: "socket_chest", pointsCost: 150, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Robot dance — procedural snap loop", emoteKind: "dance", animationId: "dance_robot", durationMs: 6500, cooldownMs: 700, performanceCost: 3, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_dance_salsa", label: "Salsa", icon: "🌶️", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 180, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Salsa stub — procedural sway", emoteKind: "dance", animationId: "dance_salsa", durationMs: 7000, cooldownMs: 700, performanceCost: 3, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_dance_country", label: "Country Line", icon: "🤠", accent: "#C68642", slot: "emote", socketId: "socket_chest", pointsCost: 160, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Country line stub — procedural step", emoteKind: "dance", animationId: "dance_country", durationMs: 7000, cooldownMs: 700, performanceCost: 3, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_dance_disco", label: "Disco", icon: "🪩", accent: "#FFD700", slot: "emote", socketId: "socket_chest", pointsCost: 170, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Disco stub — procedural point", emoteKind: "dance", animationId: "dance_disco", durationMs: 7000, cooldownMs: 700, performanceCost: 3, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_dance_slow", label: "Slow Groove", icon: "🌙", accent: "#AA2DFF", slot: "emote", socketId: "socket_chest", pointsCost: 140, rarity: "common", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Slow groove — procedural sway", emoteKind: "dance", animationId: "dance_slow", durationMs: 8000, cooldownMs: 600, performanceCost: 2, capability: "ANIMATED", isNew: true, stripeProductId: null },
  { id: "emote_dance_spin", label: "Spin Out", icon: "🌀", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 180, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Spin dance", emoteKind: "dance", animationId: "dance_spin", durationMs: 5500, cooldownMs: 900, performanceCost: 3, capability: "ANIMATED", stripeProductId: null },
  { id: "emote_headbang", label: "Headbang", icon: "🤘", accent: "#FF6600", slot: "emote", socketId: "socket_chest", pointsCost: 140, rarity: "rare", inventoryCategory: "dances", equipSlot: "emote", certifiedGlb: false, description: "Headbang loop", emoteKind: "dance", animationId: "dance_headbang", durationMs: 5000, cooldownMs: 700, performanceCost: 3, capability: "ANIMATED", stripeProductId: null },
];

/**
 * Action Emotes — button launches visual reaction/effect (not body dance).
 * Throttled via cooldownMs + performanceCost (EmoteEngine action budget).
 */
const ACTION_EMOTES: FanCosmeticDef[] = [
  { id: "action_flame_cannon", label: "Flame Cannon", icon: "🔥", accent: "#FF4500", slot: "emote", socketId: "socket_primary_hand", pointsCost: 220, rarity: "rare", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — flame burst VFX", emoteKind: "action", effectId: "fx_flame_cannon", animKind: "flame_flicker", durationMs: 2500, cooldownMs: 8000, visibilityRadius: 18, performanceCost: 6, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_heart_shower", label: "Heart Shower", icon: "💖", accent: "#FF2DAA", slot: "emote", socketId: "socket_chest", pointsCost: 180, rarity: "rare", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — floating hearts VFX", emoteKind: "action", effectId: "fx_heart_shower", animKind: "heart_float", durationMs: 3200, cooldownMs: 6000, visibilityRadius: 14, performanceCost: 4, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_gold_coin_toss", label: "Gold Coin Toss", icon: "🪙", accent: "#FFD700", slot: "emote", socketId: "socket_primary_hand", pointsCost: 200, rarity: "rare", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — gold coin cascade", emoteKind: "action", effectId: "fx_gold_coin_toss", animKind: "coin_toss", durationMs: 2800, cooldownMs: 7000, visibilityRadius: 12, performanceCost: 5, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_lightning_strike", label: "Lightning Strike", icon: "⚡", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 280, rarity: "epic", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — lightning bolt VFX", emoteKind: "action", effectId: "fx_lightning_strike", animKind: "lightning_strike", durationMs: 1800, cooldownMs: 10000, visibilityRadius: 20, performanceCost: 7, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_neon_glow_burst", label: "Neon Glow Burst", icon: "💠", accent: "#AA2DFF", slot: "emote", socketId: "socket_chest", pointsCost: 190, rarity: "rare", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — neon ring burst", emoteKind: "action", effectId: "fx_neon_glow_burst", animKind: "neon_burst", durationMs: 2200, cooldownMs: 6500, visibilityRadius: 14, performanceCost: 5, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_smoke_haze", label: "Smoke Haze", icon: "💨", accent: "#8899AA", slot: "emote", socketId: "socket_waist", pointsCost: 160, rarity: "common", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — smoke haze pool", emoteKind: "action", effectId: "fx_smoke_haze", animKind: "smoke_haze", durationMs: 4000, cooldownMs: 9000, visibilityRadius: 10, performanceCost: 4, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_mic_drop", label: "Mic Drop", icon: "🎤", accent: "#00E5FF", slot: "emote", socketId: "socket_primary_hand", pointsCost: 240, rarity: "epic", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — mic drop impact VFX", emoteKind: "action", effectId: "fx_mic_drop", animKind: "mic_drop", durationMs: 2000, cooldownMs: 8000, visibilityRadius: 12, performanceCost: 5, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_confetti_cannon", label: "Confetti Cannon", icon: "🎊", accent: "#FFD700", slot: "emote", socketId: "socket_primary_hand", pointsCost: 260, rarity: "epic", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Marcel Action Emote — confetti blast", emoteKind: "action", effectId: "fx_confetti_cannon", animKind: "confetti_burst", durationMs: 3500, cooldownMs: 9000, visibilityRadius: 16, performanceCost: 6, capability: "INTERACTIVE", featured: true, isNew: true, stripeProductId: null },
  { id: "action_sparkle_burst", label: "Sparkle Burst", icon: "✨", accent: "#FFE566", slot: "emote", socketId: "socket_chest", pointsCost: 120, rarity: "common", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Sparkle Action Emote variant", emoteKind: "action", effectId: "fx_sparkle_burst", animKind: "sparkler_burst", durationMs: 2200, cooldownMs: 5000, visibilityRadius: 10, performanceCost: 3, capability: "INTERACTIVE", isNew: true, stripeProductId: null },
  { id: "action_music_notes", label: "Music Note Rain", icon: "🎵", accent: "#00FFFF", slot: "emote", socketId: "socket_chest", pointsCost: 140, rarity: "common", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Music-note Action Emote variant", emoteKind: "action", effectId: "fx_music_notes", animKind: "neon_burst", durationMs: 3000, cooldownMs: 5500, visibilityRadius: 12, performanceCost: 3, capability: "INTERACTIVE", isNew: true, stripeProductId: null },
  { id: "action_flame_mini", label: "Mini Flame", icon: "🕯️", accent: "#FF6600", slot: "emote", socketId: "socket_primary_hand", pointsCost: 90, rarity: "common", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Lightweight flame Action Emote", emoteKind: "action", effectId: "fx_flame_mini", animKind: "flame_flicker", durationMs: 1800, cooldownMs: 4000, visibilityRadius: 8, performanceCost: 2, capability: "INTERACTIVE", stripeProductId: null },
  { id: "action_heart_mini", label: "Mini Hearts", icon: "💗", accent: "#FF6B9D", slot: "emote", socketId: "socket_chest", pointsCost: 80, rarity: "common", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Lightweight heart Action Emote", emoteKind: "action", effectId: "fx_heart_mini", animKind: "heart_float", durationMs: 2000, cooldownMs: 3500, visibilityRadius: 8, performanceCost: 2, capability: "INTERACTIVE", stripeProductId: null },
  { id: "action_lightning_mini", label: "Mini Zap", icon: "⚡", accent: "#88EEFF", slot: "emote", socketId: "socket_chest", pointsCost: 110, rarity: "common", inventoryCategory: "action-emotes", equipSlot: "emote", certifiedGlb: false, description: "Lightweight lightning Action Emote", emoteKind: "action", effectId: "fx_lightning_mini", animKind: "lightning_strike", durationMs: 1200, cooldownMs: 5000, visibilityRadius: 10, performanceCost: 3, capability: "INTERACTIVE", stripeProductId: null },
];

/** Legacy alias — gestures + dances (Action Emotes are separate). */
const EMOTES: FanCosmeticDef[] = [...GESTURE_EMOTES, ...DANCE_EMOTES];

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
        inventoryCategory: "tops",
        equipSlot: "outfit",
        description: "Shirt colorway",
        layerScale: 1.05,
      },
      cw,
    ),
  );
  const hoodies = HOODIE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "hoodie_street",
        labelBase: "Street Hoodie",
        icon: "🧥",
        slot: "outfit",
        socketId: "socket_chest",
        inventoryCategory: "tops",
        equipSlot: "outfit",
        description: "Streetwear hoodie colorway",
        layerScale: 1.15,
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
  const bombers = MATERIAL_TINT_MASKS.slice(0, 5).map((cw) =>
    colorwaySku(
      {
        idBase: "bomber_stage",
        labelBase: "Stage Bomber",
        icon: "🧥",
        slot: "outfit",
        socketId: "socket_chest",
        inventoryCategory: "tops",
        equipSlot: "outfit",
        description: "Stage bomber colorway",
        layerScale: 1.18,
      },
      cw,
    ),
  );
  const tanks = MATERIAL_TINT_MASKS.slice(0, 4).map((cw) =>
    colorwaySku(
      {
        idBase: "tank_stage",
        labelBase: "Stage Tank",
        icon: "🎽",
        slot: "outfit",
        socketId: "socket_chest",
        inventoryCategory: "tops",
        equipSlot: "outfit",
        description: "Stage tank colorway",
        layerScale: 1.05,
      },
      { ...cw, cost: Math.max(0, cw.cost - 40) },
    ),
  );
  const velvet = [
    { slug: "royal", label: "Royal Velvet", hex: "#4a1040", cost: 350, rarity: "legendary" as const },
    { slug: "gold_thread", label: "Gold Thread", hex: "#3a2a08", cost: 380, rarity: "legendary" as const },
    { slug: "obsidian", label: "Obsidian Velvet", hex: "#0A0A12", cost: 320, rarity: "epic" as const },
  ].map((cw) =>
    colorwaySku(
      {
        idBase: "velvet_luxury",
        labelBase: "Luxury Velvet",
        icon: "👔",
        slot: "outfit",
        socketId: "socket_chest",
        inventoryCategory: "outfits",
        equipSlot: "outfit",
        description: "Luxury velvet / gold-thread set piece",
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
        inventoryCategory: "bottoms",
        equipSlot: "outfit",
        description: "Pants colorway (waist socket tint hint)",
        layerScale: 1.05,
      },
      cw,
    ),
  );
  const track = MATERIAL_TINT_MASKS.slice(0, 4).map((cw) =>
    colorwaySku(
      {
        idBase: "track_pants",
        labelBase: "Track Pants",
        icon: "🏃",
        slot: "waist",
        socketId: "socket_waist",
        inventoryCategory: "bottoms",
        equipSlot: "outfit",
        description: "Tracksuit bottoms colorway",
        layerScale: 1.05,
      },
      cw,
    ),
  );
  const denim = [
    { slug: "indigo", label: "Indigo", hex: "#1e3a5f", cost: 100, rarity: "common" as const },
    { slug: "black_wash", label: "Black Wash", hex: "#111118", cost: 120, rarity: "common" as const },
    { slug: "ripped", label: "Ripped Stage", hex: "#2a2a40", cost: 160, rarity: "rare" as const },
  ].map((cw) =>
    colorwaySku(
      {
        idBase: "denim_stage",
        labelBase: "Stage Denim",
        icon: "👖",
        slot: "waist",
        socketId: "socket_waist",
        inventoryCategory: "bottoms",
        equipSlot: "outfit",
        description: "Stage denim bottoms",
        layerScale: 1.05,
      },
      cw,
    ),
  );
  const shoes = SHOE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "kicks",
        labelBase: "Low-Tops",
        icon: "👟",
        slot: "feet",
        socketId: "socket_foot_r",
        inventoryCategory: "shoes",
        equipSlot: "accessory",
        description: "Low-top shoe colorway",
        layerScale: 1,
      },
      cw,
      "accentOnly",
    ),
  );
  const hiTops = MATERIAL_TINT_MASKS.slice(0, 5).map((cw) =>
    colorwaySku(
      {
        idBase: "kicks_led",
        labelBase: "High-Tops LED",
        icon: "👟",
        slot: "feet",
        socketId: "socket_foot_r",
        inventoryCategory: "shoes",
        equipSlot: "accessory",
        description: "LED high-tops colorway SKU",
        layerScale: 1.05,
      },
      { ...cw, cost: cw.cost + 40, rarity: cw.rarity === "free" ? "common" : cw.rarity },
      "accentOnly",
    ),
  );
  const loafers = [
    { slug: "black", label: "Black", hex: "#111111", cost: 90, rarity: "common" as const },
    { slug: "gold_chrome", label: "Gold Chrome", hex: "#FFD700", cost: 180, rarity: "rare" as const },
    { slug: "burgundy", label: "Burgundy", hex: "#4a1020", cost: 120, rarity: "common" as const },
  ].map((cw) =>
    colorwaySku(
      {
        idBase: "loafers",
        labelBase: "Loafers",
        icon: "👞",
        slot: "feet",
        socketId: "socket_foot_r",
        inventoryCategory: "shoes",
        equipSlot: "accessory",
        description: "Loafer colorway",
        layerScale: 1,
      },
      cw,
      "accentOnly",
    ),
  );
  const boots = [
    { slug: "black", label: "Black", hex: "#111111", cost: 140, rarity: "common" as const },
    { slug: "combat_olive", label: "Combat Olive", hex: "#2a3a22", cost: 160, rarity: "rare" as const },
    { slug: "chrome", label: "Chrome", hex: "#C0C8D0", cost: 220, rarity: "epic" as const },
  ].map((cw) =>
    colorwaySku(
      {
        idBase: "boots_combat",
        labelBase: "Combat Boots",
        icon: "🥾",
        slot: "feet",
        socketId: "socket_foot_r",
        inventoryCategory: "shoes",
        equipSlot: "accessory",
        description: "Combat boot colorway",
        layerScale: 1.08,
      },
      cw,
      "accentOnly",
    ),
  );
  return [
    ...tees,
    ...hoodies,
    ...jackets,
    ...bombers,
    ...tanks,
    ...velvet,
    ...pants,
    ...track,
    ...denim,
    ...shoes,
    ...hiTops,
    ...loafers,
    ...boots,
  ];
}

function buildHeadwearEyewearExpansion(): FanCosmeticDef[] {
  const snapF = BEANIE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "snapback_forward",
        labelBase: "Snapback F",
        icon: "🧢",
        slot: "head",
        socketId: "socket_head",
        inventoryCategory: "hats",
        equipSlot: "accessory",
        description: "Forward snapback colorway",
        layerScale: 1.1,
      },
      cw,
      "accentOnly",
    ),
  );
  const snapB = BEANIE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "snapback_back",
        labelBase: "Snapback B",
        icon: "🧢",
        slot: "head",
        socketId: "socket_head",
        inventoryCategory: "hats",
        equipSlot: "accessory",
        description: "Backwards snapback colorway",
        layerScale: 1.1,
      },
      cw,
      "accentOnly",
    ),
  );
  const beanies = BEANIE_COLORWAYS.map((cw) =>
    colorwaySku(
      {
        idBase: "beanie_knit",
        labelBase: "Knit Beanie",
        icon: "🧶",
        slot: "head",
        socketId: "socket_head",
        inventoryCategory: "hats",
        equipSlot: "accessory",
        description: "Beanie colorway",
        layerScale: 1.12,
      },
      cw,
      "accentOnly",
    ),
  );
  const headbands = MATERIAL_TINT_MASKS.slice(0, 4).map((cw) =>
    colorwaySku(
      {
        idBase: "headband_sport",
        labelBase: "Headband",
        icon: "🎀",
        slot: "head",
        socketId: "socket_head",
        inventoryCategory: "hats",
        equipSlot: "accessory",
        description: "Sport headband colorway",
        layerScale: 0.95,
      },
      { ...cw, cost: Math.max(40, cw.cost - 60) },
      "accentOnly",
    ),
  );
  const core: FanCosmeticDef[] = [
    {
      id: "eyewear_cyber_led",
      label: "Cyber LED Shutters",
      icon: "🕶️",
      accent: "#00FFFF",
      slot: "face",
      socketId: "socket_face",
      pointsCost: 280,
      rarity: "epic",
      inventoryCategory: "glasses",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "Cyber LED shutter eyewear — procedural face plate",
      isNew: true,
      featured: true,
      capability: "PLACED",
      performanceCost: 2,
      stripeProductId: null,
    },
    {
      id: "eyewear_gold_aviators",
      label: "Gold Aviators",
      icon: "🕶️",
      accent: "#FFD700",
      slot: "face",
      socketId: "socket_face",
      pointsCost: 260,
      rarity: "rare",
      inventoryCategory: "glasses",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "Gold aviator eyewear",
      isNew: true,
      capability: "PLACED",
      performanceCost: 1,
      stripeProductId: null,
    },
    {
      id: "eyewear_diamond_studs",
      label: "Diamond Stud Shades",
      icon: "💎",
      accent: "#E8F4FF",
      slot: "face",
      socketId: "socket_face",
      pointsCost: 320,
      rarity: "legendary",
      inventoryCategory: "glasses",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "Diamond-stud eyewear SKU",
      isNew: true,
      capability: "PLACED",
      performanceCost: 1,
      stripeProductId: null,
    },
    {
      id: "eyewear_ar_visor",
      label: "AR Visor",
      icon: "🥽",
      accent: "#00FF88",
      slot: "face",
      socketId: "socket_face",
      pointsCost: 300,
      rarity: "epic",
      inventoryCategory: "glasses",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "AR visor — procedural HUD plate",
      isNew: true,
      featured: true,
      capability: "PLACED",
      performanceCost: 2,
      stripeProductId: null,
    },
    {
      id: "hat_tiara",
      label: "Stage Tiara",
      icon: "👸",
      accent: "#FFD700",
      slot: "head",
      socketId: "socket_head",
      pointsCost: 350,
      rarity: "legendary",
      inventoryCategory: "hats",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "Tiara headwear",
      layerScale: 1.15,
      isNew: true,
      capability: "PLACED",
      performanceCost: 1,
      stripeProductId: null,
    },
    {
      id: "dj_cans_cyan",
      label: "DJ Cans · Cyan",
      icon: "🎧",
      accent: "#00FFFF",
      slot: "head",
      socketId: "socket_head",
      pointsCost: 260,
      rarity: "epic",
      inventoryCategory: "headphones",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "Cyan DJ cans colorway",
      colorwayOf: "studio_headset",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "dj_cans_fuchsia",
      label: "DJ Cans · Fuchsia",
      icon: "🎧",
      accent: "#FF2DAA",
      slot: "head",
      socketId: "socket_head",
      pointsCost: 260,
      rarity: "epic",
      inventoryCategory: "headphones",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "Fuchsia DJ cans colorway",
      colorwayOf: "studio_headset",
      isNew: true,
      stripeProductId: null,
    },
  ];
  return [...core, ...snapF, ...snapB, ...beanies, ...headbands];
}

function buildPropExpansion(): FanCosmeticDef[] {
  return [
    {
      id: "prop_vintage_mic_stand",
      label: "Vintage Mic Stand",
      icon: "🎙️",
      accent: "#C0C8D0",
      slot: "hand",
      socketId: "socket_primary_hand",
      pointsCost: 200,
      rarity: "rare",
      inventoryCategory: "props",
      equipSlot: "prop",
      certifiedGlb: false,
      description: "HELD vintage mic stand — procedural socket",
      animKind: "mic_pulse",
      capability: "HELD",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "prop_boombox",
      label: "Boombox",
      icon: "📻",
      accent: "#FF6600",
      slot: "hand",
      socketId: "socket_primary_hand",
      pointsCost: 240,
      rarity: "epic",
      inventoryCategory: "props",
      equipSlot: "prop",
      certifiedGlb: false,
      description: "HELD boombox — triggers shared Fan lobby jam audio via prop bus",
      animKind: "hold_bob",
      capability: "HELD",
      isNew: true,
      featured: true,
      stripeProductId: null,
    },
    {
      id: "prop_neon_guitar",
      label: "Neon Guitar",
      icon: "🎸",
      accent: "#00FFFF",
      slot: "instrument",
      socketId: "socket_primary_hand",
      pointsCost: 320,
      rarity: "epic",
      inventoryCategory: "instruments",
      equipSlot: "instrument",
      certifiedGlb: false,
      description: "HELD neon guitar — procedural mesh",
      animKind: "instrument_strum",
      capability: "HELD",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "prop_neon_bass",
      label: "Neon Bass",
      icon: "🎸",
      accent: "#AA2DFF",
      slot: "instrument",
      socketId: "socket_primary_hand",
      pointsCost: 300,
      rarity: "epic",
      inventoryCategory: "instruments",
      equipSlot: "instrument",
      certifiedGlb: false,
      description: "HELD neon bass — procedural mesh",
      animKind: "instrument_strum",
      capability: "HELD",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "prop_vip_lanyard",
      label: "VIP Lanyard",
      icon: "🎫",
      accent: "#FFD700",
      slot: "chest",
      socketId: "socket_chest",
      pointsCost: 120,
      rarity: "common",
      inventoryCategory: "accessories",
      equipSlot: "accessory",
      certifiedGlb: false,
      description: "VIP lanyard chest prop",
      capability: "PLACED",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "prop_energy_drink",
      label: "Energy Drink",
      icon: "🥤",
      accent: "#B8FF00",
      slot: "hand",
      socketId: "socket_primary_hand",
      pointsCost: 60,
      rarity: "common",
      inventoryCategory: "props",
      equipSlot: "prop",
      certifiedGlb: false,
      description: "HELD energy drink can",
      animKind: "hold_bob",
      capability: "HELD",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "prop_trading_cards",
      label: "Trading Cards",
      icon: "🃏",
      accent: "#00E5FF",
      slot: "hand",
      socketId: "socket_secondary_hand",
      pointsCost: 90,
      rarity: "common",
      inventoryCategory: "props",
      equipSlot: "prop",
      certifiedGlb: false,
      description: "HELD trading card pack",
      animKind: "hold_bob",
      capability: "HELD",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "prop_action_cannon",
      label: "Handheld Confetti Cannon",
      icon: "🎉",
      accent: "#FFD700",
      slot: "hand",
      socketId: "socket_primary_hand",
      pointsCost: 280,
      rarity: "epic",
      inventoryCategory: "props",
      equipSlot: "prop",
      certifiedGlb: false,
      description: "Prop form of confetti cannon — pairs with Action Emote",
      animKind: "cannon_burst",
      capability: "HELD",
      isNew: true,
      stripeProductId: null,
    },
  ];
}

function buildAuraEntranceSets(): FanCosmeticDef[] {
  return [
    {
      id: "aura_cyan_ring",
      label: "Cyan Aura Ring",
      icon: "⭕",
      accent: "#00FFFF",
      slot: "aura",
      socketId: "socket_chest",
      pointsCost: 200,
      rarity: "rare",
      inventoryCategory: "auras",
      equipSlot: "aura",
      certifiedGlb: false,
      description: "Soft cyan aura — strict performanceCost budget",
      animKind: "aura_pulse",
      effectId: "fx_aura_cyan",
      durationMs: 0,
      performanceCost: 5,
      capability: "ANIMATED",
      isNew: true,
      featured: true,
      stripeProductId: null,
    },
    {
      id: "aura_gold_haze",
      label: "Gold Haze Aura",
      icon: "✨",
      accent: "#FFD700",
      slot: "aura",
      socketId: "socket_chest",
      pointsCost: 280,
      rarity: "epic",
      inventoryCategory: "auras",
      equipSlot: "aura",
      certifiedGlb: false,
      description: "Gold haze aura — stricter FPS budget",
      animKind: "aura_pulse",
      effectId: "fx_aura_gold",
      performanceCost: 7,
      capability: "ANIMATED",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "aura_fuchsia_pulse",
      label: "Fuchsia Pulse Aura",
      icon: "💜",
      accent: "#FF2DAA",
      slot: "aura",
      socketId: "socket_chest",
      pointsCost: 240,
      rarity: "rare",
      inventoryCategory: "auras",
      equipSlot: "aura",
      certifiedGlb: false,
      description: "Fuchsia pulse aura",
      animKind: "aura_pulse",
      effectId: "fx_aura_fuchsia",
      performanceCost: 6,
      capability: "ANIMATED",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "entrance_neon_trail",
      label: "Neon Trail Entrance",
      icon: "🚪",
      accent: "#00FFFF",
      slot: "entrance",
      socketId: "socket_foot_r",
      pointsCost: 220,
      rarity: "rare",
      inventoryCategory: "entrances",
      equipSlot: "entrance",
      certifiedGlb: false,
      description: "Entrance VFX trail on join — procedural",
      animKind: "entrance_trail",
      effectId: "fx_entrance_neon",
      animationId: "anim_enter_neon",
      durationMs: 2500,
      performanceCost: 4,
      capability: "ANIMATED",
      isNew: true,
      featured: true,
      stripeProductId: null,
    },
    {
      id: "entrance_mic_drop",
      label: "Mic Drop Entrance",
      icon: "🎤",
      accent: "#FFD700",
      slot: "entrance",
      socketId: "socket_primary_hand",
      pointsCost: 300,
      rarity: "epic",
      inventoryCategory: "entrances",
      equipSlot: "entrance",
      certifiedGlb: false,
      description: "Entrance paired with mic-drop impact",
      animKind: "mic_drop",
      effectId: "fx_entrance_mic",
      animationId: "anim_enter_mic",
      durationMs: 2200,
      performanceCost: 5,
      capability: "ANIMATED",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "exit_smoke_out",
      label: "Smoke Exit",
      icon: "💨",
      accent: "#8899AA",
      slot: "entrance",
      socketId: "socket_waist",
      pointsCost: 180,
      rarity: "common",
      inventoryCategory: "entrances",
      equipSlot: "entrance",
      certifiedGlb: false,
      description: "Exit smoke haze — procedural",
      animKind: "smoke_haze",
      effectId: "fx_exit_smoke",
      animationId: "anim_exit_smoke",
      durationMs: 2000,
      performanceCost: 3,
      capability: "ANIMATED",
      isNew: true,
      stripeProductId: null,
    },
    {
      id: "set_street_starter",
      label: "Street Starter Set",
      icon: "🎒",
      accent: "#AA2DFF",
      slot: "outfit",
      socketId: "socket_chest",
      pointsCost: 0,
      rarity: "free",
      inventoryCategory: "sets",
      equipSlot: "outfit",
      certifiedGlb: false,
      description: "Bundle hint: tee + pants + kicks (equip pieces separately)",
      bodyTint: "#2a1840",
      isNew: true,
      featured: true,
      performanceCost: 0,
      stripeProductId: null,
    },
    {
      id: "set_stage_legend",
      label: "Stage Legend Set",
      icon: "🏆",
      accent: "#FFD700",
      slot: "outfit",
      socketId: "socket_chest",
      pointsCost: 499,
      rarity: "legendary",
      inventoryCategory: "sets",
      equipSlot: "outfit",
      certifiedGlb: false,
      description: "Legendary set SKU — leather + gold kicks + crown (pieces separate)",
      bodyTint: "#3a2a08",
      isNew: true,
      featured: true,
      performanceCost: 1,
      stripeProductId: null,
    },
  ];
}

function defaultPerformanceCost(c: FanCosmeticDef): number {
  if (c.inventoryCategory === "auras") return 6;
  if (c.emoteKind === "action") return 5;
  if (c.inventoryCategory === "entrances") return 4;
  if (c.emoteKind === "dance") return 2;
  if (c.equipSlot === "prop" || c.slot === "hand") return 2;
  return 1;
}

function inferStoreFilters(c: FanCosmeticDef): FanStoreFilterId[] {
  const out = new Set<FanStoreFilterId>();
  if (c.isNew) out.add("NEW");
  if (c.featured) out.add("FEATURED");
  if (c.rarity === "legendary") out.add("LEGENDARY");
  switch (c.inventoryCategory) {
    case "hair":
      out.add("HAIR");
      break;
    case "hats":
    case "headphones":
      out.add("HEADWEAR");
      if (c.inventoryCategory === "headphones") out.add("ACCESSORIES");
      break;
    case "glasses":
      out.add("EYEWEAR");
      break;
    case "tops":
    case "clothing":
      out.add("TOPS");
      break;
    case "bottoms":
      out.add("BOTTOMS");
      break;
    case "outfits":
    case "jackets":
      out.add("OUTFITS");
      if (c.inventoryCategory === "jackets") out.add("TOPS");
      break;
    case "shoes":
      out.add("SHOES");
      break;
    case "jewelry":
      out.add("JEWELRY");
      break;
    case "accessories":
    case "mic-skins":
      out.add("ACCESSORIES");
      break;
    case "instruments":
      out.add("INSTRUMENTS");
      break;
    case "props":
    case "vfx":
      out.add("PROPS");
      break;
    case "dances":
      out.add("DANCES");
      break;
    case "gestures":
    case "emotes":
      out.add("EMOTES");
      break;
    case "action-emotes":
      out.add("ACTION_EMOTES");
      break;
    case "auras":
      out.add("AURAS");
      break;
    case "entrances":
      out.add("ENTRANCES");
      break;
    case "sets":
      out.add("SETS");
      break;
    default:
      break;
  }
  if (c.emoteKind === "action") out.add("ACTION_EMOTES");
  if (c.emoteKind === "dance") out.add("DANCES");
  if (c.emoteKind === "gesture") out.add("EMOTES");
  return [...out];
}

/** Marcel volume cash defaults — wired to STRIPE_PRODUCTS FAN_COSMETIC_* keys. */
function volumeUsdCentsForRarity(rarity: FanCosmeticRarity, pointsCost: number): number | null {
  if (pointsCost <= 0 || rarity === "free") return null;
  if (rarity === "legendary") return 399;
  if (rarity === "epic") return 299;
  if (rarity === "rare") return 199;
  return 99; // common + default
}

function volumeStripeProductKey(rarity: FanCosmeticRarity, pointsCost: number): string | null {
  if (pointsCost <= 0 || rarity === "free") return null;
  if (rarity === "legendary") return "FAN_COSMETIC_LEGENDARY";
  if (rarity === "epic") return "FAN_COSMETIC_EPIC";
  if (rarity === "rare") return "FAN_COSMETIC_RARE";
  return "FAN_COSMETIC_COMMON";
}

/** Fill schema fields for every catalog row (seed may omit). */
export function normalizeFanCosmetic(c: FanCosmeticDef): FanCosmeticDef {
  const category = c.category ?? c.inventoryCategory;
  const rigAnchor = c.rigAnchor ?? c.socketId;
  const usdCents =
    c.usdCents != null && c.usdCents > 0
      ? c.usdCents
      : volumeUsdCentsForRarity(c.rarity, c.pointsCost);
  const stripeProductId =
    c.stripeProductId ?? volumeStripeProductKey(c.rarity, c.pointsCost);
  const price: FanCosmeticPrice = c.price ?? {
    points: c.pointsCost,
    stripeProductId,
  };
  const entitlement: CosmeticEntitlementKind =
    c.entitlement ?? (c.pointsCost === 0 ? "free" : "points");
  return {
    ...c,
    category,
    rigAnchor,
    price: { ...price, stripeProductId: price.stripeProductId ?? stripeProductId },
    entitlement,
    compatibleAvatarRig: c.compatibleAvatarRig ?? "AvatarRig_v0",
    performanceCost: c.performanceCost ?? defaultPerformanceCost(c),
    AIExpansionAllowed: c.AIExpansionAllowed ?? true,
    published: c.published ?? true,
    storeFilters: c.storeFilters ?? inferStoreFilters({ ...c, category, isNew: c.isNew, featured: c.featured }),
    stripeProductId,
    usdCents,
    certifiedGlb: Boolean(c.certifiedGlb),
    glbUrl: c.glbUrl ?? null,
  };
}

/** Core battle/cypher/lobby SKUs + expanded Fan economy. */
export const FAN_COSMETIC_CATALOG: FanCosmeticDef[] = [
  ...CORE_PROPS,
  ...CORE_ACCESSORIES,
  ...LEGACY_OUTFITS,
  ...buildHairCatalog(),
  ...buildGlassColorways(),
  ...buildClothingColorways(),
  ...buildHeadwearEyewearExpansion(),
  ...buildPropExpansion(),
  ...buildAuraEntranceSets(),
  ...INSTRUMENTS,
  ...EMOTES,
  ...ACTION_EMOTES,
].map(normalizeFanCosmetic);

const CORE_IDS = new Set(FAN_COSMETIC_CATALOG.map((c) => c.id));

export function lobbyPropAsCosmetic(prop: LobbyPropDef): FanCosmeticDef {
  const isHold = prop.effect === "hold";
  const isInstrument = prop.id.startsWith("inst_");
  return normalizeFanCosmetic({
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
  });
}

export function getUnifiedFanCosmeticCatalog(opts?: { includeUnpublished?: boolean }): FanCosmeticDef[] {
  const extras = LOBBY_INVENTORY_PROPS.filter((p) => !CORE_IDS.has(p.id)).map(lobbyPropAsCosmetic);
  const all = [...FAN_COSMETIC_CATALOG, ...extras];
  if (opts?.includeUnpublished) return all;
  return all.filter((c) => c.published !== false);
}

export function getFanCosmetic(id: string): FanCosmeticDef | undefined {
  return getUnifiedFanCosmeticCatalog({ includeUnpublished: true }).find((c) => c.id === id);
}

export function listFanCosmeticsBySlot(slot: FanCosmeticSlot): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.slot === slot);
}

export function listFanCosmeticsByCategory(cat: FanInventoryCategory): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.inventoryCategory === cat || c.category === cat);
}

export function listFanCosmeticsByStoreFilter(filter: FanStoreFilterId): FanCosmeticDef[] {
  const all = getUnifiedFanCosmeticCatalog();
  if (filter === "NEW") return all.filter((c) => c.isNew || c.storeFilters?.includes("NEW"));
  if (filter === "FEATURED") return all.filter((c) => c.featured || c.storeFilters?.includes("FEATURED"));
  if (filter === "LEGENDARY") return all.filter((c) => c.rarity === "legendary");
  return all.filter((c) => c.storeFilters?.includes(filter));
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

export function listDanceEmotes(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter((c) => c.emoteKind === "dance" || c.inventoryCategory === "dances");
}

export function listActionEmotes(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter(
    (c) => c.emoteKind === "action" || c.inventoryCategory === "action-emotes",
  );
}

export function listGestureEmotes(): FanCosmeticDef[] {
  return getUnifiedFanCosmeticCatalog().filter(
    (c) => c.emoteKind === "gesture" || c.inventoryCategory === "gestures",
  );
}

/**
 * AI-assisted curated colorway factory — data variants from material tint masks.
 * Returns unpublished drafts by default when `publish: false`; starter expansions use publish true.
 * Does NOT auto-dump junk into live catalog — caller must register approved SKUs.
 */
export function expandColorways(
  baseId: string,
  opts?: { masks?: Colorway[]; publish?: boolean; rarityBoost?: FanCosmeticRarity },
): FanCosmeticDef[] {
  const base = getFanCosmetic(baseId);
  if (!base || base.AIExpansionAllowed === false) return [];
  const masks = opts?.masks ?? MATERIAL_TINT_MASKS;
  const publish = opts?.publish ?? true;
  const out: FanCosmeticDef[] = [];
  for (const cw of masks) {
    const id = `${base.colorwayOf ?? base.id}_${cw.slug}`;
    if (getFanCosmetic(id) || out.some((o) => o.id === id)) continue;
    out.push(
      normalizeFanCosmetic({
        ...base,
        id,
        label: `${base.label.replace(/ · .+$/, "")} · ${cw.label}`,
        accent: cw.hex,
        pointsCost: cw.cost,
        rarity: opts?.rarityBoost ?? cw.rarity,
        bodyTint: base.equipSlot === "outfit" ? cw.hex : base.bodyTint,
        colorwayOf: base.colorwayOf ?? base.id,
        published: publish,
        isNew: true,
        stripeProductId: null,
        usdCents: null,
        description: `${base.description} · AI-assisted colorway ${cw.label} (material mask)`,
      }),
    );
  }
  return out;
}

/** Map inventory ownership → CosmeticEntitlement (canonical persist path = grantAvatarCosmetic). */
export function toCosmeticEntitlement(
  userId: string,
  cosmeticId: string,
  source: CosmeticEntitlement["source"] = "points",
): CosmeticEntitlement {
  return { userId, cosmeticId, grantedAt: Date.now(), source, owned: true };
}

/** Catalog size snapshot for assembly directors / store HUD. */
export function getFanCosmeticCatalogStats() {
  const all = getUnifiedFanCosmeticCatalog();
  const count = (pred: (c: FanCosmeticDef) => boolean) => all.filter(pred).length;
  return {
    total: all.length,
    hair: count((c) => c.inventoryCategory === "hair"),
    glasses: count((c) => c.inventoryCategory === "glasses"),
    headwear: count((c) => c.inventoryCategory === "hats" || c.inventoryCategory === "headphones"),
    clothing: count(
      (c) =>
        c.inventoryCategory === "clothing" ||
        c.inventoryCategory === "tops" ||
        c.inventoryCategory === "bottoms" ||
        c.inventoryCategory === "jackets" ||
        c.inventoryCategory === "outfits",
    ),
    tops: count((c) => c.inventoryCategory === "tops"),
    bottoms: count((c) => c.inventoryCategory === "bottoms"),
    shoes: count((c) => c.inventoryCategory === "shoes"),
    headphones: count((c) => c.inventoryCategory === "headphones"),
    mics: count((c) => c.inventoryCategory === "mic-skins"),
    emotes: count((c) => c.emoteKind === "gesture" || c.inventoryCategory === "gestures" || c.inventoryCategory === "emotes"),
    dances: count((c) => c.emoteKind === "dance" || c.inventoryCategory === "dances"),
    actionEmotes: count((c) => c.emoteKind === "action" || c.inventoryCategory === "action-emotes"),
    auras: count((c) => c.inventoryCategory === "auras"),
    entrances: count((c) => c.inventoryCategory === "entrances"),
    sets: count((c) => c.inventoryCategory === "sets"),
    props: count((c) => c.inventoryCategory === "props" || c.inventoryCategory === "vfx"),
    instruments: count((c) => c.inventoryCategory === "instruments"),
    jewelry: count((c) => c.inventoryCategory === "jewelry"),
    legendary: count((c) => c.rarity === "legendary"),
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
