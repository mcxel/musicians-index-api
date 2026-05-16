export type CameraMode = "WORLD_RELEASE" | "VERSUS_BATTLE" | "GUEST_JAM";

export type CameraLayout =
  | "VIDEO_FULL"
  | "ARTIST_FULL"
  | "ARTIST_PIP"
  | "OPPONENT_PIP"
  | "SPLIT_SCREEN"
  | "TURN_A_FULL"
  | "TURN_B_FULL"
  | "REACTION_VIEW"
  | "REPLAY_VIEW";

export type CameraTrigger =
  | "VIDEO_STARTED"
  | "VIDEO_ENDED"
  | "FAN_ENGAGED"
  | "TURN_SWITCH"
  | "VOTING_STARTED"
  | "GUEST_JOINED"
  | "REPLAY_REQUESTED"
  | "REACTION_PEAK";

export type SlotName = "video" | "artist" | "opponent" | "guest";

export type SlotGeometry = {
  top: string;
  left: string;
  width: string;
  height: string;
  opacity: number;
  zIndex: number;
  borderRadius: string;
  pointerEvents: "none" | "auto";
};

// All hidden slots park at full size with opacity 0.
// This produces a "camera zoom" effect when slots appear (shrinking into position)
// and a "zoom out to dismiss" when they disappear — no hard cuts.
const PARKED: SlotGeometry = {
  top: "0%", left: "0%", width: "100%", height: "100%",
  opacity: 0, zIndex: 0, borderRadius: "0px", pointerEvents: "none",
};

const FULL: SlotGeometry = {
  top: "0%", left: "0%", width: "100%", height: "100%",
  opacity: 1, zIndex: 1, borderRadius: "0px", pointerEvents: "auto",
};

// Bottom-right picture-in-picture (secondary cam)
const PIP_BR: SlotGeometry = {
  top: "73%", left: "74%", width: "24%", height: "25%",
  opacity: 1, zIndex: 3, borderRadius: "12px", pointerEvents: "auto",
};

// Bottom-left picture-in-picture (minimized opponent cam during battle).
// 28×28% ensures the opponent is always 25%+ of visual weight — battle authority rule.
const PIP_BL: SlotGeometry = {
  top: "70%", left: "2%", width: "28%", height: "28%",
  opacity: 0.88, zIndex: 3, borderRadius: "12px", pointerEvents: "auto",
};

const LEFT_HALF: SlotGeometry = {
  top: "0%", left: "0%", width: "50%", height: "100%",
  opacity: 1, zIndex: 1, borderRadius: "0px", pointerEvents: "auto",
};

const RIGHT_HALF: SlotGeometry = {
  top: "0%", left: "50%", width: "50%", height: "100%",
  opacity: 1, zIndex: 1, borderRadius: "0px", pointerEvents: "auto",
};

const LEFT_WIDE: SlotGeometry = {
  top: "0%", left: "0%", width: "65%", height: "100%",
  opacity: 1, zIndex: 1, borderRadius: "0px", pointerEvents: "auto",
};

const RIGHT_NARROW: SlotGeometry = {
  top: "0%", left: "65%", width: "35%", height: "100%",
  opacity: 1, zIndex: 1, borderRadius: "0px", pointerEvents: "auto",
};

export const LAYOUT_MAP: Record<CameraLayout, Record<SlotName, SlotGeometry>> = {
  // Music video dominates; artist cam hidden until engaged
  VIDEO_FULL: {
    video: FULL,
    artist: PARKED,
    opponent: PARKED,
    guest: PARKED,
  },

  // Artist on camera full screen (post-video, Q&A, replay talk)
  ARTIST_FULL: {
    video: PARKED,
    artist: FULL,
    opponent: PARKED,
    guest: PARKED,
  },

  // Video plays full; artist cam appears bottom-right as PiP
  ARTIST_PIP: {
    video: FULL,
    artist: PIP_BR,
    opponent: PARKED,
    guest: PARKED,
  },

  // Artist on camera full; opponent cam appears bottom-right as PiP
  OPPONENT_PIP: {
    video: PARKED,
    artist: FULL,
    opponent: PIP_BR,
    guest: PARKED,
  },

  // Both performers side by side (voting, intros, countdowns)
  SPLIT_SCREEN: {
    video: PARKED,
    artist: LEFT_HALF,
    opponent: RIGHT_HALF,
    guest: PARKED,
  },

  // Performer A is active; B stays minimized bottom-left
  TURN_A_FULL: {
    video: PARKED,
    artist: { ...FULL, zIndex: 2 },
    opponent: PIP_BL,
    guest: PARKED,
  },

  // Performer B is active; A stays minimized bottom-left
  TURN_B_FULL: {
    video: PARKED,
    artist: PIP_BL,
    opponent: { ...FULL, zIndex: 2 },
    guest: PARKED,
  },

  // Reaction content takes right side; video shrinks left
  REACTION_VIEW: {
    video: LEFT_WIDE,
    artist: PARKED,
    opponent: PARKED,
    guest: RIGHT_NARROW,
  },

  // Replay: video full screen, controls rendered as overlay
  REPLAY_VIEW: {
    video: FULL,
    artist: PARKED,
    opponent: PARKED,
    guest: PARKED,
  },
};

