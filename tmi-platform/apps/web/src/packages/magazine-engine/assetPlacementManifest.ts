/**
 * Asset Placement Manifest
 * Maps curated image/PDF assets definitively into the runtime codebase.
 * Copilot Rule: No asset renders on-screen without a mapping here.
 */

export type AssetPlacement = {
  id: string;
  sourceAsset: string;
  targetRoute: string;
  targetZone: string;
  targetComponent: string;
  fallbackComponent: string;
};

export const assetPlacementManifest: Record<string, AssetPlacement> = {
  "home1-cover": {
    id: "home1-cover",
    sourceAsset: "Tmi Homepage 1.jpg",
    targetRoute: "/home/1",
    targetZone: "coverFront",
    targetComponent: "MagazineCover",
    fallbackComponent: "StaticCoverPlaceholder",
  },
  "home2-discovery": {
    id: "home2-discovery",
    sourceAsset: "Tmi Homepage 2.png",
    targetRoute: "/home/2",
    targetZone: "discovery",
    targetComponent: "DiscoveryBelt",
    fallbackComponent: "FallbackZoneCard",
  },
  "home3-live": {
    id: "home3-live",
    sourceAsset: "Tmi Homepage 3.png",
    targetRoute: "/home/3",
    targetZone: "liveRooms",
    targetComponent: "LiveRoomsZone",
    fallbackComponent: "FallbackZoneCard",
  },
  "host-julius": {
    id: "host-julius",
    sourceAsset: "Julius.png",
    targetRoute: "global",
    targetZone: "overlay",
    targetComponent: "JuliusHelperPanel",
    fallbackComponent: "None",
  }
  // Copilot Directive: Map Home 4, Home 5, and all venue-xx.jpg assets here.
};