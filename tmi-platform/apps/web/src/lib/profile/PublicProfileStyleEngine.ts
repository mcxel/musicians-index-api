/**
 * PublicProfileStyleEngine
 *
 * Canonical registry for public-profile visual presentation:
 *   FREE  — color, static layout, module visibility (always free)
 *   TIER  — style packs unlocked by reaching a membership tier
 *   COIN  — style packs purchasable with platform points
 *   PAID  — style packs purchasable for $0.99–$3.99 (real money)
 *
 * A style pack = { background treatment, frame treatment, entrance animation,
 *   transition family, overlay set, typography pairing, button treatment,
 *   optional ambient animation }.
 * Owner's chosen accent color is applied on top; packs provide geometry +
 * motion, not a fixed palette.
 *
 * Rule 19/Playlist-Skin analogy: ownership = entitlement, never a rental.
 * Rule 23: no pack grants competitive advantage over other users.
 * Rule 20: every pack flag must be backed by real entitlement data —
 *   never derive "owned" from a mock/hash.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type StyleAcquisitionPath = "FREE" | "TIER" | "COIN" | "PAID";
export type AnimationIntensity = "OFF" | "LOW" | "NORMAL" | "HIGH";

/** What a style pack provides at runtime. */
export interface StylePackTokens {
  /** CSS class(es) or data-attribute applied to the profile root element. */
  rootClass: string;
  /** Whether the pack includes an animated background layer. */
  hasAnimatedBg: boolean;
  /** Whether the pack includes an ambient overlay (triangles, particles, etc.). */
  hasOverlay: boolean;
  /** Whether the pack includes per-module entrance animations. */
  hasEntranceAnim: boolean;
  /** Whether the pack supports music-reactive background elements. */
  musicReactive: boolean;
  /** Maximum recommended animation intensity level for this pack. */
  maxIntensity: AnimationIntensity;
}

