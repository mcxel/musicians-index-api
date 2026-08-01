/**
 * YoPho card composition state — style + scene + custom BG/text.
 * Persists to localStorage for drawer preview (no dedicated YoPho save API yet).
 */

import type { YoPhoStudioStyleId } from "./YoPhoStudioStylePresets";
import type { YoPhoSceneId } from "./YoPhoScenePack";

export type TextOverlayPosition = "top" | "center" | "bottom";

/** Motor-card hook loop lengths (first-class editor presets) */
export type YoPhoMotionDurationSec = 2 | 3 | 4 | 5 | 6 | 7;

export const YOPHO_MOTION_DURATIONS: YoPhoMotionDurationSec[] = [2, 3, 4, 5, 6, 7];

/** Max source take length we accept for upload (seconds) — card loops a 2–7s hook */
export const YOPHO_MOTION_SOURCE_MAX_SEC = 60;

export interface YoPhoMotionClip {
  sourceUrl: string | null;
  durationSec: YoPhoMotionDurationSec;
  /** Trim start within source (seconds) */
  hookStartSec: number;
  mimeType?: string | null;
}

export interface YoPhoTextOverlay {
  text: string;
  fontSize: number;
  color: string;
  position: TextOverlayPosition;
  outline: boolean;
}

export interface YoPhoCardComposition {
  styleId: YoPhoStudioStyleId;
  sceneId: YoPhoSceneId;
  /** Custom background — data URL or https URL; overrides scene backdrop when set */
  customBgUrl: string | null;
  textOverlay: YoPhoTextOverlay;
  /** Extra collage slot images (honest empty if missing) */
  collageUrls: (string | null)[];
  /** Last published interactive card id (same browser) */
  cardId?: string | null;
  /** Attached playlist for interactive Next Track */
  playlistId?: string | null;
  /** Motor card motion clip (loop hook) */
  motion?: YoPhoMotionClip | null;
  updatedAt: string;
}

export function defaultMotionClip(): YoPhoMotionClip {
  return {
    sourceUrl: null,
    durationSec: 4,
    hookStartSec: 0,
    mimeType: null,
  };
}

export const TMI_TEXT_COLORS = ["#FFFFFF", "#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88"] as const;

export function defaultTextOverlay(year = String(new Date().getFullYear())): YoPhoTextOverlay {
  return {
    text: year,
    fontSize: 28,
    color: "#FFD700",
    position: "bottom",
    outline: true,
  };
}

export function createDefaultComposition(): YoPhoCardComposition {
  return {
    styleId: "classic",
    sceneId: "neon_stage",
    customBgUrl: null,
    textOverlay: defaultTextOverlay(),
    collageUrls: [null, null, null],
    cardId: null,
    playlistId: null,
    motion: defaultMotionClip(),
    updatedAt: new Date().toISOString(),
  };
}

function storageKey(role: string, userKey: string): string {
  return `tmi_yopho_card_comp_${role}_${userKey}`;
}

export function loadCardComposition(role: string, userKey: string): YoPhoCardComposition {
  if (typeof window === "undefined") return createDefaultComposition();
  try {
    const raw = localStorage.getItem(storageKey(role, userKey));
    if (!raw) return createDefaultComposition();
    const parsed = JSON.parse(raw) as Partial<YoPhoCardComposition>;
    const base = createDefaultComposition();
    return {
      ...base,
      ...parsed,
      textOverlay: { ...base.textOverlay, ...(parsed.textOverlay ?? {}) },
      collageUrls: Array.isArray(parsed.collageUrls)
        ? [...parsed.collageUrls, null, null, null].slice(0, 3)
        : base.collageUrls,
      motion: { ...defaultMotionClip(), ...(parsed.motion ?? {}) },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createDefaultComposition();
  }
}

export function saveCardComposition(
  role: string,
  userKey: string,
  comp: YoPhoCardComposition,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      storageKey(role, userKey),
      JSON.stringify({ ...comp, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* quota / private mode — preview still works in memory */
  }
}
