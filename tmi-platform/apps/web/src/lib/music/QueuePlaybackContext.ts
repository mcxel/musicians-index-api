/**
 * QueuePlaybackContext — separates QUEUE-LEVEL provenance from TRACK-LEVEL
 * provenance (owner correction, 2026-10-29).
 *
 * The bug this fixes: AudioProvider's canonical receipt pipeline originally
 * only knew how to attach a full PlaybackContext to the exact track a caller
 * explicitly passed one for. When a user loaded a Playlist (Track A begins,
 * context attached) and then tapped Track B directly from the Mini Player's
 * queue list, the Mini Player calls play(trackB) with NO context — it has no
 * way to know, and must never be required to reconstruct, that Track B's
 * legitimate discovery source is still "this playlist." The receipt pipeline
 * silently reported a gap for Track B instead of crediting PLAYLIST.
 *
 * The fix: a queue (Playlist / Station / Program) carries ONE discoverySource
 * + playlistId/stationId/programId for its whole lifetime (QueueContext).
 * Each track within it may separately carry its own mediaId/submissionId/
 * programEntryId/queueEntryId/boostCampaignId (TrackProvenanceInput). Mini
 * Player (and any other "pick a different track in the already-loaded
 * queue" caller) needs zero provenance knowledge — AudioProvider derives the
 * full PlaybackContext by merging the ambient QueueContext with whichever
 * track it's told to play.
 *
 * TrackProvenanceInput is intentionally a minimal structural type, not an
 * import of AudioTrack — lib/ must not depend on components/.
 */

import type { DiscoverySource } from "@/lib/music/PlayReceiptRepository";
import type { PlaybackContext } from "@/lib/music/PlaybackReceiptClient";

export interface QueueContext {
  discoverySource: DiscoverySource;
  playlistId?: string;
  stationId?: string;
  programId?: string;
}

export interface TrackProvenanceInput {
  id: string;
  mediaType?: "SONG" | "VIDEO";
  submissionId?: string;
  programEntryId?: string;
  queueEntryId?: string;
  boostCampaignId?: string;
}

/**
 * Projects a full, explicitly-supplied PlaybackContext down to its
 * queue-level fields. Called whenever a caller starts playback with an
 * explicit context (loadQueue, or a direct play(track, opts, context)) —
 * this establishes/REPLACES the ambient queue context, which is exactly the
 * "starting a genuinely new playback source replaces the applicable
 * queue/source context" rule (e.g. leaving a Playlist to play a SEARCH
 * result must not leave stale PLAYLIST context for subsequent tracks).
 */
export function toQueueContext(context: PlaybackContext): QueueContext {
  return {
    discoverySource: context.discoverySource,
    playlistId: context.playlistId,
    stationId: context.stationId,
    programId: context.programId,
  };
}

/**
 * Merges an ambient queue context with one track's own provenance into the
 * full PlaybackContext to report for that specific track. Returns null when
 * there is no queue context to inherit from — callers must never fabricate
 * one (Rule 20): genuinely unknown provenance must surface as a reported
 * gap, not a guessed discoverySource.
 */
export function resolveTrackPlaybackContext(
  queueContext: QueueContext | null,
  track: TrackProvenanceInput,
): PlaybackContext | null {
  if (!queueContext) return null;
  return {
    mediaId: track.id,
    mediaType: track.mediaType ?? "SONG",
    discoverySource: queueContext.discoverySource,
    playlistId: queueContext.playlistId,
    stationId: queueContext.stationId,
    programId: queueContext.programId,
    boostCampaignId: track.boostCampaignId,
    submissionId: track.submissionId,
    programEntryId: track.programEntryId,
    queueEntryId: track.queueEntryId,
  };
}
