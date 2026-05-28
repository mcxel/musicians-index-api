'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { resolveAdRailSlot, type AdRailSlotId } from '@/lib/ads/AdRailEngine';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdRailSlotProps = {
  slotId: AdRailSlotId;
  hasSponsor?: boolean;
  hasAdvertiser?: boolean;
  style?: CSSProperties;
  className?: string;
  title?: string;
};

function railFrameStyle(accent: string): CSSProperties {
  return {
    border: `1px solid ${accent}44`,
    background: `linear-gradient(145deg, ${accent}12, rgba(6,7,16,0.92))`,
    boxShadow: `0 0 16px ${accent}22`,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  };
}

function AdSenseTile({ client, slot, format }: { client: string; slot: string; format: 'auto' | 'rectangle' | 'horizontal' }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Keep page stable if AdSense script is blocked.
    }
  }, []);

  const minHeight = format === 'horizontal' ? 90 : 250;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', minHeight }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format === 'auto' ? 'auto' : undefined}
      data-full-width-responsive="true"
    />
  );
}

export default function AdRailSlot({
  slotId,
  hasSponsor,
  hasAdvertiser,
  style,
  className,
  title = 'Monetization Rail',
}: AdRailSlotProps) {
  const selection = resolveAdRailSlot({ slotId, hasSponsor, hasAdvertiser });

  const accent =
    selection.type === 'sponsor'
      ? selection.payload.accentColor
      : selection.type === 'advertiser'
        ? selection.payload.accentColor
        : '#00C8FF';

  return (
    <aside style={{ ...railFrameStyle(accent), ...style }} className={className}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', marginBottom: 8 }}>
        {title}
      </div>

      {selection.type === 'sponsor' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{selection.payload.brand}</div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>{selection.payload.headline}</div>
          <Link href={selection.payload.href} style={{ color: accent, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, textDecoration: 'none' }}>
            {selection.payload.ctaLabel} →
          </Link>
        </div>
      )}

      {selection.type === 'advertiser' && (
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{selection.payload.company}</div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12 }}>{selection.payload.campaign}</div>
          <Link href={selection.payload.href} style={{ color: accent, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, textDecoration: 'none' }}>
            {selection.payload.ctaLabel} →
          </Link>
        </div>
      )}

      {selection.type === 'adsense' && (
        <AdSenseTile
          client={selection.payload.client}
          slot={selection.payload.slot}
          format={selection.payload.format}
        />
      )}
    </aside>
  );
}
