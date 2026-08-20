/**
 * canonicalMediaPlayerRuntime.ts
 *
 * Single source of truth for all media frames on the platform.
 *
 * Hard invariants:
 *  - ONE canonical roomId per session (set once, never changed mid-session)
 *  - ONE WebRTC acquisition per camera / screen-share source
 *  - NO duplicate WebRTC publications
 *  - NO playback restart when frames are rearranged (swap / layout change)
 *  - NO route navigation triggered by frame operations
 *  - Audio comes from exactly ONE frame at a time (primary audio arbitration)
 */

import { create } from "zustand";

// ─── Types ──────────────────────────────────────────────────────────────────

export type FrameId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export type MediaSource =
  | "SELF_CAMERA"       // performer's own camera via Daily headless call
  | "PERFORMER_FEED"    // incoming performer video track
  | "AUDIENCE_VIEW"     // audience/venue camera stream
  | "VENUE_VIEW"        // static or live venue background
  | "SCREEN_SHARE"      // screen-share track
  | "VIDEO_PLAYBACK"    // pre-recorded video / playlist item
  | "MONITOR_FEED"      // re-routed feed from another frame
  | null;               // empty / parked frame

export type LayoutMode =
  | "SINGLE"    // one frame fills the viewport
  | "SPLIT_2"   // A | B side by side (or stacked on mobile)
  | "SPLIT_3"   // A (large left) + B/C (stacked right)
  | "SPLIT_4"   // 2×2 grid
  | "GRID_6"    // 3×2 grid — density mode DENSE
  | "GRID_8";   // 4×2 grid — density mode ULTRA_DENSE

/** Controls how much chrome (labels, gaps, padding) each density tier renders. */
export type MonitorDensityMode =
  | "COMFORTABLE"  // 1–2 frames
  | "COMPACT"      // 3–4 frames
  | "DENSE"        // 6 frames
  | "ULTRA_DENSE"; // 8 frames

/** Per-source hint for how to fill the frame — cover crops live/camera feeds,
 *  contain preserves screen-share and playback without cropping. */
export type FrameFit = "cover" | "contain";

export interface FrameState {
  id: FrameId;
  source: MediaSource;
  /** When true the frame is parked (CSS-collapsed) — DOM stays mounted so
   *  WebRTC tracks are not destroyed.  Use for quick-panel yield. */
  parked: boolean;
  /** Label shown in layout picker and monitor selector */
  label: string;
  /** object-fit hint — cover for live feeds, contain for screen-share/playback */
  fit: FrameFit;
  /** When true, this frame is temporarily promoted to a large focus slot. */
  focused: boolean;
}

export interface CanonicalMediaPlayerState {
  // ── Room ──
  roomId: string | null;

  // ── Frames ──
  frames: Record<FrameId, FrameState>;

  // ── Layout ──
  layout: LayoutMode;

  // ── Fullscreen ──
  fullscreenFrame: FrameId | null;

  // ── Audio ──
  /** The frame whose audio track is currently unmuted for the viewer */
  primaryAudioFrame: FrameId | null;

  // ── Density ──
  /** Derived from layout — consumers use this to reduce chrome at higher densities. */
  densityMode: MonitorDensityMode;

  // ── Actions ──
  /** Call once when the live room session is established. Never call again mid-session. */
  setRoomId: (roomId: string) => void;

  setLayout: (mode: LayoutMode) => void;

  assignSource: (frameId: FrameId, source: MediaSource) => void;

  /** Swap sources between two frames without any WebRTC restart. */
  swapFrames: (a: FrameId, b: FrameId) => void;

  setFullscreen: (frameId: FrameId | null) => void;

  /** CSS-collapse a frame (e.g. when a quick panel needs that monitor's space).
   *  The DOM element — and the WebRTC track attached to it — remain mounted. */
  parkFrame: (frameId: FrameId) => void;

  unparkFrame: (frameId: FrameId) => void;

