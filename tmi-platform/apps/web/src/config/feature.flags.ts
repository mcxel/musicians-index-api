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

  // TMI Musical Gauntlet (persistent battle subtype — feature-gated)
  GAUNTLET_ENABLED: false,
  GAUNTLET_DISCOVERY_ENABLED: false,
  GAUNTLET_ENTRY_ENABLED: false,

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

/**
 * Env override (dev / Marcel soft-test) without hard-enabling production defaults.
 * Example for Gauntlet soft-test in apps/web/.env.local:
 *   NEXT_PUBLIC_FEATURE_GAUNTLET_ENABLED=true
 *   NEXT_PUBLIC_FEATURE_GAUNTLET_DISCOVERY_ENABLED=true
 *   NEXT_PUBLIC_FEATURE_GAUNTLET_ENTRY_ENABLED=true
 * Restart `pnpm dev` after changing. Defaults in FEATURE_FLAGS stay false for Gauntlet.
 */
export function isEnabled(flag: FeatureFlag): boolean {
  if (typeof process !== "undefined" && process.env) {
    const envKey = `NEXT_PUBLIC_FEATURE_${flag}`;
    const raw = process.env[envKey];
    if (raw === "1" || raw === "true" || raw === "TRUE") return true;
    if (raw === "0" || raw === "false" || raw === "FALSE") return false;
  }
  return FEATURE_FLAGS[flag] === true;
}
