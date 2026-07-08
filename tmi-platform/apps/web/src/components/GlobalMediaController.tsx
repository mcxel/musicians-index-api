'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGlobalMediaStore } from '@/stores/globalMediaStore';
import AmbientVisualizerBackground from '@/components/audio/AmbientVisualizerBackground';

const AMBIENT_KEY = 'tmi_ambient_enabled';

export function GlobalMediaController() {
  const {
    currentItem,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    repeatMode,
    isShuffling,
    togglePlay,
    playNext,
    playPrev,
    play,
    seek,
    updateProgress,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
  } = useGlobalMediaStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(AMBIENT_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Sync play/pause/volume to actual media element
  useEffect(() => {
    const el = currentItem?.type === 'video' ? videoRef.current : audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => {/* autoplay blocked */});
    } else {
      el.pause();
    }
    el.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
  }, [isPlaying, currentItem, volume, muted]);

  // Wire OS/browser Media Session API for lock-screen controls and background continuity
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!currentItem) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title:  currentItem.title  ?? 'Now Playing',
      artist: currentItem.artist ?? 'TMI',
      album:  'TMI Platform',
      artwork: currentItem.thumbnailUrl
        ? [{ src: currentItem.thumbnailUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play',          () => togglePlay());
    navigator.mediaSession.setActionHandler('pause',         () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('nexttrack',     () => playNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seek(details.seekTime * 1000);
    });

    return () => {
      ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto'].forEach((action) => {
        try { navigator.mediaSession.setActionHandler(action as MediaSessionAction, null); } catch { /* unsupported */ }
      });
    };
  }, [currentItem, isPlaying, togglePlay, playPrev, playNext, seek]);

  const handleTimeUpdate = () => {
    const el = audioRef.current || videoRef.current;
    if (el) updateProgress(el.currentTime * 1000);
  };

  const handleEnded = () => playNext();

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct * duration);
  };

  const toggleAmbient = () => {
    const next = !ambientEnabled;
    setAmbientEnabled(next);
    localStorage.setItem(AMBIENT_KEY, String(next));
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const cycleRepeat = () => {
    const next = repeatMode === 'none' ? 'one' : repeatMode === 'one' ? 'all' : 'none';
    setRepeatMode(next);
  };

  if (!currentItem) return null;

  const currentIdx = queue.findIndex((q) => q.id === currentItem.id);
  const upNext = queue.slice(currentIdx + 1, currentIdx + 6);

  const BAR_HEIGHT = 80;
  const DRAWER_HEIGHT = 380;

  return (
    <>
      {/* ── Expandable Ambient Drawer ──────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: BAR_HEIGHT,
          left: 0,
          right: 0,
          height: drawerOpen ? DRAWER_HEIGHT : 0,
          overflow: 'hidden',
          transition: 'height 0.38s cubic-bezier(0.22,1,0.36,1)',
          zIndex: 999,
          background: 'rgba(5, 5, 16, 0.97)',
          backdropFilter: 'blur(24px)',
          borderTop: drawerOpen ? '1px solid rgba(0,255,255,0.12)' : 'none',
        }}
      >
        {/* Ambient background layer */}
        {drawerOpen && (
          <AmbientVisualizerBackground
            isPlaying={isPlaying}
            accentColor="#00ffff"
            visible={ambientEnabled}
          />
        )}

        {/* Drawer content — above ambient (z-index: 1) */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            gap: 0,
          }}
        >
          {/* ── Left: Spinning album art + track info ─────────────────── */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px',
              gap: 14,
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Spinning album art */}
            <style>{`
              @keyframes tmi-spin-art {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ position: 'relative' }}>
              {/* Outer glow ring */}
              <div style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: '1px solid rgba(0,255,255,0.2)',
                boxShadow: '0 0 20px rgba(0,255,255,0.15)',
                pointerEvents: 'none',
              }} />
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#1a1a2e',
                  border: '2px solid rgba(0,255,255,0.3)',
                  boxShadow: '0 0 24px rgba(0,255,255,0.2), inset 0 0 12px rgba(0,0,0,0.6)',
                  animation: isPlaying ? 'tmi-spin-art 8s linear infinite' : 'none',
                  transition: 'animation-play-state 0.3s',
                }}
              >
                {currentItem.thumbnailUrl ? (
                  <img
                    src={currentItem.thumbnailUrl}
                    alt={currentItem.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a0614, #1a0a2e)',
                  }}>
                    <span style={{ fontSize: 32, filter: 'drop-shadow(0 0 10px #00ffff)' }}>♪</span>
                  </div>
                )}
              </div>
              {/* Center hole (vinyl look) */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 10, height: 10,
                borderRadius: '50%',
                background: 'rgba(5,5,16,0.9)',
                border: '1px solid rgba(0,255,255,0.3)',
                pointerEvents: 'none',
              }} />
            </div>
            {/* Track info */}
            <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '0 0 10px rgba(0,255,255,0.3)',
              }}>
                {currentItem.title}
              </div>
              {'artist' in currentItem && currentItem.artist && (
                <div style={{
                  fontSize: 11,
                  color: 'rgba(0,255,255,0.7)',
                  marginTop: 3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {String(currentItem.artist)}
                </div>
              )}
              <div style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.25)',
                marginTop: 8,
                letterSpacing: '0.18em',
                fontWeight: 700,
              }}>
                NOW PLAYING
              </div>
            </div>
          </div>

          {/* ── Center: Queue ─────────────────────────────────────────── */}
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', minWidth: 0 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: '0.25em',
                color: 'rgba(255,255,255,0.35)',
                fontWeight: 700,
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              Up Next
            </div>
            {upNext.length === 0 ? (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', padding: '8px 0' }}>
                Queue is empty
              </div>
            ) : (
              upNext.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => play(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,255,255,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  {/* Index */}
                  <span
                    style={{
                      width: 16,
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.25)',
                      flexShrink: 0,
                      textAlign: 'right',
                    }}
                  >
                    {currentIdx + 2 + i}
                  </span>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 4,
                      overflow: 'hidden',
                      background: '#1a1a2e',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                        }}
                      >
                        ♪
                      </div>
                    )}
                  </div>
                  {/* Title + artist */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </div>
                    {'artist' in item && item.artist && (
                      <div
                        style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.4)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {String(item.artist)}
                      </div>
                    )}
                  </div>
                  {/* Duration */}
                  {item.durationMs && (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                      {fmt(item.durationMs)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ── Right: Ambient toggle + stats ─────────────────────────── */}
          <div
            style={{
              width: 160,
              flexShrink: 0,
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Ambient toggle */}
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.25em',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 700,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                Visual Mode
              </div>
              <button
                onClick={toggleAmbient}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 20,
                  border: `1px solid ${ambientEnabled ? 'rgba(0,255,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  background: ambientEnabled
                    ? 'linear-gradient(90deg, rgba(0,255,255,0.12), rgba(170,45,255,0.12))'
                    : 'rgba(255,255,255,0.04)',
                  color: ambientEnabled ? '#00ffff' : 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%',
                  boxShadow: ambientEnabled ? '0 0 10px rgba(0,255,255,0.15)' : 'none',
                }}
              >
                <span style={{ fontSize: 14 }}>{ambientEnabled ? '✦' : '○'}</span>
                {ambientEnabled ? 'Ambient On' : 'Ambient Off'}
              </button>
            </div>

            {/* Queue count */}
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.25em',
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 700,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Queue
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                {queue.length}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                {queue.length === 1 ? 'track' : 'tracks'}
              </div>
            </div>

            {/* Shuffle / Repeat quick toggles */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={toggleShuffle}
                title={isShuffling ? 'Shuffle on' : 'Shuffle off'}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 8,
                  border: `1px solid ${isShuffling ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: isShuffling ? 'rgba(0,255,255,0.1)' : 'transparent',
                  color: isShuffling ? '#00ffff' : 'rgba(255,255,255,0.35)',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔀
              </button>
              <button
                onClick={cycleRepeat}
                title={repeatMode}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 8,
                  border: `1px solid ${repeatMode !== 'none' ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  background: repeatMode !== 'none' ? 'rgba(0,255,255,0.1)' : 'transparent',
                  color: repeatMode !== 'none' ? '#00ffff' : 'rgba(255,255,255,0.35)',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {repeatMode === 'one' ? '🔂' : '🔁'}
              </button>
            </div>

            {/* Quick links */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link
                href="/profile/playlist"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 8,
                  border: '1px solid rgba(0,255,255,0.15)',
                  background: 'rgba(0,255,255,0.05)',
                  color: 'rgba(0,255,255,0.75)',
                  fontSize: 11, fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 13 }}>♪</span> Full Playlist
              </Link>
              <Link
                href="/profile/memory-wall"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 8,
                  border: '1px solid rgba(170,45,255,0.2)',
                  background: 'rgba(170,45,255,0.06)',
                  color: 'rgba(170,45,255,0.8)',
                  fontSize: 11, fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 13 }}>📸</span> Memory Wall
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Persistent Bottom Bar ─────────────────────────────────────────── */}
      <div
        aria-label="Global Media Controller"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: BAR_HEIGHT,
          background: 'linear-gradient(180deg, rgba(10,6,20,0.96) 0%, rgba(5,5,10,0.99) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${drawerOpen ? 'rgba(0,255,255,0.25)' : 'rgba(0,255,255,0.1)'}`,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          zIndex: 1000,
          boxShadow: drawerOpen
            ? '0 -4px 20px rgba(0,255,255,0.12), 0 -2px 6px rgba(0,0,0,0.4)'
            : '0 -4px 12px rgba(0,0,0,0.3)',
          gap: '14px',
          transition: 'border-top-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Hidden media elements */}
        {currentItem.type !== 'video' && (
          <audio
            ref={audioRef}
            src={currentItem.sourceUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            preload="metadata"
          />
        )}
        {currentItem.type === 'video' && (
          <video
            ref={videoRef}
            src={currentItem.sourceUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            style={{ display: 'none' }}
            preload="metadata"
          />
        )}

        {/* Expand chevron — centered at top of bar */}
        <button
          onClick={() => setDrawerOpen((o) => !o)}
          title={drawerOpen ? 'Close queue' : 'Open queue & visuals'}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: `translateX(-50%) translateY(-1px)`,
            width: 44,
            height: 16,
            background: 'rgba(5,5,16,0.9)',
            border: '1px solid rgba(0,255,255,0.2)',
            borderBottom: 'none',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,255,255,0.6)',
            fontSize: 9,
            transition: 'all 0.2s',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#00ffff';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,255,255,0.6)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,255,255,0.2)';
          }}
        >
          <span
            style={{
              display: 'block',
              transform: drawerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.35s ease',
              lineHeight: 1,
            }}
          >
            ▲
          </span>
        </button>

        {/* Album Art */}
        <div
          onClick={() => setDrawerOpen((o) => !o)}
          style={{
            flexShrink: 0,
            width: '52px',
            height: '52px',
            borderRadius: '4px',
            overflow: 'hidden',
            background: '#1a1a2e',
            border: `1px solid ${drawerOpen ? 'rgba(0,255,255,0.4)' : 'rgba(0,255,255,0.18)'}`,
            cursor: 'pointer',
            transition: 'border-color 0.3s',
            boxShadow: drawerOpen ? '0 0 12px rgba(0,255,255,0.2)' : 'none',
          }}
        >
          {currentItem.thumbnailUrl ? (
            <img
              src={currentItem.thumbnailUrl}
              alt={currentItem.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0614, #1a0a2e)',
              }}
            >
              <span style={{ fontSize: '22px', color: '#00ffff' }}>♪</span>
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
            {currentItem.title}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(0,255,255,0.7)',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {'artist' in currentItem && currentItem.artist
              ? String(currentItem.artist)
              : currentItem.type}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ flex: 0.8, height: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#aaaaaa', minWidth: '28px' }}>
            {fmt(progress)}
          </span>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            onClick={handleSeekClick}
            style={{
              flex: 1,
              height: '4px',
              background: 'rgba(0,255,255,0.1)',
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
            {fmt(duration || 0)}
          </span>
        </div>

        {/* Primary Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ControlButton title="Previous" onClick={playPrev}>⏮</ControlButton>
          <ControlButton
            title={isPlaying ? 'Pause' : 'Play'}
            onClick={togglePlay}
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #00ffff, #00ccaa)'
                : '#00ffff',
              color: '#000000',
              width: '40px',
              height: '40px',
              fontSize: '18px',
              border: 'none',
              boxShadow: isPlaying ? '0 0 14px rgba(0,255,255,0.4)' : '0 0 8px rgba(0,255,255,0.2)',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </ControlButton>
          <ControlButton title="Next" onClick={playNext}>⏭</ControlButton>
        </div>

        {/* Mute + Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '110px' }}>
          <ControlButton title={muted ? 'Unmute' : 'Mute'} onClick={toggleMute}>
            {muted || volume === 0 ? '🔇' : '🔊'}
          </ControlButton>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, cursor: 'pointer', accentColor: '#00ffff' }}
          />
        </div>
      </div>
    </>
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
        border: '1px solid rgba(0,255,255,0.25)',
        color: '#ffffff',
        fontSize: '15px',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        transition: 'all 0.18s',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!(style as React.CSSProperties)?.background) {
          e.currentTarget.style.background = 'rgba(0,255,255,0.15)';
        }
        e.currentTarget.style.borderColor = 'rgba(0,255,255,0.6)';
      }}
      onMouseLeave={(e) => {
        if (!(style as React.CSSProperties)?.background) {
          e.currentTarget.style.background = 'transparent';
        }
        e.currentTarget.style.borderColor = 'rgba(0,255,255,0.25)';
      }}
    >
      {children}
    </button>
  );
}
