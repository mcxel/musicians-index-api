'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home5BattleDensityRail() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2300);
    return () => window.clearInterval(id);
  }, []);

  const joins = 80 + ((tick * 13) % 50);
  const prizePool = 34000 + ((tick * 611) % 9000);
  const xpMoves = 740 + ((tick * 19) % 280);

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 10px' }}>
      <div style={{ border: '1px solid rgba(255,45,170,0.4)', borderRadius: 10, background: 'linear-gradient(165deg, rgba(34,6,28,0.95), rgba(5,5,16,0.96))', padding: '10px 12px', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Tag text='BATTLE LIVE' color='#FF2DAA' pulse />
          <Tag text='CYPHER ACTIVE' color='#AA2DFF' />
          <Tag text='XP CLIMB' color='#FFD700' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <Metric label='Join Velocity' value={`+${joins}/h`} color='#FF2DAA' />
          <Metric label='Prize Pool' value={`$${prizePool.toLocaleString()}`} color='#FFD700' />
          <Metric label='XP Movers' value={xpMoves.toString()} color='#00FFFF' />
          <Metric label='Live Brackets' value={`${6 + (tick % 5)}`} color='#00FF88' />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Move href='/battles/live' label='Join Battle' color='#FF2DAA' />
          <Move href='/cypher/live' label='Join Cypher' color='#AA2DFF' />
          <Move href='/prizes' label='Open Prize Vault' color='#FFD700' />
        </div>
      </div>
    </section>
  );
}

function Tag({ text, color, pulse }: { text: string; color: string; pulse?: boolean }) {
  return <span style={{ fontSize: 8, fontWeight: 800, color: '#050510', background: color, letterSpacing: '0.1em', borderRadius: 4, padding: '2px 6px', animation: pulse ? 'h5-pulse 1.2s infinite' : undefined }}>{text}</span>;
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ border: `1px solid ${color}55`, borderRadius: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 8, letterSpacing: '0.12em', fontWeight: 800, color }}>{label}</div><div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{value}</div></div>;
}

function Move({ href, label, color }: { href: string; label: string; color: string }) {
  return <Link href={href} style={{ textDecoration: 'none', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color, border: `1px solid ${color}50`, borderRadius: 6, padding: '5px 8px' }}>{label}</Link>;
}
