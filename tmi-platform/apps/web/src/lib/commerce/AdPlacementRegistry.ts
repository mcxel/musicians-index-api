/**
 * AdPlacementRegistry — canonical slot definitions (Rule 8 / Rule 12).
 * One registry for all ad surfaces — reserved dimensions + protected regions.
 */

export type AdInventoryClass = "ADSENSE" | "DIRECT_SPONSOR" | "HOUSE_PROMO" | "NO_FILL";

export type AdSurface =
  | "HEADER_SPONSOR_RIBBON"
  | "MEDIA_UNDERLAY_RIBBON"
  | "SIDEBAR"
  | "ARTICLE_INLINE"
  | "CURTAIN_RAIL"
  | "COMMAND_CENTER_BOTTOM"
  | "COMMAND_CENTER_MID"
  | "MAGAZINE_LEADERBOARD"
  | "HOME_BANNER";

export interface AdPlacementSlot {
  slotId: string;
  surface: AdSurface;
  inventoryClass: AdInventoryClass;
  zoneKey: string;
  width: number;
  height: number;
  minHeight: number;
  protectedRegions: string[];
  description: string;
}

export const AD_PLACEMENT_REGISTRY: AdPlacementSlot[] = [
  {
    slotId: "header-sponsor-ribbon",
    surface: "HEADER_SPONSOR_RIBBON",
    inventoryClass: "DIRECT_SPONSOR",
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
    zoneKey: "media-underlay-ribbon",
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["primary-video", "media-player-controls", "hud-overlay"],
    description: "Under primary video — never over HUD/media controls",
  },
  {
    slotId: "fan-cc-bottom",
    surface: "COMMAND_CENTER_BOTTOM",
    inventoryClass: "ADSENSE",
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
    zoneKey: "curtain-ad-rail",
    width: 640,
    height: 360,
    minHeight: 200,
    protectedRegions: ["curtain-overlay-controls"],
    description: "Intermission / curtain commercial rail",
  },
  {
    slotId: "magazine-leaderboard",
    surface: "MAGAZINE_LEADERBOARD",
    inventoryClass: "ADSENSE",
    zoneKey: "magazineLeaderboard",
    width: 728,
    height: 90,
    minHeight: 90,
    protectedRegions: ["article-body", "magazine-nav"],
    description: "Magazine article leaderboard",
  },
  {
    slotId: "home-banner",
    surface: "HOME_BANNER",
    inventoryClass: "ADSENSE",
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
