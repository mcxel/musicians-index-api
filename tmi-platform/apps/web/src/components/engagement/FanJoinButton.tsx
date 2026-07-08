'use client';

/**
 * FanJoinButton
 *
 * 👥 The "join as a fan" button. This is a relationship action, not just
 * content appreciation (that's HeartButton). A fan actively chooses to
 * follow a performer's journey.
 *
 * Uses the 👥 multi-person emoji per Marcel's directive — feels like
 * joining a community, not subscribing to a channel.
 *
 * Analytics: every join/leave is tracked via EngagementRegistry.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  EngagementRegistry,
  isFan, setFan,
} from '@/lib/engagement/EngagementRegistry';

interface Props {
  performerId: string;
  performerName: string;
  /** Current fan count from the real registry. Do not pass fake numbers. */
  initialFanCount?: number;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  source?: string;
}

export default function FanJoinButton({
  performerId,
  performerName,
  initialFanCount = 0,
  accentColor = '#00FF88',
  size = 'md',
  showCount = true,
  source = 'article',
}: Props) {
  const [joined, setJoined]   = useState(false);
  const [count, setCount]     = useState(initialFanCount);
  const [joining, setJoining] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Hydrate from localStorage (SSR-safe)
  useEffect(() => {
    setJoined(isFan(performerId));
  }, [performerId]);

  const toggle = useCallback(async () => {
    if (joining) return;
    setJoining(true);

    const next = !joined;
    setJoined(next);
    setFan(performerId, next);
    setCount((c) => c + (next ? 1 : -1));

    EngagementRegistry.track({
      contentId: performerId,
      contentType: 'performer_profile',
      performerId,
      action: next ? 'join_fan' : 'leave_fan',
      source,
    });

    if (next) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1200);
    }

    setJoining(false);
  }, [joined, joining, performerId, source]);

  const SIZE_MAP = {
    sm: { fontSize: 9,  pad: '5px 12px', iconSize: 13, gap: 5 },
    md: { fontSize: 11, pad: '9px 18px', iconSize: 16, gap: 7 },
    lg: { fontSize: 13, pad: '11px 22px', iconSize: 20, gap: 8 },
  };
  const s = SIZE_MAP[size];

  const label = joined
    ? `✓ Fan Joined`
    : `👥 Join Fan`;

  const title = joined
    ? `You're a fan of ${performerName}. Click to leave.`
    : `Join ${performerName}'s fan community`;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button
        onClick={toggle}
        disabled={joining}
        title={title}
        aria-pressed={joined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: s.gap,
          padding: s.pad,
          background: joined
            ? `${accentColor}18`
            : `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
          border: `1.5px solid ${joined ? accentColor : `${accentColor}55`}`,
          borderRadius: 999,
          cursor: joining ? 'not-allowed' : 'pointer',
          color: joined ? accentColor : `${accentColor}cc`,
          fontSize: s.fontSize,
          fontWeight: 900,
          letterSpacing: '0.06em',
          transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          outline: 'none',
          userSelect: 'none',
          boxShadow: joined ? `0 0 16px ${accentColor}28` : 'none',
          transform: celebrate ? 'scale(1.08)' : 'scale(1)',
          opacity: joining ? 0.7 : 1,
        }}
      >
        <span style={{ fontSize: s.iconSize, lineHeight: 1 }}>
          {joined ? '✓' : '👥'}
        </span>
        {label}
      </button>

      {/* Fan count — only when > 0 */}
      {showCount && count > 0 && (
        <span style={{
          fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em',
          fontWeight: 600,
        }}>
          {count.toLocaleString()} fans
        </span>
      )}

      {/* Celebration flash — brief "New fan!" note on join */}
      {celebrate && (
        <span style={{
          fontSize: 9, color: accentColor, fontWeight: 900,
          letterSpacing: '0.08em', animation: 'tmi-fan-celebrate 1.2s ease forwards',
        }}>
          🎉 You joined!
        </span>
      )}

      <style>{`
        @keyframes tmi-fan-celebrate {
          0%   { opacity: 0; transform: translateY(4px); }
          20%  { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
