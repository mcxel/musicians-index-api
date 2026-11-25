/**
 * First-available peer-call panel placement.
 * Reuses CanonicalMediaPlayerRuntime frame order (a→h) — no parallel monitor engine.
 * Convention: a–d = Monitor 1 bank priority, e–h = Monitor 2 bank (GRID_8 / dual denseness).
 * Never auto-steals peerCallStream, screen share, broadcast, or hard-occupied sources.
 */

import {
  findFirstFreeLobbyWallPanel,
  isFrameOccupiedForLobbyWall,
  type LobbyWallPanelOccupancyHints,
} from "@/lib/media/lobbyWallFreePanelAllocator";
import {
  isFrameActiveInLayout,
  type FrameId,
  type FrameState,
  type LayoutMode,
  useCanonicalMediaPlayerRuntime,
} from "@/lib/media/canonicalMediaPlayerRuntime";

const MONITOR_1_FRAMES: readonly FrameId[] = ["a", "b", "c", "d"];
const MONITOR_2_FRAMES: readonly FrameId[] = ["e", "f", "g", "h"];

export type PeerCallAllocationResult =
  | { status: "ASSIGNED"; frameId: FrameId; bank: "MONITOR_1" | "MONITOR_2" }
  | { status: "ALL_OCCUPIED"; frameId: null; bank: null };

function firstFreeInBank(
  frames: Record<FrameId, FrameState>,
  layout: LayoutMode,
  bank: readonly FrameId[],
  hints: LobbyWallPanelOccupancyHints,
): FrameId | null {
  for (const id of bank) {
    if (!isFrameActiveInLayout(id, layout)) continue;
    const frame = frames[id];
    if (!frame) continue;
    if (!isFrameOccupiedForLobbyWall(frame, hints)) return id;
  }
  return null;
}

/** Pure allocator — Monitor 1 bank first, then Monitor 2. */
export function allocatePeerCallFrame(
  frames: Record<FrameId, FrameState>,
  layout: LayoutMode,
  hints: LobbyWallPanelOccupancyHints = {},
): PeerCallAllocationResult {
  const m1 = firstFreeInBank(frames, layout, MONITOR_1_FRAMES, hints);
  if (m1) return { status: "ASSIGNED", frameId: m1, bank: "MONITOR_1" };
  const m2 = firstFreeInBank(frames, layout, MONITOR_2_FRAMES, hints);
  if (m2) return { status: "ASSIGNED", frameId: m2, bank: "MONITOR_2" };

  // Fallback: any free active frame in full order (if layout exposes a subset oddly).
  const any = findFirstFreeLobbyWallPanel(frames, layout, hints);
  if (any) {
    return {
      status: "ASSIGNED",
      frameId: any,
      bank: MONITOR_1_FRAMES.includes(any) ? "MONITOR_1" : "MONITOR_2",
    };
  }
  return { status: "ALL_OCCUPIED", frameId: null, bank: null };
}

/** Live runtime helper for accept handlers. */
export function allocatePeerCallFrameFromRuntime(
  hints: LobbyWallPanelOccupancyHints = {},
): PeerCallAllocationResult {
  const state = useCanonicalMediaPlayerRuntime.getState();
  return allocatePeerCallFrame(state.frames, state.layout, {
    ...hints,
    layout: hints.layout ?? state.layout,
  });
}

// ─── TMI Social Cinema: 8+8 (16-Participant) Viewpoint Mapping & Lip-Sync Bridge ───

export interface ParticipantViewpointSlot16 {
  /** Global participant viewpoint position 1..16 (1..8 on Monitor 1, 9..16 on Monitor 2). */
  globalPosition: number;
  monitorId: "MONITOR_1" | "MONITOR_2";
  /** 1..8 within the target monitor. */
  monitorViewpointIndex: number;
  /** Addressable panel id in AdaptiveVoltronPresentationDirector ("panel-1-a" .. "panel-2-h"). */
  panelId: string;
  /** Canonical media frame backing this monitor bank ("a".."d" on M1, "e".."h" on M2). */
  canonicalFrameId: FrameId;
  /** Sub-tile index (0 or 1) inside the canonical frame when rendering 8 viewpoints across 4 frames. */
  subSlotInFrame: 0 | 1;
}

const PANEL_LETTERS_8 = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

/**
 * Maps any global participant position (1..16) to its deterministic 8+8 Monitor & Frame slot:
 * - Positions 1..8  -> MONITOR_1 (panel-1-a..h, canonical frames a..d)
 * - Positions 9..16 -> MONITOR_2 (panel-2-a..h, canonical frames e..h)
 */
