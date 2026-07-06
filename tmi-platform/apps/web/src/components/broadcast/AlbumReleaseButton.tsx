'use client';

/**
 * AlbumReleaseButton
 *
 * Broadcast Control Deck trigger for the Album Out Now overlay.
 * Performer fills in their album art URL + title, then fires the reveal.
 *
 * The reveal fires once per press — a 10-second cooldown prevents
 * accidental double-drops during a live show.
 *
 * Usage in Broadcast Control Deck:
 *   <AlbumReleaseButton
 *     albumArtUrl={performer.latestAlbum.coverUrl}
 *     albumTitle={performer.latestAlbum.title}
 *     artistName={performer.displayName}
 *     onFire={(payload) => broadcastOverlayToVenue(payload)}
 *   />
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AlbumOutNowOverlay from './AlbumOutNowOverlay';

export interface AlbumReleasePayload {
  albumArtUrl: string;
  albumTitle: string;
  artistName: string;
}

export interface AlbumReleaseButtonProps {
  albumArtUrl: string;
  albumTitle: string;
  artistName: string;
  /** Fires when the performer drops the reveal — wire this to your venue broadcast system */
  onFire?: (payload: AlbumReleasePayload) => void;
  /** Cooldown in ms before the button resets. Default 10000. */
  cooldownMs?: number;
  accentColor?: string;
}

type ButtonState = 'ready' | 'live' | 'cooldown';

export default function AlbumReleaseButton({
  albumArtUrl,
  albumTitle,
  artistName,
  onFire,
  cooldownMs = 10_000,
  accentColor = '#ffd700',
}: AlbumReleaseButtonProps) {
  const [state, setState] = useState<ButtonState>('ready');
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleFire = useCallback(() => {
    if (state !== 'ready') return;
    setState('live');
    setOverlayVisible(true);
    onFire?.({ albumArtUrl, albumTitle, artistName });
  }, [state, albumArtUrl, albumTitle, artistName, onFire]);

  const handleDismiss = useCallback(() => {
    setOverlayVisible(false);
    setState('cooldown');
    setTimeout(() => setState('ready'), cooldownMs);
  }, [cooldownMs]);

  const labels: Record<ButtonState, string> = {
    ready:    '🎵  Drop Album Reveal',
    live:     '📡  Reveal Live…',
    cooldown: '✓  Dropped',
  };

  const bg: Record<ButtonState, string> = {
    ready:    `${accentColor}18`,
    live:     `${accentColor}30`,
    cooldown: 'rgba(0,255,136,0.12)',
  };

  const border: Record<ButtonState, string> = {
    ready:    `${accentColor}55`,
    live:     accentColor,
    cooldown: 'rgba(0,255,136,0.4)',
  };

  const color: Record<ButtonState, string> = {
    ready:    accentColor,
    live:     accentColor,
    cooldown: '#00ff88',
  };

  return (
    <>
      {/* ── Local preview overlay (performer sees their own reveal) ─────────── */}
      <AlbumOutNowOverlay
        visible={overlayVisible}
        albumArtUrl={albumArtUrl}
        albumTitle={albumTitle}
        artistName={artistName}
        onDismiss={handleDismiss}
        accentColor={accentColor}
      />

      {/* ── Trigger button ───────────────────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={handleFire}
        disabled={state !== 'ready'}
        whileTap={state === 'ready' ? { scale: 0.96 } : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 10,
          border: `1px solid ${border[state]}`,
          background: bg[state],
          color: color[state],
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          cursor: state === 'ready' ? 'pointer' : 'default',
          transition: 'all 0.25s',
          outline: 'none',
          whiteSpace: 'nowrap',
          boxShadow: state === 'live'
            ? `0 0 18px ${accentColor}55, 0 0 6px ${accentColor}33`
            : 'none',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {labels[state]}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
