'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';

interface MeUser { id: string; email: string; name?: string; role: string; }

const ACCENT = '#00FF88';

const STATS = [
  { label: 'Events This Month', value: '0',  icon: '🎤', color: '#00FF88' },
  { label: 'Tickets Sold',      value: '0',  icon: '🎟️', color: '#00FFFF' },
  { label: 'Capacity Used',     value: '0%', icon: '📊', color: '#FFD700' },
  { label: 'Revenue',           value: '$0', icon: '💵', color: '#AA2DFF' },
];

const PRIMARY_ACTIONS = [
  { label: 'BOOK ARTIST',      icon: '🎤', href: '/booking',            color: '#00FF88', desc: 'Hire performers for events' },
  { label: 'SELL TICKETS',     icon: '🎟️', href: '/tickets',           color: '#00FFFF', desc: 'Create & sell event tickets' },
  { label: 'PRINT TICKETS',    icon: '🖨️', href: '/tickets',           color: '#FFD700', desc: 'Print physical tickets' },
  { label: 'LIVE ROOMS',       icon: '📺', href: '/live/rooms',         color: '#AA2DFF', desc: 'Manage live video rooms' },
  { label: 'SEAT MAP',         icon: '🏟️', href: '/seating',           color: '#00FF88', desc: 'Configure seating chart' },
  { label: 'SPONSOR BOARD',    icon: '🤝', href: '/advertising',        color: '#00FFFF', desc: 'Attract venue sponsors' },
  { label: 'ANALYTICS',        icon: '📊', href: '/dashboard/venue/analytics', color: '#FFD700', desc: 'Attendance, revenue, trends' },
  { label: 'MESSAGES',         icon: '💌', href: '/messages',           color: '#AA2DFF', desc: 'Artists & promoter inbox' },
  { label: 'VENUE HUB',        icon: '🏢', href: '/hub/venue',         color: '#00FF88', desc: 'Full venue control room' },
  { label: 'MY PROFILE',       icon: '👤', href: '/profile',            color: '#00FFFF', desc: 'Edit venue profile' },
  { label: 'INVITE & XP',     icon: '⭐', href: '/account/referrals',  color: '#FF9500', desc: 'Earn referral points' },
  { label: 'SETTINGS',         icon: '⚙️', href: '/settings',          color: '#555',    desc: 'Account preferences' },
];

const LIVE_LINKS = [
  { label: 'Live Lobby',    icon: '🏟️', href: '/live/lobby' },
  { label: 'Live Rooms',    icon: '📺', href: '/live/rooms' },
  { label: 'Live Stages',   icon: '🎤', href: '/live/stages' },
  { label: 'Backstage',     icon: '🎪', href: '/live/backstage' },
  { label: 'Live Queue',    icon: '⏳', href: '/live/queue' },
  { label: 'Lobby Wall',    icon: '🎨', href: '/live/lobby-wall' },
];

const PLATFORM_LINKS = [
  { label: 'HOME RAIL',    icon: '🏠', href: '/home/1',                desc: 'Billboard #1',     color: '#00FF88' },
  { label: 'ADMIN PANEL',  icon: '👑', href: '/admin/owner-dashboard', desc: 'Owner access',     color: '#FFD700' },
  { label: 'BILLBOARD',    icon: '📡', href: '/live/billboards',       desc: 'Live billboard',   color: '#00FFFF' },
  { label: 'STORE — VENUES', icon: '🎭', href: '/store/venues',        desc: 'Upgrade venue skin', color: '#AA2DFF' },
];

const RECENT_ACTIVITY = [
  { type: 'BOOKING',  text: 'Booking request from @wavetek pending',   time: '2h ago',  color: '#FFD700' },
  { type: 'TICKET',   text: '12 tickets sold for Fri night event',      time: '5h ago',  color: '#00FF88' },
  { type: 'SPONSOR',  text: 'New sponsorship inquiry in messages',      time: '1d ago',  color: '#AA2DFF' },
];

export default function VenueDashboardPage() {
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
      <span style={{ color: ACCENT, fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING VENUE HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(0,255,136,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800 }}>VENUE & PROMOTER COMMAND CENTER</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? 'Venue Operator'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/admin/owner-dashboard" style={{ fontSize: 10, color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN</Link>
          <PersonaSwitcher currentRole="venue" compact />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`, borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,255,255,0.06))', border: '1.5px solid rgba(0,255,136,0.3)', borderRadius: 16, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: ACCENT, fontWeight: 800, marginBottom: 6 }}>🏟️ YOUR VENUE EMPIRE</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Book. Sell. Broadcast. Own.</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Manage bookings, sell tickets, control your live rooms and attract sponsors.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/hub/venue" style={{ padding: '13px 28px', background: `linear-gradient(90deg,${ACCENT},#00FFFF)`, borderRadius: 9, color: '#050510', fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>ENTER VENUE HUB</Link>
            <Link href="/booking" style={{ padding: '13px 20px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>BOOK ARTIST</Link>
          </div>
        </motion.div>

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

        {/* Live routes + Activity + Platform */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Live routes */}
          <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.12)', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800, marginBottom: 12 }}>LIVE VIDEO ROUTES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {LIVE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', borderRadius: 7, textDecoration: 'none' }}>
                  <span style={{ fontSize: 14 }}>{l.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: 'rgba(0,255,255,0.03)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 12 }}>RECENT ACTIVITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} style={{ padding: '10px 12px', background: `${a.color}08`, border: `1px solid ${a.color}20`, borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: a.color, letterSpacing: '0.15em', marginBottom: 3 }}>{a.type}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800, marginBottom: 12 }}>PLATFORM CONNECTIONS</div>
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

      </div>
    </main>
  );
}