type TransitionTable = Partial<Record<CameraTrigger, CameraLayout>>;

const TRANSITIONS: Record<CameraMode, Partial<Record<CameraLayout, TransitionTable>>> = {
  WORLD_RELEASE: {
    VIDEO_FULL: {
      VIDEO_ENDED: "ARTIST_FULL",
      FAN_ENGAGED: "ARTIST_PIP",
      REPLAY_REQUESTED: "REPLAY_VIEW",
    },
    ARTIST_PIP: {
      VIDEO_ENDED: "ARTIST_FULL",
      REPLAY_REQUESTED: "REPLAY_VIEW",
    },
    ARTIST_FULL: {
      VIDEO_STARTED: "VIDEO_FULL",
      REPLAY_REQUESTED: "REPLAY_VIEW",
      REACTION_PEAK: "REACTION_VIEW",
    },
    REPLAY_VIEW: {
      VIDEO_STARTED: "VIDEO_FULL",
      FAN_ENGAGED: "ARTIST_PIP",
    },
    REACTION_VIEW: {
      VIDEO_STARTED: "VIDEO_FULL",
      REPLAY_REQUESTED: "REPLAY_VIEW",
    },
  },

  VERSUS_BATTLE: {
    TURN_A_FULL: {
      TURN_SWITCH: "TURN_B_FULL",
      VOTING_STARTED: "SPLIT_SCREEN",
      REACTION_PEAK: "REACTION_VIEW",
    },
    TURN_B_FULL: {
      TURN_SWITCH: "TURN_A_FULL",
      VOTING_STARTED: "SPLIT_SCREEN",
      REACTION_PEAK: "REACTION_VIEW",
    },
    SPLIT_SCREEN: {
      TURN_SWITCH: "TURN_A_FULL",
      REACTION_PEAK: "REACTION_VIEW",
    },
    REACTION_VIEW: {
      TURN_SWITCH: "TURN_A_FULL",
    },
  },

  GUEST_JAM: {
    ARTIST_FULL: {
      GUEST_JOINED: "OPPONENT_PIP",
    },
    OPPONENT_PIP: {
      FAN_ENGAGED: "SPLIT_SCREEN",
    },
    SPLIT_SCREEN: {
      REACTION_PEAK: "REACTION_VIEW",
      FAN_ENGAGED: "OPPONENT_PIP",
    },
    REACTION_VIEW: {
      FAN_ENGAGED: "SPLIT_SCREEN",
    },
  },
};

export function suggestLayout(
  mode: CameraMode,
  current: CameraLayout,
  trigger: CameraTrigger
): CameraLayout {
  return TRANSITIONS[mode]?.[current]?.[trigger] ?? current;
}

export function defaultLayout(mode: CameraMode): CameraLayout {
  if (mode === "VERSUS_BATTLE") return "TURN_A_FULL";
  if (mode === "GUEST_JAM") return "ARTIST_FULL";
  return "VIDEO_FULL";
}

// ─── Signal-driven auto-switching ─────────────────────────────────────────────
// The Director follows energy, not buttons.
// Call this every polling interval with live signals; use the return value as the
// new layout if it differs from current. Keeps manual triggers as an override path.

export type LiveSignals = {
  heat: number;            // 0–100 room energy
  audioLevelA: number;     // 0–100 simulated mic level for Performer A
  audioLevelB: number;     // 0–100 simulated mic level for Performer B
  voteDelta: number;       // aVotes - bVotes (positive = A winning)
  newFanRate: number;      // 0–100, new fan conversions per minute
  completionRate: number;  // 0–100, average track completion
  likeRate: number;        // 0–100, like rate
};

// ─── Momentum Engine ──────────────────────────────────────────────────────────
// Each tick blends new signal into a running score via EMA (α=0.85).
// This prevents instant snapping — the camera builds toward a moment,
// not reacts to a single frame of data.

export type MomentumState = {
  scoreA: number;
  scoreB: number;
};

export const MOMENTUM_INITIAL: MomentumState = { scoreA: 0, scoreB: 0 };

export function updateMomentum(prev: MomentumState, signals: LiveSignals): MomentumState {
  const aVoteBoost = Math.max(0, signals.voteDelta);
  const bVoteBoost = Math.max(0, -signals.voteDelta);
  return {
    scoreA: prev.scoreA * 0.85 + signals.audioLevelA * 0.10 + aVoteBoost * 0.05,
    scoreB: prev.scoreB * 0.85 + signals.audioLevelB * 0.10 + bVoteBoost * 0.05,
  };
}

export function resolveDominant(momentum: MomentumState): "A" | "B" | "NONE" {
  if (momentum.scoreA > momentum.scoreB + 5) return "A";
  if (momentum.scoreB > momentum.scoreA + 5) return "B";
  return "NONE";
}

// ─── Switch cooldown ──────────────────────────────────────────────────────────
// Once a performer earns the spotlight, they hold it for at least this long.
// Prevents the camera from bouncing between layouts on every tick.

