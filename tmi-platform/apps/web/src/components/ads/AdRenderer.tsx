'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdSenseUnit from '@/components/placement/AdSenseUnit';

export interface AdRendererProps {
  zone: string;
  tier?: "free" | "bronze" | "gold" | "platinum" | "diamond";
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
  const [adState, setAdState] = useState<{ type: 'internal' | 'premium' | 'adsense' | 'cta', data?: any }>({ type: 'adsense' });

  useEffect(() => {
    // Platform Law: Diamond and Platinum users see no ads
    if (tier === 'diamond' || tier === 'platinum') return;

    // Ad Priority Stack: Internal -> Premium -> AdSense -> CTA
    const fetchAd = async () => {
      // Simulated AdManager priority check (Wire to actual DB in production)
      const rand = Math.random();
      if (rand > 0.75) {
        setAdState({
          type: 'internal',
          data: { title: 'TMI VIP SEASON PASS', desc: 'Secure your backstage pass, remove ads, and dominate the ranks.', cta: 'UPGRADE NOW' }
        });
      } else if (rand > 0.45) {
        setAdState({
          type: 'premium',
          data: { name: 'TMI Pro Audio', message: 'Upgrade your sound. 20% off for Gold members.', color: '#FFD700' }
        });
      } else {
        setAdState({ type: 'adsense' });
      }
    };

    fetchAd();
    const interval = setInterval(fetchAd, 18000); // 18s rotation jitter
    return () => clearInterval(interval);
  }, [zone, tier]);

  if (tier === 'diamond' || tier === 'platinum') return null;

  if (adState.type === 'internal') {
    return (
      <div className={className} style={{ width: '100%', height: zoneFormat(zone) === 'horizontal' ? 90 : 250, background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 900, color: '#FF2DAA', letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' }}>INTERNAL PROMO</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#fff', fontFamily: 'var(--font-orbitron, Impact)' }}>{adState.data.title}</h3>
        <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{adState.data.desc}</p>
        <Link href="/season-pass" style={{ padding: '6px 16px', background: '#FF2DAA', color: '#fff', fontSize: 10, fontWeight: 900, borderRadius: 4, textDecoration: 'none', letterSpacing: '0.1em' }}>{adState.data.cta}</Link>
      </div>
    );
  }

  if (adState.type === 'premium') {
    return (
      <div className={className} style={{ width: '100%', height: zoneFormat(zone) === 'horizontal' ? 90 : 250, background: `${adState.data.color}0A`, border: `1px solid ${adState.data.color}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: adState.data.color, textTransform: 'uppercase' }}>SPONSORED</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 20, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-orbitron, Impact)' }}>{adState.data.name}</h3>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '80%' }}>{adState.data.message}</p>
        <Link href={`/sponsor/promo`} style={{ marginTop: 12, padding: '6px 16px', background: adState.data.color, color: '#050510', fontSize: 10, fontWeight: 900, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.1em' }}>LEARN MORE</Link>
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
