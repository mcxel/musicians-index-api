/**
 * Camera Director Engine
 *
 * Event-driven camera system for World Dance Party, concerts, battles, and
 * any live venue. Manages camera mode rotation, user/DJ follow logic, bass
 * shakes, beat-drop cinematic cuts, and automatic director scheduling.
 *
 * Design rules:
 *  - No real WebGL/WebRTC needed at this layer — state-only (drives CSS
 *    transforms + React components that render the visual view).
 *  - Auto-director rotates through a default schedule unless an event fires.
 *  - Safety: strobe / shake capped at safe thresholds.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type CameraMode =
  | 'STAGE'           // Full stage, wide angle
  | 'CROWD'           // Reverse crowd shot
  | 'FLYOVER'         // Animated sweep above the venue
  | 'SPOTLIGHT'       // Single user or DJ highlighted
  | 'FOLLOW_USER'     // Locked on a specific user bubble
  | 'FOLLOW_DJ'       // Locked on DJ booth area
  | 'SELFIE'          // User's own bubble, front-facing
  | 'SPLIT_SCREEN'    // Two-up: stage left + stage right (or DJ + crowd)
  | 'WIDE'            // Ultra-wide full venue
  | 'TOP_DOWN'        // Overhead bird's-eye
  | 'ORBIT';          // Slow circular orbit around stage

export type CameraEvent =
  | 'beat-drop'        // Song drops — dramatic cut
  | 'tip'              // User tips an artist
  | 'winner'           // Battle / game winner announced
  | 'host-speak'       // Host / MC starts talking
  | 'lighting-change'  // Venue lighting mode changes
  | 'crowd-jump'       // Crowd energy spike
  | 'battle-start'     // 1v1 battle begins
  | 'song-change'      // Track transition
  | 'applause'         // Extended crowd applause
  | 'vip-entry'        // VIP / high-rank user enters room
  | 'drop-reveal'      // Exclusive item / NFT drop moment
  | 'sponsor-flash';   // Sponsor placement highlight

export interface CameraTransition {
  from: CameraMode;
  to: CameraMode;
  durationMs: number;
  easing: 'cut' | 'ease' | 'zoom-in' | 'zoom-out' | 'pan' | 'spin';
}

export interface CameraState {
  mode: CameraMode;
  targetUserId?: string;   // Used by FOLLOW_USER, SPOTLIGHT
  zoom: number;            // 0.5 = zoomed out, 2.0 = zoomed in, 1.0 = normal
  tiltDeg: number;         // Vertical tilt in degrees (-45 to +45)
  panDeg: number;          // Horizontal pan in degrees (-90 to +90)
  shaking: boolean;
  shakeIntensity: number;  // 0–1
  autoDirector: boolean;
  splitLeft?: CameraMode;
  splitRight?: CameraMode;
  lockedBy?: CameraEvent;  // If set, auto-director won't override until cleared
  lockedUntil?: number;    // Epoch ms when lock expires
}

export interface CameraDirectorConfig {
  roomId: string;
  bpm: number;
  autoDirectorEnabled: boolean;
  rotationIntervalMs: number;   // Default 8000ms between auto-rotations
  shakeOnBass: boolean;
  cameraOnDrop: boolean;
}

// ─── Default rotation schedule ─────────────────────────────────────────────

const AUTO_ROTATION: CameraMode[] = [
  'STAGE',
  'CROWD',
  'FLYOVER',
  'SPOTLIGHT',
  'SPLIT_SCREEN',
  'WIDE',
  'STAGE',
];

// Event→mode mappings (what camera switch an event triggers)
const EVENT_CAMERA_MAP: Record<CameraEvent, CameraMode> = {
  'beat-drop':     'FLYOVER',
  'tip':           'SPOTLIGHT',
  'winner':        'SPOTLIGHT',
  'host-speak':    'STAGE',
  'lighting-change': 'WIDE',
  'crowd-jump':    'CROWD',
  'battle-start':  'SPLIT_SCREEN',
  'song-change':   'FLYOVER',
  'applause':      'CROWD',
  'vip-entry':     'SPOTLIGHT',
  'drop-reveal':   'SPOTLIGHT',
  'sponsor-flash': 'WIDE',
};

// How long (ms) each event holds the camera before auto-director resumes
const EVENT_LOCK_DURATION: Record<CameraEvent, number> = {
  'beat-drop':     3000,
  'tip':           4000,
  'winner':        6000,
  'host-speak':    0,      // No lock — host may speak indefinitely
  'lighting-change': 2000,
  'crowd-jump':    3000,
  'battle-start':  0,      // No auto-override during battle
  'song-change':   4000,
  'applause':      3000,
  'vip-entry':     4000,
  'drop-reveal':   6000,
  'sponsor-flash': 2500,
};

// ─── Default state factory ──────────────────────────────────────────────────

export function defaultCameraState(): CameraState {
  return {
    mode: 'STAGE',
    zoom: 1.0,
    tiltDeg: 0,
    panDeg: 0,
    shaking: false,
    shakeIntensity: 0,
    autoDirector: true,
    splitLeft: 'STAGE',
    splitRight: 'CROWD',
  };
}

export function defaultCameraConfig(roomId: string, bpm = 128): CameraDirectorConfig {
  return {
    roomId,
    bpm,
    autoDirectorEnabled: true,
    rotationIntervalMs: 8000,
    shakeOnBass: true,
    cameraOnDrop: true,
  };
}

// ─── State mutators ─────────────────────────────────────────────────────────

/** Directly set the camera mode. Clears any event lock. */
export function setCameraMode(
  state: CameraState,
  mode: CameraMode,
  targetUserId?: string,
): CameraState {
  return {
    ...state,
    mode,
    targetUserId: targetUserId ?? state.targetUserId,
    lockedBy: undefined,
    lockedUntil: undefined,
  };
}

