import type { BroadcastFeedType } from '@/lib/broadcast/PanelRegistry';
import type { BroadcastFeedAssignment } from '@/lib/broadcast/PanelRegistry';

export type BroadcastFeedId =
  | 'LIVE_ABC'
  | 'MAGAZINE_84'
  | 'PROFILE_BIGKAZHDOG'
  | 'SPONSOR_NIKE'
  | 'ANALYTICS_REVENUE'
  | 'BACKSTAGE_MAIN'
  | 'CHAT_LIVE'
  | 'BATTLE_A'
  | 'BATTLE_B'
  | 'CYPHER_MAIN'
  | 'CHALLENGE_MAIN'
  | 'GAME_SHOW_MAIN'
  | 'DRONE_A'
  | 'SCREEN_SHARE_A'
  | 'OBS_OUTPUT_A'
  | 'BRACKET_MAIN'
  | 'EDITOR_CAM'
  | 'FEATURE_ARTICLE'
  | 'SECURITY_MAIN'
  | 'CHARTS_MAIN'
  | 'LOBBY_A'
  | 'STAGE_MAIN'
  | 'PLAYLIST_MAIN'
  | 'MEMORY_WALL_MAIN'
  | 'RELEASE_ANNOUNCEMENT_MAIN'
  | 'SPONSOR_SPOTLIGHT_MAIN'
  | 'ADVERTISEMENT_MAIN';

export interface FeedDescriptor {
  id: BroadcastFeedId;
  label: string;
  type: BroadcastFeedType;
  sourceId: string;
  status: 'ready' | 'live' | 'queued' | 'error';
  lastUpdatedMs: number;
  metadata?: Record<string, unknown>;
}

