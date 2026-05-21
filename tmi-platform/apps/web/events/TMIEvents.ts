import type { ModuleEvent } from "@tmi/module-runtime";

// ─── Events emitted BY TMI ────────────────────────────────────────────────────

export interface TmiArtistReferral {
  artistId: string;
  artistName: string;
  sessionId: string;
  referralReason: "legal_help" | "contract_review" | "dmca" | "general" | "contractor" | "stream";
  targetModule: string; // "law" | "willdoit" | "usa-stream-team" etc.
  correlationId: string;
}

export interface TmiSessionActive {
  sessionId: string;
  userId: string;
  role: string;
  entryPath: string;
}

export interface TmiMediaContract {
  artistId: string;
  trackId: string;
  requestType: "playlist_sync" | "stream_ingest" | "stats_request";
  correlationId: string;
}

export interface TmiVenueEvent {
  venueId: string;
  eventType: "show_start" | "show_end" | "capacity_warn" | "sold_out";
  attendeeCount: number;
  timestamp: number;
}

export interface TmiRankingUpdated {
  artistId: string;
  previousRank: number;
  newRank: number;
  category: string;
  timestamp: number;
}

// ─── Event type constants ─────────────────────────────────────────────────────

export const TMI_EVENT_TYPES = {
  ARTIST_REFERRAL:  "tmi.artist.referral",
  SESSION_ACTIVE:   "tmi.session.active",
  MEDIA_CONTRACT:   "tmi.media.contract",
  VENUE_EVENT:      "tmi.venue.event",
  RANKING_UPDATED:  "tmi.ranking.updated",
  BOOKING_CONFIRMED:"tmi.booking.confirmed",
} as const;

export type TMIEvent =
  | ModuleEvent<TmiArtistReferral>
  | ModuleEvent<TmiSessionActive>
  | ModuleEvent<TmiMediaContract>
  | ModuleEvent<TmiVenueEvent>
  | ModuleEvent<TmiRankingUpdated>;