/** Respond to a live event — switches mode, sets a timed lock */
export function fireCameraEvent(
  state: CameraState,
  event: CameraEvent,
  now = Date.now(),
  overrideTargetUserId?: string,
): CameraState {
  const mode = EVENT_CAMERA_MAP[event];
  const lockMs = EVENT_LOCK_DURATION[event];
  return {
    ...state,
    mode,
    targetUserId: overrideTargetUserId ?? state.targetUserId,
    lockedBy: event,
    lockedUntil: lockMs > 0 ? now + lockMs : undefined,
  };
}

/** Follow a specific user's bubble */
export function followUser(state: CameraState, userId: string): CameraState {
  return { ...state, mode: 'FOLLOW_USER', targetUserId: userId };
}

/** Follow the DJ booth */
export function followDJ(state: CameraState): CameraState {
  return { ...state, mode: 'FOLLOW_DJ', targetUserId: undefined };
}

/** Spotlight a user (cinematic close) */
export function spotlightUser(state: CameraState, userId: string): CameraState {
  return { ...state, mode: 'SPOTLIGHT', targetUserId: userId };
}

/** Enter flyover sweep mode */
export function flyoverVenue(state: CameraState): CameraState {
  return { ...state, mode: 'FLYOVER', zoom: 0.7, tiltDeg: -20 };
}

/** Enable split screen */
export function splitScreen(
  state: CameraState,
  left: CameraMode = 'STAGE',
  right: CameraMode = 'CROWD',
): CameraState {
  return { ...state, mode: 'SPLIT_SCREEN', splitLeft: left, splitRight: right };
}

/** Pan + zoom helpers */
export function zoomCamera(state: CameraState, zoom: number): CameraState {
  return { ...state, zoom: Math.max(0.5, Math.min(3.0, zoom)) };
}

export function tiltCamera(state: CameraState, deg: number): CameraState {
  return { ...state, tiltDeg: Math.max(-45, Math.min(45, deg)) };
}

export function panCamera(state: CameraState, deg: number): CameraState {
  return { ...state, panDeg: Math.max(-90, Math.min(90, deg)) };
}

