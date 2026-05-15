'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BookingMetric {
  label: string;
  value: string;
  delta?: string;
  color: string;
}

const METRICS: BookingMetric[] = [
  { label: 'Total Bookings',      value: '142',     delta: '+18 this month', color: '#00FFFF' },
  { label: 'Confirmed',           value: '118',     delta: '83%',            color: '#00FF88' },
  { label: 'Pending Response',    value: '16',      delta: 'awaiting',       color: '#FFD700' },
  { label: 'Cancelled',          value: '8',       delta: '-2 vs last mo',  color: '#FF2DAA' },
  { label: 'Avg. Deal Value',     value: '$2,400',  delta: '+$340',          color: '#AA2DFF' },
  { label: 'Gross Revenue',       value: '$284K',   delta: '+31%',           color: '#FFD700' },
  { label: 'Repeat Clients',      value: '38%',     delta: '+5%',            color: '#00FFFF' },
  { label: 'Response Time (Avg)', value: '4.2h',    delta: '-0.8h',          color: '#60a5fa' },
];

const RECENT_BOOKINGS = [
  { venue: 'Venue ATL',         artist: 'Nova Cipher',    date: 'May 14',   value: '$3,200', status: 'confirmed', color: '#00FF88' },
  { venue: 'Club Underground',  artist: 'Ari Volt',        date: 'May 17',   value: '$1,800', status: 'pending',   color: '#FFD700' },
  { venue: 'Crown Stage NYC',   artist: 'FlowState.J',    date: 'May 20',   value: '$4,500', status: 'confirmed', color: '#00FF88' },
  { venue: 'TMI Live Arena',    artist: 'Yung Mako',      date: 'May 22',   value: '$2,100', status: 'confirmed', color: '#00FF88' },
  { venue: 'Rooftop Lounge',   artist: 'Nova Cipher',    date: 'May 28',   value: '$2,800', status: 'pending',   color: '#FFD700' },
];

export default function BookingAnalyticsPage() {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  const displayed = filter === 'all' ? RECENT_BOOKINGS : RECENT_BOOKINGS.filter((b) => b.status === filter);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: '#AA2DFF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Booking Analytics</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Booking Performance</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            Revenue, fill rate, response time, repeat clients
          </p>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 32 }}>
          {METRICS.map((m) => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${m.color}22`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{m.label}</div>
              {m.delta && <div style={{ fontSize: 10, color: m.color, marginTop: 5, fontWeight: 700 }}>{m.delta}</div>}
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>Recent Bookings</div>
            {(['all', 'confirmed', 'pending'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                style={{ fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 5, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.12)', background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent', color: filter === f ? '#e2e8f0' : 'rgba(255,255,255,0.3)' }}>
                {f}
              </button>
            ))}
            <Link href="/booking" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginLeft: 'auto' }}>View All →</Link>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            {displayed.map((b, i) => (
              <div key={`${b.venue}-${b.date}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto auto', gap: 12, padding: '14px 18px', alignItems: 'center', borderBottom: i < displayed.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{b.venue}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{b.artist}</div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{b.date}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFD700' }}>{b.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, border: `1px solid ${b.color}44`, background: `${b.color}11`, color: b.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{b.status}</div>
                <Link href={`/booking/${b.venue.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>→</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
