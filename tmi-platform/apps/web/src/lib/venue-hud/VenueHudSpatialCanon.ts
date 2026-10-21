/**
 * Venue HUD Spatial Canon — Rule 40 + Physical Venue World Law.
 * Screen-space HUD vs world-space venue ownership. Not a second HUD engine.
 */

export type HudLayerKind = "SCREEN_SPACE" | "WORLD_SPACE" | "HYBRID";

export const VENUE_HUD_REGIONS = [
  "TOP_STATUS_BAR",
  "LEFT_TOOL_RAIL",
  "CENTER_VENUE_VIEW",
  "RIGHT_PEOPLE_RAIL",
  "BOTTOM_ACTION_DOCK",
] as const;

export type VenueHudRegion = (typeof VENUE_HUD_REGIONS)[number];

/** Explicit ownership: HUD controls ≠ venue geometry. */
export const LAYER_OWNERSHIP: Record<string, HudLayerKind> = {
  actionDock: "SCREEN_SPACE",
  compactChat: "SCREEN_SPACE",
  reactionPicker: "SCREEN_SPACE",
  emotePicker: "SCREEN_SPACE",
  propInventory: "SCREEN_SPACE",
  tipPanel: "SCREEN_SPACE",
  hudSettings: "SCREEN_SPACE",
  stage: "WORLD_SPACE",
  curtain: "WORLD_SPACE",
  seats: "WORLD_SPACE",
  avatars: "WORLD_SPACE",
  julius: "WORLD_SPACE",
  jumbotron: "WORLD_SPACE",
  venueLighting: "WORLD_SPACE",
  reactionFx: "HYBRID",
  tipCelebration: "HYBRID",
};

/** Fan bottom dock order (left → right). */
export const FAN_DOCK_ORDER = [
  "HUD",
  "VIEW",
  "CHAT",
  "REACTIONS",
  "EMOTES",
  "PROPS",
  "GROUP",
  "TIP",
  "MEMORY",
  "MORE",
] as const;

/** Performer bottom dock order. */
export const PERFORMER_DOCK_ORDER = [
  "HUD",
  "CAMERA",
  "MIC",
  "CHAT",
  "CROWD",
  "CURTAIN",
  "SMOKE",
  "WRITE",
  "MEDIA",
  "FX",
  "MORE",
] as const;

export const VIEWING_ENVELOPE = {
  horizontalDegrees: 360,
  overheadVerticalDegrees: 120,
} as const;

export function isJumbotronHudChrome(): boolean {
  return LAYER_OWNERSHIP.jumbotron !== "WORLD_SPACE";
}

export function isCurtainHudChrome(): boolean {
  return LAYER_OWNERSHIP.curtain !== "WORLD_SPACE";
}
