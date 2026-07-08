'use client';

/**
 * HeartButton — per-content engagement button.
 *
 * Each content item (song, photo, video, article, live performance, etc.)
 * has its own heart count tracked separately. This gives performers analytics
 * on exactly which piece of content resonated — not just overall likes.
 *
 * Rule 20: base count comes from real registry data (passed as prop).
 *          Local delta tracked via EngagementRegistry optimistic cache.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  EngagementRegistry,
  isHearted, setHearted,
  type ContentType,
} from '@/lib/engagement/EngagementRegistry';

interface Props {
  contentId: string;
  contentType: ContentType;
  performerId: string;
  /** Real count from the database / registry. Do not pass fake numbers. */
  initialCount?: number;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  source?: string;
}

export default function HeartButton({
  contentId,
  contentType,
  performerId,
  initialCount = 0,
  accentColor = '#FF2DAA',
  size = 'md',
  showCount = true,
  source = 'article',
}: Props) {
  const [hearted, setHeartedState] = useState(false);
  const [count, setCount]          = useState(initialCount);
  const [burst, setBurst]          = useState(false);

  // Hydrate from localStorage (SSR-safe)
  useEffect(() => {
    setHeartedState(isHearted(contentId));
  }, [contentId]);

  const toggle = useCallback(() => {
    const next = !hearted;
    setHeartedState(next);
    setHearted(contentId, next);
    setCount((c) => c + (next ? 1 : -1));

    EngagementRegistry.track({
      contentId,
      contentType,
      performerId,
      action: next ? 'heart' : 'unheart',
      source,
    });

    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
  }, [hearted, contentId, contentType, performerId, source]);

  const SIZE_MAP = {
    sm: { icon: 14, gap: 4, fontSize: 9, pad: '4px 8px' },
    md: { icon: 16, gap: 5, fontSize: 10, pad: '6px 12px' },
    lg: { icon: 20, gap: 6, fontSize: 12, pad: '8px 16px' },
  };
  const s = SIZE_MAP[size];

  return (
    <button
      onClick={toggle}
      title={hearted ? 'Remove heart' : 'Heart this'}
      aria-pressed={hearted}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.pad,
        background: hearted ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hearted ? accentColor : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 999,
        cursor: 'pointer',
        color: hearted ? accentColor : 'rgba(255,255,255,0.55)',
        fontSize: s.fontSize,
        fontWeight: 700,
        letterSpacing: '0.04em',
        transition: 'all 0.18s ease',
        outline: 'none',
        userSelect: 'none',
        transform: burst ? 'scale(1.18)' : 'scale(1)',
      }}
    >
      <span
        style={{
          fontSize: s.icon,
          lineHeight: 1,
          display: 'inline-block',
          transform: burst ? 'scale(1.3)' : 'scale(1)',
          transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          filter: hearted ? `drop-shadow(0 0 4px ${accentColor})` : 'none',
        }}
      >
        {hearted ? '❤️' : '🤍'}
      </span>
      {showCount && count > 0 && (
        <span>{count.toLocaleString()}</span>
      )}
    </button>
  );
}
