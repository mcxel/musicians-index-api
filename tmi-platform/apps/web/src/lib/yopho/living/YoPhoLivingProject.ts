/**
 * YoPhoLivingProject — canonical editable living-card project authority.
 * One project state shared by Quick Card, Connected Drawer, and Full Studio.
 * Persistence: LOCAL_BROWSER (localStorage) — NOT_PRISMA_YET. Honest classification.
 * Does NOT depend on AiGeneratedAssetRegistry / Visual Creator prototype Map.
 */

export const YOPHO_LIVING_PERSISTENCE = "LOCAL_BROWSER_NOT_PRISMA_YET" as const;
/** Hard YoPho motion-card limits. Any value between them is valid. */
export const YOPHO_DURATION_MIN_SEC = 1;
export const YOPHO_DURATION_MAX_SEC = 30;
/** Shortcuts only. They do not restrict the custom duration control. */
export const YOPHO_DURATION_SHORTCUTS = [5, 10, 15, 20, 30] as const;
export const YOPHO_MASTER_DURATIONS = YOPHO_DURATION_SHORTCUTS;
export type YoPhoMasterDurationSec = number;

export function clampYoPhoMasterDuration(value: number): YoPhoMasterDurationSec {
  if (!Number.isFinite(value)) return 20;
  const tenths = Math.round(value * 10) / 10;
  return Math.min(YOPHO_DURATION_MAX_SEC, Math.max(YOPHO_DURATION_MIN_SEC, tenths));
}

export type YoPhoLivingLayerFamily =
  | "BACKGROUND"
  | "UNDERLAY"
  | "SUBJECT"
  | "OBJECT"
  | "PROP"
  | "MEDIA_SURFACE"
  | "FOREGROUND"
  | "OVERLAY"
  | "TEXT"
  | "EFFECT"
  | "LIGHT"
  | "AUDIO";

export type YoPhoMotionPresetId =
  | "BOUNCE"
  | "FLOAT"
  | "SWAY"
  | "PULSE"
  | "BLINK"
  | "FLICKER"
  | "GLOW"
  | "SPIN"
  | "DRIFT"
  | "SHAKE"
  | "ZOOM"
  | "ORBIT"
  | "FLY_BY"
  | "SLIDE"
  | "POP"
  | "PARALLAX"
  | "LIGHT_SWEEP"
  | "NONE";

export interface YoPhoVec3 {
  x: number;
  y: number;
  z: number;
}

export interface YoPhoTransform {
  position: YoPhoVec3;
  scale: YoPhoVec3;
  rotation: { yaw: number; pitch: number; roll: number };
  opacity: number;
}

export interface YoPhoLayerTiming {
  inSec: number;
  outSec: number;
  loop: boolean;
  hold?: { startSec: number; endSec: number } | null;
}

export interface YoPhoMotionBlock {
  preset: YoPhoMotionPresetId;
  amplitude?: number;
  speed?: number;
  path?: Array<{ t: number; x: number; y: number; z: number; roll?: number }>;
}

export interface YoPhoLivingRegion {
  regionId: string;
  label: string;
  /** Normalized 0–1 rect on the parent layer */
  rect: { x: number; y: number; w: number; h: number };
  /** Perspective corners TL TR BR BL */
  corners?: Array<{ x: number; y: number }>;
  motionAssetRef?: string | null;
  mode: "BEHIND" | "INSIDE" | "EFFECT";
}

export interface YoPhoLivingLayer {
  layerId: string;
  family: YoPhoLivingLayerFamily;
  label: string;
  assetRef: string | null;
  /** Procedural fill when no asset (qa stars, glow, etc.) */
  procedural?: "STAR_FIELD" | "SHOOTING_STAR" | "GLOW" | "SHADOW" | "SOLID" | "RAIN" | null;
  /** Declared asset abilities. A flat picture has none, so articulated parts stay unavailable. */
  assetCapabilities?: string[];
  color?: string | null;
  visible: boolean;
  locked: boolean;
  order: number;
  depth: number;
  transform: YoPhoTransform;
  mask?: string | null;
  livingRegion?: YoPhoLivingRegion | null;
  timing: YoPhoLayerTiming;
  motion: YoPhoMotionBlock;
}

