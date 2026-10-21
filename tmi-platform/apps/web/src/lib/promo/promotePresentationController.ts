/**
 * Promote presentation controller.
 * Visual placement uses MonitorAnchorZones.
 * Audio/queue commands refuse when the asset has no canonical playable source.
 * Live PLAYING state is not written into the device preset.
 */

import type { MonitorAnchorZoneId } from "@/lib/presentation/MonitorAnchorZones";
import {
  isCanonicalMonitorId,
  presentedMonitorOrRefuse,
  type Phase1PresentedMonitorId,
} from "@/lib/monitors/canonicalMonitorIdentity";
import type { UniversalPromoItem } from "@/lib/promo/UniversalPromotionRackAuthority";

export type PromoMediaKind = "SONG" | "PLAYLIST" | "ALBUM" | "ARTWORK" | "SPONSOR" | "VIDEO" | "OTHER";

export type PromoVisualSize = "COMPACT" | "FIT" | "FILL";

/** Phase 1 PROMOTE glass is the presented pair. M3–M8 are not targets. */
export type PromoVisualTarget = Phase1PresentedMonitorId;

export function normalizePromoVisualTarget(value: unknown): PromoVisualTarget | null {
  if (!isCanonicalMonitorId(value)) return null;
  return presentedMonitorOrRefuse(value);
}

export const PROMO_ANCHOR_PRESETS: MonitorAnchorZoneId[] = [
  "TOP_LEFT",
  "TOP_RIGHT",
  "CENTER",
  "BOTTOM_LEFT",
  "BOTTOM_RIGHT",
];

export type PromoPlacementPreset = {
  anchor: MonitorAnchorZoneId;
  size: PromoVisualSize;
  target: PromoVisualTarget;
};

export type PromoLiveVisual = PromoPlacementPreset & {
  promoItemId: string;
  onScreen: boolean;
  hidden: boolean;
};

const PRESET_KEY = "tmi.promote.presentationPreset.v1";

export function classifyPromoMedia(item: Pick<UniversalPromoItem, "sourceType" | "sourceAuthority" | "badge">): PromoMediaKind {
  if (item.sourceAuthority === "HouseSponsorCanon" || item.sourceType === "SPONSOR_CAMPAIGN") return "SPONSOR";
  if (item.sourceType === "YO_SINGLE") return "SONG";
  if (item.sourceType === "STREAM") return "PLAYLIST";
  if (item.sourceType === "YO_ALBUM" || item.sourceType === "YO_EP" || item.sourceType === "YOALBUM_SECURE") return "ALBUM";
  if (item.badge === "ARTWORK" || item.sourceType === "FILM_PROJECT") return "ARTWORK";
  return "OTHER";
}

export function defaultPlacement(): PromoPlacementPreset {
  return { anchor: "BOTTOM", size: "COMPACT", target: "M1" };
}

export function readPlacementPreset(userId: string, promoItemId: string): PromoPlacementPreset | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, PromoPlacementPreset>;
    const hit = all[`${userId}:${promoItemId}`];
    const target = normalizePromoVisualTarget(hit?.target);
    if (!hit?.anchor || !hit.size || !target) return null;
    return { anchor: hit.anchor, size: hit.size, target };
  } catch {
    return null;
  }
}

export function writePlacementPreset(userId: string, promoItemId: string, preset: PromoPlacementPreset): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, PromoPlacementPreset>) : {};
    all[`${userId}:${promoItemId}`] = {
      anchor: preset.anchor,
      size: preset.size,
      target: preset.target,
    };
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(all));
  } catch {
    /* device storage unavailable */
  }
}

/** Playback is refused unless the caller already holds a real media URL. */
export function commandPromoTransport(input: {
  action: "PLAY" | "PAUSE" | "STOP" | "RESTART" | "NEXT" | "PREVIOUS";
  audioUrl?: string | null;
  hasQueue?: boolean;
}): { ok: false; code: "NO_PLAYBACK_SOURCE" | "NO_QUEUE" } | { ok: true; code: "DELEGATE_TO_MONITOR_AUDIO" } {
  if (input.action === "NEXT" || input.action === "PREVIOUS") {
    if (!input.hasQueue) return { ok: false, code: "NO_QUEUE" };
  }
  if (!input.audioUrl) return { ok: false, code: "NO_PLAYBACK_SOURCE" };
  return { ok: true, code: "DELEGATE_TO_MONITOR_AUDIO" };
}

export const UNSUPPORTED_PROMO_CONTROLS = [
  "SHUFFLE",
  "REPEAT",
  "VISUALIZER",
  "ROTATION_INTERVAL",
  "FREEFORM_DRAG",
  "VIDEO_SEEK",
] as const;
