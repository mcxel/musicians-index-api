'use client';

/**
 * MemoryCaptureButton — "📸 Capture Moment" trigger for any live surface.
 *
 * Calls POST /api/memory/capture → MemoryCaptureEngine.saveCapture()
 * → MemoryWallEngine.captureLiveMoment() (Prisma) → TMI_MEMORY_CAPTURED event.
 *
 * Required on (BD Phase C Task 2):
 *   Live Rooms, Battles, Cyphers, Challenges, Concerts, Game Shows,
 *   Avatar Lobbies, World Dance Party
 *
 * imageUrl: caller provides the performer's profile image or a room thumbnail.
 * Defaults to /images/tmi-placeholder.jpg — artifact title carries the meaning.
 *
 * Per Rule 20: no fake success states. Real Prisma write or honest error.
 */

import { useState, useCallback } from 'react';
import type { CaptureType } from '@/lib/capture/CaptureEngine';
import { dispatchSoundEvent } from '@/lib/sound/AudioDirector';

// ─── Types ────────────────────────────────────────────────────────────────────

type CaptureState = 'idle' | 'saving' | 'saved' | 'error';

export interface MemoryCaptureButtonProps {
  userId:         string;
  roomId?:        string;
  performerName?: string;
  roomLabel?:     string;
  /** Performer or room image used as the memory artifact thumbnail. */
  imageUrl?:      string;
  captureType?:   CaptureType;
  /** Compact mode: icon-only pill button for space-constrained surfaces. */
  compact?:       boolean;
  accentColor?:   string;
}

// ─── Response shape from /api/memory/capture ─────────────────────────────────

interface CaptureApiResponse {
  success?: boolean;
  xpEarned?: number;
  memoryId?: string;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MemoryCaptureButton({
  userId,
  roomId,
  performerName,
  roomLabel,
  imageUrl,
  captureType = 'stage_shot',
  compact = false,
  accentColor = '#FF2DAA',
}: MemoryCaptureButtonProps) {
  const [state, setState] = useState<CaptureState>('idle');
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const handleCapture = useCallback(async () => {
    if (state !== 'idle') return;
    setState('saving');

    try {
      const res = await fetch('/api/memory/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageData: imageUrl ?? '/images/tmi-placeholder.jpg',
          captureType,
          roomId,
          performerName,
          roomLabel: roomLabel ?? (roomId ? `Live Room · ${roomId}` : undefined),
        }),
      });

      const data: CaptureApiResponse = await res.json();

      if (data.success) {
        dispatchSoundEvent('tmi:memory_captured');
        setXpEarned(data.xpEarned ?? 0);
        setState('saved');
        setTimeout(() => {
          setState('idle');
          setXpEarned(null);
        }, 2800);
      } else {
        setState('error');
        setTimeout(() => setState('idle'), 2000);
      }
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  }, [state, userId, roomId, performerName, roomLabel, imageUrl, captureType]);

  // ── Styles ────────────────────────────────────────────────────────────────

  const isActive   = state !== 'idle';
  const isSaved    = state === 'saved';
  const isError    = state === 'error';

  const bg = isSaved
    ? 'rgba(0,255,136,0.18)'
    : isError
    ? 'rgba(255,70,70,0.15)'
    : `${accentColor}18`;

  const border = isSaved
    ? 'rgba(0,255,136,0.4)'
    : isError
    ? 'rgba(255,70,70,0.4)'
    : `${accentColor}44`;

  const color = isSaved ? '#00FF88' : isError ? '#FF6B6B' : accentColor;

  const label = state === 'saving'
    ? '⌛ Saving…'
    : isSaved
    ? xpEarned
      ? `✅ Saved! +${xpEarned} XP`
      : '✅ Memory Saved!'
    : isError
    ? '❌ Failed — try again'
    : compact
    ? '📸'
    : '📸 Capture Moment';

  return (
    <button
      type="button"
      onClick={handleCapture}
      disabled={isActive}
      title={compact ? 'Capture this moment to your Memory Wall' : undefined}
      aria-label="Capture this moment to your Memory Wall"
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           compact ? 0 : 6,
        padding:       compact ? '8px 10px' : '9px 16px',
        borderRadius:  10,
        border:        `1px solid ${border}`,
        background:    bg,
        color,
        fontSize:      compact ? 16 : 11,
        fontWeight:    800,
        letterSpacing: compact ? 0 : '0.06em',
        cursor:        isActive ? 'wait' : 'pointer',
        transition:    'all 0.2s',
        whiteSpace:    'nowrap',
        outline:       'none',
        textTransform: 'uppercase',
        boxShadow:     isSaved ? `0 0 12px rgba(0,255,136,0.25)` : 'none',
      }}
    >
      {label}
    </button>
  );
}
