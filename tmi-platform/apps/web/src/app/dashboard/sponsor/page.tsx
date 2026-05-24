'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRoleStats, type DashboardStat } from '@/lib/stats/DashboardStatsEngine';
import LiveMediaWall from '@/components/media/LiveMediaWall';

interface MeUser { id: string; email: string; name?: string; role: string; }

const PRIMARY_ACTIONS = [
  { label: 'SPONSOR ARTIST',   icon: '🎤', href: '/sponsor/campaigns',  color: '#FF2DAA', desc: 'Attach brand to an artist' },
  { label: 'SPONSOR ROOM',     icon: '🎪', href: '/sponsor/rooms',      color: '#AA2DFF', desc: 'Sponsor a live show' },
  { label: 'SPONSOR CONTEST',  icon: '🏆', href: '/sponsor/contests',   color: '#FFD700', desc: 'Fund a battle or contest' },
  { label: 'ANALYTICS',        icon: '📊', href: '/sponsor/analytics',  color: '#00FFFF', desc: 'Reach, views, ROI' },
  { label: 'CONTRACTS',        icon: '📋', href: '/sponsor/contracts',  color: '#FF2DAA', desc: 'Review signed deals' },
  { label: 'PAYMENTS',         icon: '💳', href: '/sponsor/payments',   color: '#AA2DFF', desc: 'Billing & invoices' },
  { label: 'PRIZE POOL',       icon: '💰', href: '/sponsor/contests',   color: '#FFD700', desc: 'Add to contest prize pool' },
  { label: 'MESSAGES',         icon: '💌', href: '/messages',           color: '#00FFFF', desc: 'Artist & team inbox' },
];

const LIVE_ROUTES = [
  { label: 'Live Stages',   icon: '🎤', href: '/live/stages' },
  { label: 'Live Rooms',    icon: '📺', href: '/live/rooms' },
  { label: 'Live Lobby',    icon: '🏟️', href: '/live/lobby' },
  { label: 'Live Billboards', icon: '📡', href: '/live/billboards' },
];

const PLATFORM_LINKS = [
  { label: 'HOME RAIL',    icon: '🏠', href: '/home/1',                desc: 'Billboard #1',    color: '#FF2DAA' },
  { label: 'ADMIN PANEL',  icon: '👑', href: '/admin/owner-dashboard', desc: 'Owner access',    color: '#FFD700' },
  { label: 'LOBBY WALL',   icon: '🎨', href: '/live/lobby-wall',       desc: 'Fan lobby ads',   color: '#00FFFF' },
  { label: 'STORE HUB',    icon: '🛒', href: '/store',                 desc: 'TMI global store', color: '#AA2DFF' },
];

const SPONSOR_PACKAGES = [
  { name: 'Artist Partner',  price: '$199/mo', desc: 'Brand on 1 artist profile + live overlay', color: '#FF2DAA' },
  { name: 'Room Takeover',   price: '$499/mo', desc: 'Full branding on live room for 1 month',   color: '#AA2DFF' },
  { name: 'Championship',    price: '$1,499',  desc: 'Title sponsor for a full battle event',     color: '#FFD700' },
];

const PATRONAGE_ORBIT = [
  { label: 'Bronze Orbit', xp: '2,500 XP', reach: '5K fans/mo',   color: '#CD7F32' },
  { label: 'Silver Orbit', xp: '5,000 XP', reach: '15K fans/mo',  color: '#C0C0C0' },
  { label: 'Gold Orbit',   xp: '10,000 XP', reach: '40K fans/mo', color: '#FFD700' },
];

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleStats, setRoleStats] = useState<DashboardStat[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { router.replace('/auth'); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace('/auth'); return; }
        setUser(data.user);
        setRoleStats(getRoleStats('sponsor'));
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#FF2DAA', fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING SPONSOR HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,45,170,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800 }}>SPONSOR COMMAND CENTER</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? 'Sponsor'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/hub/sponsor" style={{ fontSize: 10, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>SPONSOR HUB</Link>
          <Link href="/admin/owner-dashboard" style={{ fontSize: 10, color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN</Link>
          <Link href="/sponsor/analytics" style={{ fontSize: 10, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.2)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>ANALYTICS</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {roleStats.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`, borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 9, color: s.deltaPositive ? '#00FF88' : '#FF4444', marginTop: 3 }}>{s.delta}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, rgba(255,45,170,0.12), rgba(0,255,255,0.07))', border: '1.5px solid rgba(255,45,170,0.35)', borderRadius: 16, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 800, marginBottom: 6 }}>🤝 GET YOUR BRAND ON STAGE</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Sponsor the Music. Own the Moment.</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Attach your brand to live events, battles, and rising artists seen by thousands.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/sponsor/campaigns" style={{ padding: '13px 28px', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', borderRadius: 9, color: '#fff', fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>SPONSOR NOW</Link>
            <Link href="/sponsor/payments" style={{ padding: '13px 20px', background: 'rgba(255,45,170,0.1)', border: '1px solid rgba(255,45,170,0.3)', borderRadius: 9, color: '#FF2DAA', fontWeight: 800, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>VIEW PACKAGES</Link>
          </div>
        </motion.div>

        {/* Sponsored live room preview */}
        <div style={{ marginBottom: 28 }}>
          <LiveMediaWall roomId="R-307" title="LIVE EVENTS YOU'RE SPONSORING" mode="billboard" nodeCount={6} accentColor="#FF2DAA" enterHref="/sponsor/campaigns" />
        </div>

        {/* Primary Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {PRIMARY_ACTIONS.map((a, i) => (
              <motion.div key={a.href + a.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Link href={a.href} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: a.color, letterSpacing: '0.1em' }}>{a.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{a.desc}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Packages + Patronage + Live */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>

          {/* Sponsor packages */}
          <div style={{ background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.15)', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 12 }}>SPONSOR PACKAGES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SPONSOR_PACKAGES.map((p) => (
                <Link key={p.name} href="/sponsor/payments" style={{ padding: '10px 12px', background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: 8, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: p.color }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: p.color }}>{p.price}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{p.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Patronage orbit */}
          <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800, marginBottom: 12 }}>PATRONAGE ORBIT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PATRONAGE_ORBIT.map((o) => (
                <Link key={o.label} href="/sponsor/campaigns" style={{ padding: '10px 12px', background: `${o.color}10`, border: `1px solid ${o.color}30`, borderRadius: 8, textDecoration: 'none' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: o.color }}>{o.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{o.xp} · {o.reach}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Live routes */}
          <div style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 12 }}>LIVE EVENT ROUTES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {LIVE_ROUTES.map((l) => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: 8, textDecoration: 'none' }}>
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#00FFFF' }}>{l.label}</span>
                </Link>
              ))}
              <div style={{ borderTop: '1px solid rgba(0,255,255,0.1)', paddingTop: 8, marginTop: 4 }}>
                {PLATFORM_LINKS.map((p) => (
                  <Link key={p.href} href={p.href} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14 }}>{p.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
