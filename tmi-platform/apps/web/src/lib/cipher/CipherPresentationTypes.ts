/**
 * CipherPresentationTypes.ts
 *
 * Canonical type library for the TMI Cipher Presentation Runtime.
 *
 * Derived from the 10-second broadcast prototype video breakdown.
 * Every visible element in the video is represented as a registered
 * runtime type here — nothing is hardcoded into a single page.
 *
 * Rule 20: CipherVoteState.displayedPercentages must come from
 * server-validated, fraud-checked vote counts — never raw client clicks.
 */

// ─── 1. Semantic Presentation States ─────────────────────────────────────────
// 15 states covering the full cipher lifecycle from lobby to exit.

export type CipherPresentationState =
  | "LOBBY_OPEN"          // Pre-show: countdown, competitor pods visible
  | "PARTICIPANTS_READY"  // All slots filled, ready to begin
  | "INTRO"               // Host/brand intro sequence
  | "PERFORMER_ENTRY"     // Performer entering the circle (name reveal)
  | "VERSE_ACTIVE"        // Active verse — solo performer focused
  | "TIME_WARNING"        // ≤10 seconds remaining in verse
  | "MIC_PASS"            // Orbital transition between performers
  | "NEXT_PERFORMER"      // Queue advance + next-performer panel lock
  | "SPLIT_CLASH"         // Side-by-side split screen (faceoff/final 2)
  | "VOTING_OPEN"         // Audience votes are open
  | "VOTING_LOCKING"      // Final 5 seconds of voting
  | "RESULT_PROCESSING"   // Server computing winner (honest loading)
  | "WINNER_DECLARED"     // Winner identified, ceremony begins
  | "CEREMONY"            // Full gold ceremony with trophy
  | "REPLAY"              // Highlight replay sequence
  | "NEXT_ROUND"          // Round advance transition
  | "EXIT";               // Room closing

// ─── 2. Panel Types ───────────────────────────────────────────────────────────

export type CipherPanelType =
  | "PRIMARY_PERFORMER"
  | "SECONDARY_PERFORMER"
  | "PREVIOUS_PERFORMER"
  | "NEXT_PERFORMER"
  | "HOST"
  | "DJ"
  | "QUEUE"
  | "AUDIENCE_WALL"
  | "VOTE"
  | "SCORE"
  | "WINNER_STATS"
  | "EVENT_STATUS"
  | "SPONSOR"
  | "CHAT"
  | "REACTION";

export type PanelSize = { width: number; height: number };

export type PanelTrackingMode =
  | "SCREEN_LOCKED"      // Fixed CSS position relative to viewport
  | "WORLD_LOCKED"       // Anchored to a spatial point in the arena
  | "PERFORMER_LOCKED"   // Follows performer body bounds
  | "AVATAR_LOCKED";     // Follows avatar head/chest rig

export interface CipherPanelDefinition {
  id: string;
  type: CipherPanelType;
  /** Spatial anchor ID this panel binds to */
  anchorId: string;
  trackingMode: PanelTrackingMode;
  aspectRatio: number;
  minSize: PanelSize;
  maxSize: PanelSize;
  enterTransition: CipherTransitionPreset;
  exitTransition: CipherTransitionPreset;
  zIndex: number;
  /** Prevents PiP from colliding with vote buttons / performer face */
  collisionGroup: string;
}

// ─── 3. Transition Presets ────────────────────────────────────────────────────

export type CipherTransitionPreset =
  | "ORBITAL_MIC_PASS"    // Magenta orbit sweep, queue advance, performer frame lock
  | "NEON_FRAME_LOCK"     // Panel snaps with neon border flare
  | "VERSUS_COLLISION"    // Gold VS erupts center, performers split to sides
  | "FINAL_VOTE_ALERT"    // Red edge pulse, vote buttons illuminate
  | "WINNER_ASCENSION"    // Loser retracts, winner centers, gold floods the stage
  | "FADE_IN"
  | "FADE_OUT"
  | "SLIDE_LEFT"
  | "SLIDE_RIGHT"
  | "NONE";

// ─── 4. Camera Commands ───────────────────────────────────────────────────────

export type CipherCameraCommand =
  | "ESTABLISHING_WIDE"    // Full arena view
  | "PUSH_PRIMARY"         // Push in toward active performer
  | "ORBIT_MIC_PASS"       // Orbital transition as mic changes hands
  | "CENTER_SPLIT"         // Stabilized split-screen framing
  | "FOCUS_VOTE"           // Slight zoom on vote state
  | "LOCK_WINNER"          // Hard lock on winner, centered
  | "CEREMONY_PULLBACK";   // Slow pullback revealing full ceremony stage

// ─── 5. Reactions ─────────────────────────────────────────────────────────────

export type CipherReaction =
  | "FIRE"
  | "HEART"
  | "CROWN"
  | "MIC"
  | "ROSE"
  | "GLOW_STICK"
  | "BOO"
  | "CHEER"
  | "LIGHTER"
  | "CONFETTI";

