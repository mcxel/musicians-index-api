/**
 * YoPho card composition state — style + scene + custom BG/text + Phase A document fields.
 * Persists to localStorage for drawer preview. Canonical scene document is YoPhoCardDocument.
 */

import type { YoPhoStudioStyleId } from "./YoPhoStudioStylePresets";
import type { YoPhoSceneId } from "./YoPhoScenePack";
import type { YoPhoMagicEffectId } from "./YoPhoMagicEffects";
import type { YoPhoCardDocument, YoPhoCardKind, YoPhoRarityLabel } from "./YoPhoCardDocument";
import type { YoPhoMediaModule } from "./YoPhoMediaModule";

export type TextOverlayPosition = "top" | "center" | "bottom";

/** Motor-card hook lengths: existing 2–7 + longer presets 5|8|10|12|15|20 */
export type YoPhoMotionDurationSec = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 15 | 20;

export const YOPHO_MOTION_DURATIONS: YoPhoMotionDurationSec[] = [
  2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20,
];

/** Max source take length we accept for upload (seconds) — card loops a hook */
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

export interface YoPhoCompositionBranding {
  enabled: boolean;
  heightPct: number;
  showQr: boolean;
  qrTarget: "card" | "profile";
  label: string;
  rarity?: YoPhoRarityLabel;
  showEditionBadge?: boolean;
  editionBadge?: string | null;
}

export interface YoPhoCompositionCanvas {
  aspectRatio: "9:16" | "3:4" | "1:1";
  width: number;
  height: number;
  safeAreaBottomPct: number;
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
  /** Optional media modules (playlist / song / motto). Does not consume image slots. */
  mediaModules?: YoPhoMediaModule[] | null;
  /** Motor card motion clip (loop hook) */
  motion?: YoPhoMotionClip | null;
  /** Toggleable magic effect presets (underlay / foreground) */
  magicEffects?: YoPhoMagicEffectId[];
  /** One canonical identity card per account */
  isCanonical?: boolean;
  /** Edition / promotional title when not canonical */
  editionTitle?: string | null;
  /** Document kind mirror for editor */
  kind?: YoPhoCardKind;
  /** Display-only collectible label — no marketplace */
  rarity?: YoPhoRarityLabel;
  brandingFooter?: YoPhoCompositionBranding;
  canvas?: YoPhoCompositionCanvas;
  /** Last built scene document (JSON source of truth for publish) */
  documentJson?: YoPhoCardDocument | null;
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
    mediaModules: [],
    motion: defaultMotionClip(),
    magicEffects: [],
    isCanonical: false,
    editionTitle: null,
    kind: "MEMORY_EDITION",
    rarity: "STANDARD",
    brandingFooter: {
      enabled: true,
      heightPct: 0.1,
      showQr: true,
      qrTarget: "card",
      label: "TMI × YoPho",
      rarity: "STANDARD",
      showEditionBadge: true,
      editionBadge: null,
    },
    canvas: {
      aspectRatio: "9:16",
      width: 360,
      height: 640,
      safeAreaBottomPct: 0.1,
    },
    documentJson: null,
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
    const duration = parsed.motion?.durationSec;
    const safeDuration =
      typeof duration === "number" &&
      (YOPHO_MOTION_DURATIONS as number[]).includes(duration)
        ? (duration as YoPhoMotionDurationSec)
        : base.motion!.durationSec;
    return {
      ...base,
      ...parsed,
      textOverlay: { ...base.textOverlay, ...(parsed.textOverlay ?? {}) },
      collageUrls: Array.isArray(parsed.collageUrls)
        ? [...parsed.collageUrls, null, null, null].slice(0, 3)
        : base.collageUrls,
      motion: {
        ...defaultMotionClip(),
        ...(parsed.motion ?? {}),
        durationSec: safeDuration,
      },
      magicEffects: Array.isArray(parsed.magicEffects) ? parsed.magicEffects : base.magicEffects,
      rarity: parsed.rarity === "RARE" ? "RARE" : "STANDARD",
      kind:
        parsed.kind === "MOMENT_SNAPSHOT"
          ? "MEMORY_EDITION"
          : parsed.kind ?? base.kind,
      brandingFooter: { ...base.brandingFooter!, ...(parsed.brandingFooter ?? {}) },
      canvas: { ...base.canvas!, ...(parsed.canvas ?? {}) },
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
