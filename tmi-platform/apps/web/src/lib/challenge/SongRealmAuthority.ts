/**
 * HUMAN SONG REALM vs AI SONG REALM — server-side competitive wall.
 * Listening collections may mix. Competitive matches may not.
 * AI-assisted (partial) songs are NOT classified here — policy is MISSING.
 */

import { parseSunoShareUrl } from "@/lib/media/MediaIngestionService";
import { isAiTaggedWork } from "@/lib/challenge/AiMusicChallengeIntegrity";
import { isAiMusicChallengeLane } from "@/lib/challenge/ChallengeDefinition";

export type SongRealm = "HUMAN" | "AI" | "UNKNOWN";

export type SongRealmDeclaration = "AI_GENERATED" | "AI_ASSISTED" | "HUMAN" | null;

/** Explicit: do not silently classify AI-assisted work into either realm. */
export const AI_ASSISTED_COMPETITION_POLICY = "MISSING" as const;

export const AI_SONG_REALM_DESTINATION = "/live/rooms/anchor-ai-music-challenge";
export const HUMAN_SONG_REALM_DESTINATION = "/live/rooms/challenge-song-lab";

export interface SongRealmEvidence {
  madeWithAi?: boolean;
  aiTool?: string | null;
  type?: string | null;
  tags?: string[] | null;
  genre?: string | null;
  audioUrl?: string | null;
  declaration?: SongRealmDeclaration;
}

export interface SongRealmClassification {
  realm: SongRealm;
  eligible: boolean;
  provider: "SUNO" | "UDIO" | "OTHER" | null;
  reason: string;
  competitionDestination: string | null;
}

export function classifySongRealm(input: SongRealmEvidence): SongRealmClassification {
  if (input.declaration === "AI_ASSISTED") {
    return {
      realm: "UNKNOWN",
      eligible: false,
      provider: null,
      reason: "AI_ASSISTED_COMPETITION_POLICY=MISSING — not routed to Human or AI Realm.",
      competitionDestination: null,
    };
  }

  const suno = parseSunoShareUrl(input.audioUrl);
  const tagged = isAiTaggedWork({
    madeWithAi: input.madeWithAi || input.declaration === "AI_GENERATED",
    type: input.type,
    tags: input.tags,
  });
  const genreAi = (input.genre ?? "").toLowerCase() === "suno" || (input.genre ?? "").toLowerCase() === "udio";
  const tool = (input.aiTool ?? "").toLowerCase();
  const provider: SongRealmClassification["provider"] = suno || tool === "suno" || (input.genre ?? "").toLowerCase() === "suno"
    ? "SUNO"
    : tool === "udio" || (input.genre ?? "").toLowerCase() === "udio"
      ? "UDIO"
      : tagged || input.declaration === "AI_GENERATED"
        ? "OTHER"
        : null;

  if (suno || tagged || genreAi || input.declaration === "AI_GENERATED" || provider === "SUNO" || provider === "UDIO") {
    return {
      realm: "AI",
      eligible: true,
      provider: provider ?? "OTHER",
      reason: suno ? "SUNO_PROVENANCE" : "AI_PROVENANCE",
      competitionDestination: AI_SONG_REALM_DESTINATION,
    };
  }

  if (input.declaration === "HUMAN") {
    return {
      realm: "HUMAN",
      eligible: true,
      provider: null,
      reason: "HUMAN_DECLARATION",
      competitionDestination: HUMAN_SONG_REALM_DESTINATION,
    };
  }

  return {
    realm: "UNKNOWN",
    eligible: false,
    provider: null,
    reason: "UNKNOWN_NOT_HUMAN_DEFAULT — classify before Song Realm competition.",
    competitionDestination: null,
  };
}

export function assertCompatibleSongRealms(
  left: SongRealmClassification,
  right: SongRealmClassification,
): { ok: true; realm: "HUMAN" | "AI" } | { ok: false; code: "CROSS_REALM" | "UNCLASSIFIED"; message: string } {
  if (!left.eligible || !right.eligible || left.realm === "UNKNOWN" || right.realm === "UNKNOWN") {
    return {
      ok: false,
      code: "UNCLASSIFIED",
      message: "Song Realm match rejected — both entries must be classified before competition.",
    };
  }
  if (left.realm !== right.realm) {
    return {
      ok: false,
      code: "CROSS_REALM",
      message: "AI songs compete only against AI songs. Human songs compete only against human songs.",
    };
  }
  return { ok: true, realm: left.realm };
}

export function assertWorkFitsLane(input: {
  challengeLane: string;
  classification: SongRealmClassification;
}): { ok: true } | { ok: false; message: string } {
  const aiLane = isAiMusicChallengeLane(input.challengeLane);
  if (input.classification.realm === "UNKNOWN") {
    return { ok: false, message: input.classification.reason };
  }
  if (aiLane && input.classification.realm !== "AI") {
    return { ok: false, message: "AI Music Challenge accepts AI-classified works only." };
  }
  if (!aiLane && input.classification.realm === "AI") {
    return { ok: false, message: "AI-generated work cannot enter the Human Song Realm." };
  }
  return { ok: true };
}

export function nextOpponentMustShareRealm(winnerRealm: SongRealm): SongRealm | null {
  if (winnerRealm === "AI" || winnerRealm === "HUMAN") return winnerRealm;
  return null;
}

export function songRealmCompetitionHref(classification: SongRealmClassification): string | null {
  return classification.competitionDestination;
}
