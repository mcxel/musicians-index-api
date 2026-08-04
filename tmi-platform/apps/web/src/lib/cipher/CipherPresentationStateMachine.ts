/**
 * CipherPresentationStateMachine.ts
 *
 * Drives all broadcast presentation decisions for TMI Cipher rooms.
 * Governs which panels are visible, which camera command fires, what
 * lighting preset applies, and which transitions run — state by state.
 *
 * This extends and replaces the 6-state BattleBroadcastStateMachine
 * for Cipher/Cypher event types with the full 15-state sequence
 * derived from the 10-second broadcast prototype video.
 *
 * Architecture:
 *  - Pure TypeScript singleton per roomId (Map-backed, no React)
 *  - Listeners subscribe to state change events (same pattern as
 *    BattleBroadcastStateMachineImpl)
 *  - Emits on the tmi:system:event bus so CypherPresentationAdapter
 *    can pick up commands and route to DirectorRegistry
 *  - All state transitions are logged (Rule 22 — Observe before Recommend)
 */

import type {
  CipherPresentationState,
  CipherStateConfig,
  CipherPanelType,
  CipherAllowedAction,
  CipherFloorMode,
} from "./CipherPresentationTypes";

// ─── State configuration table ────────────────────────────────────────────────
// Each entry declares the full runtime intent for that presentation state.
// Camera / lighting / panel / transition constants live here — components
// consume these values, they never re-derive them independently.