const FEED_REGISTRY = new Map<BroadcastFeedId, FeedDescriptor>([
  ['LIVE_ABC', { id: 'LIVE_ABC', label: 'Live Room ABC', type: 'LIVE_WEBRTC', sourceId: 'room-abc123', status: 'live', lastUpdatedMs: Date.now() }],
  ['MAGAZINE_84', { id: 'MAGAZINE_84', label: 'Magazine Article 84', type: 'MAGAZINE', sourceId: 'article-84', status: 'ready', lastUpdatedMs: Date.now() }],
  ['PROFILE_BIGKAZHDOG', { id: 'PROFILE_BIGKAZHDOG', label: 'Profile BigKazHdog', type: 'PROFILE', sourceId: 'bigkazhdog', status: 'ready', lastUpdatedMs: Date.now() }],
  ['SPONSOR_NIKE', { id: 'SPONSOR_NIKE', label: 'Sponsor Nike Spot', type: 'SPONSOR', sourceId: 'nike-campaign', status: 'queued', lastUpdatedMs: Date.now() }],
  ['ANALYTICS_REVENUE', { id: 'ANALYTICS_REVENUE', label: 'Revenue Analytics', type: 'REVENUE', sourceId: 'analytics-revenue', status: 'live', lastUpdatedMs: Date.now() }],
  ['BACKSTAGE_MAIN', { id: 'BACKSTAGE_MAIN', label: 'Backstage Main', type: 'BACKSTAGE', sourceId: 'backstage-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['CHAT_LIVE', { id: 'CHAT_LIVE', label: 'Live Chat Analytics', type: 'ANALYTICS', sourceId: 'chat-live', status: 'live', lastUpdatedMs: Date.now() }],
  ['BATTLE_A', { id: 'BATTLE_A', label: 'Battle Competitor A', type: 'BATTLE', sourceId: 'battle-a', status: 'ready', lastUpdatedMs: Date.now() }],
  ['BATTLE_B', { id: 'BATTLE_B', label: 'Battle Competitor B', type: 'BATTLE', sourceId: 'battle-b', status: 'ready', lastUpdatedMs: Date.now() }],
  ['CYPHER_MAIN', { id: 'CYPHER_MAIN', label: 'Cypher Main', type: 'CYPHER', sourceId: 'cypher-main', status: 'queued', lastUpdatedMs: Date.now() }],
  ['CHALLENGE_MAIN', { id: 'CHALLENGE_MAIN', label: 'Challenge Main', type: 'CHALLENGE', sourceId: 'challenge-main', status: 'queued', lastUpdatedMs: Date.now() }],
  ['GAME_SHOW_MAIN', { id: 'GAME_SHOW_MAIN', label: 'Game Show Main', type: 'GAME_SHOW', sourceId: 'game-show-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['DRONE_A', { id: 'DRONE_A', label: 'Drone Camera A', type: 'DRONE', sourceId: 'drone-a', status: 'ready', lastUpdatedMs: Date.now() }],
  ['SCREEN_SHARE_A', { id: 'SCREEN_SHARE_A', label: 'Screen Share A', type: 'SCREEN_SHARE', sourceId: 'screen-a', status: 'ready', lastUpdatedMs: Date.now() }],
  ['OBS_OUTPUT_A', { id: 'OBS_OUTPUT_A', label: 'OBS Program Output', type: 'VIDEO', sourceId: 'obs-output-a', status: 'live', lastUpdatedMs: Date.now() }],
  ['BRACKET_MAIN', { id: 'BRACKET_MAIN', label: 'Bracket Main', type: 'CHARTS', sourceId: 'bracket-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['EDITOR_CAM', { id: 'EDITOR_CAM', label: 'Editor Cam', type: 'CAMERA', sourceId: 'editor-cam', status: 'ready', lastUpdatedMs: Date.now() }],
  ['FEATURE_ARTICLE', { id: 'FEATURE_ARTICLE', label: 'Feature Article', type: 'ARTICLE', sourceId: 'feature-article', status: 'ready', lastUpdatedMs: Date.now() }],
  ['SECURITY_MAIN', { id: 'SECURITY_MAIN', label: 'Security Main', type: 'SECURITY', sourceId: 'security-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['CHARTS_MAIN', { id: 'CHARTS_MAIN', label: 'Charts Main', type: 'CHARTS', sourceId: 'charts-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['LOBBY_A', { id: 'LOBBY_A', label: 'Lobby Cam', type: 'CAMERA', sourceId: 'lobby-a', status: 'ready', lastUpdatedMs: Date.now() }],
  ['STAGE_MAIN', { id: 'STAGE_MAIN', label: 'Stage Main Camera', type: 'CAMERA', sourceId: 'stage-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['PLAYLIST_MAIN', { id: 'PLAYLIST_MAIN', label: 'Playlist Main', type: 'PLAYLIST', sourceId: 'playlist-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['MEMORY_WALL_MAIN', { id: 'MEMORY_WALL_MAIN', label: 'Memory Wall Main', type: 'VIDEO', sourceId: 'memory-wall-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['RELEASE_ANNOUNCEMENT_MAIN', { id: 'RELEASE_ANNOUNCEMENT_MAIN', label: 'Release Announcement', type: 'VIDEO', sourceId: 'release-announcement-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['SPONSOR_SPOTLIGHT_MAIN', { id: 'SPONSOR_SPOTLIGHT_MAIN', label: 'Sponsor Spotlight', type: 'SPONSOR', sourceId: 'sponsor-spotlight-main', status: 'ready', lastUpdatedMs: Date.now() }],
  ['ADVERTISEMENT_MAIN', { id: 'ADVERTISEMENT_MAIN', label: 'Advertisement Main', type: 'ADVERTISEMENT', sourceId: 'advertisement-main', status: 'ready', lastUpdatedMs: Date.now() }],
]);

export function listFeeds(): FeedDescriptor[] {
  return Array.from(FEED_REGISTRY.values()).sort((a, b) => b.lastUpdatedMs - a.lastUpdatedMs);
}

export function getFeed(feedId: BroadcastFeedId): FeedDescriptor | null {
  return FEED_REGISTRY.get(feedId) ?? null;
}

export function upsertFeed(feed: FeedDescriptor): FeedDescriptor {
  const next: FeedDescriptor = {
    ...feed,
    lastUpdatedMs: Date.now(),
  };
  FEED_REGISTRY.set(feed.id, next);
  return next;
}

export function getFeedRegistrySummary(): {
  totalFeeds: number;
  ready: number;
  live: number;
  queued: number;
  error: number;
  updatedAtMs: number;
} {
  const feeds = listFeeds();
  return {
    totalFeeds: feeds.length,
    ready: feeds.filter((feed) => feed.status === 'ready').length,
    live: feeds.filter((feed) => feed.status === 'live').length,
    queued: feeds.filter((feed) => feed.status === 'queued').length,
    error: feeds.filter((feed) => feed.status === 'error').length,
    updatedAtMs: Date.now(),
  };
}

export function resolveFeedAssignment(feedId: BroadcastFeedId): BroadcastFeedAssignment | null {
  const feed = getFeed(feedId);
  if (!feed) return null;
  return {
    feedType: feed.type,
    sourceId: feed.sourceId,
    label: feed.label,
    payload: feed.metadata,
  };
}