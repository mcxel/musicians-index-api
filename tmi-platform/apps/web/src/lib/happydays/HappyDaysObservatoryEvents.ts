/**
 * HappyDaysObservatoryEvents — Factual observatory events for Happy Days features.
 *
 * Strict Law: Factual product engagement metrics only.
 * NEVER perform sentiment scoring, psychological classification, or diagnostic logging.
 */

export const HAPPY_DAYS_EVENT = {
  PROMPT_SHOWN: "HAPPY_DAYS_PROMPT_SHOWN",
  PROMPT_DISMISSED: "HAPPY_DAYS_PROMPT_DISMISSED",
  RESPONSE_SUBMITTED: "HAPPY_DAYS_RESPONSE_SUBMITTED",
  MAGAZINE_VIEWED: "HAPPY_DAYS_MAGAZINE_VIEWED",
  SONG_PLAYED: "HAPPY_DAYS_SONG_PLAYED",
  LIVE_BRIDGE_CLICKED: "HAPPY_DAYS_LIVE_BRIDGE_CLICKED",
} as const;

export type HappyDaysEventType = (typeof HAPPY_DAYS_EVENT)[keyof typeof HAPPY_DAYS_EVENT];

export interface HappyDaysEventPayload {
  promptId?: string;
  destination?: "private" | "friends" | "magazine";
  role?: "fan" | "performer";
  hasTrackAttachment?: boolean;
  hasMediaAttachment?: boolean;
  targetLiveRoomId?: string;
}

export function logHappyDaysEvent(eventType: HappyDaysEventType, payload: HappyDaysEventPayload = {}) {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[HAPPY_DAYS_OBSERVATORY] ${eventType}`, payload);
    }
  } catch {
    // Non-blocking observability
  }
}
