/**
 * AdPlacementRegistry — canonical slot definitions (Rule 8 / Rule 12).
 * One registry for all ad surfaces — reserved dimensions + protected regions.
 * MonetizationKind: PLATFORM_AD countsAgainstMemberAdAllowance; PERFORMANCE_NATIVE does not.
 */

import type { AdMonetizationKind } from "./CanonicalPricingRegistry";
import { MAGAZINE_AD_MODULE_SLOTS } from "@/lib/magazine/MagazineIssueContract";

export type AdInventoryClass = "ADSENSE" | "DIRECT_SPONSOR" | "HOUSE_PROMO" | "NO_FILL";

export type AdSurface =
  | "HEADER_SPONSOR_RIBBON"
  | "MEDIA_UNDERLAY_RIBBON"
  | "SIDEBAR"
  | "ARTICLE_INLINE"
  | "CURTAIN_RAIL"
  | "JUMBOTRON_FACE"
  | "COMMAND_CENTER_BOTTOM"
  | "COMMAND_CENTER_MID"
  | "MAGAZINE_LEADERBOARD"
  | "MAGAZINE_MODULE"
  | "HOME_BANNER";

export interface AdPlacementSlot {
  slotId: string;
  surface: AdSurface;
  inventoryClass: AdInventoryClass;
  /** PLATFORM_AD vs PERFORMANCE_NATIVE (Jumbotron/Curtain/Ribbon). */
  monetizationKind: AdMonetizationKind;
  countsAgainstMemberAdAllowance: boolean;
  zoneKey: string;
  width: number;
  height: number;
  minHeight: number;
  protectedRegions: string[];
  description: string;
  /** Curtain commercials never interrupt LIVE performance. */
  neverInterruptActivePerformance?: boolean;
}

