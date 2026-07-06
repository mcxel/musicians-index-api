import { type BroadcastPresetId, applyBroadcastPreset, queueFeed } from '@/lib/broadcast/BroadcastRoutingEngine';
import type { BroadcastPanelId } from '@/lib/broadcast/PanelRegistry';
import { getFeed } from '@/lib/broadcast/FeedRegistry';

export type DirectorMode =
  | 'EMERGENCY'
  | 'CONCERT'
  | 'BATTLE'
  | 'CYPHER'
  | 'CHALLENGE'
  | 'GAME_SHOW'
  | 'RELEASE'
  | 'COMEDY'
  | 'PODCAST'
  | 'MAGAZINE'
  | 'MISSION_CONTROL'
  | 'CREATOR_STUDIO'
  | 'SPONSOR_REVIEW';

export interface DirectorTimelineItem {
  id: string;
  panelId: BroadcastPanelId;
  feedId: string;
  status: 'current' | 'queued' | 'next' | 'completed';
  scheduledAtMs: number;
}

export interface DirectorPlan {
  mode: DirectorMode;
  preset: BroadcastPresetId;
  timeline: DirectorTimelineItem[];
  updatedAtMs: number;
}

const MODE_TO_PRESET: Record<DirectorMode, BroadcastPresetId> = {
  EMERGENCY: 'MISSION_CONTROL',
  CONCERT: 'CONCERT_MODE',
  BATTLE: 'BATTLE_MODE',
  CYPHER: 'BATTLE_MODE',
  CHALLENGE: 'BATTLE_MODE',
  GAME_SHOW: 'BATTLE_MODE',
  RELEASE: 'CONCERT_MODE',
  COMEDY: 'MAGAZINE_MODE',
  PODCAST: 'MAGAZINE_MODE',
  MAGAZINE: 'MAGAZINE_MODE',
  MISSION_CONTROL: 'MISSION_CONTROL',
  CREATOR_STUDIO: 'CONCERT_MODE',
  SPONSOR_REVIEW: 'MISSION_CONTROL',
};

// Canonical Director priority policy.
// Lower number means higher priority.
// 1) Emergency/System Alerts
// 2) Live Concert / Active Performance
// 3) Battle / Cypher / Challenge
// 4) Release Announcement
// 5) Sponsor Obligations
// 6) Game Shows
// 7) Magazine / Editorial
// 8) Playlist / Memory Wall
// 9) Analytics / Idle Branding
export const DIRECTOR_PRIORITY_POLICY: Record<DirectorMode, number> = {
  EMERGENCY: 1,
  CONCERT: 2,
  BATTLE: 3,
  CYPHER: 3,
  CHALLENGE: 3,
  GAME_SHOW: 6,
  RELEASE: 4,
  SPONSOR_REVIEW: 5,
  MAGAZINE: 7,
  COMEDY: 7,
  PODCAST: 7,
  CREATOR_STUDIO: 8,
  MISSION_CONTROL: 9,
};

let currentPlan: DirectorPlan = {
  mode: 'MISSION_CONTROL',
  preset: 'MISSION_CONTROL',
  timeline: [],
  updatedAtMs: Date.now(),
};

export interface DirectorModeRequest {
  mode: DirectorMode;
  reason?: string;
  force?: boolean;
}

export interface DirectorModeDecision {
  applied: boolean;
  requestedMode: DirectorMode;
  activeMode: DirectorMode;
  requestedPriority: number;
  activePriority: number;
  reason: string;
  plan: DirectorPlan;
}

