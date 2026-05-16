'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home1CrownDensityRail() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2500);
    return () => window.clearInterval(id);
  }, []);

  const votes = 11000 + ((tick * 173) % 2200);
  const viewers = 430 + ((tick * 11) % 140);
  const movers = 7 + (tick % 4);

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 10px' }}>
      <div style={{ border: '1px solid rgba(0,255,255,0.45)', borderRadius: 10, background: 'linear-gradient(165deg, rgba(12,8,36,0.95), rgba(5,5,16,0.96))', padding: '10px 12px', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label='LIVE CROWN' color='#00FFFF' pulse />
          <Chip label='VOTING OPEN' color='#FFD700' />
          <Chip label='RANK SWAPS' color='#FF2DAA' />
          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em' }}>ISSUE W28</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          <Metric label='Votes' value={votes.toLocaleString()} color='#FFD700' />
          <Metric label='Live Viewers' value={viewers.toString()} color='#00FFFF' />
          <Metric label='Rank Movers' value={movers.toString()} color='#FF2DAA' />
          <Metric label='Crown Pressure' value={`${78 + (tick % 19)}%`} color='#00FF88' />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Route href='/rankings/crown' label='Crown Board' color='#00FFFF' />
          <Route href='/vote' label='Vote Now' color='#FFD700' />
          <Route href='/profile/astra-nova' label='Winner Profile' color='#FF2DAA' />
        </div>
      </div>
    </section>
  );
}

function Chip({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  return <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.12em', color: '#050510', background: color, borderRadius: 4, padding: '2px 6px', animation: pulse ? 'h1-pulse 1.2s infinite' : undefined }}>{label}</span>;
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ border: `1px solid ${color}55`, borderRadius: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: 8, letterSpacing: '0.12em', fontWeight: 800, color }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{value}</div>
    </div>
  );
}

function Route({ href, label, color }: { href: string; label: string; color: string }) {
  return <Link href={href} style={{ textDecoration: 'none', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color, border: `1px solid ${color}50`, borderRadius: 6, padding: '5px 8px' }}>{label}</Link>;
}
