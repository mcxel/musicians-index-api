'use client';
import { useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';

const NAV_LINKS = [
  { href: '/admin/mc-michael-charlie', label: 'Home' },
  { href: '/admin/mc-michael-charlie/overview', label: 'Overview' },
  { href: '/admin/mc-michael-charlie/operations', label: 'Operations' },
  { href: '/admin/mc-michael-charlie/bots', label: 'Bots' },
  { href: '/admin/mc-michael-charlie/tasks', label: 'Tasks' },
  { href: '/admin/mc-michael-charlie/corrections', label: 'Corrections' },
  { href: '/admin/mc-michael-charlie/communications', label: 'Comms' },
];

type LiveSystem = {
  name: string;
  type: string;
  count: number;
  health: 'optimal' | 'nominal' | 'degraded' | 'down';
  note: string;
};

const LIVE_SYSTEMS: LiveSystem[] = [
  { name: 'Live Rooms',         type: 'Streaming', count: 156,  health: 'optimal',  note: 'Full capacity, all regions' },
  { name: 'Active Venues',      type: 'Streaming', count: 42,   health: 'optimal',  note: 'Seat engines nominal' },
  { name: 'Live Events',        type: 'Events',    count: 18,   health: 'nominal',  note: '3 battles, 6 concerts, 9 misc' },
  { name: 'Bot Sessions',       type: 'Bots',      count: 62,   health: 'optimal',  note: 'All departments running' },
  { name: 'Active Subscribers', type: 'Billing',   count: 5421, health: 'optimal',  note: 'Stripe webhooks stable' },
  { name: 'Ticket Sales Open',  type: 'Commerce',  count: 823,  health: 'nominal',  note: 'Venue/Promoter issued only' },
  { name: 'Auth Sessions',      type: 'Auth',      count: 2847, health: 'optimal',  note: 'Cookie healing active' },
  { name: 'Email Sends Today',  type: 'Comms',     count: 1640, health: 'nominal',  note: '4 VIP emails still pending fix' },
  { name: 'Ad Slots Filled',    type: 'Ads',       count: 94,   health: 'nominal',  note: '6% using fallback chain' },
  { name: 'Ranking Updates',    type: 'Rankings',  count: 4,    health: 'nominal',  note: 'XP-driven, last computed 8m ago' },
];

const HEALTH_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  optimal:  { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(74,222,128,0.3)' },
  nominal:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)' },
  degraded: { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(248,113,113,0.3)' },
  down:     { color: '#ef4444', bg: 'rgba(69,10,10,0.5)',    border: 'rgba(239,68,68,0.7)' },
};

const REVENUE_BREAKDOWN = [
  { source: 'Subscriptions', amount: '$7,200',  pct: 58, color: '#FFD700' },
  { source: 'Ad Revenue',    amount: '$2,400',  pct: 19, color: '#FF2DAA' },
  { source: 'Tickets',       amount: '$1,800',  pct: 15, color: '#00FFFF' },
  { source: 'Tips',          amount: '$600',    pct: 5,  color: '#c4b5fd' },
  { source: 'Sponsors',      amount: '$400',    pct: 3,  color: '#a78bfa' },
];

export default function MCOperationsPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC Michael Charlie"
      hubSubtitle="Live Operations"
      backHref="/admin/mc-michael-charlie"
    >
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
            border: l.label === 'Operations' ? '1px solid rgba(0,255,255,0.7)' : '1px solid rgba(251,191,36,0.25)',
            background: l.label === 'Operations' ? 'rgba(0,255,255,0.1)' : 'rgba(0,0,0,0.3)',
            color: l.label === 'Operations' ? '#67e8f9' : '#94a3b8',
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, alignItems: 'start' }}>
        {/* Live systems table */}
        <div style={{ border: '1px solid rgba(0,255,255,0.18)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,20,30,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ margin: 0, color: '#67e8f9', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Live Systems</p>
            <button type="button" onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 9, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}>
              {collapsed ? 'EXPAND' : 'COLLAPSE'}
            </button>
          </div>
          {!collapsed && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 90px', gap: 0, padding: '6px 14px', background: 'rgba(0,10,20,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['System', 'Type', 'Count', 'Health'].map(h => (
                  <span key={h} style={{ fontSize: 9, color: '#67e8f9', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {LIVE_SYSTEMS.map((s, i) => {
                const hs = HEALTH_STYLE[s.health];
                return (
                  <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 90px', gap: 0, padding: '8px 14px', background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,15,25,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: 9, color: '#64748b' }}>{s.note}</p>
                    </div>
                    <span style={{ fontSize: 10, color: '#94a3b8', alignSelf: 'center' }}>{s.type}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fde68a', alignSelf: 'center' }}>{s.count.toLocaleString()}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 4, background: hs.bg, color: hs.color, border: `1px solid ${hs.border}`, textTransform: 'uppercase', alignSelf: 'center', display: 'inline-block' }}>{s.health}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Revenue breakdown */}
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, background: 'linear-gradient(135deg, rgba(40,20,5,0.6), rgba(10,6,2,0.9))', padding: 14 }}>
            <p style={{ margin: '0 0 12px', color: '#fde68a', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Revenue Today — $12.4K</p>
            {REVENUE_BREAKDOWN.map(r => (
              <div key={r.source} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: '#cbd5e1' }}>{r.source}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.amount}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${r.pct}%`, background: r.color, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid rgba(255,45,170,0.3)', borderRadius: 12, background: 'rgba(0,0,0,0.5)', padding: 14 }}>
            <p style={{ margin: '0 0 8px', color: '#FF2DAA', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Quick Actions</p>
            {[
              { label: 'Revenue Leaks',    href: '/admin/mc-michael-charlie/corrections' },
              { label: 'Bot Oversight',    href: '/admin/mc-michael-charlie/bots' },
              { label: 'Task Queue',       href: '/admin/mc-michael-charlie/tasks' },
              { label: 'Full Admin Deck',  href: '/admin/overseer' },
              { label: 'Report to Big Ace', href: '/admin/big-ace' },
            ].map(a => (
              <Link key={a.label} href={a.href} style={{ display: 'block', fontSize: 10, color: '#94a3b8', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', letterSpacing: '0.05em' }}>
                → {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