  setPrimaryAudio: (frameId: FrameId) => void;

  /** Update the display label for a frame (e.g. "CAM A", "VENUE", "SCREEN"). */
  setFrameLabel: (frameId: FrameId, label: string) => void;

  /** Promote a frame to the large focus slot; null clears focus without changing layout. */
  setFocusedFrame: (frameId: FrameId | null) => void;

  /** Override fit hint for a frame. */
  setFrameFit: (frameId: FrameId, fit: FrameFit) => void;

  reset: () => void;
}

// ─── Density derivation ─────────────────────────────────────────────────────

function densityForLayout(layout: LayoutMode): MonitorDensityMode {
  if (layout === "SINGLE" || layout === "SPLIT_2") return "COMFORTABLE";
  if (layout === "SPLIT_3" || layout === "SPLIT_4") return "COMPACT";
  if (layout === "GRID_6") return "DENSE";
  return "ULTRA_DENSE";
}

/** Source-type default fit: live feeds cover, informational feeds contain. */
function defaultFitForSource(source: MediaSource): FrameFit {
  if (source === "SCREEN_SHARE" || source === "VIDEO_PLAYBACK") return "contain";
  return "cover";
}

// ─── Default frames ─────────────────────────────────────────────────────────

const makeFrame = (
  id: FrameId,
  source: MediaSource,
  label: string,
): FrameState => ({ id, source, parked: false, label, fit: defaultFitForSource(source), focused: false });

const DEFAULT_FRAMES: Record<FrameId, FrameState> = {
  a: makeFrame("a", "SELF_CAMERA",   "CAM A"),
  b: makeFrame("b", "AUDIENCE_VIEW", "AUDIENCE"),
  c: makeFrame("c", null,            "MONITOR C"),
  d: makeFrame("d", null,            "MONITOR D"),
  e: makeFrame("e", null,            "MONITOR E"),
  f: makeFrame("f", null,            "MONITOR F"),
  g: makeFrame("g", null,            "MONITOR G"),
  h: makeFrame("h", null,            "MONITOR H"),
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useCanonicalMediaPlayerRuntime = create<CanonicalMediaPlayerState>(
  (set, get) => ({
    roomId: null,
    frames: { ...DEFAULT_FRAMES },
    layout: "SPLIT_2",
    fullscreenFrame: null,
    primaryAudioFrame: "b",
    densityMode: "COMFORTABLE",

    // ── Room ──

    setRoomId(roomId) {
      if (get().roomId !== null) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[CanonicalMediaPlayerRuntime] setRoomId called while roomId already set. " +
              "Ignoring to preserve the active WebRTC session."
          );
        }
        return;
      }
      set({ roomId });
    },

    // ── Layout ──

    setLayout(mode) {
      set({ layout: mode, densityMode: densityForLayout(mode) });
    },

    // ── Frame sources ──

    assignSource(frameId, source) {
      set((s) => ({
        frames: {
          ...s.frames,
          [frameId]: {
            ...s.frames[frameId],
            source,
            fit: defaultFitForSource(source),
          },
        },
      }));
    },

    swapFrames(a, b) {
      set((s) => {
        const frameA = s.frames[a];
        const frameB = s.frames[b];
        return {
          frames: {
            ...s.frames,
            [a]: { ...frameA, source: frameB.source, label: frameB.label, fit: frameB.fit },
            [b]: { ...frameB, source: frameA.source, label: frameA.label, fit: frameA.fit },
          },
          primaryAudioFrame:
            s.primaryAudioFrame === a
              ? b
              : s.primaryAudioFrame === b
              ? a
              : s.primaryAudioFrame,
        };
      });
    },

    // ── Fullscreen ──

    setFullscreen(frameId) {
      set({ fullscreenFrame: frameId });
    },

    // ── Frame parking ──

    parkFrame(frameId) {
      set((s) => ({
        frames: { ...s.frames, [frameId]: { ...s.frames[frameId], parked: true } },
      }));
    },

    unparkFrame(frameId) {
      set((s) => ({
        frames: { ...s.frames, [frameId]: { ...s.frames[frameId], parked: false } },
      }));
    },

    // ── Audio arbitration ──

    setPrimaryAudio(frameId) {
      set({ primaryAudioFrame: frameId });
    },

    // ── Labels ──

    setFrameLabel(frameId, label) {
      set((s) => ({
        frames: { ...s.frames, [frameId]: { ...s.frames[frameId], label } },
      }));
    },

    // ── Focus promotion ──

    setFocusedFrame(frameId) {
      set((s) => {
        const updated = { ...s.frames };
        for (const id of Object.keys(updated) as FrameId[]) {
          updated[id] = { ...updated[id], focused: id === frameId };
        }
        return { frames: updated };
      });
    },

    // ── Fit override ──

    setFrameFit(frameId, fit) {
      set((s) => ({
        frames: { ...s.frames, [frameId]: { ...s.frames[frameId], fit } },
      }));
    },

    // ── Reset ──

    reset() {
      set({
        roomId: null,
        frames: { ...DEFAULT_FRAMES },
        layout: "SPLIT_2",
        fullscreenFrame: null,
        primaryAudioFrame: "b",
        densityMode: "COMFORTABLE",
      });
    },
  })
);