function createTimelineForMode(mode: DirectorMode): DirectorTimelineItem[] {
  const now = Date.now();
  if (mode === 'EMERGENCY') {
    return [
      { id: 'emg-1', panelId: 'OBS_P1', feedId: 'SECURITY_MAIN', status: 'current', scheduledAtMs: now },
      { id: 'emg-2', panelId: 'OBS_P2', feedId: 'LIVE_ABC', status: 'current', scheduledAtMs: now },
      { id: 'emg-3', panelId: 'OBS_P3', feedId: 'CHARTS_MAIN', status: 'next', scheduledAtMs: now + 10_000 },
      { id: 'emg-4', panelId: 'OBS_P4', feedId: 'ANALYTICS_REVENUE', status: 'queued', scheduledAtMs: now + 20_000 },
    ];
  }

  if (mode === 'CONCERT') {
    return [
      { id: 'concert-1', panelId: 'OBS_P1', feedId: 'LIVE_ABC', status: 'current', scheduledAtMs: now },
      { id: 'concert-2', panelId: 'OBS_P2', feedId: 'DRONE_A', status: 'next', scheduledAtMs: now + 30_000 },
      { id: 'concert-3', panelId: 'OBS_P3', feedId: 'BACKSTAGE_MAIN', status: 'queued', scheduledAtMs: now + 60_000 },
      { id: 'concert-4', panelId: 'OBS_P4', feedId: 'SPONSOR_NIKE', status: 'queued', scheduledAtMs: now + 90_000 },
      { id: 'concert-5', panelId: 'OBS_P5', feedId: 'ANALYTICS_REVENUE', status: 'current', scheduledAtMs: now },
      { id: 'concert-6', panelId: 'OBS_P6', feedId: 'CHAT_LIVE', status: 'current', scheduledAtMs: now },
    ];
  }

  if (mode === 'MAGAZINE') {
    return [
      { id: 'mag-1', panelId: 'OBS_P1', feedId: 'MAGAZINE_84', status: 'current', scheduledAtMs: now },
      { id: 'mag-2', panelId: 'OBS_P2', feedId: 'PROFILE_BIGKAZHDOG', status: 'next', scheduledAtMs: now + 25_000 },
      { id: 'mag-3', panelId: 'OBS_P3', feedId: 'SPONSOR_NIKE', status: 'queued', scheduledAtMs: now + 45_000 },
      { id: 'mag-4', panelId: 'OBS_P4', feedId: 'ANALYTICS_REVENUE', status: 'current', scheduledAtMs: now },
    ];
  }

  if (mode === 'RELEASE') {
    return [
      { id: 'rel-1', panelId: 'OBS_P1', feedId: 'RELEASE_ANNOUNCEMENT_MAIN', status: 'current', scheduledAtMs: now },
      { id: 'rel-2', panelId: 'OBS_P2', feedId: 'LIVE_ABC', status: 'next', scheduledAtMs: now + 20_000 },
      { id: 'rel-3', panelId: 'OBS_P3', feedId: 'PLAYLIST_MAIN', status: 'queued', scheduledAtMs: now + 40_000 },
      { id: 'rel-4', panelId: 'OBS_P4', feedId: 'SPONSOR_SPOTLIGHT_MAIN', status: 'queued', scheduledAtMs: now + 60_000 },
    ];
  }

  return [
    { id: 'mc-1', panelId: 'OBS_P1', feedId: 'LIVE_ABC', status: 'current', scheduledAtMs: now },
    { id: 'mc-2', panelId: 'OBS_P2', feedId: 'ANALYTICS_REVENUE', status: 'current', scheduledAtMs: now },
    { id: 'mc-3', panelId: 'OBS_P3', feedId: 'OBS_OUTPUT_A', status: 'next', scheduledAtMs: now + 20_000 },
    { id: 'mc-4', panelId: 'OBS_P4', feedId: 'SPONSOR_NIKE', status: 'queued', scheduledAtMs: now + 40_000 },
  ];
}

export function activateDirectorMode(mode: DirectorMode): DirectorPlan {
  const preset = MODE_TO_PRESET[mode];
  applyBroadcastPreset(preset);
  const timeline = createTimelineForMode(mode);

  for (const item of timeline.filter((entry) => entry.status === 'queued' || entry.status === 'next')) {
    const feed = getFeed(item.feedId as any);
    if (!feed) continue;
    queueFeed(item.panelId, {
      feedType: feed.type,
      sourceId: feed.sourceId,
      label: feed.label,
      payload: feed.metadata,
    });
  }

  currentPlan = {
    mode,
    preset,
    timeline,
    updatedAtMs: Date.now(),
  };

  return currentPlan;
}

export function getDirectorPlan(): DirectorPlan {
  return currentPlan;
}

export function listDirectorModes(): DirectorMode[] {
  return Object.keys(MODE_TO_PRESET) as DirectorMode[];
}

export function requestDirectorMode(request: DirectorModeRequest): DirectorModeDecision {
  const requestedPriority = DIRECTOR_PRIORITY_POLICY[request.mode];
  const activePriority = DIRECTOR_PRIORITY_POLICY[currentPlan.mode];

  if (!request.force && requestedPriority > activePriority) {
    return {
      applied: false,
      requestedMode: request.mode,
      activeMode: currentPlan.mode,
      requestedPriority,
      activePriority,
      reason: `Suppressed by priority policy (${request.reason ?? 'runtime'})`,
      plan: currentPlan,
    };
  }

  const plan = activateDirectorMode(request.mode);
  return {
    applied: true,
    requestedMode: request.mode,
    activeMode: plan.mode,
    requestedPriority,
    activePriority,
    reason: request.reason ?? 'runtime',
    plan,
  };
}

export function getDirectorPriorityPolicy(): Record<DirectorMode, number> {
  return { ...DIRECTOR_PRIORITY_POLICY };
}