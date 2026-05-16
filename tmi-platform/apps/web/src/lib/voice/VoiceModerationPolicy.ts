// VoiceModerationPolicy.ts
// Voice-layer moderation rules. Used by components and engines.
// Allowed: cheering, casual profanity.
// Blocked: threats, violent targeting, racial slurs, harassment, doxxing, spam screaming.

export type VoiceModerationAction =
  | "ALLOW"
  | "WARN"
  | "MUTE_BURST"    // spam screaming → temp mute
  | "HARD_MUTE"     // harassment/threats → persistent mute
  | "EJECT";        // doxxing/violent targeting → remove from room voice

export interface VoiceModerationResult {
  action: VoiceModerationAction;
  reason: string;
  participantId: string;
  triggeredAt: number;
}

// Burst tracking: participantId → recent high-volume burst count
const burstTracker = new Map<string, { count: number; windowStart: number }>();
const BURST_WINDOW_MS = 10_000;
const BURST_THRESHOLD = 4;

export function evaluateVoiceBurst(
  participantId: string
): VoiceModerationResult | null {
  const now = Date.now();
  const tracker = burstTracker.get(participantId);

  if (!tracker || now - tracker.windowStart > BURST_WINDOW_MS) {
    burstTracker.set(participantId, { count: 1, windowStart: now });
    return null;
  }

  tracker.count += 1;

  if (tracker.count >= BURST_THRESHOLD) {
    burstTracker.delete(participantId);
    return {
      action: "MUTE_BURST",
      reason: "Spam screaming — burst threshold exceeded",
      participantId,
      triggeredAt: now,
    };
  }

  return null;
}

/**
 * Voice moderation rule constants.
 * These represent what the audio moderation pipeline enforces.
 */
export const VOICE_MODERATION_RULES = {
  ALLOWED: [
    "cheering",
    "casual_profanity",
    "laughing",
    "clapping",
    "singing_along",
  ],
  BLOCKED: [
    "threats",            // any form of physical/verbal threat
    "violent_targeting",  // targeting a specific person with violence
    "racial_slurs",       // hate speech based on race/ethnicity
    "harassment",         // sustained personal attacks
    "doxxing",            // revealing personal information
    "spam_screaming",     // continuous loud noise burst
  ],
  ACTIONS: {
    threats: "EJECT" as VoiceModerationAction,
    violent_targeting: "EJECT" as VoiceModerationAction,
    racial_slurs: "HARD_MUTE" as VoiceModerationAction,
    harassment: "HARD_MUTE" as VoiceModerationAction,
    doxxing: "EJECT" as VoiceModerationAction,
    spam_screaming: "MUTE_BURST" as VoiceModerationAction,
  },
} as const;
