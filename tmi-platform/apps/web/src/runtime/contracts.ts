export type RuntimePanelState = 'minimized' | 'standard' | 'expanded' | 'fullscreen';

export interface RuntimePanelContract {
  id: string;
  state: RuntimePanelState;
  opacity: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  draggable?: boolean;
  avoidZones?: string[];
}

export interface TripleViewManagerContract {
  selfPanel: RuntimePanelContract;
  audiencePanel: RuntimePanelContract;
  avatarPanel: RuntimePanelContract;
  persistentLayoutKey: string;
}

export interface PlaylistEngineContract {
  protectedEngine: true;
  source: 'existing-playlist-system';
  enabled: boolean;
}

export interface AudiencePresenceEngineContract {
  protectedEngine: true;
  source: 'existing-audience-system';
  enabled: boolean;
}

export interface LiveStageRuntimeContract {
  enabled: boolean;
  mode: 'idle' | 'live';
}

export interface ProfileLobbyRuntimeContract {
  role: 'performer' | 'fan' | 'venue';
  displayName: string;
  userId?: string;
  bio?: string;
  isLive?: boolean;
  videoSrc?: string;
  tripleView: TripleViewManagerContract;
  playlist: PlaylistEngineContract;
  audience: AudiencePresenceEngineContract;
  liveStage: LiveStageRuntimeContract;
}
