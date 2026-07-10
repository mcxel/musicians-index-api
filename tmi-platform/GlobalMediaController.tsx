"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useGlobalMediaStore } from "./apps/web/src/stores/globalMediaStore";
import { shallow } from "zustand/shallow";
import { SeekBar } from "./SeekBar";

/**
 * A global component that shows and controls the currently playing media item.
 * It would be placed in the root layout of the application.
 * It handles all media types (audio, video, podcasts, replays) and persists
 * playback state as the user navigates the site.
 *
 * Renamed from NowPlayingBar. @see User request on 2026-06-26.
 */
export function GlobalMediaController() {
  const [isQueueVisible, setQueueVisible] = React.useState(false);
  const state = useGlobalMediaStore(
    (state) => ({
      currentItem: state.currentItem,
      isPlaying: state.isPlaying,
      progress: state.progress,
      duration: state.duration,
      volume: state.volume,
      muted: state.muted,
      repeatMode: state.repeatMode,
      isShuffling: state.isShuffling,
      actions: {
        togglePlay: state.togglePlay,
        playNext: state.playNext,
        playPrev: state.playPrev,
        updateProgress: state.updateProgress,
        seek: state.seek,
        setVolume: state.setVolume,
        toggleMute: state.toggleMute,
        setRepeatMode: state.setRepeatMode,
        toggleShuffle: state.toggleShuffle,
      },
    }),
    shallow
  );

  const { currentItem, isPlaying, progress, duration, volume, muted, repeatMode, isShuffling, actions } = state;

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mediaEl = audioRef.current || videoRef.current;
    if (!mediaEl) return;

    if (isPlaying) {
      mediaEl.play().catch(e => console.error("Media play failed:", e));
    } else {
      mediaEl.pause();
    }

    mediaEl.volume = muted ? 0 : volume;

  }, [isPlaying, currentItem, volume, muted, audioRef, videoRef]);

  useEffect(() => {
    const mediaEl = audioRef.current || videoRef.current;
    if (mediaEl && Math.abs(mediaEl.currentTime * 1000 - progress) > 1000) {
      mediaEl.currentTime = progress / 1000;
    }
  }, [progress]);

  const handleTimeUpdate = () => {
    const mediaEl = audioRef.current || videoRef.current;
    if (mediaEl) {
      actions.updateProgress(mediaEl.currentTime * 1000);
    }
  };

  const handleMediaEnded = useCallback(() => {
    actions.playNext();
  }, [actions]);

  if (!currentItem) {
    return null;
  }

  const isVideo = currentItem.type === "video";

  return (
    <div
      aria-label="Global Media Controller"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "72px",
        background: "rgba(10, 6, 20, 0.85)", // Dark purple from Rule 7
        backdropFilter: "blur(10px)",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        zIndex: 1000,
        borderTop: "1px solid #333",
        fontFamily: "sans-serif",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {/* Hidden Media Elements for Playback */}
      {currentItem.type === "audio" && (
        <audio
          ref={audioRef}
          src={currentItem.sourceUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleMediaEnded}
        />
      )}
      {currentItem.type === "video" && (
        <video
          ref={videoRef}
          src={currentItem.sourceUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleMediaEnded}
          style={{ display: "none" }}
        />
      )}
      {/* Album Art & Track Info */}
      <div style={{ display: "flex", alignItems: "center", minWidth: "200px" }}>
        {currentItem.thumbnailUrl && <img
          src={currentItem.thumbnailUrl}
          alt={currentItem.title}
          width={48}
          height={48}
          style={{ borderRadius: "4px" }}
        />}
        <div style={{ marginLeft: "12px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
            {currentItem.title}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#aaa" }}>
            {currentItem.artist}
          </p>
        </div>
      </div>

      {/* Playback Controls & Progress */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 24px",
        }}
      >
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button title="Shuffle" onClick={actions.toggleShuffle} style={{...controlButtonStyle, color: isShuffling ? '#00FFFF' : 'white'}}>
            {"🔀"}
          </button>
          <button title="Previous" onClick={actions.playPrev} style={controlButtonStyle}>{"⏮"}</button>
          <button title={isPlaying ? "Pause" : "Play"} onClick={actions.togglePlay} style={{...controlButtonStyle, width: '40px', height: '40px', fontSize: '24px', background: '#00FFFF', color: '#000'}}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button title="Next" onClick={actions.playNext} style={controlButtonStyle}>{"⏭"}</button>
          <button
            title="Repeat"
            onClick={() => actions.setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
            style={{...controlButtonStyle, color: repeatMode !== 'none' ? '#00FFFF' : 'white'}}
          >
            {repeatMode === 'one' ? '🔂' : '🔁'}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "500px", gap: "8px", marginTop: "4px" }}>
            <span style={{fontSize: '11px', color: '#888'}}>{formatTime(progress)}</span>
            <SeekBar progress={progress} duration={duration} onSeek={actions.seek} />
            <span style={{fontSize: '11px', color: '#888'}}>{formatTime(duration || 0)}</span>
        </div>
      </div>

      {/* Volume & Other Controls (Placeholder) */}
      <div style={{ display: "flex", alignItems: "center", minWidth: "200px", justifyContent: "flex-end" }}>
        <button onClick={() => setQueueVisible(q => !q)} style={{...controlButtonStyle, color: isQueueVisible ? '#00FFFF' : 'white'}}>
            {"☰"}
        </button>
        <button onClick={actions.toggleMute} style={controlButtonStyle}>
          {muted || volume === 0 ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => actions.setVolume(parseFloat(e.target.value))}
          style={{ width: '80px', cursor: 'pointer' }}
        />
      </div>
      {/* Queue panel — canonical at apps/web/src/components/media/MediaQueue.tsx */}
    </div>
  );
}

const controlButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid transparent',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    transition: 'background-color 0.2s',
};

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}