export function mapParticipantPositionToMonitorSlot(position1To16: number): ParticipantViewpointSlot16 {
  const clamped = Math.max(1, Math.min(16, Math.round(position1To16)));
  const isMonitor1 = clamped <= 8;
  const monitorId = isMonitor1 ? "MONITOR_1" : "MONITOR_2";
  const monitorViewpointIndex = isMonitor1 ? clamped : clamped - 8; // 1..8
  const zeroIdx = monitorViewpointIndex - 1; // 0..7
  const letter = PANEL_LETTERS_8[zeroIdx] ?? "a";
  const panelId = `panel-${isMonitor1 ? "1" : "2"}-${letter}`;
  const bankFrames = isMonitor1 ? MONITOR_1_FRAMES : MONITOR_2_FRAMES;
  const canonicalFrameId = bankFrames[Math.floor(zeroIdx / 2)] ?? (isMonitor1 ? "a" : "e");
  const subSlotInFrame = (zeroIdx % 2) as 0 | 1;

  return {
    globalPosition: clamped,
    monitorId,
    monitorViewpointIndex,
    panelId,
    canonicalFrameId,
    subSlotInFrame,
  };
}

export type MultiFriendAllocationResult =
  | {
      status: "ASSIGNED";
      slot: ParticipantViewpointSlot16;
      requiresSfuTransport: boolean;
      honestTransportNote: string;
    }
  | {
      status: "ALL_OCCUPIED_16";
      slot: null;
      requiresSfuTransport: true;
      honestTransportNote: string;
    };

/**
 * Allocates the next free 1..16 participant viewpoint across Monitor 1 (1..8) -> Monitor 2 (9..16).
 * Preserves Rule 20 honesty: when activeParticipantCount >= 2 and sfuTransportReady is false,
 * flags `requiresSfuTransport: true` so the UI never fakes a 3rd WebRTC connection before Daily SFU is active.
 */
export function allocateNextFriendCallPosition(opts: {
  occupiedPositions: readonly number[];
  monitorMode?: "SINGLE" | "DUAL";
  sfuTransportReady?: boolean;
}): MultiFriendAllocationResult {
  const occupied = new Set(opts.occupiedPositions);
  const maxPosition = opts.monitorMode === "SINGLE" ? 8 : 16;

  for (let pos = 1; pos <= maxPosition; pos++) {
    if (!occupied.has(pos)) {
      const slot = mapParticipantPositionToMonitorSlot(pos);
      const nextTotalParticipants = occupied.size + 1;
      const requiresSfuTransport = nextTotalParticipants >= 2 && !opts.sfuTransportReady;
      return {
        status: "ASSIGNED",
        slot,
        requiresSfuTransport,
        honestTransportNote: requiresSfuTransport
          ? "Viewpoint reserved in 8+8 layout; live 3+ party media stream awaits Daily SFU group transport."
          : "Viewpoint assigned with live peer media transport.",
      };
    }
  }

  return {
    status: "ALL_OCCUPIED_16",
    slot: null,
    requiresSfuTransport: true,
    honestTransportNote:
      opts.monitorMode === "SINGLE"
        ? "All 8 Monitor 1 viewpoints are occupied. Expand to 2 Monitors (8+8) or choose a panel."
        : "All 16 participant viewpoints (8+8 across Monitor 1 & Monitor 2) are occupied.",
  };
}

/**
 * Converts a normalized 0..1 audio level from Claude's Daily/WebRTC participant telemetry
 * into a deterministic viseme/mouth-open directive for the Fan Avatar Bobblehead rig.
 */
export function audioLevelToLipSyncState(opts: {
  audioLevel: number;
  isSpeaking: boolean;
  isMuted?: boolean;
}): {
  talking: boolean;
  mouthOpenPct: number;
  phoneme: "rest" | "bilabial" | "vowel-close" | "vowel-mid" | "vowel-open";
} {
  if (opts.isMuted || !opts.isSpeaking || opts.audioLevel <= 0.04) {
    return { talking: false, mouthOpenPct: 0, phoneme: "rest" };
  }
  const level = Math.max(0, Math.min(1, opts.audioLevel));
  if (level < 0.2) {
    return { talking: true, mouthOpenPct: 20, phoneme: "bilabial" };
  }
  if (level < 0.45) {
    return { talking: true, mouthOpenPct: 40, phoneme: "vowel-close" };
  }
  if (level < 0.75) {
    return { talking: true, mouthOpenPct: 68, phoneme: "vowel-mid" };
  }
  return { talking: true, mouthOpenPct: 92, phoneme: "vowel-open" };
}
