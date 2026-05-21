// apps/web/src/lib/engines/fanRoomEligibility.engine.ts
// Evaluates fan earning eligibility combining room presence + anti-hop rules.

import { FanPresenceSession, DEFAULT_FAN_POLICY, FanPresencePolicy } from "./fanPresenceTracker.engine";

export interface FanEligibilityResult {
  eligible: boolean;
  status: "counting_down" | "eligible" | "paused" | "disqualified" | "locked";
  remainingSeconds: number;
  percentComplete: number;
  message: string;
  unlockMessage?: string;
  canEarnPoints: boolean;
  canEarnCash: boolean;
}

export function evaluateFanEligibility(
  session: FanPresenceSession,
  remainingSeconds: number,
  policy: FanPresencePolicy = DEFAULT_FAN_POLICY
): FanEligibilityResult {
  const minSeconds = policy.minPresenceMinutes * 60;
  const activeSeconds = minSeconds - remainingSeconds;
  const percentComplete = Math.min(100, Math.round((activeSeconds / minSeconds) * 100));

  if (session.status === "eligible") {
    return {
      eligible: true, status: "eligible", remainingSeconds: 0, percentComplete: 100,
      message: "You can earn now", unlockMessage: "🎉 Fan rewards unlocked!",
      canEarnPoints: true, canEarnCash: false, // fans earn points, not direct cash
    };
  }
  if (session.status === "disqualified") {
    return {
      eligible: false, status: "disqualified", remainingSeconds, percentComplete,
      message: "Room hopping detected — ineligible for rewards this session",
      canEarnPoints: false, canEarnCash: false,
    };
  }
  if (session.status === "paused") {
    return {
      eligible: false, status: "paused", remainingSeconds, percentComplete,
      message: "Stay in the room to earn",
      canEarnPoints: false, canEarnCash: false,
    };
  }

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return {
    eligible: false, status: "counting_down", remainingSeconds, percentComplete,
    message: `Fan rewards unlock in ${timeStr}`,
    canEarnPoints: false, canEarnCash: false,
  };
}
