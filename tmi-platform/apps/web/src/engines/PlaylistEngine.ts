export type PlaylistType =
  | 'personal'
  | 'fan'
  | 'artist'
  | 'performer'
  | 'venue'
  | 'sponsor'
  | 'promoter'
  | 'lobby'
  | 'stage'
  | 'walkOn'
  | 'memoryWall'
  | 'worldDanceParty'
  | 'miniEvent';

export type PlaylistSource =
  | 'spotify'
  | 'appleMusic'
  | 'youtube'
  | 'usaStreamTeam'
  | 'uploadedTrack'
  | 'artistCatalog'
  | 'venuePlaylist'
  | 'fanPlaylist'
  | 'sponsorPlaylist'
  | 'walkOnMusic'
  | 'memoryWallMusic'
  | 'internal';

export type ViewState = 'minimized' | 'standard' | 'expanded' | 'fullscreen';

export interface PlaylistTrack {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  durationMs?: number;
  sourceUrl?: string;
}

export interface PlaylistContextBinding {
  ownerId?: string;
  roomId?: string;
  venueId?: string;
  eventId?: string;
}

export interface PlaylistAnalyticsSnapshot {
  plays: number;
  uniqueListeners: number;
  likes: number;
  dislikes: number;
  favorites: number;
  shares: number;
  comments: number;
  replays: number;
  completionRate: number;
}

export interface PlaylistSyncState {
  sharedPlaybackSessionId?: string;
  hostUserId?: string;
  syncedAudienceCount?: number;
}

export interface PlaylistAdaptationSignals {
  skipRate?: number;
  retention?: number;
  reactionScore?: number;
  danceActivity?: number;
  audienceEngagement?: number;
}

export interface PlaylistDiscoveryState {
  visibility: 'private' | 'friends' | 'followers' | 'public' | 'featured';
  surfacedOnLiveWall: boolean;
}

export interface PlaylistEngineState {
  currentTrack: PlaylistTrack | null;
  queue: PlaylistTrack[];
  isPlaying: boolean;
  volume: number;
  source: PlaylistSource;
  playlistType: PlaylistType;
  binding: PlaylistContextBinding;
  analytics: PlaylistAnalyticsSnapshot;
  sync: PlaylistSyncState;
  adaptation: PlaylistAdaptationSignals;
  discovery: PlaylistDiscoveryState;
  activeViewState: ViewState;
}

export interface PlaylistEngineContract {
  state: PlaylistEngineState;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setQueue: (queue: PlaylistTrack[]) => void;
  setVolume: (volume: number) => void;
  attachToRuntime: (binding: PlaylistContextBinding) => void;
  preserveAcrossViewState: (state: ViewState) => void;
  // Future hooks
  setVisibility: (visibility: PlaylistDiscoveryState['visibility']) => void;
  attachSharedPlaybackSession: (sessionId: string, hostUserId?: string) => void;
}

const defaultState: PlaylistEngineState = {
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 1,
  source: 'internal',
  playlistType: 'personal',
  binding: {},
  analytics: {
    plays: 0,
    uniqueListeners: 0,
    likes: 0,
    dislikes: 0,
    favorites: 0,
    shares: 0,
    comments: 0,
    replays: 0,
    completionRate: 0,
  },
  sync: {},
  adaptation: {},
  discovery: {
    visibility: 'private',
    surfacedOnLiveWall: false,
  },
  activeViewState: 'standard',
};

class PlaylistEngineRuntime implements PlaylistEngineContract {
  state: PlaylistEngineState = { ...defaultState };

  play() {
    this.state = { ...this.state, isPlaying: true };
  }

  pause() {
    this.state = { ...this.state, isPlaying: false };
  }

  next() {
    if (this.state.queue.length === 0) return;
    const currentIndex = this.state.currentTrack
      ? this.state.queue.findIndex((t) => t.id === this.state.currentTrack?.id)
      : -1;
    const nextIndex = (currentIndex + 1) % this.state.queue.length;
    this.state = { ...this.state, currentTrack: this.state.queue[nextIndex], isPlaying: true };
  }

  previous() {
    if (this.state.queue.length === 0) return;
    const currentIndex = this.state.currentTrack
      ? this.state.queue.findIndex((t) => t.id === this.state.currentTrack?.id)
      : 0;
    const prevIndex = (currentIndex - 1 + this.state.queue.length) % this.state.queue.length;
    this.state = { ...this.state, currentTrack: this.state.queue[prevIndex], isPlaying: true };
  }

  setQueue(queue: PlaylistTrack[]) {
    this.state = {
      ...this.state,
      queue,
      currentTrack: queue[0] ?? null,
    };
  }

  setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.state = { ...this.state, volume: clamped };
  }

  attachToRuntime(binding: PlaylistContextBinding) {
    this.state = { ...this.state, binding: { ...binding } };
  }

  preserveAcrossViewState(state: ViewState) {
    this.state = { ...this.state, activeViewState: state };
  }

  setVisibility(visibility: PlaylistDiscoveryState['visibility']) {
    this.state = {
      ...this.state,
      discovery: {
        ...this.state.discovery,
        visibility,
        surfacedOnLiveWall: visibility === 'public' || visibility === 'featured',
      },
    };
  }

  attachSharedPlaybackSession(sessionId: string, hostUserId?: string) {
    this.state = {
      ...this.state,
      sync: {
        ...this.state.sync,
        sharedPlaybackSessionId: sessionId,
        hostUserId,
      },
    };
  }
}

// Singleton runtime for v1 contract-first migration.
export const PlaylistEngine = new PlaylistEngineRuntime();
