'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home3LiveDensityRail() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2400);
    return () => window.clearInterval(id);
  }, []);

  const rooms = 10 + (tick % 8);
  const occupancy = 64 + (tick % 23);
  const joinBurst = 14 + (tick % 10);

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 10px' }}>
      <div style={{ border: '1px solid rgba(0,255,255,0.35)', borderRadius: 10, background: 'linear-gradient(165deg, rgba(8,26,40,0.94), rgba(5,5,16,0.96))', padding: '10px 12px', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Tag text='LIVE NOW' color='#00FFFF' pulse />
          <Tag text='ROOM BURST' color='#FF2DAA' />
          <Tag text='PREMIERES ACTIVE' color='#FFD700' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <Cell label='Open Rooms' value={rooms.toString()} color='#00FFFF' />
          <Cell label='Avg Occupancy' value={`${occupancy}%`} color='#FFD700' />
          <Cell label='Join Burst' value={`+${joinBurst}/min`} color='#FF2DAA' />
          <Cell label='Cypher Queue' value={`${3 + (tick % 6)}`} color='#00FF88' />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Action href='/live/lobby' label='Open Lobby' color='#00FFFF' />
          <Action href='/live/random' label='Join Random Room' color='#FF2DAA' />
          <Action href='/cypher/arena' label='Cypher Arena' color='#FFD700' />
        </div>
      </div>
    </section>
  );
}

function Tag({ text, color, pulse }: { text: string; color: string; pulse?: boolean }) {
  return <span style={{ fontSize: 8, fontWeight: 800, color: '#050510', background: color, letterSpacing: '0.1em', borderRadius: 4, padding: '2px 6px', animation: pulse ? 'h3-pulse 1.2s infinite' : undefined }}>{text}</span>;
}

function Cell({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ border: `1px solid ${color}55`, borderRadius: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 8, letterSpacing: '0.12em', fontWeight: 800, color }}>{label}</div><div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{value}</div></div>;
}

function Action({ href, label, color }: { href: string; label: string; color: string }) {
  return <Link href={href} style={{ textDecoration: 'none', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color, border: `1px solid ${color}50`, borderRadius: 6, padding: '5px 8px' }}>{label}</Link>;
}
