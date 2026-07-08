'use client';

/**
 * MomentMarkButton — ⭐ "Mark this moment" for live rooms.
 *
 * Lets fans timestamp a highlight during a live performance.
 * Each press creates a moment_mark engagement event tied to the
 * performer's current live session, with the current timestamp.
 *
 * Moment marks aggregate into the MemoryWall and performer analytics.
 * Rule 20: every mark is tied to a real contentId + real timestamp.
 */

import { useState, useCallback } from 'react';
import { EngagementRegistry } from '@/lib/engagement/EngagementRegistry';

interface Props {
  performerId: string;
  liveSessionId: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MomentMarkButton({
  performerId,
  liveSessionId,
  accentColor = '#FFD700',
  size = 'md',
}: Props) {
  const [markCount, setMarkCount] = useState(0);
  const [burst, setBurst]         = useState(false);
  const [lastMark, setLastMark]   = useState<string | null>(null);

  const mark = useCallback(() => {
    const now = new Date().toISOString();
    const contentId = `moment-${liveSessionId}-${Date.now()}`;

    EngagementRegistry.track({
      contentId,
      contentType: 'live_performance',
      performerId,
      action: 'moment_mark',
      source: 'live_room',
      metadata: { sessionId: liveSessionId, markedAt: now },
    });

    setMarkCount((c) => c + 1);
    setLastMark(now);
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
  }, [performerId, liveSessionId]);

  const SIZE_MAP = {
    sm: { icon: 16, pad: '5px 12px', fontSize: 9, gap: 5 },
    md: { icon: 20, pad: '8px 16px', fontSize: 11, gap: 6 },
    lg: { icon: 24, pad: '10px 20px', fontSize: 13, gap: 8 },
  };
  const s = SIZE_MAP[size];

  const timeLabel = lastMark
    ? new Date(lastMark).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <button
        onClick={mark}
        title="Mark this moment as a highlight"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: s.gap,
          padding: s.pad,
          background: burst ? `${accentColor}28` : `${accentColor}10`,
          border: `1.5px solid ${burst ? accentColor : `${accentColor}50`}`,
          borderRadius: 999,
          cursor: 'pointer',
          color: accentColor,
          fontSize: s.fontSize,
          fontWeight: 900,
          letterSpacing: '0.06em',
          transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          outline: 'none',
          userSelect: 'none',
          transform: burst ? 'scale(1.14)' : 'scale(1)',
          boxShadow: burst ? `0 0 18px ${accentColor}44` : 'none',
        }}
      >
        <span
          style={{
            fontSize: s.icon,
            lineHeight: 1,
            display: 'inline-block',
            transform: burst ? 'scale(1.3) rotate(-10deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            filter: burst ? `drop-shadow(0 0 5px ${accentColor})` : 'none',
          }}
        >
          ⭐
        </span>
        MARK MOMENT
        {markCount > 0 && (
          <span style={{
            background: accentColor,
            color: '#050310',
            fontSize: s.fontSize - 1,
            fontWeight: 900,
            borderRadius: 999,
            padding: '1px 6px',
            lineHeight: 1.4,
            minWidth: 18,
            textAlign: 'center',
          }}>
            {markCount}
          </span>
        )}
      </button>

      {/* Timestamp of last mark */}
      {timeLabel && (
        <span style={{
          fontSize: 8,
          color: `${accentColor}80`,
          letterSpacing: '0.06em',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}>
          Last: {timeLabel}
        </span>
      )}
    </div>
  );
}
