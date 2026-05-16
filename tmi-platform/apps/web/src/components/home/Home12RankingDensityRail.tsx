'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home12RankingDensityRail() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 3000);
    return () => window.clearInterval(id);
  }, []);

  const swaps = 24 + (tick % 8);
  const velocity = 130 + ((tick * 7) % 30);
  const ballots = 42000 + ((tick * 401) % 5200);

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px 4px' }}>
      <div style={{ border: '1px solid rgba(255,215,0,0.4)', borderRadius: 10, background: 'linear-gradient(165deg, rgba(24,14,2,0.95), rgba(6,6,20,0.96))', padding: '10px 12px', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <Tag label='DOUBLE SPREAD' color='#FFD700' />
          <Tag label='GENRE LADDER' color='#00FFFF' />
          <Tag label='VOTE VELOCITY' color='#FF2DAA' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <Cell label='Rank Swaps' value={swaps.toString()} color='#FF2DAA' />
          <Cell label='Vote Velocity' value={`${velocity}/min`} color='#00FFFF' />
          <Cell label='Ballots Cast' value={ballots.toLocaleString()} color='#FFD700' />
          <Cell label='Chart Heat' value={`${71 + (tick % 21)}%`} color='#00FF88' />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Action href='/charts' label='All Charts' color='#FFD700' />
          <Action href='/charts' label='DJ Chart' color='#00FFFF' />
          <Action href='/charts' label='MVP Chart' color='#FF2DAA' />
        </div>
      </div>
    </section>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color: '#050510', background: color, borderRadius: 4, padding: '2px 6px' }}>{label}</span>;
}

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ border: `1px solid ${color}55`, borderRadius: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 8, letterSpacing: '0.12em', fontWeight: 800, color }}>{label}</div><div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{value}</div></div>;
}

function Action({ href, label, color }: { href: string; label: string; color: string }) {
  return <Link href={href} style={{ textDecoration: 'none', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color, border: `1px solid ${color}50`, borderRadius: 6, padding: '5px 8px' }}>{label}</Link>;
}
