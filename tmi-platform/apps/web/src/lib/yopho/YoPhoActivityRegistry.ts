/**
 * YoPho activity catalog — maps hub tiles to existing workspaces only.
 * LIVE / CODE_WIRED appear on the hub. TYPE_ONLY / COMING_SOON stay hidden.
 */

export type YoPhoAvailability = "LIVE" | "CODE_WIRED" | "TYPE_ONLY" | "COMING_SOON";
export type YoPhoHubRole = "fan" | "performer";
export type YoPhoMobilePresentation = "HUB_TILE" | "HIDDEN";

export interface YoPhoActivity {
  id: string;
  label: string;
  capability: string;
  routeOrWorkspace: string;
  availability: YoPhoAvailability;
  mobilePresentation: YoPhoMobilePresentation;
  roles: YoPhoHubRole[];
}

export const YOPHO_ACTIVITIES: YoPhoActivity[] = [
  {
    id: "create_card",
    label: "Create Card",
    capability: "Triple-stage composer + living card editor",
    routeOrWorkspace:
      "YoPhoFanPortraitWorkspace / YoPhoTradingCard overlay; full canvas /fan/canvas | /performer/canvas",
    availability: "LIVE",
    mobilePresentation: "HUB_TILE",
    roles: ["fan", "performer"],
  },
  {
    id: "view_collection",
    label: "Collection",
    capability: "Personal editions + collected / published cards",
    routeOrWorkspace: "YoPhoEditionEngine + listPublishedCardsLocal + /yopho/card/[cardId]",
    availability: "LIVE",
    mobilePresentation: "HUB_TILE",
    roles: ["fan", "performer"],
  },
  {
    id: "skin_selector",
    label: "Player Skin",
    capability: "Playlist / media-player chassis picker (Fan store path)",
    routeOrWorkspace: "PlaylistCardSkinSelector + MediaPlayerInventory",
    availability: "CODE_WIRED",
    mobilePresentation: "HUB_TILE",
    roles: ["fan"],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    capability: "YoArtifact release shelf + performer merch drawer",
    routeOrWorkspace: "YoReleaseShelf + MarketplaceDrawerPanel",
    availability: "CODE_WIRED",
    mobilePresentation: "HUB_TILE",
    roles: ["fan", "performer"],
  },
  {
    id: "trade",
    label: "Trade",
    capability: "Card trade / exchange",
    routeOrWorkspace: "YoPhoEditionEngine — Gift/trade deferred",
    availability: "COMING_SOON",
    mobilePresentation: "HIDDEN",
    roles: ["fan", "performer"],
  },
  {
    id: "triptych",
    label: "Triptych",
    capability: "Multi-image depth presets (data only)",
    routeOrWorkspace: "YoPhoTriptychPresets.ts — used inside Triple Stage layers, no standalone picker",
    availability: "TYPE_ONLY",
    mobilePresentation: "HIDDEN",
    roles: ["fan", "performer"],
  },
  {
    id: "card_lock",
    label: "Card Lock",
    capability: "Lock / sale policy on YoPho documents",
    routeOrWorkspace: "YoCardLockEngine.ts + /api/yo/purchase — no lock workspace UI",
    availability: "TYPE_ONLY",
    mobilePresentation: "HIDDEN",
    roles: ["fan", "performer"],
  },
  {
    id: "fan_mosaic",
    label: "Fan Mosaic",
    capability: "Magazine random page type only — not a live collage board",
    routeOrWorkspace: "MagazineIssueContract FAN_YOPHO_MOSAIC",
    availability: "TYPE_ONLY",
    mobilePresentation: "HIDDEN",
    roles: ["fan"],
  },
  {
    id: "performer_mosaic",
    label: "Performer Mosaic",
    capability: "Magazine random page type only — not a live collage board",
    routeOrWorkspace: "MagazineIssueContract PERFORMER_YOPHO_MOSAIC",
    availability: "TYPE_ONLY",
    mobilePresentation: "HIDDEN",
    roles: ["performer"],
  },
];

export function listVisibleYoPhoActivities(role: YoPhoHubRole): YoPhoActivity[] {
  return YOPHO_ACTIVITIES.filter(
    (a) =>
      a.roles.includes(role) &&
      a.mobilePresentation === "HUB_TILE" &&
      (a.availability === "LIVE" || a.availability === "CODE_WIRED"),
  );
}
