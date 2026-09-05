/**
 * ProfileConfigService
 *
 * Server-side helpers for reading and writing PublicProfileConfig.
 * Entitlement validation happens here — never trust the client.
 */

import prisma from "@/lib/prisma";
import {
  canUseStylePack,
  FREE_STYLE_IDS,
  DEFAULT_PUBLIC_PROFILE_CONFIG,
  type PublicProfileConfig,
  type AnimationIntensity,
  type ProfileLayout,
} from "@/lib/profile/PublicProfileStyleEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbProfileConfig {
  themeColor: string;
  activeStylePackId: string;
  animationIntensity: AnimationIntensity;
  layout: ProfileLayout;
  visibleModules: string[];
  statusMessage: string | null;
  pinnedItems: string[];
  published: boolean;
}

/** Owned style pack ids for an account. Currently: free defaults + tier unlocks. */
async function resolveOwnedPackIds(userId: string, tier: string): Promise<string[]> {
  // Phase 1: FREE defaults + tier unlocks only.
  // Phase 2 (coin purchases / $0.99 paid packs) will query a StylePackOwnership
  // table once the purchase flow is built.
  return FREE_STYLE_IDS;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function validateThemeColor(v: unknown): string {
  if (typeof v !== "string" || !HEX_COLOR_RE.test(v)) {
    return DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor;
  }
  return v.toUpperCase();
}

const VALID_INTENSITIES: AnimationIntensity[] = ["OFF", "LOW", "NORMAL", "HIGH"];
const VALID_LAYOUTS: ProfileLayout[] = ["SINGLE_COL", "SIDEBAR_RIGHT", "MAGAZINE", "FEATURE_HERO"];
const VALID_MODULES = new Set([
  "ABOUT", "MEDIA", "FEATURED_TRACK", "PLAYLIST", "YOPHO",
  "SNIPS", "MEMORY", "LIVE_NOW", "UPCOMING", "MAGAZINE",
  "BOOKING", "MERCH", "ACHIEVEMENTS", "FOLLOWING", "SOCIAL_LINKS",
]);

function rowToConfig(row: {
  themeColor: string;
  activeStylePackId: string;
  animationIntensity: string;
  layout: string;
  visibleModules: unknown;
  statusMessage: string | null;
  pinnedItems: unknown;
  published: boolean;
}): DbProfileConfig {
  return {
    themeColor: row.themeColor,
    activeStylePackId: row.activeStylePackId,
    animationIntensity: (VALID_INTENSITIES.includes(row.animationIntensity as AnimationIntensity)
      ? row.animationIntensity
      : "NORMAL") as AnimationIntensity,
    layout: (VALID_LAYOUTS.includes(row.layout as ProfileLayout)
      ? row.layout
      : "SINGLE_COL") as ProfileLayout,
    visibleModules: Array.isArray(row.visibleModules) && (row.visibleModules as string[]).length > 0
      ? (row.visibleModules as string[]).filter((m) => VALID_MODULES.has(m))
      : DEFAULT_PUBLIC_PROFILE_CONFIG.visibleModules,
    statusMessage: typeof row.statusMessage === "string" ? row.statusMessage.slice(0, 120) : null,
    pinnedItems: Array.isArray(row.pinnedItems) ? (row.pinnedItems as string[]).slice(0, 5) : [],
    published: row.published,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Return the saved config for a user, or canonical defaults if none saved yet. */
export async function getProfileConfig(userId: string): Promise<DbProfileConfig> {
  const row = await prisma.publicProfileConfig.findUnique({ where: { userId } });
  if (!row) {
    return {
      themeColor: DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor,
      activeStylePackId: DEFAULT_PUBLIC_PROFILE_CONFIG.activeStylePackId,
      animationIntensity: DEFAULT_PUBLIC_PROFILE_CONFIG.animationIntensity,
      layout: DEFAULT_PUBLIC_PROFILE_CONFIG.layout,
      visibleModules: DEFAULT_PUBLIC_PROFILE_CONFIG.visibleModules,
      statusMessage: DEFAULT_PUBLIC_PROFILE_CONFIG.statusMessage,
      pinnedItems: DEFAULT_PUBLIC_PROFILE_CONFIG.pinnedItems,
      published: DEFAULT_PUBLIC_PROFILE_CONFIG.published,
    };
  }
  return rowToConfig(row);
}

/** Read config for a PUBLIC profile page — respects `published` flag. */
export async function getPublicProfileConfig(userId: string): Promise<DbProfileConfig> {
  const cfg = await getProfileConfig(userId);
  if (!cfg.published) {
    // Visitor sees defaults while owner has unpublished draft
    return {
      themeColor: DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor,
      activeStylePackId: DEFAULT_PUBLIC_PROFILE_CONFIG.activeStylePackId,
      animationIntensity: DEFAULT_PUBLIC_PROFILE_CONFIG.animationIntensity,
      layout: DEFAULT_PUBLIC_PROFILE_CONFIG.layout,
      visibleModules: DEFAULT_PUBLIC_PROFILE_CONFIG.visibleModules,
      statusMessage: null,
      pinnedItems: [],
      published: false,
    };
  }
  return cfg;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export type SaveConfigInput = Partial<PublicProfileConfig>;

export interface SaveConfigResult {
  ok: boolean;
  config?: DbProfileConfig;
  error?: string;
  status?: number;
}

/**
 * Persist a profile config update.
 * Validates all fields and entitlements server-side — never trusts client flags.
 */
export async function saveProfileConfig(
  userId: string,
  tier: string,
  input: SaveConfigInput,
): Promise<SaveConfigResult> {
  // Resolve real owned pack ids for this account
  const ownedPackIds = await resolveOwnedPackIds(userId, tier);

  const current = await getProfileConfig(userId);

  // Validate themeColor
  const themeColor = "accentColor" in input
    ? validateThemeColor(input.accentColor)
    : current.themeColor;

  // Validate + authorize activeStylePackId
  let activeStylePackId = current.activeStylePackId;
  if ("activeStylePackId" in input && typeof input.activeStylePackId === "string") {
    const entitled = canUseStylePack(input.activeStylePackId, ownedPackIds, tier);
    if (!entitled) {
      return { ok: false, error: "Style pack not owned by this account.", status: 403 };
    }
    activeStylePackId = input.activeStylePackId;
  }

  // Validate animationIntensity
  const animationIntensity: AnimationIntensity =
    input.animationIntensity && VALID_INTENSITIES.includes(input.animationIntensity)
      ? input.animationIntensity
      : current.animationIntensity;

  // Validate layout
  const layout: ProfileLayout =
    input.layout && VALID_LAYOUTS.includes(input.layout)
      ? input.layout
      : current.layout;

  // Validate visibleModules
  const visibleModules: string[] = Array.isArray(input.visibleModules)
    ? input.visibleModules.filter((m) => VALID_MODULES.has(m))
    : current.visibleModules;

  // Validate statusMessage
  const statusMessage =
    typeof input.statusMessage === "string"
      ? input.statusMessage.slice(0, 120)
      : input.statusMessage === null
        ? null
        : current.statusMessage;

  // Validate pinnedItems
  const pinnedItems = Array.isArray(input.pinnedItems)
    ? input.pinnedItems.slice(0, 5)
    : current.pinnedItems;

  const published =
    typeof input.published === "boolean" ? input.published : current.published;

  const data = {
    themeColor,
    activeStylePackId,
    animationIntensity,
    layout,
    visibleModules,
    statusMessage,
    pinnedItems,
    published,
  };

  const row = await prisma.publicProfileConfig.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return { ok: true, config: rowToConfig(row) };
}
