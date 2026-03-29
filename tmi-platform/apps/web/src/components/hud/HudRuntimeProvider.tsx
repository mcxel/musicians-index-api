"use client";

import React, { createContext, useContext } from "react";
import { useAudio } from "@/components/AudioProvider";

type HudRuntimeContextValue = {
  trackTitle: string | null;
  trackArtist: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  sourceUrl: string | null;
  canPlayPause: boolean;
  play: () => void;
  pause: () => void;
};

const HudRuntimeContext = createContext<HudRuntimeContextValue | undefined>(undefined);

export function useHudRuntime() {
  const context = useContext(HudRuntimeContext);
  if (!context) throw new Error("useHudRuntime must be used within HudRuntimeProvider");
  return context;
}

export default function HudRuntimeProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { currentTrack, isPlaying, currentTime, duration, play, pause } = useAudio();

  const value: HudRuntimeContextValue = {
    trackTitle: currentTrack?.title ?? null,
    trackArtist: currentTrack?.artist ?? null,
    isPlaying,
    currentTime,
    duration,
    sourceUrl: currentTrack?.url ?? null,
    canPlayPause: !!currentTrack,
    play: () => play(),
    pause,
  };

  return <HudRuntimeContext.Provider value={value}>{children}</HudRuntimeContext.Provider>;
}
