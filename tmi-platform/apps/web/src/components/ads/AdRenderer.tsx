'use client';

import React from 'react';
import Link from 'next/link';
import AdSenseUnit from '@/components/placement/AdSenseUnit';
import { getAdSlotForZone } from '@/lib/commerce/SponsorRegistry';

export interface AdRendererProps {
  zone: string;
  tier?: "free" | "RUBY" | "gold" | "platinum" | "diamond";
  className?: string;
}

const FORMAT_MAP: Record<string, 'horizontal' | 'rectangle' | 'auto'> = {
  banner: 'horizontal',
  sidebar: 'rectangle',
  rail: 'rectangle',
  inline: 'auto',
};

function zoneFormat(zone: string): 'horizontal' | 'rectangle' | 'auto' {
  for (const key of Object.keys(FORMAT_MAP)) {
    if (zone.toLowerCase().includes(key)) return FORMAT_MAP[key];
  }
  return 'auto';
}

export default function AdRenderer({ zone, tier = "free", className }: AdRendererProps) {
  if (tier === 'diamond' || tier === 'platinum') return null;

  const adSlot = getAdSlotForZone(zone);

  if (adSlot.type === 'paid' && adSlot.sponsor) {
    return (
      <div className={className} style={{ width: '100%', height: zoneFormat(zone) === 'horizontal' ? 90 : 250, background: `${adSlot.sponsor.accentColor}0A`, border: `1px solid ${adSlot.sponsor.accentColor}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: adSlot.sponsor.accentColor, textTransform: 'uppercase' }}>SPONSORED</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 20, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-orbitron, Impact)' }}>{adSlot.sponsor.name}</h3>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '80%' }}>{adSlot.sponsor.tagline}</p>
        <Link href={adSlot.sponsor.ctaHref} style={{ marginTop: 12, padding: '6px 16px', background: adSlot.sponsor.accentColor, color: '#050510', fontSize: 10, fontWeight: 900, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.1em' }}>{adSlot.sponsor.ctaLabel}</Link>
      </div>
    );
  }

  if (adSlot.type === 'platform' && adSlot.platformPromo) {
    return (
      <div className={className} style={{ width: '100%', height: zoneFormat(zone) === 'horizontal' ? 90 : 250, background: `${adSlot.platformPromo.accentColor}0A`, border: `1px solid ${adSlot.platformPromo.accentColor}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: adSlot.platformPromo.accentColor, textTransform: 'uppercase' }}>PLATFORM PROMO</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 20, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-orbitron, Impact)' }}>{adSlot.platformPromo.headline}</h3>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '80%' }}>{adSlot.platformPromo.body}</p>
        <Link href={adSlot.platformPromo.ctaHref} style={{ marginTop: 12, padding: '6px 16px', background: adSlot.platformPromo.accentColor, color: '#050510', fontSize: 10, fontWeight: 900, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.1em' }}>{adSlot.platformPromo.ctaLabel}</Link>
      </div>
    );
  }

  // Fallback: AdSense (with underlying CTA if AdSense fails to fill)
  return (
    <section
      className={className}
      data-ad-zone={zone}
      data-ad-tier={tier}
      aria-label={`Advertisement — ${zone}`}
      style={{ overflow: 'hidden', borderRadius: 8, position: 'relative', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,255,0.2)', minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ position: 'absolute', zIndex: 0, textAlign: 'center' }}>
         <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(0,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>AD SLOT AVAILABLE</div>
         <Link href="/advertise" style={{ fontSize: 11, color: '#00FFFF', fontWeight: 900, textDecoration: 'none', borderBottom: '1px solid #00FFFF' }}>ADVERTISE HERE →</Link>
      </div>
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <AdSenseUnit format={zoneFormat(zone)} style={{ width: '100%', minHeight: 90 }} />
      </div>
    </section>
  );
}
