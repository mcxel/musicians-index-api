'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }

const STATS = [
  { label: 'Active Bookings', value: '0',     icon: '📅', color: '#AA2DFF' },
  { label: 'Battle Record',   value: '0W-0L', icon: '⚔️', color: '#FF2DAA' },
  { label: 'XP Points',       value: '0',     icon: '⭐', color: '#FFD700' },
  { label: 'Monthly Revenue', value: '$0',    icon: '💵', color: '#00FF88' },
];

const PRIMARY_ACTIONS = [
  { label: 'GO LIVE',       icon: '🔴', href: '/go-live',                    color: '#FF2DAA', desc: 'Start your live session' },
  { label: 'WORLD CONCERT', icon: '🌍', href: '/live/stages',                color: '#AA2DFF', desc: 'Full stage performance' },
  { label: 'WORLD RELEASE', icon: '💿', href: '/beats',                      color: '#00FFFF', desc: 'Drop your next project' },
  { label: 'MINI RELEASE',  icon: '🎵', href: '/beat-vault',                 color: '#FFD700', desc: 'Quick beat or single' },
  { label: 'BATTLES',       icon: '⚔️', href: '/battles',                   color: '#FF2DAA', desc: 'Enter live battles' },
  { label: 'BOOKINGS',      icon: '📅', href: '/booking',                    color: '#AA2DFF', desc: 'Manage your schedule' },
  { label: 'TICKETS',       icon: '🎟️', href: '/tickets',                   color: '#00FF88', desc: 'Sell event tickets' },
  { label: 'MESSAGES',      icon: '💌', href: '/messages',                   color: '#00FFFF', desc: 'Fan & promoter inbox' },
  { label: 'CYPHER',        icon: '🎤', href: '/cypher',                     color: '#FFD700', desc: 'Freestyle sessions' },
  { label: 'INVITE & XP',  icon: '⭐', href: '/account/referrals',           color: '#FF9500', desc: 'Earn referral points' },
  { label: 'EARNINGS',      icon: '💵', href: '/dashboard/performer/earnings', color: '#00FF88', desc: 'Revenue & payouts' },
  { label: 'SETTINGS',      icon: '⚙️', href: '/settings',                  color: '#555',    desc: 'Account preferences' },
];

const STORE_LINKS = [
  { label: 'Creator Store',  icon: '🛍️', href: '/store/creator',  color: '#FF2DAA' },
  { label: 'Venue Skins',    icon: '🎭', href: '/store/venues',   color: '#AA2DFF' },
  { label: 'Lobby Skins',    icon: '🛋️', href: '/store/lobbies', color: '#00FFFF' },
  { label: 'Full Store',     icon: '🛒', href: '/store',          color: '#FFD700' },
];

const LIVE_LINKS = [
  { label: 'Live Lobby',  icon: '🏟️', href: '/live/lobby' },
  { label: 'Live Rooms',  icon: '📺', href: '/live/rooms' },
  { label: 'Backstage',   icon: '🎪', href: '/live/backstage' },
  { label: 'Green Room',  icon: '🟢', href: '/live/green-room' },
  { label: 'Lobby Wall',  icon: '🎨', href: '/live/lobby-wall' },
  { label: 'Live Stages', icon: '🎤', href: '/live/stages' },
];

const PLATFORM_LINKS = [
  { label: 'HOME RAIL',   icon: '🏠', href: '/home/1',                  desc: 'Billboard #1', color: '#FF2DAA' },
  { label: 'ADMIN PANEL', icon: '👑', href: '/admin/owner-dashboard',   desc: 'Owner access', color: '#FFD700' },
  { label: 'BILLBOARD',   icon: '📡', href: '/live/billboards',          desc: 'Live screens', color: '#AA2DFF' },
  { label: 'STORE HUB',   icon: '🛒', href: '/store',                   desc: 'Global store', color: '#00FF88' },
];

export default function PerformerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { router.replace('/auth'); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace('/auth'); return; }
        setUser(data.user);
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#AA2DFF', fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING PERFORMER HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(170,45,255,0.25)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#AA2DFF', fontWeight: 800 }}>PERFORMER COMMAND CENTER</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? 'Artist'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/admin/owner-dashboard" style={{ fontSize: 10, color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN</Link>
          <Link href="/settings" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>SETTINGS</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`, borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 26, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* GO LIVE hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, rgba(255,45,170,0.15), rgba(170,45,255,0.12))', border: '1.5px solid rgba(255,45,170,0.4)', borderRadius: 16, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 800, marginBottom: 6 }}>🔴 READY TO PERFORM</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Enter Your Control Room</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Go live, manage your set, monitor crowd reactions and revenue in real time.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/go-live" style={{ padding: '13px 28px', background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', borderRadius: 9, color: '#fff', fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>🔴 GO LIVE NOW</Link>
            <Link href="/hub/performer" style={{ padding: '13px 20px', background: 'rgba(170,45,255,0.15)', border: '1px solid rgba(170,45,255,0.4)', borderRadius: 9, color: '#AA2DFF', fontWeight: 800, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>CONTROL ROOM</Link>
          </div>
        </motion.div>

        {/* Primary Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
            {PRIMARY_ACTIONS.map((a, i) => (
              <motion.div key={a.href} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                <Link href={a.href} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s' }}>
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

        {/* Store & Assets row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          {/* Store */}
          <div style={{ background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.2)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 14 }}>STORE & PRODUCTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STORE_LINKS.map((s) => (
                <Link key={s.href} href={s.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 8, textDecoration: 'none' }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.label} →</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Live Video Routes */}
          <div style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.15)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 14 }}>LIVE VIDEO ROUTES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {LIVE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 10px', background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: 7, textDecoration: 'none' }}>
                  <span style={{ fontSize: 14 }}>{l.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#00FFFF' }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Connections */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>PLATFORM CONNECTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {PLATFORM_LINKS.map((p) => (
              <Link key={p.href} href={p.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 12px', background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}>
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: p.color, letterSpacing: '0.1em' }}>{p.label}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{p.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Referral XP banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,149,0,0.1), rgba(255,45,170,0.08))', border: '1px solid rgba(255,149,0,0.25)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#FF9500', marginBottom: 4 }}>⭐ INVITE & EARN — LAUNCH BONUS ACTIVE (2× XP)</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Invite fans or performers. Free tier = 1,000 XP. Paid tiers = up to 5,000 XP each.</div>
          </div>
          <Link href="/account/referrals" style={{ padding: '10px 20px', background: '#FF9500', borderRadius: 8, color: '#000', fontWeight: 900, fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>GET LINK</Link>
        </div>

      </div>
    </main>
  );
}
