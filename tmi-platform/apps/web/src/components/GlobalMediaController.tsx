'use client';

import React, { useEffect, useState } from 'react';
import { MediaItem } from '@/lib/media/MediaRegistry';

/**
 * Global Media Controller
 *
 * Persistent playback control visible across the entire platform.
 * Supports:
 * - Personal playlists
 * - Live broadcast queues
 * - Stream & Win Radio
 * - Event queues
 * - Group listening sessions
 *
 * Placed in root layout. Uses global state from Zustand/Jotai.
 *
 * @see CLAUDE.md Rule 15 (Canister Integration), Rule 2 (Media Priority Chain)
 */

interface PlaybackState {
  currentItem: MediaItem | null;
  queue: MediaItem[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number; // milliseconds
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  source: 'personal' | 'radio' | 'live' | 'event' | 'group';
}

interface GlobalMediaControllerProps {
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function GlobalMediaController(props: GlobalMediaControllerProps) {
  const [playback, setPlayback] = useState<PlaybackState>({
    currentItem: null,
    queue: [],
    isPlaying: false,
    isMuted: false,
    volume: 0.8,
    progress: 0,
    shuffle: false,
    repeat: 'off',
    source: 'personal',
  });

  // TODO: Wire to actual global state store (Zustand/Jotai)
  // import { useGlobalMediaStore } from '@/stores/globalMediaStore';
  // const { playback, setPlayback } = useGlobalMediaStore();

  const handlePlayPause = () => {
    setPlayback((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    if (!playback.isPlaying) {
      props.onPlay?.();
    } else {
      props.onPause?.();
    }
  };

  const handleNext = () => {
    props.onNext?.();
  };

  const handlePrev = () => {
    props.onPrev?.();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setPlayback((prev) => ({ ...prev, volume: newVolume }));
    props.onVolumeChange?.(newVolume);
  };

  const handleMute = () => {
    setPlayback((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleRepeat = () => {
    const repeatStates: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = repeatStates.indexOf(playback.repeat);
    const nextRepeat = repeatStates[(currentIndex + 1) % repeatStates.length];
    setPlayback((prev) => ({ ...prev, repeat: nextRepeat }));
  };

  const handleShuffle = () => {
    setPlayback((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = playback.currentItem?.durationMs
    ? (playback.progress / playback.currentItem.durationMs) * 100
    : 0;

  // Don't render if no current item
  if (!playback.currentItem) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(180deg, rgba(10, 6, 20, 0.95) 0%, rgba(5, 5, 10, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 255, 255, 0.1)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
        gap: '16px',
      }}
    >
      {/* Album Art */}
      <div
        style={{
          flexShrink: 0,
          width: '56px',
          height: '56px',
          borderRadius: '4px',
          overflow: 'hidden',
          background: '#1a1a2e',
          border: '1px solid rgba(0, 255, 255, 0.2)',
        }}
      >
        {playback.currentItem.thumbnailUrl ? (
          <img
            src={playback.currentItem.thumbnailUrl}
            alt={playback.currentItem.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '24px', color: '#00ffff' }}>♪</span>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {playback.currentItem.title}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#aaaaaa',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {playback.currentItem.type}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          flex: 0.8,
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '11px', color: '#aaaaaa', minWidth: '28px' }}>
          {formatTime(playback.progress)}
        </span>
        <div
          style={{
            flex: 1,
            height: '4px',
            background: 'rgba(0, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
              width: `${progressPercent}%`,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <span style={{ fontSize: '11px', color: '#aaaaaa', minWidth: '28px', textAlign: 'right' }}>
          {formatTime(playback.currentItem.durationMs || 0)}
        </span>
      </div>

      {/* Primary Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ControlButton title="Previous" onClick={handlePrev}>
          ⏮
        </ControlButton>
        <ControlButton
          title={playback.isPlaying ? 'Pause' : 'Play'}
          onClick={handlePlayPause}
          style={{ background: '#00ffff', color: '#000000', width: '40px', height: '40px', fontSize: '20px' }}
        >
          {playback.isPlaying ? '⏸' : '▶'}
        </ControlButton>
        <ControlButton title="Next" onClick={handleNext}>
          ⏭
        </ControlButton>
      </div>

      {/* Secondary Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ControlButton
          title={playback.shuffle ? 'Shuffle On' : 'Shuffle Off'}
          onClick={handleShuffle}
          style={{ opacity: playback.shuffle ? 1 : 0.5 }}
        >
          🔀
        </ControlButton>
        <ControlButton
          title={playback.repeat === 'off' ? 'Repeat Off' : playback.repeat === 'one' ? 'Repeat One' : 'Repeat All'}
          onClick={handleRepeat}
          style={{
            opacity: playback.repeat === 'off' ? 0.5 : 1,
            color: playback.repeat !== 'off' ? '#00ffff' : '#ffffff',
          }}
        >
          🔁
        </ControlButton>
        <ControlButton title={playback.isMuted ? 'Unmute' : 'Mute'} onClick={handleMute}>
          {playback.isMuted ? '🔇' : '🔊'}
        </ControlButton>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={playback.volume}
          onChange={handleVolumeChange}
          style={{
            flex: 1,
            cursor: 'pointer',
            accentColor: '#00ffff',
          }}
        />
        <span style={{ fontSize: '11px', color: '#aaaaaa', minWidth: '24px' }}>{Math.round(playback.volume * 100)}%</span>
      </div>

      {/* Source Indicator */}
      <div
        style={{
          fontSize: '10px',
          padding: '4px 8px',
          background: 'rgba(0, 255, 255, 0.1)',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          borderRadius: '4px',
          color: '#00ffff',
          textTransform: 'uppercase',
        }}
      >
        {playback.source}
      </div>
    </div>
  );
}

function ControlButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
) {
  const { children, style, ...rest } = props;
  return (
    <button
      {...rest}
      style={{
        background: 'transparent',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        color: '#ffffff',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
        e.currentTarget.style.borderColor = '#00ffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      }}
    >
      {children}
    </button>
  );
}
