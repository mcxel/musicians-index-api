"use client";

/**
 * PlaybackReceiptClient — the one client-side function that reports playback
 * evidence to the canonical receipt service (api/music/play-receipts). It
 * never asserts "qualified" itself; it reports what the canonical player
 * observed, and the server authority re-validates and decides (owner
 * requirement: no client-trusted qualification).
 */

import type { DiscoverySource } from "@/lib/music/PlayReceiptRepository";

export interface PlaybackContext {
  mediaId: string;
  mediaType: "SONG" | "VIDEO";
  discoverySource: DiscoverySource;
  boostCampaignId?: string;
  /** Only when discoverySource is PLAYLIST. */
  playlistId?: string;
  /** Queue-level (station) and track-level (program entry / submission / queue slot) provenance — see QueuePlaybackContext.ts for the queue-vs-track separation this is derived from. */
  stationId?: string;
  programId?: string;
  submissionId?: string;
  programEntryId?: string;
  queueEntryId?: string;
}

export interface QualifiedPlayEvidence {
  playbackSessionId: string;
  consumedSeconds: number;
  validDurationSeconds: number;
}

/**
 * Fire-and-forget by design: a network failure must never interrupt
 * playback. The DB-level dedupe constraint (PlayReceipt.dedupeKey) makes a
 * safe future retry harmless, but no retry loop exists yet — flagged as a
 * real gap, not silently assumed solved.
 *
 * Deliberately sends no client-side session/anonymous identity (owner
 * correction, 2026-10-29) — the server resolves authenticated identity via
 * getTmiAuth() and anonymous identity via its own dedicated, privacy-safe
 * cookie (AnonymousPlaybackIdentity.ts), credentials included automatically
 * by same-origin fetch. The client never gets to assert who it is.
 */
export async function reportQualifiedPlayEvidence(
  evidence: QualifiedPlayEvidence,
  context: PlaybackContext,
): Promise<void> {
  try {
    await fetch("/api/music/play-receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        playbackSessionId: evidence.playbackSessionId,
        mediaId: context.mediaId,
        mediaType: context.mediaType,
        consumedSeconds: evidence.consumedSeconds,
        validDurationSeconds: evidence.validDurationSeconds,
        discoverySource: context.discoverySource,
        boostCampaignId: context.boostCampaignId,
        playlistId: context.playlistId,
        stationId: context.stationId,
        programId: context.programId,
        submissionId: context.submissionId,
        programEntryId: context.programEntryId,
        queueEntryId: context.queueEntryId,
      }),
    });
  } catch {
    // See file header — silent by design, not a bug.
  }
}