// ─── Selectors ──────────────────────────────────────────────────────────────

export const selectFrame = (frameId: FrameId) => (s: CanonicalMediaPlayerState) =>
  s.frames[frameId];

export const selectLayout = (s: CanonicalMediaPlayerState) => s.layout;

export const selectDensityMode = (s: CanonicalMediaPlayerState) => s.densityMode;

export const selectFullscreenFrame = (s: CanonicalMediaPlayerState) =>
  s.fullscreenFrame;

export const selectPrimaryAudioFrame = (s: CanonicalMediaPlayerState) =>
  s.primaryAudioFrame;

export const selectFocusedFrame = (s: CanonicalMediaPlayerState) => {
  const entry = Object.values(s.frames).find((f) => f.focused);
  return entry?.id ?? null;
};

/** Returns true when a given frame should be visible in the current layout. */
export function isFrameActiveInLayout(frameId: FrameId, layout: LayoutMode): boolean {
  switch (layout) {
    case "SINGLE":   return frameId === "a";
    case "SPLIT_2":  return frameId === "a" || frameId === "b";
    case "SPLIT_3":  return frameId === "a" || frameId === "b" || frameId === "c";
    case "SPLIT_4":  return frameId === "a" || frameId === "b" || frameId === "c" || frameId === "d";
    case "GRID_6":   return frameId === "a" || frameId === "b" || frameId === "c" || frameId === "d" || frameId === "e" || frameId === "f";
    case "GRID_8":   return true;
    default:         return false;
  }
}

/**
 * Mobile banking helper: returns the frame IDs that should be visible in the
 * current "bank page" on a narrow viewport where showing all active frames at
 * once is impractical.  Consumers use this to build a pageable frame bank.
 *
 * @param layout  current layout mode
 * @param bankPage  0-indexed page (each page = 4 frames max on mobile)
 */
export function mobileBankFrames(layout: LayoutMode, bankPage = 0): FrameId[] {
  const all = (["a", "b", "c", "d", "e", "f", "g", "h"] as FrameId[]).filter((id) =>
    isFrameActiveInLayout(id, layout)
  );
  const pageSize = 4;
  return all.slice(bankPage * pageSize, bankPage * pageSize + pageSize);
}

/** How many bank pages are needed for a given layout on mobile. */
export function mobileBankPageCount(layout: LayoutMode): number {
  const activeCount = (["a", "b", "c", "d", "e", "f", "g", "h"] as FrameId[]).filter((id) =>
    isFrameActiveInLayout(id, layout)
  ).length;
  return Math.ceil(activeCount / 4);
}
