"use client";

import React from "react";
import { useHudRuntime } from "@/components/hud/HudRuntimeProvider";

function formatDuration(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return "00:00";
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const secs = (total % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

const TmiHud = () => {
  const {
    trackTitle,
    trackArtist,
    isPlaying,
    currentTime,
    duration,
    sourceUrl,
    canPlayPause,
    play,
    pause,
  } = useHudRuntime();

  const hasTrack = !!trackTitle;
  let runtimeStatus = "IDLE";
  if (hasTrack) {
    runtimeStatus = "PAUSED";
    if (isPlaying) {
      runtimeStatus = "PLAYING";
    }
  }

  return (
    <div className="p-3">
      <h2 className="m-0 font-bold">TMI HUD</h2>
      <p className="mt-2 mb-2">Global audio runtime: {runtimeStatus}</p>

      <div className="mb-2 text-[13px] opacity-90">
        <div>
          Track: <strong>{trackTitle ?? "—"}</strong>
        </div>
        <div>Artist: {trackArtist ?? "—"}</div>
        <div>
          Progress: {formatDuration(currentTime)} / {formatDuration(duration)}
        </div>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          Source: {sourceUrl ?? "—"}
        </div>
      </div>

      <button
        type="button"
        onClick={isPlaying ? pause : play}
        disabled={!canPlayPause}
        className="rounded border border-white/20 bg-white/10 px-2.5 py-1.5 text-white disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={isPlaying ? "Pause global audio" : "Play global audio"}
        title={isPlaying ? "Pause global audio" : "Play global audio"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};

export default TmiHud;
