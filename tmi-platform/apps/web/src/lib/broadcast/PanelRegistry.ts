export type BroadcastPanelId =
  | 'OBS_P1'
  | 'OBS_P2'
  | 'OBS_P3'
  | 'OBS_P4'
  | 'OBS_P5'
  | 'OBS_P6'
  | 'PROFILE_MAIN'
  | 'PROFILE_P2'
  | 'PROFILE_P3'
  | 'LIVE_MAIN'
  | 'LIVE_P2'
  | 'LIVE_P3'
  | 'VENUE_STAGE'
  | 'VENUE_AUDIENCE'
  | 'VENUE_BACKSTAGE'
  | 'HUD_PIP_1'
  | 'HUD_PIP_2'
  | 'HUD_PIP_3';

export type BroadcastFeedType =
  | 'LIVE_WEBRTC'
  | 'VIDEO'
  | 'PLAYLIST'
  | 'MAGAZINE'
  | 'BATTLE'
  | 'CYPHER'
  | 'CHALLENGE'
  | 'GAME_SHOW'
  | 'SPONSOR'
  | 'ADVERTISEMENT'
  | 'ARTICLE'
  | 'PROFILE'
  | 'CAMERA'
  | 'DRONE'
  | 'BACKSTAGE'
  | 'SECURITY'
  | 'ANALYTICS'
  | 'REVENUE'
  | 'CHARTS'
  | 'BROWSER'
  | 'SCREEN_SHARE';

export interface BroadcastFeedAssignment {
  feedType: BroadcastFeedType;
  sourceId: string;
  label: string;
  payload?: Record<string, unknown>;
}

export interface BroadcastPanelState {
  panelId: BroadcastPanelId;
  assignment: BroadcastFeedAssignment | null;
  queue: BroadcastFeedAssignment[];
  status: 'idle' | 'live' | 'queued';
  muted: boolean;
  fullscreen: boolean;
  recording: boolean;
  quality: 'low' | 'medium' | 'high';
  viewers: number;
  updatedAtMs: number;
}

const PANEL_IDS: BroadcastPanelId[] = [
  'OBS_P1',
  'OBS_P2',
  'OBS_P3',
  'OBS_P4',
  'OBS_P5',
  'OBS_P6',
  'PROFILE_MAIN',
  'PROFILE_P2',
  'PROFILE_P3',
  'LIVE_MAIN',
  'LIVE_P2',
  'LIVE_P3',
  'VENUE_STAGE',
  'VENUE_AUDIENCE',
  'VENUE_BACKSTAGE',
  'HUD_PIP_1',
  'HUD_PIP_2',
  'HUD_PIP_3',
];

const panels = new Map<BroadcastPanelId, BroadcastPanelState>(
  PANEL_IDS.map((panelId) => [
    panelId,
    {
      panelId,
      assignment: null,
      queue: [],
      status: 'idle',
      muted: false,
      fullscreen: false,
      recording: false,
      quality: 'high',
      viewers: 0,
      updatedAtMs: Date.now(),
    },
  ]),
);

export function listBroadcastPanelIds(): BroadcastPanelId[] {
  return [...PANEL_IDS];
}

export function listBroadcastPanelStates(): BroadcastPanelState[] {
  return listBroadcastPanelIds().map((panelId) => getBroadcastPanelState(panelId));
}

export function getBroadcastPanelState(panelId: BroadcastPanelId): BroadcastPanelState {
  const state = panels.get(panelId);
  if (!state) {
    throw new Error(`Unknown broadcast panel: ${panelId}`);
  }
  return {
    ...state,
    assignment: state.assignment ? { ...state.assignment } : null,
    queue: state.queue.map((feed) => ({ ...feed })),
  };
}

export function setBroadcastPanelState(
  panelId: BroadcastPanelId,
  updater: (prev: BroadcastPanelState) => BroadcastPanelState,
): BroadcastPanelState {
  const prev = getBroadcastPanelState(panelId);
  const next = {
    ...updater(prev),
    panelId,
    updatedAtMs: Date.now(),
  };
  panels.set(panelId, next);
  return getBroadcastPanelState(panelId);
}