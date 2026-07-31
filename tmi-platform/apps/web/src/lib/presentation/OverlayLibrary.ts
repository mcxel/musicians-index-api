/**
 * Reusable overlay library entries — data descriptors, not 100 visual assets.
 * Directors resolve these by id into placement intents.
 */

import type { MonitorAnchorZoneId } from "./MonitorAnchorZones";
import type { PresentationLayerId } from "./LayerStack";

export interface OverlayLibraryEntry {
  id: string;
  label: string;
  kind:
    | "LOWER_THIRD"
    | "ROUND_BANNER"
    | "VS_BADGE"
    | "SCORE_PANEL"
    | "WINNER_BANNER"
    | "SPONSOR_BUG"
    | "CAMERA_CUE"
    | "CAPTION_BAR";
  defaultAnchor: MonitorAnchorZoneId;
  defaultLayer: PresentationLayerId;
  /** Honest note — visual asset may be CSS/placeholder until Asset Compiler */
  assetStatus: "STRUCTURE_ONLY" | "CSS_SHELL" | "WIRED";
  tags: string[];
}

export const OVERLAY_LIBRARY: OverlayLibraryEntry[] = [
  {
    id: "overlay.lower-third.standard",
    label: "Standard lower third",
    kind: "LOWER_THIRD",
    defaultAnchor: "BOTTOM",
    defaultLayer: "OVERLAYS",
    assetStatus: "CSS_SHELL",
    tags: ["battle", "cypher", "challenge", "concert"],
  },
  {
    id: "overlay.round-banner",
    label: "Round / phase banner",
    kind: "ROUND_BANNER",
    defaultAnchor: "TOP",
    defaultLayer: "OVERLAYS",
    assetStatus: "CSS_SHELL",
    tags: ["battle", "cypher", "challenge"],
  },
  {
    id: "overlay.vs-badge",
    label: "VS badge",
    kind: "VS_BADGE",
    defaultAnchor: "CENTER",
    defaultLayer: "TRANSITIONS",
    assetStatus: "CSS_SHELL",
    tags: ["battle"],
  },
  {
    id: "overlay.score-panel",
    label: "Score panel (real tallies only)",
    kind: "SCORE_PANEL",
    defaultAnchor: "TOP",
    defaultLayer: "OVERLAYS",
    assetStatus: "STRUCTURE_ONLY",
    tags: ["battle", "challenge"],
  },
  {
    id: "overlay.winner-banner",
    label: "Winner crown banner",
    kind: "WINNER_BANNER",
    defaultAnchor: "CENTER",
    defaultLayer: "OVERLAYS",
    assetStatus: "CSS_SHELL",
    tags: ["battle", "challenge", "award"],
  },
  {
    id: "overlay.sponsor-bug",
    label: "Sponsor bug",
    kind: "SPONSOR_BUG",
    defaultAnchor: "BOTTOM_RIGHT",
    defaultLayer: "OVERLAYS",
    assetStatus: "STRUCTURE_ONLY",
    tags: ["battle", "concert", "lobby"],
  },
  {
    id: "overlay.camera-cue",
    label: "Camera cue chip",
    kind: "CAMERA_CUE",
    defaultAnchor: "TOP_LEFT",
    defaultLayer: "OVERLAYS",
    assetStatus: "CSS_SHELL",
    tags: ["preview", "observatory"],
  },
  {
    id: "overlay.caption-bar",
    label: "Caption / accessibility bar",
    kind: "CAPTION_BAR",
    defaultAnchor: "BOTTOM",
    defaultLayer: "CRITICAL_ALERTS",
    assetStatus: "STRUCTURE_ONLY",
    tags: ["a11y", "all"],
  },
];

export function getOverlayLibraryEntry(id: string): OverlayLibraryEntry | undefined {
  return OVERLAY_LIBRARY.find((e) => e.id === id);
}

export function listOverlayLibrary(tag?: string): OverlayLibraryEntry[] {
  if (!tag) return [...OVERLAY_LIBRARY];
  return OVERLAY_LIBRARY.filter((e) => e.tags.includes(tag) || e.tags.includes("all"));
}
