'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home4SponsorDensityRail() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  const adSpend = 52000 + ((tick * 777) % 11000);
  const campaigns = 16 + (tick % 6);
  const ctr = 3.4 + (tick % 7) * 0.1;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 10px' }}>
      <div style={{ border: '1px solid rgba(255,215,0,0.35)', borderRadius: 10, background: 'linear-gradient(165deg, rgba(36,20,4,0.94), rgba(5,5,16,0.96))', padding: '10px 12px', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Tag text='SPONSOR LIVE' color='#FFD700' />
          <Tag text='AD WALL' color='#00FFFF' />
          <Tag text='DEAL FLOW' color='#FF2DAA' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <Stat label='Ad Spend' value={`$${adSpend.toLocaleString()}`} color='#FFD700' />
          <Stat label='Campaigns' value={campaigns.toString()} color='#00FFFF' />
          <Stat label='CTR' value={`${ctr.toFixed(1)}%`} color='#FF2DAA' />
          <Stat label='Deals Pending' value={`${2 + (tick % 5)}`} color='#00FF88' />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Jump href='/advertiser' label='Create Ad' color='#FFD700' />
          <Jump href='/advertiser/analytics' label='Analytics' color='#00FFFF' />
          <Jump href='/sponsors/deals' label='Sponsor Deals' color='#FF2DAA' />
        </div>
      </div>
    </section>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return <span style={{ fontSize: 8, fontWeight: 800, color: '#050510', background: color, letterSpacing: '0.1em', borderRadius: 4, padding: '2px 6px' }}>{text}</span>;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ border: `1px solid ${color}55`, borderRadius: 8, padding: '6px 8px', background: 'rgba(255,255,255,0.03)' }}><div style={{ fontSize: 8, letterSpacing: '0.12em', fontWeight: 800, color }}>{label}</div><div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{value}</div></div>;
}

function Jump({ href, label, color }: { href: string; label: string; color: string }) {
  return <Link href={href} style={{ textDecoration: 'none', fontSize: 8, fontWeight: 800, letterSpacing: '0.1em', color, border: `1px solid ${color}50`, borderRadius: 6, padding: '5px 8px' }}>{label}</Link>;
}
