'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRoleStats, type DashboardStat } from '@/lib/stats/DashboardStatsEngine';
import LiveMediaWall from '@/components/media/LiveMediaWall';
import VideoCurtainReveal from '@/components/media/VideoCurtainReveal';
import AdSenseSlot, { AD_SLOTS } from '@/components/ads/AdSenseSlot';

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; fanPoints?: number; }

const ACCENT = '#00FFFF';

const PRIMARY_ACTIONS = [
  { label: 'WATCH LIVE',     icon: '📺', href: '/live',              color: '#FF2DAA', desc: 'Join live performances' },
  { label: 'BATTLES',        icon: '⚔️', href: '/battles',          color: '#AA2DFF', desc: 'Watch & vote live battles' },
  { label: 'CONTESTS',       icon: '🏆', href: '/contests',          color: '#FFD700', desc: 'Enter fan contests' },
  { label: 'LIVE LOBBY',     icon: '🏟️', href: '/live/lobby',       color: '#00FFFF', desc: 'Enter the live lobby' },
  { label: 'FAN STORE',      icon: '🛍️', href: '/store/fan',        color: '#FF2DAA', desc: 'Tips, passes, memberships' },
  { label: 'LOBBY SKINS',    icon: '🎨', href: '/store/lobbies',     color: '#AA2DFF', desc: 'Customize your world' },
  { label: 'SEASON PASS',    icon: '🎫', href: '/store/fan',         color: '#FFD700', desc: 'Get all-access pass' },
  { label: 'INVITE & XP',   icon: '⭐', href: '/account/referrals', color: '#FF9500', desc: '2× launch XP bonus' },
  { label: 'MESSAGES',       icon: '💌', href: '/messages',          color: '#00FFFF', desc: 'Artist & fan inbox' },
  { label: 'ACHIEVEMENTS',   icon: '🏅', href: '/achievements',      color: '#FFD700', desc: 'Your fan milestones' },
  { label: 'MY PROFILE',     icon: '👤', href: '/profile',           color: '#AA2DFF', desc: 'Edit fan profile' },
  { label: 'SETTINGS',       icon: '⚙️', href: '/settings',         color: '#555',    desc: 'Account preferences' },
];

const LIVE_LINKS = [
  { label: 'Live Lobby',   icon: '🏟️', href: '/live/lobby' },
  { label: 'Live Rooms',   icon: '📺', href: '/live/rooms' },
  { label: 'Audience',     icon: '👥', href: '/live/audience' },
  { label: 'Reactions',    icon: '💥', href: '/live/reactions' },
  { label: 'Lobby Wall',   icon: '🎨', href: '/live/lobby-wall' },
  { label: 'Live Chat',    icon: '💬', href: '/live/chat' },
];

const PLATFORM_LINKS = [
  { label: 'HOME RAIL',    icon: '🏠', href: '/home/1',          desc: 'Billboard #1',  color: '#FF2DAA' },
  { label: 'LIVE STAGES',  icon: '🎤', href: '/live/stages',     desc: 'Live events',   color: '#AA2DFF' },
  { label: 'LOBBY WALL',   icon: '🎨', href: '/live/lobby-wall', desc: 'Fan wall',      color: '#00FFFF' },
  { label: 'STORE HUB',    icon: '🛒', href: '/store',           desc: 'Shop everything', color: '#FFD700' },
];

const TIER_TABLE = [
  { tier: 'Free',      normal: '500 XP',    launch: '1,000 XP',  color: '#555' },
  { tier: 'Pro',       normal: '750 XP',    launch: '1,500 XP',  color: '#00FFFF' },
  { tier: 'Silver',    normal: '1,000 XP',  launch: '2,000 XP',  color: '#C0C0C0' },
  { tier: 'Gold',      normal: '1,500 XP',  launch: '3,000 XP',  color: '#FFD700' },
  { tier: 'Platinum',  normal: '2,000 XP',  launch: '4,000 XP',  color: '#AA2DFF' },
  { tier: 'Diamond',   normal: '2,500 XP',  launch: '5,000 XP',  color: '#00FF88' },
];

