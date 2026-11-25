import { create } from "zustand";

/**
 * Teleprompter Store — single canonical runtime state for all presentations.
 *
 * Requirements:
 * - Single script authority for PAD, WORDS ONLY, OVERLAY, FULLSCREEN, MIRROR.
 * - Script position, play/pause state, speed, and font size are preserved across all modes.
 * - Private by default — never broadcasts script to audience.
 * - Persistent in localStorage (tmi_teleprompter_script_v1).
 * - MIX controls presentation composition (PAD, WORDS ONLY, OVERLAY, FULLSCREEN, MIRROR, Target Monitor, Scrim, Width).
 */

export type TeleprompterPresentationMode = "OFF" | "PAD" | "WORDS_ONLY" | "OVERLAY" | "FULLSCREEN";
export type TeleprompterMonitorTarget = "a" | "b" | "modal";
export type TeleprompterOverlayPosition = "top" | "center" | "bottom";

const STORAGE_KEY = "tmi_teleprompter_script_v1";

const DEFAULT_SCRIPT = `WELCOME TO THE MUSICIAN'S INDEX LIVE STAGE

1. OPENING ANNOUNCEMENT:
"Welcome everybody to the live room. We're competing today on TMI."

2. TRACK INTRODUCTIONS:
- Mention your latest single / video release
- Remind fans to drop tips, votes, and diamonds

3. INTERMISSION / NEXT SEGMENT:
- Keep the energy high
- Announce upcoming show dates and collaborations

(Tap EDIT SCRIPT in Pad mode to paste your own lyrics, speaking notes, or setlist.)`;

function getInitialScript(): string {
  if (typeof window === "undefined") return DEFAULT_SCRIPT;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || DEFAULT_SCRIPT;
  } catch {
    return DEFAULT_SCRIPT;
  }
}

export interface TeleprompterStore {
  script: string;
  isPlaying: boolean;
  speed: number;
  textSize: number;
  scrollTop: number;
  presentationMode: TeleprompterPresentationMode;
  isMirrored: boolean;
  targetMonitor: TeleprompterMonitorTarget;
  isPadOpen: boolean;
  overlayOpacity: number;
  readingWidthPercent: number;
  overlayPosition: TeleprompterOverlayPosition;

  setScript: (script: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  setTextSize: (textSize: number) => void;
  setScrollTop: (scrollTop: number) => void;
  setPresentationMode: (mode: TeleprompterPresentationMode) => void;
  toggleMirror: () => void;
  setTargetMonitor: (target: TeleprompterMonitorTarget) => void;
  setIsPadOpen: (open: boolean) => void;
  setOverlayOpacity: (opacity: number) => void;
  setReadingWidthPercent: (width: number) => void;
  setOverlayPosition: (pos: TeleprompterOverlayPosition) => void;
  restart: () => void;
}

export const useTeleprompterStore = create<TeleprompterStore>((set, get) => ({
  script: getInitialScript(),
  isPlaying: false,
  speed: 1,
  textSize: 24,
  scrollTop: 0,
  presentationMode: "OFF",
  isMirrored: false,
  targetMonitor: "b",
  isPadOpen: false,
  overlayOpacity: 0.65,
  readingWidthPercent: 85,
  overlayPosition: "center",

  setScript: (script: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, script);
    } catch {}
    set({ script });
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  togglePlay: () => set({ isPlaying: !get().isPlaying }),

  setSpeed: (speed: number) => set({ speed }),

  setTextSize: (textSize: number) => set({ textSize }),

  setScrollTop: (scrollTop: number) => set({ scrollTop }),

  setPresentationMode: (presentationMode: TeleprompterPresentationMode) => {
    if (presentationMode === "PAD") {
      set({ presentationMode, isPadOpen: true });
    } else if (presentationMode === "OVERLAY") {
      set({ presentationMode, targetMonitor: "a" });
    } else {
      set({ presentationMode });
    }
  },

  toggleMirror: () => set({ isMirrored: !get().isMirrored }),

  setTargetMonitor: (targetMonitor: TeleprompterMonitorTarget) => set({ targetMonitor }),

  setIsPadOpen: (isPadOpen: boolean) => set({ isPadOpen }),

  setOverlayOpacity: (overlayOpacity: number) => set({ overlayOpacity }),

  setReadingWidthPercent: (readingWidthPercent: number) => set({ readingWidthPercent }),

  setOverlayPosition: (overlayPosition: TeleprompterOverlayPosition) => set({ overlayPosition }),

  restart: () => set({ scrollTop: 0 }),
}));