export const SWITCH_HOLD_MS = 1800;

export function canSwitch(lastSwitchAt: number): boolean {
  return Date.now() - lastSwitchAt > SWITCH_HOLD_MS;
}

// ─── Emotional heat ───────────────────────────────────────────────────────────
// Converts funnel metrics into a single "crowd emotion" score.
// Used to trigger cinematic moments rather than dry threshold checks.

export function computeEmotionalHeat(signals: LiveSignals): number {
  return signals.newFanRate * 1.5 + signals.likeRate * 1.0 + signals.completionRate * 0.5;
}

// ─── Signal-driven layout resolution ─────────────────────────────────────────

function resolveLayoutFromSignals(
  mode: CameraMode,
  current: CameraLayout,
  signals: LiveSignals,
  momentum: MomentumState
): CameraLayout {
  const emotionalHeat = computeEmotionalHeat(signals);
  const dominant = resolveDominant(momentum);
  const { voteDelta, completionRate, heat, newFanRate, audioLevelA, audioLevelB } = signals;

  if (mode === "VERSUS_BATTLE") {
    // Raw heat emergency: room is erupting → cut to reactions immediately, no cooldown needed
    if (heat > 85) return "REACTION_VIEW";
    // Funnel spike: conversion surge should feel intentional and immediate.
    // Lock camera to the clear lead to capture the moment.
    if (newFanRate >= 12) {
      const audioDelta = audioLevelA - audioLevelB;
      if (audioDelta >= 10 || voteDelta >= 15) return "TURN_A_FULL";
      if (audioDelta <= -10 || voteDelta <= -15) return "TURN_B_FULL";
      if (dominant === "A") return "TURN_A_FULL";
      if (dominant === "B") return "TURN_B_FULL";
      return current === "TURN_B_FULL" ? "TURN_B_FULL" : "TURN_A_FULL";
    }
    // Momentum winner earns the full frame (EMA prevents jitter)
    if (dominant === "A" && current !== "TURN_A_FULL") return "TURN_A_FULL";
    if (dominant === "B" && current !== "TURN_B_FULL") return "TURN_B_FULL";
    // Vote dominance in split → leader earns the frame
    if (voteDelta > 22 && current === "SPLIT_SCREEN") return "TURN_A_FULL";
    if (voteDelta < -22 && current === "SPLIT_SCREEN") return "TURN_B_FULL";
    // Emotional crowd peak → reaction view
    if (emotionalHeat > 120) return "REACTION_VIEW";
    // Balanced energy, both performers hot → split so fans see both
    if (dominant === "NONE" && signals.audioLevelA > 48 && signals.audioLevelB > 48 && current !== "SPLIT_SCREEN") {
      return "SPLIT_SCREEN";
    }
  }

  if (mode === "WORLD_RELEASE") {
    // Raw heat emergency → reaction view
    if (heat > 85) return "REACTION_VIEW";
    // Crowd warming → bring artist into PiP
    if (emotionalHeat > 88 && current === "VIDEO_FULL") return "ARTIST_PIP";
    // Emotional surge → full reaction view (artist earns the frame)
    if (emotionalHeat > 130) return "REACTION_VIEW";
    // High completion → hold video (fans are engaged, don't cut away)
    if (completionRate > 86 && current === "ARTIST_PIP") return "VIDEO_FULL";
    // Crowd cools → Q&A mode
    if (heat < 30 && current === "REACTION_VIEW") return "ARTIST_FULL";
  }

  if (mode === "GUEST_JAM") {
    // Heat emergency → reaction panel
    if (heat > 85) return "REACTION_VIEW";
    // Heat spike with one performer → show both
    if (emotionalHeat > 98 && current === "ARTIST_FULL") return "SPLIT_SCREEN";
    // Crowd peaks → full reaction panel
    if (emotionalHeat > 130 && current === "SPLIT_SCREEN") return "REACTION_VIEW";
    // Energy drops → back to split
    if (heat < 35 && current === "REACTION_VIEW") return "SPLIT_SCREEN";
  }

  return current;
}

// ─── Unified decision authority ───────────────────────────────────────────────
// This is the ONLY function the UI should call for layout decisions.
// Priority chain:
//   1. Manual trigger (director override — immediate, bypasses cooldown check)
//   2. Signal + momentum intelligence (all automatic switching)
// Cooldown enforcement (canSwitch) is the caller's responsibility since it
// requires wall-clock time, which pure functions should not access.

export type DirectorDecisionParams = {
  mode: CameraMode;
  current: CameraLayout;
  signals: LiveSignals;
  momentum: MomentumState;
  trigger?: CameraTrigger;
};

export function decideNextLayout(params: DirectorDecisionParams): CameraLayout {
  // Priority 1 — manual trigger wins immediately
  if (params.trigger) {
    const triggered = suggestLayout(params.mode, params.current, params.trigger);
    if (triggered !== params.current) return triggered;
    // Trigger was a no-op for this mode/state — fall through to signals
  }
  // Priority 2 — signal + momentum intelligence
  return resolveLayoutFromSignals(params.mode, params.current, params.signals, params.momentum);
}
