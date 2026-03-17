/**
 * feature.flags.ts
 * Repo: apps/web/src/config/feature.flags.ts
 * Action: CREATE | Wave: B8
 * Purpose: Single source of truth for feature toggles.
 * These control experimental/optional platform features.
 * Update these — do NOT scatter boolean checks around the codebase.
 */

export const FEATURE_FLAGS = {
  // Contest
  CONTEST_ENABLED: true,
  CONTEST_VOTING_ENABLED: true,
  CONTEST_MULTI_WINNER_REVEAL: true,
  CONTEST_VOICE_CHATTER: false,         // Set true when WebRTC voice is wired
  CONTEST_ADAPTIVE_TRANSITIONS: false,  // Set true after analytics baseline established
  CONTEST_REPLAY_CLIPS: false,          // Set true when clip storage is wired

  // Sponsor
  SPONSOR_ROI_ANALYTICS: true,
  SPONSOR_LEADERBOARD: true,
  SPONSOR_OVERLAY_ON_STAGE: true,
  SPONSOR_SLOT_CAPS_ENFORCED: true,

  // Host
  RAY_JOURNEY_LIVE_MODE: false,         // Set true when WebSocket host cue is wired
  RAY_JOURNEY_VOICE: false,             // Set true when ElevenLabs/TTS is wired

  // Reveal
  REVEAL_CAMERA_DIRECTOR: true,
  REVEAL_REACTION_BURST: true,
  REVEAL_WINNER_LINEUP_STRIP: true,

  // Platform
  PLATFORM_DARK_MODE_ONLY: true,        // TMI is always dark
  PLATFORM_SEASONAL_THEMES: false,      // Set true when theme packs are ready
  PLATFORM_ARCADE_GAMES: false,         // Set true when game engine is wired

  // Ops
  MAINTENANCE_MODE: false,
  CONTEST_REGISTRATION_OPEN: false,     // Controlled by August 8 date rule — do not manually set
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] === true;
}
