'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdRendererProps {
  zone: 'leaderboard' | 'sidebar' | 'in-feed' | 'billboard';
  userTier?: string;
  fallbackColor?: string;
}

export default function AdRenderer({ zone, userTier = 'free', fallbackColor = '#00FFFF' }: AdRendererProps) {
  const [sponsor, setSponsor] = useState<{ id: string; name: string; message: string; color: string } | null>(null);

  useEffect(() => {
    // Platform Law: Diamond and Platinum users see no ads
    if (userTier === 'diamond' || userTier === 'platinum') return;

    // Simulated fetch to the Ad Placement Engine
    const fetchSponsor = async () => {
      setSponsor({
        id: 'sp_1',
        name: 'TMI Pro Audio',
        message: 'Upgrade your sound with TMI Audio Gear. 20% off for Gold members.',
        color: '#FFD700'
      });
    };
    
    fetchSponsor();
    // Rotate ads every 15 seconds
    const interval = setInterval(fetchSponsor, 15000);
    return () => clearInterval(interval);
  }, [zone, userTier]);

  if (userTier === 'diamond' || userTier === 'platinum') return null;

  if (!sponsor) {
    return (
      <div style={{ width: '100%', height: zone === 'leaderboard' ? 90 : 250, background: 'rgba(255,255,255,0.02)', border: `1px solid ${fallbackColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.2em', color: `${fallbackColor}66`, textTransform: 'uppercase' }}>AD SLOT AVAILABLE</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: zone === 'leaderboard' ? 90 : 250, background: `${sponsor.color}0A`, border: `1px solid ${sponsor.color}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: sponsor.color, textTransform: 'uppercase' }}>SPONSORED</div>
      <h3 style={{ margin: '0 0 4px', fontSize: 18, color: '#fff', fontWeight: 900, fontFamily: 'var(--font-orbitron, Impact)' }}>{sponsor.name}</h3>
      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '80%' }}>{sponsor.message}</p>
      <Link href={`/sponsor/${sponsor.id}`} style={{ marginTop: 12, padding: '6px 12px', background: sponsor.color, color: '#000', fontSize: 9, fontWeight: 900, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.1em' }}>LEARN MORE</Link>
    </div>
  );
}