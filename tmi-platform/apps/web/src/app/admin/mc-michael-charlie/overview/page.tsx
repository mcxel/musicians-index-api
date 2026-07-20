'use client';
import { useEffect, useState } from 'react';
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

const KPI_TILES = [
  { label: 'Active Bots',      value: '62',    delta: '+4 today',   color: '#00FFFF' },
  { label: 'Ops Health',       value: '98%',   delta: 'nominal',    color: '#22c55e' },
  { label: 'Tasks Queued',     value: '17',    delta: '3 critical',  color: '#f59e0b' },
  { label: 'Revenue Today',    value: '$12.4K',delta: '+8% vs avg', color: '#FFD700' },
  { label: 'Profit Margin',    value: '71%',   delta: '+2pts',      color: '#c4b5fd' },
  { label: 'Live Sessions',    value: '156',   delta: 'across 42 venues', color: '#FF2DAA' },
  { label: 'Active Users',     value: '2,847', delta: 'right now',  color: '#67e8f9' },
  { label: 'Corrections Sent', value: '9',     delta: 'this cycle', color: '#a78bfa' },
];

const SYSTEM_CHECKS = [
  { system: 'Auth / Session layer',   status: 'OK' },
  { system: 'Payment pipeline',        status: 'OK' },
  { system: 'Live streaming engine',   status: 'OK' },
  { system: 'Bot workforce',           status: 'OK' },
  { system: 'Magazine CMS',            status: 'OK' },
  { system: 'Ranking engine',          status: 'OK' },
  { system: 'Notifications (email)',   status: 'WARN' },
  { system: 'Diamond invite emails',   status: 'WARN' },
  { system: 'Avatar runtime',          status: 'BUILDING' },
];

export default function MCOverviewPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <AdminShell
      hubId="mc"
      hubTitle="MC Michael Charlie"
      hubSubtitle="Operations Overview"
      backHref="/admin/mc-michael-charlie"
    >
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
            border: l.label === 'Overview' ? '1px solid rgba(251,191,36,0.7)' : '1px solid rgba(251,191,36,0.25)',
            background: l.label === 'Overview' ? 'rgba(120,53,15,0.45)' : 'rgba(0,0,0,0.3)',
            color: l.label === 'Overview' ? '#fde68a' : '#94a3b8',
          }}>{l.label}</Link>
        ))}
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 16 }}>
        {KPI_TILES.map(k => (
          <div key={k.label} style={{ border: `1px solid ${k.color}33`, borderRadius: 10, background: 'rgba(255,255,255,0.03)', padding: '10px 12px' }}>
            <p style={{ margin: 0, fontSize: 9, color: k.color, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800 }}>{k.label}</p>
            <p style={{ margin: '4px 0 2px', fontSize: 18, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 9, color: '#64748b' }}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
        {/* System health */}
        <div style={{ border: '1px solid rgba(0,255,255,0.2)', borderRadius: 12, background: 'rgba(0,10,20,0.6)', padding: 14 }}>
          <p style={{ margin: '0 0 10px', color: '#67e8f9', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>System Health Check</p>
          <div style={{ display: 'grid', gap: 5 }}>
            {SYSTEM_CHECKS.map(s => (
              <div key={s.system} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>{s.system}</span>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 4,
                  background: s.status === 'OK' ? 'rgba(34,197,94,0.15)' : s.status === 'WARN' ? 'rgba(245,158,11,0.15)' : 'rgba(168,85,247,0.15)',
                  color: s.status === 'OK' ? '#4ade80' : s.status === 'WARN' ? '#fbbf24' : '#c4b5fd',
                  border: `1px solid ${s.status === 'OK' ? 'rgba(74,222,128,0.3)' : s.status === 'WARN' ? 'rgba(251,191,36,0.3)' : 'rgba(196,181,253,0.3)'}`,
                }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mandate summary */}
        <div style={{ border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, background: 'linear-gradient(135deg, rgba(40,20,5,0.6), rgba(10,6,2,0.9))', padding: 14 }}>
          <p style={{ margin: '0 0 10px', color: '#fde68a', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Operational Mandate</p>
          {[
            'Keep TMI running at 100% capacity 24/7.',
            'Identify and fix profit leaks before they compound.',
            'Oversee all 62 bots — assign, activate, correct.',
            'Escalate platform-critical issues to Big Ace immediately.',
            'Track every revenue stream: ads, tickets, subs, tips, sponsors.',
            'Zero tolerance for dead buttons, broken routes, or empty surfaces.',
            'Ensure every onboarding path completes without blockers.',
            'Report daily metrics summary to Big Ace at cycle end.',
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#fbbf24', fontSize: 10, flexShrink: 0 }}>→</span>
              <p style={{ margin: 0, fontSize: 10, color: '#cbd5e1', lineHeight: 1.5 }}>{m}</p>
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Link href="/admin/mc-michael-charlie/tasks" style={{ fontSize: 10, color: '#fde68a', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 6, padding: '5px 12px', textDecoration: 'none', fontWeight: 700 }}>
              View Task Queue →
            </Link>
            <Link href="/admin/big-ace" style={{ fontSize: 10, color: '#c4b5fd', border: '1px solid rgba(170,45,255,0.3)', borderRadius: 6, padding: '5px 12px', textDecoration: 'none', fontWeight: 700 }}>
              Report to Big Ace →
            </Link>
          </div>
        </div>
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 9, color: '#334155', letterSpacing: '0.1em' }}>LAST CYCLE CHECK — AUTO-REFRESHES EVERY 10s — TICK #{tick}</p>
    </AdminShell>
  );
}