export const YOPHO_ACTION_TRACKS = [
  "CAMERA",
  "SUBJECT",
  "PROPS",
  "ENVIRONMENT",
  "TEXT",
  "EFFECTS",
  "AUDIO",
] as const;
export type YoPhoActionTrack = (typeof YOPHO_ACTION_TRACKS)[number];

export const YOPHO_ACTION_KINDS = [
  "REVEAL",
  "TITLE_ENTER",
  "RAIN",
  "CAMERA_ZOOM",
  "LIGHTING",
  "BRANDING",
  "LAYER_MOTION",
] as const;
export type YoPhoActionKind = (typeof YOPHO_ACTION_KINDS)[number];

export const YOPHO_MARKER_KINDS = ["INTRO", "REVEAL", "BEAT", "ENTRANCE", "LOGO", "OUTRO"] as const;
export type YoPhoMarkerKind = (typeof YOPHO_MARKER_KINDS)[number];

export interface YoPhoMarker {
  markerId: string;
  kind: YoPhoMarkerKind;
  label: string;
  atSec: number;
}

export interface YoPhoTimedAction {
  actionId: string;
  track: YoPhoActionTrack;
  kind: YoPhoActionKind;
  targetLayerId: string | null;
  startSec: number;
  endSec: number;
  delaySec: number;
  speed: number;
  repeat: number;
  easing: "LINEAR" | "EASE_IN" | "EASE_OUT" | "EASE_IN_OUT";
  enabled: boolean;
  cueId: string | null;
  parameters: Record<string, string | number | boolean>;
}

export interface YoPhoCueMember {
  actionId: string;
  offsetSec: number;
}

export interface YoPhoCue {
  cueId: string;
  label: string;
  atSec: number;
  members: YoPhoCueMember[];
}

export interface YoPhoTimelineEvent {
  eventId: string;
  atSec: number;
  type: "HOLD_SELECTED" | "RESUME_SELECTED" | "TITLE_POP" | "CUSTOM";
  layerIds: string[];
  payload?: Record<string, string | number | boolean>;
}

export interface YoPhoLivingProject {
  projectId: string;
  ownerId: string;
  title: string;
  durationSec: YoPhoMasterDurationSec;
  width: number;
  height: number;
  aspect: "9:16" | "3:4" | "1:1" | "16:9";
  posterFrameSec: number;
  /** Playback loop preference. Missing on older saves means loop on. */
  loopPlayback?: boolean;
  layers: YoPhoLivingLayer[];
  events: YoPhoTimelineEvent[];
  actions?: YoPhoTimedAction[];
  markers?: YoPhoMarker[];
  cues?: YoPhoCue[];
  metadata: {
    qaTag?: string;
    blueprintRefs: string[];
    version: number;
  };
  createdAt: string;
  updatedAt: string;
}

export function defaultTransform(partial?: Partial<YoPhoTransform>): YoPhoTransform {
  return {
    position: { x: 0.5, y: 0.5, z: 0, ...(partial?.position ?? {}) },
    scale: { x: 1, y: 1, z: 1, ...(partial?.scale ?? {}) },
    rotation: { yaw: 0, pitch: 0, roll: 0, ...(partial?.rotation ?? {}) },
    opacity: partial?.opacity ?? 1,
  };
}

