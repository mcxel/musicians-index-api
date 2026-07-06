import { ExperienceOrchestrator } from '@/lib/experience/ExperienceOrchestrator';
import { requestDirectorMode } from '@/lib/broadcast/BroadcastDirectorEngine';
import { getFeed, upsertFeed, type BroadcastFeedId } from '@/lib/broadcast/FeedRegistry';
import { focusScene, getScene, setSceneOccupants } from '@/lib/broadcast/SceneRegistry';

let initialized = false;

function markFeedStatus(feedId: BroadcastFeedId, status: 'ready' | 'live' | 'queued' | 'error', metadata?: Record<string, unknown>): void {
  const existing = getFeed(feedId);
  if (!existing) return;
  upsertFeed({
    ...existing,
    status,
    metadata: {
      ...(existing.metadata ?? {}),
      ...(metadata ?? {}),
    },
  });
}

export function initializeExperienceBroadcastBridge(): void {
  if (initialized) return;
  initialized = true;

  ExperienceOrchestrator.on('GO_LIVE', (payload) => {
    requestDirectorMode({ mode: 'CONCERT', reason: 'GO_LIVE' });
    markFeedStatus('LIVE_ABC', 'live', { roomId: payload.roomId, performerName: payload.performerName, genre: payload.genre });
    markFeedStatus('STAGE_MAIN', 'live', { roomId: payload.roomId });
    markFeedStatus('BACKSTAGE_MAIN', 'ready', { roomId: payload.roomId });
    focusScene('MAIN_STAGE');
    setSceneOccupants('MAIN_STAGE', 1);
  });

  ExperienceOrchestrator.on('BATTLE_STARTED', (payload) => {
    requestDirectorMode({ mode: 'BATTLE', reason: 'BATTLE_STARTED' });
    markFeedStatus('BATTLE_A', 'live', { roomId: payload.roomId, competitor: payload.competitors[0] ?? null });
    markFeedStatus('BATTLE_B', 'live', { roomId: payload.roomId, competitor: payload.competitors[1] ?? null });
    markFeedStatus('BRACKET_MAIN', 'live', { roomId: payload.roomId });
    focusScene('MAIN_STAGE');
    setSceneOccupants('MAIN_STAGE', Math.max(2, payload.competitors.length));
  });

  ExperienceOrchestrator.on('SHOW_IMMINENT', (payload) => {
    markFeedStatus('LIVE_ABC', 'queued', { roomId: payload.roomId, secondsUntilStart: payload.secondsUntilStart });
    focusScene('LOBBY');
  });

  ExperienceOrchestrator.on('AUDIENCE_ARRIVED', (payload) => {
    const current = getScene('AUDIENCE')?.occupants ?? 0;
    setSceneOccupants('AUDIENCE', current + 1);
    focusScene('AUDIENCE');
    markFeedStatus('LIVE_ABC', 'live', { roomId: payload.roomId, lastAudienceUserId: payload.userId, lastAudienceDisplayName: payload.displayName });
  });

  ExperienceOrchestrator.on('MAGAZINE_OPENED', (payload) => {
    requestDirectorMode({ mode: 'MAGAZINE', reason: 'MAGAZINE_OPENED' });
    markFeedStatus('MAGAZINE_84', 'live', { articleId: payload.articleId, title: payload.title, source: payload.source });
    markFeedStatus('FEATURE_ARTICLE', 'live', { articleId: payload.articleId, title: payload.title });
    focusScene('VIP');
  });

  ExperienceOrchestrator.on('CYPHER_START', (payload) => {
    requestDirectorMode({ mode: 'CYPHER', reason: 'CYPHER_START' });
    markFeedStatus('CYPHER_MAIN', 'live', { roomId: payload.roomId });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('CHALLENGE_START', (payload) => {
    requestDirectorMode({ mode: 'CHALLENGE', reason: 'CHALLENGE_START' });
    markFeedStatus('CHALLENGE_MAIN', 'live', { roomId: payload.roomId });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('WORLD_CONCERT_STARTED', (payload) => {
    requestDirectorMode({ mode: 'CONCERT', reason: 'WORLD_CONCERT_STARTED' });
    markFeedStatus('LIVE_ABC', 'live', { roomId: payload.roomId, title: payload.title, headlinerId: payload.headlinerId });
    markFeedStatus('STAGE_MAIN', 'live', { roomId: payload.roomId });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('RELEASE_ANNOUNCEMENT', (payload) => {
    requestDirectorMode({ mode: 'RELEASE', reason: 'RELEASE_ANNOUNCEMENT' });
    markFeedStatus('RELEASE_ANNOUNCEMENT_MAIN', 'live', {
      roomId: payload.roomId,
      itemId: payload.itemId,
      itemKind: payload.itemKind,
      title: payload.title,
    });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('SPONSOR_SPOTLIGHT', (payload) => {
    requestDirectorMode({ mode: 'SPONSOR_REVIEW', reason: 'SPONSOR_SPOTLIGHT' });
    markFeedStatus('SPONSOR_SPOTLIGHT_MAIN', 'live', {
      roomId: payload.roomId,
      sponsorId: payload.sponsorId,
      sponsorName: payload.sponsorName,
    });
    markFeedStatus('SPONSOR_NIKE', 'live', {
      roomId: payload.roomId,
      sponsorId: payload.sponsorId,
      sponsorName: payload.sponsorName,
    });
    focusScene('VIP');
  });

  ExperienceOrchestrator.on('PLAYLIST_STARTED', (payload) => {
    requestDirectorMode({ mode: 'CREATOR_STUDIO', reason: 'PLAYLIST_STARTED' });
    markFeedStatus('PLAYLIST_MAIN', 'live', {
      roomId: payload.roomId,
      playlistId: payload.playlistId,
      title: payload.title,
    });
    focusScene('DJ_BOOTH');
  });

  ExperienceOrchestrator.on('MEMORY_WALL_OPENED', (payload) => {
    requestDirectorMode({ mode: 'MAGAZINE', reason: 'MEMORY_WALL_OPENED' });
    markFeedStatus('MEMORY_WALL_MAIN', 'live', {
      roomId: payload.roomId,
      ownerId: payload.ownerId,
      source: payload.source,
    });
    focusScene('GREEN_ROOM');
  });

  ExperienceOrchestrator.on('WORLD_RELEASE', (payload) => {
    requestDirectorMode({ mode: 'RELEASE', reason: 'WORLD_RELEASE' });
    markFeedStatus('RELEASE_ANNOUNCEMENT_MAIN', 'live', {
      roomId: payload.roomId,
      releaseId: payload.releaseId,
      itemKind: payload.itemKind,
      title: payload.title,
    });
    markFeedStatus('PLAYLIST_MAIN', 'queued', { roomId: payload.roomId, releaseId: payload.releaseId });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('WORLD_DANCE_PARTY_STARTED', (payload) => {
    requestDirectorMode({ mode: 'CONCERT', reason: 'WORLD_DANCE_PARTY_STARTED' });
    markFeedStatus('LIVE_ABC', 'live', { roomId: payload.roomId, djId: payload.djId, bpm: payload.bpm });
    markFeedStatus('DRONE_A', 'live', { roomId: payload.roomId, mode: 'world-dance-party' });
    focusScene('DJ_BOOTH');
  });

  ExperienceOrchestrator.on('DIRTY_DOZENS_STARTED', (payload) => {
    requestDirectorMode({ mode: 'BATTLE', reason: 'DIRTY_DOZENS_STARTED' });
    markFeedStatus('BATTLE_A', 'live', { roomId: payload.roomId, competitor: payload.competitors[0] ?? null, format: 'dirty-dozens' });
    markFeedStatus('BATTLE_B', 'live', { roomId: payload.roomId, competitor: payload.competitors[1] ?? null, format: 'dirty-dozens' });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('GAME_SHOW_STARTED', (payload) => {
    requestDirectorMode({ mode: 'GAME_SHOW', reason: 'GAME_SHOW_STARTED' });
    markFeedStatus('GAME_SHOW_MAIN', 'live', { roomId: payload.roomId, showId: payload.showId, title: payload.title });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('SPONSOR_REVEAL', (payload) => {
    requestDirectorMode({ mode: 'SPONSOR_REVIEW', reason: 'SPONSOR_REVEAL' });
    markFeedStatus('SPONSOR_SPOTLIGHT_MAIN', 'live', {
      sponsorId: payload.sponsorId,
      sponsorName: payload.sponsorName,
    });
    focusScene('VIP');
  });

  ExperienceOrchestrator.on('PLAYLIST_CHANGED', (payload) => {
    markFeedStatus('PLAYLIST_MAIN', 'live', {
      playlistId: payload.playlistId,
      trackId: payload.trackId,
    });
  });

  ExperienceOrchestrator.on('ADVERTISEMENT_BEGIN', (payload) => {
    requestDirectorMode({ mode: 'SPONSOR_REVIEW', reason: 'ADVERTISEMENT_BEGIN' });
    markFeedStatus('ADVERTISEMENT_MAIN', 'live', {
      adId: payload.adId,
      durationMs: payload.durationMs,
    });
    focusScene('VIP');
  });

  ExperienceOrchestrator.on('ADVERTISEMENT_END', (payload) => {
    markFeedStatus('ADVERTISEMENT_MAIN', 'ready', { adId: payload.adId });
  });

  ExperienceOrchestrator.on('WORLD_PREMIERE', (payload) => {
    requestDirectorMode({ mode: 'RELEASE', reason: 'WORLD_PREMIERE' });
    markFeedStatus('RELEASE_ANNOUNCEMENT_MAIN', 'live', {
      songId: payload.songId,
      performerId: payload.performerId,
      itemKind: 'premiere',
    });
    focusScene('MAIN_STAGE');
  });

  ExperienceOrchestrator.on('SHOW_ENDED', (payload) => {
    requestDirectorMode({ mode: 'MISSION_CONTROL', reason: 'SHOW_ENDED' });
    markFeedStatus('LIVE_ABC', 'ready', { roomId: payload.roomId, duration: payload.duration, endedAt: new Date().toISOString() });
    markFeedStatus('BATTLE_A', 'ready', { roomId: payload.roomId });
    markFeedStatus('BATTLE_B', 'ready', { roomId: payload.roomId });
    markFeedStatus('CYPHER_MAIN', 'ready', { roomId: payload.roomId });
    markFeedStatus('CHALLENGE_MAIN', 'ready', { roomId: payload.roomId });
    markFeedStatus('GAME_SHOW_MAIN', 'ready', { roomId: payload.roomId });
    markFeedStatus('RELEASE_ANNOUNCEMENT_MAIN', 'ready', { roomId: payload.roomId });
    markFeedStatus('SPONSOR_SPOTLIGHT_MAIN', 'ready', { roomId: payload.roomId });
    markFeedStatus('ADVERTISEMENT_MAIN', 'ready', { roomId: payload.roomId });
    focusScene('LOBBY');
    setSceneOccupants('MAIN_STAGE', 0);
  });
}
