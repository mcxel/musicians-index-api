/**
 * Replay Engine — Client-Side
 * Handles session recording metadata, playback controls, timeline scrubbing,
 * highlight clips, and replay sharing for TMI Platform live sessions.
 *
 * Connects to: /api/replay/* REST endpoints
 * Integrates with: RoomsModule, StreamModule
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ReplayStatus = 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED' | 'ARCHIVED';
export type ReplayQuality = '360p' | '480p' | '720p' | '1080p';
export type PlaybackState = 'IDLE' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'BUFFERING' | 'ENDED' | 'ERROR';

export interface ReplaySession {
  id: string;
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: ReplayStatus;
  duration: number;
  startedAt: number;
  endedAt?: number;
  viewCount: number;
  likeCount: number;
  qualities: ReplayQuality[];
  tags: string[];
  isPublic: boolean;
  highlightCount: number;
}

export interface ReplayHighlight {
  id: string;
  replayId: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnailUrl?: string;
  createdBy: string;
  viewCount: number;
  likeCount: number;
  tags: string[];
}

export interface ReplayChapter {
  id: string;
  replayId: string;
  title: string;
  startTime: number;
  endTime: number;
  type: 'INTRO' | 'PERFORMANCE' | 'INTERVIEW' | 'BREAK' | 'OUTRO' | 'HIGHLIGHT';
}

export interface PlaybackPosition {
  currentTime: number;
  duration: number;
  buffered: number;
  progress: number;
}

export interface ReplayFilters {
  roomId?: string;
  hostId?: string;
  status?: ReplayStatus;
  tags?: string[];
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'most_viewed' | 'most_liked' | 'duration';
  page?: number;
  limit?: number;
}

// ─── Replay Engine ─────────────────────────────────────────────────────────────

export class ReplayEngine {
  private baseUrl: string;
  private currentReplay: ReplaySession | null = null;
  private playbackState: PlaybackState = 'IDLE';
  private position: PlaybackPosition = { currentTime: 0, duration: 0, buffered: 0, progress: 0 };
  private currentQuality: ReplayQuality = '720p';
  private playbackRate = 1.0;
  private volume = 1.0;
  private isMuted = false;
  private chapters: ReplayChapter[] = [];
  private highlights: ReplayHighlight[] = [];
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private positionTimer: ReturnType<typeof setInterval> | null = null;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  on(event: string, listener: (...args: unknown[]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  private fire(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  // ─── Playback Control ───────────────────────────────────────────────────────

  setPlaybackState(state: PlaybackState): void {
    this.playbackState = state;
    this.fire('playback_state', state);

    if (state === 'PLAYING') {
      this.startPositionTracking();
    } else {
      this.stopPositionTracking();
    }
  }

  updatePosition(currentTime: number, duration: number, buffered: number): void {
    this.position = {
      currentTime,
      duration,
      buffered,
      progress: duration > 0 ? currentTime / duration : 0,
    };
    this.fire('position', this.position);
  }

  private startPositionTracking(): void {
    if (this.positionTimer) return;
    this.positionTimer = setInterval(() => {
      this.fire('tick', this.position);
    }, 1000);
  }

  private stopPositionTracking(): void {
    if (this.positionTimer) {
      clearInterval(this.positionTimer);
      this.positionTimer = null;
    }
  }

  setQuality(quality: ReplayQuality): void {
    this.currentQuality = quality;
    this.fire('quality_changed', quality);
  }

  setPlaybackRate(rate: number): void {
    const clamped = Math.max(0.25, Math.min(4.0, rate));
    this.playbackRate = clamped;
    this.fire('playback_rate', clamped);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.fire('volume', this.volume);
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.fire('muted', this.isMuted);
  }

  // ─── Chapter Navigation ─────────────────────────────────────────────────────

  setChapters(chapters: ReplayChapter[]): void {
    this.chapters = chapters;
    this.fire('chapters', chapters);
  }

  getCurrentChapter(): ReplayChapter | null {
    const t = this.position.currentTime;
    return this.chapters.find(c => t >= c.startTime && t < c.endTime) ?? null;
  }

  getNextChapter(): ReplayChapter | null {
    const current = this.getCurrentChapter();
    if (!current) return this.chapters[0] ?? null;
    const idx = this.chapters.indexOf(current);
    return this.chapters[idx + 1] ?? null;
  }

  getPrevChapter(): ReplayChapter | null {
    const current = this.getCurrentChapter();
    if (!current) return null;
    const idx = this.chapters.indexOf(current);
    return this.chapters[idx - 1] ?? null;
  }

  // ─── Highlight Management ───────────────────────────────────────────────────

  setHighlights(highlights: ReplayHighlight[]): void {
    this.highlights = highlights;
    this.fire('highlights', highlights);
  }

  getHighlightsAtTime(time: number): ReplayHighlight[] {
    return this.highlights.filter(h => time >= h.startTime && time <= h.endTime);
  }

  // ─── Time Formatting ────────────────────────────────────────────────────────

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  // ─── State Accessors ────────────────────────────────────────────────────────

  getCurrentReplay(): ReplaySession | null { return this.currentReplay; }
  getPlaybackState(): PlaybackState { return this.playbackState; }
  getPosition(): PlaybackPosition { return { ...this.position }; }
  getCurrentQuality(): ReplayQuality { return this.currentQuality; }
  getPlaybackRate(): number { return this.playbackRate; }
  getVolume(): number { return this.volume; }
  isMutedState(): boolean { return this.isMuted; }
  getChapters(): ReplayChapter[] { return [...this.chapters]; }
  getHighlights(): ReplayHighlight[] { return [...this.highlights]; }

  destroy(): void {
    this.stopPositionTracking();
    this.currentReplay = null;
    this.playbackState = 'IDLE';
    this.position = { currentTime: 0, duration: 0, buffered: 0, progress: 0 };
    this.chapters = [];
    this.highlights = [];
    this.listeners.clear();
  }

  // ─── REST API ───────────────────────────────────────────────────────────────

  async fetchReplays(filters?: ReplayFilters): Promise<{ replays: ReplaySession[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          params.set(k, Array.isArray(v) ? v.join(',') : String(v));
        }
      });
    }
    const url = `${this.baseUrl}/replay${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`Replay fetch failed: ${res.status}`);
    return res.json();
  }

  async fetchReplay(id: string): Promise<ReplaySession> {
    const res = await fetch(`${this.baseUrl}/replay/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Replay fetch failed: ${res.status}`);
    const replay = await res.json() as ReplaySession;
    this.currentReplay = replay;
    this.fire('replay_loaded', replay);
    return replay;
  }

  async fetchChapters(replayId: string): Promise<ReplayChapter[]> {
    const res = await fetch(`${this.baseUrl}/replay/${replayId}/chapters`, { credentials: 'include' });
    if (!res.ok) return [];
    const chapters = await res.json() as ReplayChapter[];
    this.setChapters(chapters);
    return chapters;
  }

  async fetchHighlights(replayId: string): Promise<ReplayHighlight[]> {
    const res = await fetch(`${this.baseUrl}/replay/${replayId}/highlights`, { credentials: 'include' });
    if (!res.ok) return [];
    const highlights = await res.json() as ReplayHighlight[];
    this.setHighlights(highlights);
    return highlights;
  }

  async createHighlight(replayId: string, data: { title: string; startTime: number; endTime: number; tags?: string[] }): Promise<ReplayHighlight> {
    const res = await fetch(`${this.baseUrl}/replay/${replayId}/highlights`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Highlight create failed: ${res.status}`);
    return res.json() as Promise<ReplayHighlight>;
  }

  async likeReplay(replayId: string): Promise<void> {
    await fetch(`${this.baseUrl}/replay/${replayId}/like`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async shareReplay(replayId: string): Promise<{ shareUrl: string }> {
    const res = await fetch(`${this.baseUrl}/replay/${replayId}/share`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Share failed: ${res.status}`);
    return res.json();
  }

  async getStreamUrl(replayId: string, quality: ReplayQuality): Promise<{ url: string; expiresAt: number }> {
    const res = await fetch(`${this.baseUrl}/replay/${replayId}/stream?quality=${quality}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Stream URL fetch failed: ${res.status}`);
    return res.json();
  }
}

// ─── Singleton Export ──────────────────────────────────────────────────────────

export const replayEngine = new ReplayEngine();

export function useReplayEngine(): ReplayEngine {
  return replayEngine;
}