/** Bass shake — short camera tremble on kick/bass hit */
export function shakeCameraOnBass(
  state: CameraState,
  intensity = 0.5,
): CameraState {
  return { ...state, shaking: true, shakeIntensity: Math.min(intensity, 1.0) };
}

export function stopShake(state: CameraState): CameraState {
  return { ...state, shaking: false, shakeIntensity: 0 };
}

/** Dramatic beat-drop camera sequence: flyover → spotlight → wide in 3s */
export function cameraOnDrop(state: CameraState): CameraState {
  return fireCameraEvent(state, 'beat-drop');
}

// ─── Auto Director ──────────────────────────────────────────────────────────

let _rotationIndex = 0;

/**
 * Advance the auto director one step.
 * Call this on a timer (every `config.rotationIntervalMs`).
 * Respects event locks — if a lock is active, it skips.
 */
export function autoDirectorTick(
  state: CameraState,
  now = Date.now(),
): CameraState {
  if (!state.autoDirector) return state;

  // Respect event lock
  if (state.lockedUntil && now < state.lockedUntil) return state;

  // Special case: during battle, never auto-rotate away from SPLIT_SCREEN
  if (state.lockedBy === 'battle-start' && !state.lockedUntil) return state;

  _rotationIndex = (_rotationIndex + 1) % AUTO_ROTATION.length;
  const nextMode = AUTO_ROTATION[_rotationIndex];

  return {
    ...state,
    mode: nextMode,
    lockedBy: undefined,
    lockedUntil: undefined,
    // Reset zoom/tilt gradually back toward defaults on each rotation
    zoom: nextMode === 'FLYOVER' ? 0.7 : nextMode === 'WIDE' ? 0.85 : 1.0,
    tiltDeg: nextMode === 'FLYOVER' ? -15 : nextMode === 'TOP_DOWN' ? -45 : 0,
  };
}

/** Build the CSS transform string from camera state (for a view container) */
export function cameraTransformCSS(state: CameraState): string {
  const scale = state.zoom;
  const rotateX = state.tiltDeg;
  const rotateY = state.panDeg;
  const shakeX = state.shaking ? (Math.random() * 6 - 3) * state.shakeIntensity : 0;
  const shakeY = state.shaking ? (Math.random() * 4 - 2) * state.shakeIntensity : 0;
  return `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${shakeX}px, ${shakeY}px)`;
}

/** Human-readable label for a camera mode */
export const CAMERA_MODE_LABELS: Record<CameraMode, string> = {
  STAGE: 'Stage Wide',
  CROWD: 'Crowd Reverse',
  FLYOVER: 'Venue Flyover',
  SPOTLIGHT: 'Spotlight',
  FOLLOW_USER: 'Follow User',
  FOLLOW_DJ: 'Follow DJ',
  SELFIE: 'My View',
  SPLIT_SCREEN: 'Split Screen',
  WIDE: 'Ultra Wide',
  TOP_DOWN: 'Bird\'s Eye',
  ORBIT: 'Orbit Stage',
};

export const CAMERA_EVENT_LABELS: Record<CameraEvent, string> = {
  'beat-drop': 'Beat Drop',
  'tip': 'Tip Sent',
  'winner': 'Winner',
  'host-speak': 'Host Speaking',
  'lighting-change': 'Lighting Change',
  'crowd-jump': 'Crowd Spike',
  'battle-start': 'Battle Start',
  'song-change': 'Song Change',
  'applause': 'Applause',
  'vip-entry': 'VIP Entry',
  'drop-reveal': 'Drop Reveal',
  'sponsor-flash': 'Sponsor Spot',
};

/** Persist and restore camera state (localStorage wrapper) */
export function saveCameraState(roomId: string, state: CameraState): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`camera_state_${roomId}`, JSON.stringify(state));
    }
  } catch { /* ignore */ }
}

export function loadCameraState(roomId: string): CameraState | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`camera_state_${roomId}`);
      if (raw) return JSON.parse(raw) as CameraState;
    }
  } catch { /* ignore */ }
  return null;
}