export interface StylePack {
  id: string;
  name: string;
  family: string;
  description: string;
  path: StyleAcquisitionPath;
  /** Tier required (TIER path only) */
  requiredTier?: "ruby" | "silver" | "gold" | "platinum" | "diamond";
  /** Coin cost (COIN path only) */
  coinCost?: number;
  /** USD price (PAID path only) */
  priceCents?: number;
  tokens: StylePackTokens;
  /** Accounts receive this on signup — always owned by all users. */
  isDefault?: boolean;
  /** Pack is listed in the purchasable storefront. */
  purchasable?: boolean;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const STYLE_PACK_REGISTRY: StylePack[] = [
  // ── FREE defaults ─────────────────────────────────────────────────────────
  {
    id: "tmi_classic",
    name: "TMI Classic",
    family: "Classic",
    description: "Clean dark-space profile with subtle gradient.",
    path: "FREE",
    isDefault: true,
    tokens: { rootClass: "tmi-style-classic", hasAnimatedBg: false, hasOverlay: false, hasEntranceAnim: false, musicReactive: false, maxIntensity: "OFF" },
  },
  {
    id: "tmi_dark",
    name: "TMI Dark",
    family: "Classic",
    description: "Deep void black with neon accent edges.",
    path: "FREE",
    isDefault: true,
    tokens: { rootClass: "tmi-style-dark", hasAnimatedBg: false, hasOverlay: false, hasEntranceAnim: true, musicReactive: false, maxIntensity: "LOW" },
  },
  {
    id: "tmi_neon",
    name: "TMI Neon",
    family: "Classic",
    description: "Electric neon glow on every card edge.",
    path: "FREE",
    isDefault: true,
    tokens: { rootClass: "tmi-style-neon", hasAnimatedBg: false, hasOverlay: false, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },

  // ── TIER unlocks ──────────────────────────────────────────────────────────
  {
    id: "voltron_angular",
    name: "Voltron Angular",
    family: "Voltron",
    description: "Diagonal cuts, chevrons, and animated panel transitions.",
    path: "TIER",
    requiredTier: "silver",
    tokens: { rootClass: "tmi-style-voltron", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "HIGH" },
  },
  {
    id: "vice_neon_city",
    name: "Vice Neon City",
    family: "Vice City",
    description: "Moving neon edges, distant light movement, reflections.",
    path: "TIER",
    requiredTier: "gold",
    tokens: { rootClass: "tmi-style-vice", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "HIGH" },
  },
  {
    id: "broadcast",
    name: "Broadcast",
    family: "Broadcast",
    description: "Live-television framing — lower thirds, tickers, camera cuts.",
    path: "TIER",
    requiredTier: "platinum",
    tokens: { rootClass: "tmi-style-broadcast", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "signature_diamond",
    name: "Signature",
    family: "Diamond",
    description: "Elegant dimensional metallic borders, particles, and restrained motion.",
    path: "TIER",
    requiredTier: "diamond",
    tokens: { rootClass: "tmi-style-signature", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "HIGH" },
  },

  // ── COIN purchases ────────────────────────────────────────────────────────
  {
    id: "starfield",
    name: "Starfield",
    family: "Space",
    description: "Slow-parallax stars drifting behind the profile.",
    path: "COIN",
    coinCost: 250,
    purchasable: true,
    tokens: { rootClass: "tmi-style-starfield", hasAnimatedBg: true, hasOverlay: false, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "cassette_90s",
    name: "Cassette / 90s",
    family: "Retro",
    description: "Tape/deck motifs, analog meters, and retro transitions.",
    path: "COIN",
    coinCost: 350,
    purchasable: true,
    tokens: { rootClass: "tmi-style-cassette", hasAnimatedBg: false, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "vinyl_room",
    name: "Vinyl Room",
    family: "Music",
    description: "Records, turntable-inspired elements, and equalizer movement.",
    path: "COIN",
    coinCost: 400,
    purchasable: true,
    tokens: { rootClass: "tmi-style-vinyl", hasAnimatedBg: false, hasOverlay: true, hasEntranceAnim: true, musicReactive: true, maxIntensity: "NORMAL" },
  },
  {
    id: "graffiti_wall",
    name: "Graffiti Wall",
    family: "Street",
    description: "Layered street-art surfaces, stickers, and tape.",
    path: "COIN",
    coinCost: 350,
    purchasable: true,
    tokens: { rootClass: "tmi-style-graffiti", hasAnimatedBg: false, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "photo_collage",
    name: "Photo Collage",
    family: "Personal",
    description: "Your images as layered Polaroids and film strips.",
    path: "COIN",
    coinCost: 500,
    purchasable: true,
    tokens: { rootClass: "tmi-style-collage", hasAnimatedBg: false, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "LOW" },
  },

  // ── PAID ($0.99–$3.99) ────────────────────────────────────────────────────
  {
    id: "geometric_motion",
    name: "Geometric Motion",
    family: "Geometric",
    description: "Animated triangles, diamonds, circles, and lines assembling behind modules.",
    path: "PAID",
    priceCents: 99,
    purchasable: true,
    tokens: { rootClass: "tmi-style-geometric", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "HIGH" },
  },
  {
    id: "concert_lights",
    name: "Concert Lights",
    family: "Live",
    description: "Subtle moving stage beams and light sweeps behind content.",
    path: "PAID",
    priceCents: 99,
    purchasable: true,
    tokens: { rootClass: "tmi-style-concert", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: false, musicReactive: true, maxIntensity: "NORMAL" },
  },
  {
    id: "magazine_cover",
    name: "Magazine Cover",
    family: "Editorial",
    description: "Bold editorial typography and cover-story composition.",
    path: "PAID",
    priceCents: 99,
    purchasable: true,
    tokens: { rootClass: "tmi-style-magazine", hasAnimatedBg: false, hasOverlay: false, hasEntranceAnim: true, musicReactive: false, maxIntensity: "LOW" },
  },
  {
    id: "y2k_chrome",
    name: "Y2K / Chrome",
    family: "Chrome",
    description: "Chrome shapes, bubbles, reflective typography, and fluid forms.",
    path: "PAID",
    priceCents: 199,
    purchasable: true,
    tokens: { rootClass: "tmi-style-y2k", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "HIGH" },
  },
  {
    id: "liquid_glass",
    name: "Liquid Glass",
    family: "Glass",
    description: "Floating translucent layers with gentle depth and parallax.",
    path: "PAID",
    priceCents: 199,
    purchasable: true,
    tokens: { rootClass: "tmi-style-glass", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "comic_panels",
    name: "Comic Panels",
    family: "Comics",
    description: "Speech bubbles, halftones, and animated panel entrances.",
    path: "PAID",
    priceCents: 199,
    purchasable: true,
    tokens: { rootClass: "tmi-style-comic", hasAnimatedBg: false, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "luxury_gold",
    name: "Luxury Gold",
    family: "Luxury",
    description: "Elegant metallic borders, particles, and restrained glow.",
    path: "PAID",
    priceCents: 299,
    purchasable: true,
    tokens: { rootClass: "tmi-style-luxury", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "galaxy_portal",
    name: "Galaxy Portal",
    family: "Space",
    description: "Space/portal motion around the hero and YoPho area.",
    path: "PAID",
    priceCents: 299,
    purchasable: true,
    tokens: { rootClass: "tmi-style-galaxy", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "HIGH" },
  },
  {
    id: "music_visualizer",
    name: "Music Visualizer",
    family: "Music",
    description: "Background elements react to the page's currently playing music.",
    path: "PAID",
    priceCents: 299,
    purchasable: true,
    tokens: { rootClass: "tmi-style-visualizer", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: false, musicReactive: true, maxIntensity: "HIGH" },
  },
  {
    id: "living_yopho",
    name: "Living YoPho",
    family: "YoPho",
    description: "Your YoPho artwork becomes part of the page's visual language.",
    path: "PAID",
    priceCents: 299,
    purchasable: true,
    tokens: { rootClass: "tmi-style-yopho-live", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: false, maxIntensity: "NORMAL" },
  },
  {
    id: "galaxy_portal_premium",
    name: "Galaxy Portal Premium",
    family: "Space",
    description: "Extended galaxy system with interactive depth layers.",
    path: "PAID",
    priceCents: 399,
    purchasable: true,
    tokens: { rootClass: "tmi-style-galaxy-premium", hasAnimatedBg: true, hasOverlay: true, hasEntranceAnim: true, musicReactive: true, maxIntensity: "HIGH" },
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/** All packs that are free forever (sent to every new account on signup). */
export const FREE_STYLE_IDS: string[] = STYLE_PACK_REGISTRY
  .filter((p) => p.isDefault)
  .map((p) => p.id);

/** All packs that appear in the purchasable storefront. */
export const PURCHASABLE_PACKS: StylePack[] = STYLE_PACK_REGISTRY.filter((p) => p.purchasable);

/** Look up a style pack by id. Returns undefined if not found. */
export function getStylePack(id: string): StylePack | undefined {
  return STYLE_PACK_REGISTRY.find((p) => p.id === id);
}

/** Returns all style packs matching a given acquisition path. */
export function getStylePacksByPath(path: StyleAcquisitionPath): StylePack[] {
  return STYLE_PACK_REGISTRY.filter((p) => p.path === path);
}

/**
 * Determine whether a user account is entitled to use a specific style pack.
 * `ownedPackIds` — style pack ids already granted (free defaults + purchases).
 * `accountTier`  — canonical tier string (e.g. "gold").
 *
 * Does NOT touch Stripe or the database — caller is responsible for providing
 * real entitlement data.  (Rule 20: no fake entitlement.)
 */
export function canUseStylePack(
  packId: string,
  ownedPackIds: string[],
  accountTier: string,
): boolean {
  const pack = getStylePack(packId);
  if (!pack) return false;

  if (pack.path === "FREE") return true;
  if (pack.path === "PAID" || pack.path === "COIN") return ownedPackIds.includes(packId);

  // TIER path — check canonical tier ordering
  if (pack.path === "TIER" && pack.requiredTier) {
    const TIER_ORDER = ["free", "pro", "ruby", "silver", "gold", "platinum", "diamond"];
    const userIdx = TIER_ORDER.indexOf(accountTier.toLowerCase());
    const reqIdx = TIER_ORDER.indexOf(pack.requiredTier);
    return userIdx >= reqIdx;
  }

  return false;
}

/**
 * Resolve the active StylePackTokens for a profile page rendering.
 * Falls back to tmi_classic if the requested pack is unavailable/unentitled.
 */
export function resolveActiveStyle(
  requestedPackId: string | null | undefined,
  ownedPackIds: string[],
  accountTier: string,
): { pack: StylePack; tokens: StylePackTokens } {
  const fallback = STYLE_PACK_REGISTRY.find((p) => p.id === "tmi_classic")!;

  if (!requestedPackId) return { pack: fallback, tokens: fallback.tokens };

  const pack = getStylePack(requestedPackId);
  if (!pack) return { pack: fallback, tokens: fallback.tokens };

  const entitled = canUseStylePack(requestedPackId, ownedPackIds, accountTier);
  if (!entitled) return { pack: fallback, tokens: fallback.tokens };

  return { pack, tokens: pack.tokens };
}

// ─── Profile customization model ─────────────────────────────────────────────

export type ProfileLayout = "SINGLE_COL" | "SIDEBAR_RIGHT" | "MAGAZINE" | "FEATURE_HERO";
export type FontPairing = "INTER" | "GROTESK" | "EDITORIAL" | "DISPLAY" | "MONO";

/** Owner-controlled public profile configuration (persisted server-side). */
export interface PublicProfileConfig {
  /** Chosen accent color as hex string (full spectrum, free). */
  accentColor: string;
  /** Which style pack is active. */
  activeStylePackId: string;
  /** Animation intensity override. */
  animationIntensity: AnimationIntensity;
  /** Page layout family. */
  layout: ProfileLayout;
  /** Font treatment. */
  font: FontPairing;
  /** Module IDs shown publicly (ordered). */
  visibleModules: string[];
  /** Short public status message (≤ 120 chars). */
  statusMessage: string | null;
  /** IDs of pinned items (song, yopho, article, room, friend) — max 5. */
  pinnedItems: string[];
  /** Whether the public page is live/published or draft. */
  published: boolean;
}

export const DEFAULT_PUBLIC_PROFILE_CONFIG: PublicProfileConfig = {
  accentColor: "#00FFFF",
  activeStylePackId: "tmi_classic",
  animationIntensity: "NORMAL",
  layout: "SINGLE_COL",
  font: "INTER",
  visibleModules: ["ABOUT", "MEDIA", "YOPHO", "PLAYLIST", "MEMORY", "MAGAZINE"],
  statusMessage: null,
  pinnedItems: [],
  published: true,
};
