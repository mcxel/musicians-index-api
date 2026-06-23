export interface PlaylistTrack {
  trackId: string;
  title: string;
  sourceUrl: string;
  durationMs?: number;
}

export interface PlaylistEngine {
  listTracks(playlistId: string): Promise<PlaylistTrack[]>;
  addTrack(playlistId: string, track: PlaylistTrack): Promise<void>;
}
