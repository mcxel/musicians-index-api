"use client";

import { useCallback, useMemo, useState } from "react";

interface VideoControlEngineOptions {
  initialMuted?: boolean;
  initialVolume?: number;
}

export interface VideoControlEngineState {
  muted: boolean;
  playing: boolean;
  fullscreen: boolean;
  volume: number;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (next: number) => void;
  openFullscreen: () => void;
  closeFullscreen: () => void;
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function useVideoControlEngine(options?: VideoControlEngineOptions): VideoControlEngineState {
  const [muted, setMuted] = useState(Boolean(options?.initialMuted));
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [volume, setVolumeState] = useState(clampVolume(options?.initialVolume ?? 1));

  const togglePlay = useCallback(() => setPlaying((prev) => !prev), []);
  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);
  const setVolume = useCallback((next: number) => setVolumeState(clampVolume(next)), []);
  const openFullscreen = useCallback(() => setFullscreen(true), []);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  return useMemo(() => ({
    muted,
    playing,
    fullscreen,
    volume,
    togglePlay,
    toggleMute,
    setVolume,
    openFullscreen,
    closeFullscreen,
  }), [closeFullscreen, fullscreen, muted, openFullscreen, playing, setVolume, toggleMute, togglePlay, volume]);
}