// ─── 6. PiP ──────────────────────────────────────────────────────────────────

export type CipherPiPMode =
  | "PREVIOUS_PERFORMER"
  | "NEXT_PERFORMER"
  | "HOST"
  | "DJ"
  | "JUDGE"
  | "REACTION_CAMERA"
  | "OFF";

export type CipherPiPLifecycle =
  | "DOCKED"
  | "ENTERING"
  | "ACTIVE"
  | "FOCUSED"
  | "SWAPPING"
  | "RETURNING"
  | "CLOSED";

export type CipherPiPAnchor =
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT"
  | "UPPER_LEFT"
  | "UPPER_RIGHT";

// ─── 7. Vote State ────────────────────────────────────────────────────────────

export type CipherVoteStatus =
  | "CLOSED"
  | "OPENING"
  | "OPEN"
  | "LOCKING"
  | "LOCKED";

export interface CipherVoteState {
  status: CipherVoteStatus;
  /** Unix ms — when voting window opens */
  opensAt?: number;
  /** Unix ms — when voting window closes */
  closesAt?: number;
  /** Eligibility check must be server-side (eligibleUserIds from session) */
  eligibleUserIds?: string[];
  /** Receipt token set once a vote is confirmed by the server */
  voterReceipt?: string;
  /**
   * Rule 20: these values MUST come from server-validated, fraud-checked
   * aggregation (see BattleVoteClosureEngine.calculateFraudScore).
   * Never compute from raw client click counts.
   */
  displayedPercentages: Record<string, number>;
}

// ─── 8. Performer identity in the arena ──────────────────────────────────────

export interface CipherPerformer {
  id: string;
  displayName: string;
  /** City, State (optional) */
  location?: string;
  /** ISO 3166-1 alpha-2 country code e.g. "US" */
  countryCode?: string;
  /** Rule 2 media priority chain */
  liveStreamUrl?: string;        // 1st priority — real WebRTC/RTMP stream
  motionPosterUrl?: string;      // 2nd priority — intro video loop
  profileImageUrl?: string;      // 3rd priority — static image
  /** Beat currently playing for this performer */
  activeBeat?: {
    title: string;
    producerName?: string;
    bpm?: number;
    beatLockerId?: string;
  };
  /** Current verse / round info */
  verseLabel?: string;   // e.g. "VERSE 2 OF 4"
  rankLabel?: string;    // e.g. "#8"
  seasonPhaseLabel?: string;
  /** Visual accent — cyan for active, gold for winner, muted for others */
  accentColor?: string;
  /** Comes from ProgressionEngine / BattleWinnerEngine — never invented */
  liveScore?: number;
}

// ─── 9. Per-state configuration ──────────────────────────────────────────────

export interface CipherStateConfig {
  state: CipherPresentationState;
  /** Human-readable phase label shown in the phase header overlay */
  phaseLabel: string;
  /** Camera command to issue on state entry */
  cameraCommand: CipherCameraCommand;
  /** Arena lighting preset name */
  lightingPreset: string;
  /** Transition to run when entering this state from the previous one */
  enterTransition: CipherTransitionPreset;
  /** Which panels are active in this state */
  activePanels: CipherPanelType[];
  /** Whether the vote bar is visible */
  showVoteBar: boolean;
  /** Whether the PiP is active */
  showPiP: boolean;
  /** Floor underlay mode */
  floorMode: CipherFloorMode;
  /** Whether audience wall should be brighter */
  audienceWallBright: boolean;
  /** Controls available to the viewer in this state */
  allowedActions: CipherAllowedAction[];
  /** If a transition is not valid, fall back here */
  fallbackState: CipherPresentationState;
}

export type CipherFloorMode =
  | "IDLE"         // Slow cyan pulse
  | "PERFORMANCE"  // Beat-reactive rings
  | "VERSUS"       // Split orange energy field
  | "VOTING"       // Countdown sweep ring
  | "VICTORY";     // Gold winner platform

export type CipherAllowedAction =
  | "REACT"
  | "VOTE"
  | "TIP"
  | "FOLLOW"
  | "SAVE_MOMENT"
  | "SHARE"
  | "JOIN_QUEUE"
  | "VIEW_STATS"
  | "REQUEST_REPLAY";

// ─── 10. Arena shell props ────────────────────────────────────────────────────

export interface CipherArenaConfig {
  roomId: string;
  eventTitle: string;
  /** Live audience count — must come from real session registry */
  audienceCount?: number;
  performers: CipherPerformer[];
  /** Index into performers[] of the currently active performer */
  activePerformerIndex: number;
  /** Set when a winner is known from BattleWinnerEngine.settleWinner() */
  winnerId?: string | null;
  voteState?: CipherVoteState;
  /** Whether this is a pure cypher (no elimination) or a clash (elimination) */
  mode: "cypher" | "clash" | "faceoff";
}
