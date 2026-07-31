/**
 * PlaylistRoomRuntimeEngine — Playlist Room Runtime.
 * Powers collaborative playlists, live listening, skip voting, host controls,
 * and spatial audio sharing across lounges and listening parties.
 */

import type { TrackItem } from "@/lib/runtimes/PerformanceRuntime";

export class PlaylistRoomRuntimeEngine {
  private roomId: string;
  private hostUserId: string;
  private playlist: TrackItem[] = [];
  private skipVotes: Set<string> = new Set();

  constructor(roomId: string, hostUserId: string) {
    this.roomId = roomId;
    this.hostUserId = hostUserId;
  }

  public addTrack(track: TrackItem) {
    this.playlist.push(track);
    this.emitEvent("PlaylistTrackAdded", { track });
  }

  public voteToSkip(userId: string) {
    this.skipVotes.add(userId);
    this.emitEvent("PlaylistSkipVoted", { voteCount: this.skipVotes.size });

    if (this.skipVotes.size >= 3) {
      this.skipTrack();
    }
  }

  public skipTrack() {
    this.skipVotes.clear();
    const skipped = this.playlist.shift();
    this.emitEvent("PlaylistTrackSkipped", { skippedTrack: skipped });
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, roomId: this.roomId } },
        })
      );
    } catch (e) {}
  }
}

export default PlaylistRoomRuntimeEngine;