export default function FanDashboardPage() {
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
        setRoleStats(getRoleStats(data.user.role ?? 'fan'));
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: ACCENT, fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING FAN HUB...</span>
    </div>
  );

  const displayTier = (user?.tier ?? 'free').toUpperCase();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(0,255,255,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800 }}>FAN HUB</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? user?.email?.split('@')[0] ?? 'Fan'} <span style={{ fontSize: 10, color: '#FFD700', fontWeight: 700, marginLeft: 6 }}>{displayTier}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/hub/fan" style={{ fontSize: 10, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>FAN HUB</Link>
          <Link href="/account/referrals" style={{ fontSize: 10, color: '#FF9500', border: '1px solid rgba(255,149,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>⭐ XP</Link>
          <Link href="/settings" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>SETTINGS</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {(roleStats.length > 0 ? roleStats : []).map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`, borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 9, color: s.deltaPositive ? '#00FF88' : '#FF4444', marginTop: 2 }}>{s.delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Join Live hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, rgba(0,255,255,0.1), rgba(170,45,255,0.08))', border: '1.5px solid rgba(0,255,255,0.3)', borderRadius: 16, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: ACCENT, fontWeight: 800, marginBottom: 6 }}>📺 LIVE NOW</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Jump Into the Action</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Watch live performances, vote in battles, react in real time.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/live" style={{ padding: '13px 28px', background: `linear-gradient(90deg,${ACCENT},#AA2DFF)`, borderRadius: 9, color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>WATCH LIVE</Link>
            <Link href="/battles" style={{ padding: '13px 20px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>BATTLES ⚔️</Link>
          </div>
        </motion.div>

        {/* Live arena wall */}
        <div style={{ marginBottom: 32 }}>
          <VideoCurtainReveal title="LIVE ARENA" subtitle="Tap to reveal" accentColor={ACCENT} autoOpen revealDelayMs={600}>
            <LiveMediaWall roomId="R-214" title="LIVE CYPHER · BATTLE ROOM" mode="spotlight" nodeCount={7} accentColor={ACCENT} enterHref="/live/rooms" />
          </VideoCurtainReveal>
        </div>

        {/* Primary Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
            {PRIMARY_ACTIONS.map((a, i) => (
              <motion.div key={a.href + a.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
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

        {/* Ad slot — sponsor/advertiser fallback */}
        <AdSenseSlot
          slot={AD_SLOTS.dashboardSidebar}
          format="horizontal"
          label="ADVERTISEMENT"
          style={{ marginBottom: 28 }}
        />

        {/* Live Routes + Platform rail */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{ background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.15)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 14 }}>LIVE VIDEO ROUTES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {LIVE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 10px', background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.12)', borderRadius: 7, textDecoration: 'none' }}>
                  <span style={{ fontSize: 14 }}>{l.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#FF2DAA' }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800, marginBottom: 14 }}>PLATFORM CONNECTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PLATFORM_LINKS.map((p) => (
                <Link key={p.href} href={p.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: `${p.color}08`, border: `1px solid ${p.color}20`, borderRadius: 8, textDecoration: 'none' }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: p.color }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{p.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Referral XP tier table */}
        <div style={{ background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#FF9500' }}>⭐ INVITE & EARN — 2× LAUNCH BONUS ACTIVE</div>
            <Link href="/account/referrals" style={{ fontSize: 11, color: '#FF9500', border: '1px solid rgba(255,149,0,0.3)', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontWeight: 800 }}>VIEW INVITE LINK</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6 }}>
            {TIER_TABLE.map((t) => (
              <div key={t.tier} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.color}30`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: t.color, marginBottom: 4 }}>{t.tier}</div>
                <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 700 }}>{t.launch}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{t.normal} normal</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>Invite fans OR performers — you earn XP for both. Launch bonus expires Sep 2026.</div>
        </div>

      </div>
    </main>
  );
}
