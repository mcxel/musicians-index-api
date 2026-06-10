export type MonitorMode = 'floating' | 'docked' | 'pinned' | 'full-stage' | 'mini' | 'collapsed';

export type MonitorSourceType =
  | 'playlist'
  | 'beat'
  | 'video'
  | 'screen'
  | 'article'
  | 'camera'
  | 'stage'
  | 'memory'
  | 'image'
  | 'audio';

export type SubscriptionTier = 'FREE' | 'PRO' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface SyncState {
  monitorId: string;
  sourceType: MonitorSourceType;
  playing: boolean;
  playheadSeconds: number;
  durationSeconds?: number;
  updatedAt: number;
  updatedBy: string;
  roomId?: string;
  sessionId?: string;
}

export interface MonitorPayload {
  sourceType: MonitorSourceType;
  sourceId?: string;
  sourceUrl?: string;
  title?: string;
  text?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface ActiveMonitor {
  monitorId: string;
  mode: MonitorMode;
  payload: MonitorPayload;
  syncState: SyncState;
  openedByUserId: string;
  openedByDisplayName: string;
  openedAt: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pinned: boolean;
  docked: boolean;
  collapsed: boolean;
}