export const AD_PLACEMENT_REGISTRY: AdPlacementSlot[] = [
  {
    slotId: "header-sponsor-ribbon",
    surface: "HEADER_SPONSOR_RIBBON",
    inventoryClass: "DIRECT_SPONSOR",
    monetizationKind: "PERFORMANCE_NATIVE",
    countsAgainstMemberAdAllowance: false,
    zoneKey: "header-sponsor-ribbon",
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["hud-top", "live-badge", "session-control"],
    description: "Header sponsor ribbon — below nav, above content",
  },
  {
    slotId: "media-underlay-ribbon",
    surface: "MEDIA_UNDERLAY_RIBBON",
    inventoryClass: "ADSENSE",
    monetizationKind: "PERFORMANCE_NATIVE",
    countsAgainstMemberAdAllowance: false,
    zoneKey: "media-underlay-ribbon",
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["primary-video", "media-player-controls", "hud-overlay"],
    description: "Under primary video — PERFORMANCE_NATIVE ribbon (never over HUD/media controls)",
  },
  {
    slotId: "fan-cc-bottom",
    surface: "COMMAND_CENTER_BOTTOM",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: "fan-cc-bottom",
    width: 300,
    height: 250,
    minHeight: 250,
    protectedRegions: ["quick-panel", "avatar-panel", "venue-tools-panel"],
    description: "Fan command center bottom rail",
  },
  {
    slotId: "performer-cc-bottom",
    surface: "COMMAND_CENTER_BOTTOM",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: "performer-cc-bottom",
    width: 300,
    height: 250,
    minHeight: 250,
    protectedRegions: ["performance-rail", "go-live-controls", "venue-tools-panel"],
    description: "Performer command center bottom rail",
  },
  {
    slotId: "curtain-ad-rail",
    surface: "CURTAIN_RAIL",
    inventoryClass: "DIRECT_SPONSOR",
    monetizationKind: "PERFORMANCE_NATIVE",
    countsAgainstMemberAdAllowance: false,
    zoneKey: "curtain-ad-rail",
    width: 640,
    height: 360,
    minHeight: 200,
    protectedRegions: ["curtain-overlay-controls"],
    description: "Intermission / curtain commercial rail — never during active performance",
    neverInterruptActivePerformance: true,
  },
  {
    slotId: "jumbotron-face",
    surface: "JUMBOTRON_FACE",
    inventoryClass: "DIRECT_SPONSOR",
    monetizationKind: "PERFORMANCE_NATIVE",
    countsAgainstMemberAdAllowance: false,
    zoneKey: "jumbotron-face",
    width: 1920,
    height: 1080,
    minHeight: 720,
    protectedRegions: ["emergency-overlay", "critical-live-cue", "scoreboard"],
    description: "In-world Jumbotron face — PERFORMANCE_NATIVE inventory",
  },
  {
    slotId: "magazine-leaderboard",
    surface: "MAGAZINE_LEADERBOARD",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: "magazineLeaderboard",
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Magazine article leaderboard",
  },
  // Magazine composition modules (Rule 12 fallback chain via resolveMagazineAdModule →
  // SponsorRegistry.getAdSlotForZone). zoneKey values come from MAGAZINE_AD_MODULE_SLOTS
  // (MagazineIssueContract.ts) — never re-typed here, so the contract stays the one source.
  {
    slotId: "magazine-ad-slot-top-inset",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.AD_SLOT_TOP_INSET,
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["article-body", "magazine-nav", "hero-image"],
    description: "Magazine page top inset — above the fold, below masthead",
  },
  {
    slotId: "magazine-sponsor-sidebar",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "DIRECT_SPONSOR",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.SPONSOR_SIDEBAR,
    width: 300,
    height: 250,
    minHeight: 250,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Magazine sponsor sidebar — direct sponsor priority zone",
  },
  {
    slotId: "magazine-ad-slot-mid-article",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.AD_SLOT_MID_ARTICLE,
    width: 336,
    height: 280,
    minHeight: 280,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Native ad card between editorial sections",
  },
  {
    slotId: "magazine-partner-callout",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "DIRECT_SPONSOR",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.PARTNER_CALLOUT,
    width: 300,
    height: 120,
    minHeight: 120,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Small paid-partnership callout inset",
  },
  {
    slotId: "magazine-ad-slot-section-break",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.AD_SLOT_SECTION_BREAK,
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Full-width break between major editorial sections",
  },
  {
    slotId: "magazine-sponsor-feature-strip",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "DIRECT_SPONSOR",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.SPONSOR_FEATURE_STRIP,
    width: 728,
    height: 140,
    minHeight: 140,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Branded sponsor feature strip — direct sponsor priority zone",
  },
  {
    slotId: "magazine-ad-slot-lower-page",
    surface: "MAGAZINE_MODULE",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: MAGAZINE_AD_MODULE_SLOTS.AD_SLOT_LOWER_PAGE,
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Lower-page ad slot before discovery/community modules",
  },
  {
    slotId: "home-banner",
    surface: "HOME_BANNER",
    inventoryClass: "ADSENSE",
    monetizationKind: "PLATFORM_AD",
    countsAgainstMemberAdAllowance: true,
    zoneKey: "homepageBanner",
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["crown-holder", "live-ticker"],
    description: "Homepage banner slot",
  },
];

export function getAdPlacementSlot(slotId: string): AdPlacementSlot | undefined {
  return AD_PLACEMENT_REGISTRY.find((s) => s.slotId === slotId);
}

export function getAdPlacementsForSurface(surface: AdSurface): AdPlacementSlot[] {
  return AD_PLACEMENT_REGISTRY.filter((s) => s.surface === surface);
}

export function slotCollidesWithProtectedRegion(
  slotId: string,
  regionId: string,
): boolean {
  const slot = getAdPlacementSlot(slotId);
  return slot?.protectedRegions.includes(regionId) ?? false;
}

export function getPlatformAdSlots(): AdPlacementSlot[] {
  return AD_PLACEMENT_REGISTRY.filter((s) => s.countsAgainstMemberAdAllowance);
}

export function getPerformanceNativeSlots(): AdPlacementSlot[] {
  return AD_PLACEMENT_REGISTRY.filter((s) => s.monetizationKind === "PERFORMANCE_NATIVE");
}
