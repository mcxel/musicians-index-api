/**
 * PersonalPlaylistEngine.ts
 *
 * Manages user's personal song collection (library).
 * COMPLETELY SEPARATE from Music Studio Submission Queue.
 *
 * Personal Playlist = User's library of songs (any source)
 *   ├─ Songs they uploaded
 *   ├─ Songs from other performers
 *   ├─ Remixes, covers, featured tracks
 *   └─ Can add ANY song from the platform
 *
 * Submission Queue = ONLY songs user created/owns submitted for editorial/radio
 *   ├─ Pending review
 *   ├─ Approved
 *   ├─ Scheduled/Live/Featured
 *   └─ Tracked separately with stats
 *
 * Rule: Personal Playlist ≠ Submission Queue
 *   - Can have 1,000 songs in playlist
 *   - Only submit 5 to Stream Radio
 *   - Playlist is local library
 *   - Queue is editorial pipeline
 */

export interface PlaylistSong {
  songId: string;
  title: string;
  artistId: string;          // Who created it
  artistName: string;
  duration: number;
  genre?: string;
  imageUrl?: string;
  addedAt: string;           // When user added it to their playlist
  createdAt: string;         // When song was originally created
  source: 'uploaded' | 'discovered';  // Did user upload or add from discovery?
  isOwned: boolean;          // Did user create this song?
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
   * Get user's personal playlist (library).
   * This is their local collection of any songs they want.
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
   * Add user's OWN uploaded song to playlist.
   * Called when user uploads a new song.
   */
  addOwnSong(userId: string, song: {
    songId: string;
    title: string;
    duration: number;
    genre?: string;
    imageUrl?: string;
  }) {
    const playlist = this.getOrCreatePlaylist(userId);

    const newSong: PlaylistSong = {
      ...song,
      artistId: userId,
      artistName: 'You',  // Will be replaced with actual name
      addedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'uploaded',
      isOwned: true,
    };

    playlist.songs.push(newSong);
    playlist.updatedAt = new Date().toISOString();

    return newSong;
  }

  /**
   * Add someone ELSE'S song to user's playlist.
   * Called when user discovers and adds a song from another performer.
   */
  addDiscoveredSong(userId: string, song: {
    songId: string;
    title: string;
    artistId: string;
    artistName: string;
    duration: number;
    genre?: string;
    imageUrl?: string;
    createdAt: string;
  }) {
    const playlist = this.getOrCreatePlaylist(userId);

    // Check if already in playlist
    const alreadyAdded = playlist.songs.some((s) => s.songId === song.songId);
    if (alreadyAdded) {
      return undefined;  // Already in playlist
    }

    const newSong: PlaylistSong = {
      ...song,
      addedAt: new Date().toISOString(),
      source: 'discovered',
      isOwned: false,
    };

    playlist.songs.push(newSong);
    playlist.updatedAt = new Date().toISOString();

    return newSong;
  }

  /**
   * Legacy: Add a song (auto-detects if owned or discovered).
   */
  addSong(userId: string, song: Omit<PlaylistSong, 'addedAt'>) {
    const playlist = this.getOrCreatePlaylist(userId);

    const newSong: PlaylistSong = {
      ...song,
      addedAt: new Date().toISOString(),
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
   * List all songs in user's personal playlist (library).
   * Includes both user's own songs and songs they discovered/added.
   */
  listSongs(userId: string): PlaylistSong[] {
    const playlist = this.getOrCreatePlaylist(userId);
    return playlist.songs.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }

  /**
   * List ONLY user's OWN uploaded songs.
   * (Not songs they added from discovery)
   * These are the only songs that can be submitted to Stream Radio / One Prayer.
   */
  listOwnSongs(userId: string): PlaylistSong[] {
    const playlist = this.getOrCreatePlaylist(userId);
    return playlist.songs.filter((s) => s.isOwned);
  }

  /**
   * List ONLY songs discovered and added from other performers.
   * These cannot be submitted to editorial/radio.
   */
  listDiscoveredSongs(userId: string): PlaylistSong[] {
    const playlist = this.getOrCreatePlaylist(userId);
    return playlist.songs.filter((s) => !s.isOwned);
  }

  /**
   * Remove a song from personal playlist (user's library).
   */
  removeSong(userId: string, songId: string): boolean {
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
   * Get all playlists (admin only).
   */
  getAllPlaylists(): PersonalPlaylist[] {
    return Array.from(this.playlists.values());
  }
}

export const personalPlaylistEngine = new PersonalPlaylistEngine();