const STATE_CONFIGS: Readonly<Record<CipherPresentationState, CipherStateConfig>> = {
  LOBBY_OPEN: {
    state: "LOBBY_OPEN",
    phaseLabel: "LOBBY OPEN",
    cameraCommand: "ESTABLISHING_WIDE",
    lightingPreset: "LOBBY_CYAN",
    enterTransition: "FADE_IN",
    activePanels: ["QUEUE", "EVENT_STATUS", "AUDIENCE_WALL"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "IDLE",
    audienceWallBright: false,
    allowedActions: ["REACT", "FOLLOW", "JOIN_QUEUE"],
    fallbackState: "LOBBY_OPEN",
  },
  PARTICIPANTS_READY: {
    state: "PARTICIPANTS_READY",
    phaseLabel: "READY TO BEGIN",
    cameraCommand: "ESTABLISHING_WIDE",
    lightingPreset: "READY_CYAN_PULSE",
    enterTransition: "NEON_FRAME_LOCK",
    activePanels: ["PRIMARY_PERFORMER", "QUEUE", "EVENT_STATUS", "AUDIENCE_WALL"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "IDLE",
    audienceWallBright: false,
    allowedActions: ["REACT", "FOLLOW"],
    fallbackState: "LOBBY_OPEN",
  },
  INTRO: {
    state: "INTRO",
    phaseLabel: "INTRO",
    cameraCommand: "ESTABLISHING_WIDE",
    lightingPreset: "INTRO_SLOW_SWEEP",
    enterTransition: "FADE_IN",
    activePanels: ["HOST", "EVENT_STATUS", "AUDIENCE_WALL", "SPONSOR"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "IDLE",
    audienceWallBright: true,
    allowedActions: ["REACT"],
    fallbackState: "PARTICIPANTS_READY",
  },
  PERFORMER_ENTRY: {
    state: "PERFORMER_ENTRY",
    phaseLabel: "ENTERING THE CIRCLE",
    cameraCommand: "PUSH_PRIMARY",
    lightingPreset: "ENTRY_CYAN_FUCHSIA",
    enterTransition: "NEON_FRAME_LOCK",
    activePanels: ["PRIMARY_PERFORMER", "QUEUE", "EVENT_STATUS"],
    showVoteBar: false,
    showPiP: true,
    floorMode: "PERFORMANCE",
    audienceWallBright: false,
    allowedActions: ["REACT", "FOLLOW", "TIP"],
    fallbackState: "LOBBY_OPEN",
  },
  VERSE_ACTIVE: {
    state: "VERSE_ACTIVE",
    phaseLabel: "VERSE",
    cameraCommand: "PUSH_PRIMARY",
    lightingPreset: "VERSE_CYAN_MAGENTA",
    enterTransition: "NEON_FRAME_LOCK",
    activePanels: ["PRIMARY_PERFORMER", "QUEUE", "SCORE"],
    showVoteBar: false,
    showPiP: true,
    floorMode: "PERFORMANCE",
    audienceWallBright: false,
    allowedActions: ["REACT", "FOLLOW", "TIP", "SAVE_MOMENT"],
    fallbackState: "PERFORMER_ENTRY",
  },
  TIME_WARNING: {
    state: "TIME_WARNING",
    phaseLabel: "TIME WARNING",
    cameraCommand: "PUSH_PRIMARY",
    lightingPreset: "WARNING_PULSE_RED",
    enterTransition: "FINAL_VOTE_ALERT",
    activePanels: ["PRIMARY_PERFORMER", "QUEUE", "SCORE"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "PERFORMANCE",
    audienceWallBright: false,
    allowedActions: ["REACT"],
    fallbackState: "VERSE_ACTIVE",
  },
  MIC_PASS: {
    state: "MIC_PASS",
    phaseLabel: "MIC PASS",
    cameraCommand: "ORBIT_MIC_PASS",
    lightingPreset: "TRANSITION_MAGENTA",
    enterTransition: "ORBITAL_MIC_PASS",
    activePanels: ["PREVIOUS_PERFORMER", "NEXT_PERFORMER", "QUEUE"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "PERFORMANCE",
    audienceWallBright: false,
    allowedActions: ["REACT"],
    fallbackState: "VERSE_ACTIVE",
  },
  NEXT_PERFORMER: {
    state: "NEXT_PERFORMER",
    phaseLabel: "NEXT UP",
    cameraCommand: "PUSH_PRIMARY",
    lightingPreset: "NEXT_CYAN_PULSE",
    enterTransition: "SLIDE_LEFT",
    activePanels: ["PRIMARY_PERFORMER", "QUEUE", "EVENT_STATUS"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "PERFORMANCE",
    audienceWallBright: false,
    allowedActions: ["REACT", "FOLLOW"],
    fallbackState: "MIC_PASS",
  },
  SPLIT_CLASH: {
    state: "SPLIT_CLASH",
    phaseLabel: "CLASH",
    cameraCommand: "CENTER_SPLIT",
    lightingPreset: "VERSUS_CYAN_GOLD",
    enterTransition: "VERSUS_COLLISION",
    activePanels: ["PRIMARY_PERFORMER", "SECONDARY_PERFORMER", "SCORE"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "VERSUS",
    audienceWallBright: true,
    allowedActions: ["REACT", "TIP"],
    fallbackState: "VERSE_ACTIVE",
  },
  VOTING_OPEN: {
    state: "VOTING_OPEN",
    phaseLabel: "VOTE NOW",
    cameraCommand: "FOCUS_VOTE",
    lightingPreset: "VOTING_AMBER",
    enterTransition: "FINAL_VOTE_ALERT",
    activePanels: ["PRIMARY_PERFORMER", "SECONDARY_PERFORMER", "VOTE", "AUDIENCE_WALL"],
    showVoteBar: true,
    showPiP: false,
    floorMode: "VOTING",
    audienceWallBright: true,
    allowedActions: ["VOTE", "REACT"],
    fallbackState: "SPLIT_CLASH",
  },
  VOTING_LOCKING: {
    state: "VOTING_LOCKING",
    phaseLabel: "LOCKING VOTES",
    cameraCommand: "FOCUS_VOTE",
    lightingPreset: "LOCKING_RED_PULSE",
    enterTransition: "FINAL_VOTE_ALERT",
    activePanels: ["PRIMARY_PERFORMER", "SECONDARY_PERFORMER", "VOTE"],
    showVoteBar: true,
    showPiP: false,
    floorMode: "VOTING",
    audienceWallBright: true,
    allowedActions: ["VOTE", "REACT"],
    fallbackState: "VOTING_OPEN",
  },
  RESULT_PROCESSING: {
    state: "RESULT_PROCESSING",
    phaseLabel: "CALCULATING...",
    cameraCommand: "CENTER_SPLIT",
    lightingPreset: "PROCESSING_SLOW",
    enterTransition: "FADE_IN",
    activePanels: ["PRIMARY_PERFORMER", "SECONDARY_PERFORMER", "SCORE"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "VOTING",
    audienceWallBright: false,
    allowedActions: ["REACT"],
    fallbackState: "VOTING_LOCKING",
  },
  WINNER_DECLARED: {
    state: "WINNER_DECLARED",
    phaseLabel: "WINNER",
    cameraCommand: "LOCK_WINNER",
    lightingPreset: "WINNER_GOLD_FLOOD",
    enterTransition: "WINNER_ASCENSION",
    activePanels: ["PRIMARY_PERFORMER", "WINNER_STATS", "AUDIENCE_WALL"],
    showVoteBar: false,
    showPiP: true,
    floorMode: "VICTORY",
    audienceWallBright: true,
    allowedActions: ["REACT", "FOLLOW", "TIP", "SHARE", "SAVE_MOMENT"],
    fallbackState: "RESULT_PROCESSING",
  },
  CEREMONY: {
    state: "CEREMONY",
    phaseLabel: "CEREMONY",
    cameraCommand: "CEREMONY_PULLBACK",
    lightingPreset: "CEREMONY_GOLD",
    enterTransition: "WINNER_ASCENSION",
    activePanels: ["PRIMARY_PERFORMER", "WINNER_STATS", "AUDIENCE_WALL", "SPONSOR"],
    showVoteBar: false,
    showPiP: true,
    floorMode: "VICTORY",
    audienceWallBright: true,
    allowedActions: ["REACT", "FOLLOW", "TIP", "SHARE", "SAVE_MOMENT", "VIEW_STATS"],
    fallbackState: "WINNER_DECLARED",
  },
  REPLAY: {
    state: "REPLAY",
    phaseLabel: "REPLAY",
    cameraCommand: "ESTABLISHING_WIDE",
    lightingPreset: "REPLAY_DESATURATED",
    enterTransition: "FADE_IN",
    activePanels: ["PRIMARY_PERFORMER", "EVENT_STATUS"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "IDLE",
    audienceWallBright: false,
    allowedActions: ["REACT", "REQUEST_REPLAY"],
    fallbackState: "CEREMONY",
  },
  NEXT_ROUND: {
    state: "NEXT_ROUND",
    phaseLabel: "NEXT ROUND",
    cameraCommand: "ESTABLISHING_WIDE",
    lightingPreset: "ROUND_ADVANCE_CYAN",
    enterTransition: "SLIDE_LEFT",
    activePanels: ["EVENT_STATUS", "QUEUE", "AUDIENCE_WALL"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "IDLE",
    audienceWallBright: false,
    allowedActions: ["REACT", "FOLLOW", "JOIN_QUEUE"],
    fallbackState: "LOBBY_OPEN",
  },
  EXIT: {
    state: "EXIT",
    phaseLabel: "CLOSING",
    cameraCommand: "CEREMONY_PULLBACK",
    lightingPreset: "EXIT_FADE",
    enterTransition: "FADE_OUT",
    activePanels: ["EVENT_STATUS"],
    showVoteBar: false,
    showPiP: false,
    floorMode: "IDLE",
    audienceWallBright: false,
    allowedActions: [],
    fallbackState: "EXIT",
  },
};

// ─── Valid transitions table ──────────────────────────────────────────────────
// Prevents illegal state jumps (e.g. LOBBY_OPEN → WINNER_DECLARED)

const VALID_TRANSITIONS: Partial<Record<CipherPresentationState, CipherPresentationState[]>> = {
  LOBBY_OPEN:          ["PARTICIPANTS_READY", "EXIT"],
  PARTICIPANTS_READY:  ["INTRO", "PERFORMER_ENTRY", "EXIT"],
  INTRO:               ["PERFORMER_ENTRY", "EXIT"],
  PERFORMER_ENTRY:     ["VERSE_ACTIVE", "EXIT"],
  VERSE_ACTIVE:        ["TIME_WARNING", "MIC_PASS", "SPLIT_CLASH", "EXIT"],
  TIME_WARNING:        ["MIC_PASS", "SPLIT_CLASH", "EXIT"],
  MIC_PASS:            ["NEXT_PERFORMER", "SPLIT_CLASH", "EXIT"],
  NEXT_PERFORMER:      ["PERFORMER_ENTRY", "VERSE_ACTIVE", "EXIT"],
  SPLIT_CLASH:         ["VOTING_OPEN", "MIC_PASS", "EXIT"],
  VOTING_OPEN:         ["VOTING_LOCKING", "EXIT"],
  VOTING_LOCKING:      ["RESULT_PROCESSING", "EXIT"],
  RESULT_PROCESSING:   ["WINNER_DECLARED", "VOTING_OPEN", "EXIT"],
  WINNER_DECLARED:     ["CEREMONY", "NEXT_ROUND", "EXIT"],
  CEREMONY:            ["REPLAY", "NEXT_ROUND", "EXIT"],
  REPLAY:              ["NEXT_ROUND", "EXIT"],
  NEXT_ROUND:          ["LOBBY_OPEN", "PARTICIPANTS_READY", "EXIT"],
  EXIT:                [],
};

// ─── Machine entry ────────────────────────────────────────────────────────────

export interface CipherStateMachineEntry {
  roomId: string;
  state: CipherPresentationState;
  config: CipherStateConfig;
  activePerformerId?: string;
  winnerId?: string;
  roundLabel?: string;
  updatedAt: number;
}

type CipherStateListener = (entry: CipherStateMachineEntry) => void;

class CipherPresentationStateMachineImpl {
  private entries: Map<string, CipherStateMachineEntry> = new Map();
  private listeners: Map<string, Set<CipherStateListener>> = new Map();

  private emit(entry: CipherStateMachineEntry): void {
    this.entries.set(entry.roomId, entry);
    this.listeners.get(entry.roomId)?.forEach((fn) => fn(entry));

    // Broadcast on the tmi:system:event bus so CypherPresentationAdapter
    // can route camera/lighting/overlay commands to DirectorRegistry.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: {
            eventName: "CipherPresentationStateChanged",
            payload: {
              competitionId: entry.roomId,
              state: entry.state,
              config: entry.config,
              activePerformerId: entry.activePerformerId,
              winnerId: entry.winnerId,
              roundLabel: entry.roundLabel,
            },
          },
        })
      );
    }
  }

  private isValidTransition(
    from: CipherPresentationState,
    to: CipherPresentationState
  ): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Start a new cipher room in LOBBY_OPEN state. */
  initialize(roomId: string): CipherStateMachineEntry {
    const entry: CipherStateMachineEntry = {
      roomId,
      state: "LOBBY_OPEN",
      config: STATE_CONFIGS["LOBBY_OPEN"],
      updatedAt: Date.now(),
    };
    this.emit(entry);
    return entry;
  }

  /** Transition to a new state. Returns the updated entry or null if invalid. */
  transition(
    roomId: string,
    nextState: CipherPresentationState,
    opts?: {
      activePerformerId?: string;
      winnerId?: string;
      roundLabel?: string;
    }
  ): CipherStateMachineEntry | null {
    const current = this.entries.get(roomId);
    if (!current) {
      // Room not yet initialized — boot it first
      return this.initialize(roomId);
    }

    if (!this.isValidTransition(current.state, nextState)) {
      // Try fallback state
      const fallback = STATE_CONFIGS[current.state].fallbackState;
      if (fallback !== current.state && this.isValidTransition(current.state, fallback)) {
        return this.transition(roomId, fallback, opts);
      }
      console.warn(
        `[CipherStateMachine] Invalid transition ${current.state} → ${nextState} for room ${roomId}`
      );
      return null;
    }

    const entry: CipherStateMachineEntry = {
      roomId,
      state: nextState,
      config: STATE_CONFIGS[nextState],
      activePerformerId: opts?.activePerformerId ?? current.activePerformerId,
      winnerId: opts?.winnerId ?? current.winnerId,
      roundLabel: opts?.roundLabel ?? current.roundLabel,
      updatedAt: Date.now(),
    };
    this.emit(entry);
    return entry;
  }

  /** Convenience: mark a performer's verse as active. */
  activatePerformerVerse(roomId: string, performerId: string, roundLabel?: string): CipherStateMachineEntry | null {
    const current = this.entries.get(roomId);
    if (!current) return null;

    // Accept entry from PERFORMER_ENTRY, MIC_PASS, or NEXT_PERFORMER
    const allowedFrom: CipherPresentationState[] = ["PERFORMER_ENTRY", "MIC_PASS", "NEXT_PERFORMER", "LOBBY_OPEN", "PARTICIPANTS_READY"];
    if (!allowedFrom.includes(current.state)) {
      // Force via PERFORMER_ENTRY
      this.transition(roomId, "PERFORMER_ENTRY", { activePerformerId: performerId, roundLabel });
    }
    return this.transition(roomId, "VERSE_ACTIVE", { activePerformerId: performerId, roundLabel });
  }

  /** Convenience: advance the mic to the next performer. */
  passMic(roomId: string, nextPerformerId: string): CipherStateMachineEntry | null {
    const t1 = this.transition(roomId, "MIC_PASS", { activePerformerId: nextPerformerId });
    if (!t1) return null;
    return this.transition(roomId, "NEXT_PERFORMER", { activePerformerId: nextPerformerId });
  }

  /** Convenience: begin the split-screen clash / faceoff. */
  beginClash(roomId: string): CipherStateMachineEntry | null {
    return this.transition(roomId, "SPLIT_CLASH");
  }

  /** Convenience: open voting. */
  openVoting(roomId: string): CipherStateMachineEntry | null {
    const t1 = this.transition(roomId, "VOTING_OPEN");
    if (!t1) return null;
    // Auto-advance to LOCKING after a set duration — callers should pass explicit timing
    return t1;
  }

  /** Convenience: lock and compute result. */
  lockVotes(roomId: string): CipherStateMachineEntry | null {
    const t1 = this.transition(roomId, "VOTING_LOCKING");
    if (!t1) return null;
    return this.transition(roomId, "RESULT_PROCESSING");
  }

  /**
   * Convenience: declare winner.
   * winnerId MUST come from BattleWinnerEngine.settleWinner() — never invented.
   */
  declareWinner(roomId: string, winnerId: string): CipherStateMachineEntry | null {
    const t1 = this.transition(roomId, "WINNER_DECLARED", { winnerId, activePerformerId: winnerId });
    if (!t1) return null;
    return this.transition(roomId, "CEREMONY", { winnerId });
  }

  /** Convenience: close the room. */
  exit(roomId: string): CipherStateMachineEntry | null {
    return this.transition(roomId, "EXIT");
  }

  // ─── Query ──────────────────────────────────────────────────────────────────

  getCurrent(roomId: string): CipherStateMachineEntry | undefined {
    return this.entries.get(roomId);
  }

  getStateConfig(state: CipherPresentationState): CipherStateConfig {
    return STATE_CONFIGS[state];
  }

  /** Get all STATE_CONFIGS for external readers (e.g. test suites). */
  getAllConfigs(): Readonly<Record<CipherPresentationState, CipherStateConfig>> {
    return STATE_CONFIGS;
  }

  isPanelActive(roomId: string, panelType: CipherPanelType): boolean {
    const current = this.entries.get(roomId);
    if (!current) return false;
    return current.config.activePanels.includes(panelType);
  }

  isActionAllowed(roomId: string, action: CipherAllowedAction): boolean {
    const current = this.entries.get(roomId);
    if (!current) return false;
    return current.config.allowedActions.includes(action);
  }

  // ─── Subscriptions ──────────────────────────────────────────────────────────

  subscribe(roomId: string, listener: CipherStateListener): () => void {
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }
    this.listeners.get(roomId)!.add(listener);
    return () => this.listeners.get(roomId)?.delete(listener);
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

const CipherPresentationStateMachine = new CipherPresentationStateMachineImpl();
export default CipherPresentationStateMachine;

/** Convenience hook-compatible getter — returns the static config for a state. */
export function getCipherStateConfig(state: CipherPresentationState): CipherStateConfig {
  return CipherPresentationStateMachine.getStateConfig(state);
}