export function createEmptyLayer(
  family: YoPhoLivingLayerFamily,
  order: number,
  durationSec: YoPhoMasterDurationSec,
  label?: string,
): YoPhoLivingLayer {
  return {
    layerId: `yl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    family,
    label: label ?? family,
    assetRef: null,
    procedural: family === "BACKGROUND" ? "SOLID" : null,
    color: family === "BACKGROUND" ? "#050510" : null,
    visible: true,
    locked: false,
    order,
    depth: order,
    transform: defaultTransform(),
    mask: null,
    livingRegion: null,
    timing: { inSec: 0, outSec: durationSec, loop: false, hold: null },
    motion: { preset: "NONE" },
  };
}

export function createYoPhoLivingProject(input: {
  ownerId: string;
  title: string;
  durationSec?: YoPhoMasterDurationSec;
  qaTag?: string;
}): YoPhoLivingProject {
  const durationSec = clampYoPhoMasterDuration(input.durationSec ?? 20);
  const now = new Date().toISOString();
  const bg = createEmptyLayer("BACKGROUND", 0, durationSec, "Background");
  return {
    projectId: `yp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ownerId: input.ownerId,
    title: input.title,
    durationSec,
    width: 720,
    height: 1280,
    aspect: "9:16",
    posterFrameSec: 0,
    loopPlayback: true,
    layers: [bg],
    events: [],
    actions: [],
    markers: [],
    cues: [],
    metadata: {
      qaTag: input.qaTag,
      blueprintRefs: [
        "Profiles/YoPho base drawer.png",
        "Profiles/YoPho base.png",
        "Profiles/Yopho blueprint.png",
      ],
      version: 1,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function sortLayersBackToFront(layers: YoPhoLivingLayer[]): YoPhoLivingLayer[] {
  return [...layers].sort((a, b) => a.order - b.order || a.depth - b.depth);
}

export function reconcileTimingForDuration(
  project: YoPhoLivingProject,
  nextDuration: number,
): YoPhoLivingProject {
  const duration = clampYoPhoMasterDuration(nextDuration);
  const scale = duration / project.durationSec;
  return {
    ...project,
    durationSec: duration,
    updatedAt: new Date().toISOString(),
    layers: project.layers.map((l) => ({
      ...l,
      motion: {
        ...l.motion,
        path: l.motion.path?.map((point) => ({
          ...point,
          t: Math.min(point.t * scale, duration),
        })),
      },
      timing: {
        ...l.timing,
        inSec: Math.min(l.timing.inSec * scale, duration),
        outSec: Math.min(Math.max(l.timing.outSec * scale, l.timing.inSec * scale + 0.1), duration),
        hold: l.timing.hold
          ? {
              startSec: Math.min(l.timing.hold.startSec * scale, duration),
              endSec: Math.min(l.timing.hold.endSec * scale, duration),
            }
          : null,
      },
    })),
    events: project.events.map((e) => ({
      ...e,
      atSec: Math.min(e.atSec * scale, duration),
    })),
    actions: (project.actions ?? []).map((action) => ({
      ...action,
      startSec: Math.min(action.startSec * scale, duration),
      endSec: Math.min(Math.max(action.endSec * scale, action.startSec * scale + 0.1), duration),
      delaySec: Math.min(action.delaySec * scale, duration),
    })),
    markers: (project.markers ?? []).map((marker) => ({
      ...marker,
      atSec: Math.min(marker.atSec * scale, duration),
    })),
    cues: (project.cues ?? []).map((cue) => ({
      ...cue,
      atSec: Math.min(cue.atSec * scale, duration),
      members: cue.members.map((member) => ({
        ...member,
        offsetSec: member.offsetSec * scale,
      })),
    })),
  };
}

const ACTION_TRACK: Record<YoPhoActionKind, YoPhoActionTrack> = {
  REVEAL: "SUBJECT",
  TITLE_ENTER: "TEXT",
  RAIN: "ENVIRONMENT",
  CAMERA_ZOOM: "CAMERA",
  LIGHTING: "EFFECTS",
  BRANDING: "TEXT",
  LAYER_MOTION: "PROPS",
};

export function trackForAction(kind: YoPhoActionKind): YoPhoActionTrack {
  return ACTION_TRACK[kind];
}

/** Whole-layer actions only. Articulated parts require a declared capability and still are not invented here. */
export function supportedActionsForLayer(layer: YoPhoLivingLayer): YoPhoActionKind[] {
  switch (layer.family) {
    case "SUBJECT":
    case "FOREGROUND":
      return ["REVEAL"];
    case "TEXT":
      return ["TITLE_ENTER", "BRANDING"];
    case "EFFECT":
    case "OVERLAY":
    case "BACKGROUND":
    case "UNDERLAY":
      return ["RAIN"];
    case "LIGHT":
      return ["LIGHTING"];
    case "OBJECT":
    case "PROP":
      return ["LAYER_MOTION"];
    default:
      return [];
  }
}
