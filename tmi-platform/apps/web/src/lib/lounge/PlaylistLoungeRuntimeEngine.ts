/**
 * PlaylistLoungeRuntimeEngine.ts — Phase 5.2 Priority 6 Playlist Lounge Engine.
 * Manages relaxed, ambient listening room states: soft lighting, floating album art,
 * 3D audio equalizers, listening circles, synchronized lyrics, and dual-monitor casting.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";

export type LoungeState =
  | "LOUNGE_OPEN"
  | "AMBIENT_WARMUP"
  | "TRACK_PLAYING"
  | "LISTENING_CIRCLE"
  | "LYRICS_SYNC"
  | "MONITOR_CAST"
  | "CHILL_BREAK"
  | "LOUNGE_COOLDOWN";

export interface LoungeTrack {
  trackId: string;
  title: string;
  artistName: string;
  albumArtUrl: string;
  durationSeconds: number;
  lyrics?: string[];
}

export class PlaylistLoungeRuntimeEngine extends BaseCompetitionRuntime {
  private loungeState: LoungeState = "LOUNGE_OPEN";
  private activePlaylist: LoungeTrack[] = [];
  private currentTrackIndex: number = 0;

  constructor(loungeId: string) {
    super(loungeId, "PLAYLIST");
  }

  public openLounge(title: string = "Chill Beats & Lounge", playlist: LoungeTrack[]) {
    this.activePlaylist = playlist;
    this.loungeState = "AMBIENT_WARMUP";
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("LoungeOpened", {
      loungeId: this.competitionId,
      title,
      trackCount: playlist.length,
    });
  }

  public playTrack(trackIndex: number = 0) {
    this.currentTrackIndex = trackIndex;
    this.loungeState = "TRACK_PLAYING";
    const track = this.activePlaylist[trackIndex] ?? this.activePlaylist[0];
    this.emitSemanticEvent("LoungeTrackStarted", {
      loungeId: this.competitionId,
      trackIndex,
      track,
    });
  }

  public startListeningCircle() {
    this.loungeState = "LISTENING_CIRCLE";
    this.emitSemanticEvent("ListeningCircleStarted", {
      loungeId: this.competitionId,
      currentTrack: this.activePlaylist[this.currentTrackIndex],
    });
  }

  public syncLyrics(currentLine: string) {
    this.loungeState = "LYRICS_SYNC";
    this.emitSemanticEvent("LyricsSynced", {
      loungeId: this.competitionId,
      currentLine,
    });
  }

  public castToMonitors(surfaceId: string = "main-stage-screen") {
    this.loungeState = "MONITOR_CAST";
    this.emitSemanticEvent("MonitorCastTriggered", {
      loungeId: this.competitionId,
      surfaceId,
      track: this.activePlaylist[this.currentTrackIndex],
    });
  }

  public cooldown() {
    this.loungeState = "LOUNGE_COOLDOWN";
    this.status = "IDLE";
    this.emitSemanticEvent("LoungeCooldown", {
      loungeId: this.competitionId,
    });
  }
}

export default PlaylistLoungeRuntimeEngine;
