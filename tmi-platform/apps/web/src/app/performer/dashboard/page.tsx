'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRoleStats, type DashboardStat } from '@/lib/stats/DashboardStatsEngine';

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }

const BOT_BAR = [
  { name: 'StageManagerBot', color: '#00FF88', active: true },
  { name: 'RevenueBot',      color: '#FFD700', active: true },
  { name: 'ChatGuardBot',    color: '#00FFFF', active: true },
  { name: 'StreamMonitor',   color: '#FFD700', active: false },
  { name: 'BookingBot',      color: '#AA2DFF', active: true },
];

const QUICK_ACTIONS = [
  { href: '/performer/studio',    icon: '⬆',  label: 'UPLOAD',      color: '#00FFFF' },
  { href: '/venues',               icon: '📅',  label: 'SET UP SHOW', color: '#FF2DAA' },
  { href: '/sponsors',             icon: '💼',  label: 'GET SPONSOR', color: '#FFD700' },
  { href: '/cypher',              icon: '⚡',  label: 'JOIN CYPHER', color: '#AA2DFF' },
  { href: '/battles',             icon: '🥊',  label: 'BEAT BATTLE', color: '#FF2DAA' },
  { href: '/wallet',              icon: '💵',  label: 'PAYOUTS',     color: '#00FF88' },
  { href: '/performer/analytics', icon: '📊',  label: 'ANALYTICS',   color: '#00FFFF' },
  { href: '/performer/profile',   icon: '✏️',  label: 'EDIT PROFILE',color: '#AA2DFF' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PerformerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [revBars, setRevBars] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [revMax, setRevMax] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { router.replace('/auth'); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace('/auth'); return; }
        setUser(data.user);
        setStats(getRoleStats('PERFORMER'));
        // Try to load real 7-day earnings trend
        try {
          const ledger = await fetch('/api/ledger/trend?days=7', { credentials: 'include' });
          if (ledger.ok) {
            const ldata = await ledger.json() as { bars?: number[]; max?: number };
            if (Array.isArray(ldata.bars) && ldata.bars.length === 7) {
              setRevBars(ldata.bars);
              setRevMax(ldata.max ?? 0);
            }
          }
        } catch { /* no trend API yet — bars stay at zero */ }
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#050815', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.14em', fontSize: 11, textTransform: 'uppercase' }}>Loading studio…</p>
    </main>
  );
  if (!user) return null;

  const displayName = user.name ?? user.email.split('@')[0] ?? 'Performer';

  return (
    <main style={{ minHeight: '100vh', background: '#050815', color: '#E0E0FF', fontFamily: 'Inter, sans-serif', paddingBottom: 40 }}>

      {/* Welcome banner */}
      <div style={{ background: 'rgba(8,14,38,.97)', borderBottom: '1px solid rgba(170,45,255,.3)', padding: '8px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-orbitron, monospace)', color: '#FFD700', fontSize: 11, fontWeight: 700, letterSpacing: '.1em' }}>
          🎵 WELCOME TO YOUR PROMOTION HUB 🎵
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,215,0,.5)', marginTop: 2 }}>
          We thank you for joining. Ready to take you and your music global. We grow together.
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 22, fontWeight: 900, color: '#AA2DFF', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(170,45,255,.5)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              ARTIST STUDIO · {user.role}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href="/go-live" style={{ padding: '8px 16px', background: 'rgba(0,255,136,.1)', border: '1px solid #00FF88', color: '#00FF88', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: 4, boxShadow: '0 0 10px rgba(0,255,136,.2)' }}>
              🔴 GO LIVE NOW
            </Link>
            <Link href="/performer/studio" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(170,45,255,.5)', color: '#AA2DFF', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: 4 }}>
              ⬆ UPLOAD
            </Link>
            <Link href="/venues" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(170,45,255,.5)', color: '#AA2DFF', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: 4 }}>
              📅 BOOK SHOW
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12, marginBottom: 12 }}>
          <div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              {stats.map((s: DashboardStat) => (
                <div key={s.id} style={{ background: 'rgba(8,14,38,.95)', border: `1px solid ${s.color ?? '#AA2DFF'}44`, borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                  {s.icon && <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>}
                  <div style={{ fontFamily: 'var(--font-orbitron, monospace)', fontSize: 20, fontWeight: 700, color: s.color ?? '#AA2DFF' }}>{s.value}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(170,45,255,.7)', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
                  {s.delta && <div style={{ fontSize: 8, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{s.delta}</div>}
                </div>
              ))}
            </div>

            {/* Revenue chart + battle buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 10, alignItems: 'stretch' }}>
              <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(170,45,255,.4)', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(170,45,255,.6)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Revenue Trend (7 days){revMax === 0 && <span style={{ color: 'rgba(170,45,255,.35)', fontWeight: 400, marginLeft: 6 }}>— earn to see data</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
                  {revBars.map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: h > 0 ? (h === Math.max(...revBars) ? '#FFD700' : '#AA2DFF') : 'rgba(170,45,255,.15)', height: h > 0 ? `${h}%` : '4px' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {DAYS.map(d => <span key={d} style={{ fontSize: 7, color: 'rgba(170,45,255,.4)' }}>{d}</span>)}
                </div>
              </div>
              <Link href="/cypher" style={{ background: 'transparent', border: '1px solid rgba(170,45,255,.5)', color: '#AA2DFF', borderRadius: 6, padding: '8px 14px', fontSize: 9, fontWeight: 700, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                <span style={{ fontSize: 20 }}>⚡</span>JOIN CYPHER
              </Link>
              <Link href="/battles" style={{ background: 'transparent', border: '1px solid rgba(255,45,170,.5)', color: '#FF2DAA', borderRadius: 6, padding: '8px 14px', fontSize: 9, fontWeight: 700, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                <span style={{ fontSize: 20 }}>🥊</span>BEAT BATTLE
              </Link>
            </div>

            {/* Quick action grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {QUICK_ACTIONS.map(a => (
                <Link key={a.href} href={a.href} style={{
                  background: 'transparent',
                  border: `1px solid ${a.color}55`,
                  color: a.color,
                  borderRadius: 6,
                  padding: '9px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                }}>
                  <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(170,45,255,.4)', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(170,45,255,.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Your Stats</div>
              {[
                { label: 'TIER', value: user.tier ?? 'FREE' },
                { label: 'FANS', value: '0' },
                { label: 'SHOWS', value: '0' },
                { label: 'BATTLES', value: '0' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 8, color: 'rgba(170,45,255,.5)', letterSpacing: '.08em' }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-orbitron, monospace)', fontWeight: 700, fontSize: 11, color: '#FFD700' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(8,14,38,.95)', border: '1px solid rgba(170,45,255,.4)', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(170,45,255,.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Quick Links</div>
              {[
                { href: '/hub/performer',       label: '← Performer Hub' },
                { href: '/performer/profile',   label: 'Edit Profile' },
                { href: '/admin',               label: 'Admin' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 9, color: 'rgba(170,45,255,.7)', textDecoration: 'none', marginBottom: 5, letterSpacing: '.04em' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bot bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '8px 12px', background: 'rgba(0,0,0,.3)', border: '1px solid rgba(170,45,255,.2)', borderRadius: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: 'rgba(170,45,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>BOTS:</span>
          {BOT_BAR.map(b => (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.active ? b.color : 'rgba(170,45,255,.2)', display: 'inline-block', boxShadow: b.active ? `0 0 5px ${b.color}` : 'none' }} />
              <span style={{ fontSize: 8, color: 'rgba(170,45,255,.5)' }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
