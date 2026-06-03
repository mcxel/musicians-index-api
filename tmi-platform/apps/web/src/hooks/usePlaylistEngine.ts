'use client';

import { useMemo, useState } from 'react';
import {
  PlaylistEngine,
  type PlaylistContextBinding,
  type PlaylistEngineContract,
  type PlaylistTrack,
  type ViewState,
} from '@/engines/PlaylistEngine';

/**
 * usePlaylistEngine
 * Contract-first bridge hook for Engine #1 migration.
 * Maintains local reactivity while delegating canonical state writes to PlaylistEngine singleton.
 */
export function usePlaylistEngine(): PlaylistEngineContract & {
  hydrateQueue: (tracks: PlaylistTrack[]) => void;
} {
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const api = useMemo(
    () => ({
      get state() {
        return PlaylistEngine.state;
      },
      play() {
        PlaylistEngine.play();
        bump();
      },
      pause() {
        PlaylistEngine.pause();
        bump();
      },
      next() {
        PlaylistEngine.next();
        bump();
      },
      previous() {
        PlaylistEngine.previous();
        bump();
      },
      setQueue(queue: PlaylistTrack[]) {
        PlaylistEngine.setQueue(queue);
        bump();
      },
      setVolume(volume: number) {
        PlaylistEngine.setVolume(volume);
        bump();
      },
      attachToRuntime(binding: PlaylistContextBinding) {
        PlaylistEngine.attachToRuntime(binding);
        bump();
      },
      preserveAcrossViewState(state: ViewState) {
        PlaylistEngine.preserveAcrossViewState(state);
        bump();
      },
      setVisibility(visibility: 'private' | 'friends' | 'followers' | 'public' | 'featured') {
        PlaylistEngine.setVisibility(visibility);
        bump();
      },
      attachSharedPlaybackSession(sessionId: string, hostUserId?: string) {
        PlaylistEngine.attachSharedPlaybackSession(sessionId, hostUserId);
        bump();
      },
      hydrateQueue(tracks: PlaylistTrack[]) {
        PlaylistEngine.setQueue(tracks);
        bump();
      },
    }),
    []
  );

  return api;
}
