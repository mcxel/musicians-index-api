/**
 * PersonalPlaylistEngine.ts
 *
 * Manages user's personal song collection.
 * SEPARATE from Music Studio Submission Queue.
 *
 * Personal Playlist = User's uploaded songs (immediate, always available)
 * Submission Queue = Songs submitted for editorial/radio approval
 *
 * Rule: A song in Personal Playlist does NOT automatically go to Submission Queue.
 * User must explicitly submit via Music Studio.
 */

export interface PlaylistSong {
  songId: string;
  title: string;
  duration: number;
  genre?: string;
  uploadedAt: string;
  status: 'draft' | 'published';
}

export interface PersonalPlaylist {
  playlistId: string;
  userId: string;
  songs: PlaylistSong[];
  createdAt: string;
  updatedAt: string;
}

class PersonalPlaylistEngine {
  private playlists = new Map<string, PersonalPlaylist>();

  /**
   * Get user's personal playlist.
   * Creates one if it doesn't exist.
   */
  getOrCreatePlaylist(userId: string): PersonalPlaylist {
    const playlistId = `playlist-${userId}`;

    if (!this.playlists.has(playlistId)) {
      this.playlists.set(playlistId, {
        playlistId,
        userId,
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return this.playlists.get(playlistId)!;
  }

  /**
   * Add a song to personal playlist.
   * Called when user uploads a song.
   */
  addSong(userId: string, song: Omit<PlaylistSong, 'uploadedAt'>) {
    const playlist = this.getOrCreatePlaylist(userId);

    const newSong: PlaylistSong = {
      ...song,
      uploadedAt: new Date().toISOString(),
    };

    playlist.songs.push(newSong);
    playlist.updatedAt = new Date().toISOString();

    return newSong;
  }

  /**
   * Get a specific song from personal playlist.
   */
  getSong(userId: string, songId: string): PlaylistSong | undefined {
    const playlist = this.getOrCreatePlaylist(userId);
    return playlist.songs.find((s) => s.songId === songId);
  }

  /**
   * List all songs in user's personal playlist.
   */
  listSongs(userId: string): PlaylistSong[] {
    const playlist = this.getOrCreatePlaylist(userId);
    return playlist.songs;
  }

  /**
   * List published songs (visible on profile).
   */
  listPublishedSongs(userId: string): PlaylistSong[] {
    const playlist = this.getOrCreatePlaylist(userId);
    return playlist.songs.filter((s) => s.status === 'published');
  }

  /**
   * Update song status (draft ↔ published).
   */
  updateSongStatus(userId: string, songId: string, status: 'draft' | 'published') {
    const playlist = this.getOrCreatePlaylist(userId);
    const song = playlist.songs.find((s) => s.songId === songId);

    if (song) {
      song.status = status;
      playlist.updatedAt = new Date().toISOString();
    }

    return song;
  }

  /**
   * Remove a song from personal playlist.
   */
  removeSong(userId: string, songId: string) {
    const playlist = this.getOrCreatePlaylist(userId);
    const initialLength = playlist.songs.length;

    playlist.songs = playlist.songs.filter((s) => s.songId !== songId);

    if (playlist.songs.length < initialLength) {
      playlist.updatedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Update song metadata.
   */
  updateSong(userId: string, songId: string, updates: Partial<PlaylistSong>) {
    const playlist = this.getOrCreatePlaylist(userId);
    const song = playlist.songs.find((s) => s.songId === songId);

    if (song) {
      // Don't allow modifying uploadedAt or songId
      const { uploadedAt, songId: id, ...allowedUpdates } = updates;
      Object.assign(song, allowedUpdates);
      playlist.updatedAt = new Date().toISOString();
    }

    return song;
  }

  /**
   * Get all playlists (admin only).
   */
  getAllPlaylists(): PersonalPlaylist[] {
    return Array.from(this.playlists.values());
  }
}

export const personalPlaylistEngine = new PersonalPlaylistEngine();
