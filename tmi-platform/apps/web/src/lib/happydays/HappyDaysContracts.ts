/**
 * HappyDaysContracts — Type contracts and laws for Happy Days community features.
 *
 * Laws (Permanent Product Canon):
 * 1. Non-clinical & supportive: Never diagnoses, scores mental health, or conducts mood surveillance.
 * 2. Opt-in publication: Magazine submissions require explicit consent; private reflection stays private.
 * 3. Attribution choice: Supports public name, TMI identity, performer/fan handle, or anonymous community.
 * 4. Fan + Performer equality: Fans and performers appear together in the community pool.
 */

export type HappyDaysCategory =
  | "daily_reflection"
  | "music_smile"
  | "community_gratitude"
  | "pride_achievement"
  | "future_looking";

export interface HappyDaysPrompt {
  id: string;
  promptText: string;
  category: HappyDaysCategory;
  suggestedTag?: string;
  placeholderText?: string;
  musicFocus?: boolean;
}

export type HappyDaysDestination = "private" | "friends" | "magazine";

export type HappyDaysAttribution =
  | "public_name"
  | "tmi_id"
  | "performer_alias"
  | "fan_handle"
  | "anonymous_community";

export interface HappyDaysSubmission {
  id: string;
  promptId: string;
  promptText: string;
  response: string;
  userRole: "fan" | "performer";
  userId: string;
  displayName: string;
  attributionPreference: HappyDaysAttribution;
  destination: HappyDaysDestination;
  attachedTrack?: {
    title: string;
    artist: string;
    id?: string;
    url?: string;
  };
  attachedMedia?: {
    type: "yopho" | "image" | "snip";
    url: string;
    id?: string;
  };
  consentStatus: "granted" | "revoked";
  moderationState: "approved" | "pending" | "rejected";
  submittedAt: number;
  publishedAt?: number;
  /** Dynamically checked against active LiveSessions for the Live Contributor bridge */
  isLiveNow?: boolean;
  liveRoomId?: string;
}

export interface HappyDaysMagazineEntry {
  id: string;
  quote: string;
  author: string;
  role: "fan" | "performer";
  attributionLabel: string;
  promptText: string;
  attachedTrack?: {
    title: string;
    artist: string;
    url?: string;
  };
  attachedImageUrl?: string;
  isLiveNow?: boolean;
  liveRoomId?: string;
  publishedAt: number;
}
