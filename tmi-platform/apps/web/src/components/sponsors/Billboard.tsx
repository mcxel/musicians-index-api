'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  startRotation,
  subscribeBillboard,
  recordImpression,
  recordClick,
  getActiveCreative,
  type BillboardSlot,
  type BillboardCreative,
} from '@/lib/sponsors/SponsorDispatcher';

interface BillboardProps {
  slot: BillboardSlot;
  className?: string;
  style?: React.CSSProperties;
}

export default function Billboard({ slot, className, style }: BillboardProps) {
  const [creative, setCreative] = useState<BillboardCreative | null>(null);

  useEffect(() => {
    startRotation();
    setCreative(getActiveCreative(slot));

    const unsub = subscribeBillboard((s, c) => {
      if (s === slot) setCreative(c);
    });

    return unsub;
  }, [slot]);

  useEffect(() => {
    if (!creative) return;
    recordImpression(creative.id);
  }, [creative?.id]);

  if (!creative) return null;

  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${creative.primaryColor}22 0%, ${creative.accentColor} 100%)`,
        border: `1px solid ${creative.primaryColor}44`,
        borderLeft: `3px solid ${creative.primaryColor}`,
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minHeight: 72,
        ...style,
      }}
    >
      {creative.imageEmoji && (
        <div style={{ fontSize: 28, flexShrink: 0 }}>{creative.imageEmoji}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: creative.primaryColor, fontSize: 9, letterSpacing: 3, fontWeight: 700, marginBottom: 2 }}>
          SPONSORED · {creative.sponsorName.toUpperCase()}
        </div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1.3, marginBottom: creative.subtext ? 3 : 0 }}>
          {creative.headline}
        </div>
        {creative.subtext && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.4 }}>{creative.subtext}</div>
        )}
      </div>
      <Link
        href={creative.ctaUrl}
        onClick={() => recordClick(creative.id)}
        style={{
          flexShrink: 0,
          padding: '8px 16px',
          background: creative.primaryColor,
          color: creative.accentColor || '#050510',
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: '0.08em',
          borderRadius: 6,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {creative.ctaLabel.toUpperCase()}
      </Link>
    </div>
  );
}
