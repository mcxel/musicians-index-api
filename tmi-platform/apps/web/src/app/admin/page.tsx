'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserPublic, ArtistPublic } from '@tmi/contracts';
import { UserManagement } from '@/components/admin/UserManagement';
import { getTotalRevenueStat } from '@/lib/stats/DashboardStatsEngine';
import { getBotStatus, getHealthSummary, type ActiveBot } from '@/lib/bots/BotActivationEngine';
import { getAllGhosts, type GhostArchetype } from '@/lib/bots/GhostArchetypeEngine';

interface PlatformStats {
  totalUsers: number;
  byRole: Record<string, number>;
  activeRooms: number;
  activeBots: number;
  revenueToday: string;
  revenueMonth: string;
  health: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

const RECENT_SIGNUPS = [
  { name: 'Nova_K', role: 'FAN', ts: '2 min ago' },
  { name: 'Wavetek_Pro', role: 'ARTIST', ts: '14 min ago' },
  { name: 'UrbanVenue', role: 'VENUE', ts: '1 hr ago' },
  { name: 'BrandX', role: 'SPONSOR', ts: '3 hr ago' },
  { name: 'TrapFan99', role: 'FAN', ts: '4 hr ago' },
];

const ROLE_COLORS: Record<string, string> = {
  FAN: '#00FFFF', ARTIST: '#FF2DAA', PERFORMER: '#AA2DFF',
  SPONSOR: '#FFD700', ADVERTISER: '#00FF88', VENUE: '#FF9500', ADMIN: '#FF4444',
};

const DIAG_LINKS = [
  { label: 'Route Health',     href: '/admin/routes',          color: '#00FFFF' },
  { label: 'Error Monitor',    href: '/admin/errors',          color: '#FF2DAA' },
  { label: 'Revenue',          href: '/admin/revenue',         color: '#FFD700' },
  { label: 'Bot Operations',   href: '/admin/bot-operations',  color: '#64C8FF' },
  { label: 'Observatory',      href: '/admin/observatory',     color: '#C864FF' },
  { label: 'Conductor',        href: '/admin/conductor',       color: '#00FF88' },
  { label: 'Billboards',       href: '/admin/billboards',      color: '#AA2DFF' },
  { label: 'Tasks',            href: '/admin/tasks',           color: '#FF9500' },
  { label: 'Live Feed',        href: '/admin/live-feed',       color: '#FF2DAA' },
  { label: 'NFT Sales',        href: '/admin/nft-sales',       color: '#00FFFF' },
  { label: 'Beat Sales',       href: '/admin/beat-sales',      color: '#FFD700' },
  { label: 'Article Health',   href: '/admin/articles',        color: '#00FF88' },
  { label: 'Editorial',        href: '/admin/editorial',       color: '#AA2DFF' },
  { label: 'Safety',           href: '/admin/safety',          color: '#FF4444' },
  { label: 'Mail Center',      href: '/admin/mail',            color: '#00e5ff' },
  { label: 'Finance',          href: '/admin/payouts',         color: '#ffd700' },
];

export default function AdminDashboard() {
  const [users, setUsers]       = useState<UserPublic[]>([]);
  const [artists, setArtists]   = useState<ArtistPublic[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [stats, setStats]       = useState<PlatformStats | null>(null);
  const [bots, setBots]         = useState<ActiveBot[]>([]);
  const [ghosts, setGhosts]     = useState<GhostArchetype[]>([]);
  const [botHealth, setBotHealth] = useState<ReturnType<typeof getHealthSummary> | null>(null);

  const rev = getTotalRevenueStat();

  useEffect(() => {
    const refresh = () => {
      const b = getBotStatus();
      setBots(b);
      setBotHealth(getHealthSummary());
      setGhosts(getAllGhosts());
    };
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((r) => r.ok ? r.json() : null)
      .then((d: { today?: string; month?: string } | null) => {
        if (d?.today) {
          setStats((prev) =>
            prev ? { ...prev, revenueToday: d.today!, revenueMonth: d.month ?? prev.revenueMonth } : prev
          );
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => {
        if (!r.ok) return r.json().then((d: { error?: string }) => { throw new Error(`HTTP ${r.status}: ${d.error ?? 'unknown'}`); });
        return r.json();
      })
      .then((d: { users?: UserPublic[]; artists?: ArtistPublic[] }) => {
        const userList = d.users ?? [];
        const artistList = d.artists ?? [];
        if (d.users) setUsers(userList);
        if (d.artists) setArtists(artistList);

        // Build role breakdown
        const byRole: Record<string, number> = {};
        userList.forEach((u) => {
          const r = (u as UserPublic & { role?: string }).role ?? 'FAN';
          byRole[r] = (byRole[r] ?? 0) + 1;
        });

        setStats({
          totalUsers: userList.length,
          byRole,
          activeRooms: 7,
          activeBots: 62,
          revenueToday: rev.today,
          revenueMonth: rev.month,
          health: 'HEALTHY',
        });

        if (!d.users) setError(`200 OK but no users field — response keys: ${Object.keys(d).join(', ') || 'empty'}`);
      })
      .catch((e: Error) => {
        setError(e.message);
        // Still show demo stats even on API error
        setStats({
          totalUsers: 0,
          byRole: {},
          activeRooms: 7,
          activeBots: 62,
          revenueToday: rev.today,
          revenueMonth: rev.month,
          health: 'HEALTHY',
        });
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const healthColor = stats?.health === 'HEALTHY' ? '#00FF88' : stats?.health === 'DEGRADED' ? '#FFD700' : '#FF4444';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 6 }}>ADMIN DASHBOARD</div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, margin: 0 }}>Infinity Loop Observatory</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
            Platform health, revenue, users, bots, and diagnostics.
          </p>
        </div>

        {/* Platform stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'TOTAL USERS',     value: loading ? '…' : String(stats?.totalUsers ?? users.length), color: '#00FFFF', icon: '👥' },
            { label: 'REVENUE TODAY',   value: stats?.revenueToday ?? rev.today,    color: '#FFD700', icon: '💵' },
            { label: 'REV THIS MONTH',  value: stats?.revenueMonth ?? rev.month,    color: '#00FF88', icon: '📈' },
            { label: 'ACTIVE ROOMS',    value: String(stats?.activeRooms ?? 7),     color: '#FF2DAA', icon: '🏟️' },
            { label: 'ACTIVE BOTS',     value: String(stats?.activeBots ?? 62),     color: '#AA2DFF', icon: '🤖' },
            { label: 'PLATFORM HEALTH', value: stats?.health ?? 'HEALTHY',          color: healthColor, icon: '🔋' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20`, borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two columns: Role breakdown + Recent signups */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

          {/* Role breakdown */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>USERS BY ROLE</div>
            {Object.keys(ROLE_COLORS).map((role) => {
              const count = stats?.byRole[role] ?? 0;
              const total = stats?.totalUsers || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={role} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 10 }}>
                    <span style={{ color: ROLE_COLORS[role] ?? '#fff', fontWeight: 700 }}>{role}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{count}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: ROLE_COLORS[role] ?? '#fff', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent signups */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>RECENT SIGNUPS</div>
            {RECENT_SIGNUPS.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < RECENT_SIGNUPS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ROLE_COLORS[u.role] ?? '#fff'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{u.name}</div>
                  <div style={{ fontSize: 9, color: ROLE_COLORS[u.role] ?? '#fff', fontWeight: 700 }}>{u.role}</div>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{u.ts}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bot Runtime Panel */}
        {botHealth && (
          <div style={{ marginBottom: 28, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(170,45,255,0.2)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 800, color: '#AA2DFF' }}>BOT RUNTIME STATUS</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 10 }}>
                <span style={{ color: '#00FF88' }}>✓ {botHealth.healthy} HEALTHY</span>
                <span style={{ color: '#FFD700' }}>◌ {botHealth.degraded} DEGRADED</span>
                <span style={{ color: '#555' }}>· {botHealth.offline} OFFLINE</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {bots.slice(0, 18).map((bot) => (
                <div key={bot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${bot.health === 'HEALTHY' ? '#00FF8814' : bot.health === 'DEGRADED' ? '#FFD70014' : '#33333344'}`, borderRadius: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: bot.health === 'HEALTHY' ? '#00FF88' : bot.health === 'DEGRADED' ? '#FFD700' : '#444', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bot.name}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{bot.category}</div>
                  </div>
                </div>
              ))}
            </div>
            {ghosts.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 800, color: '#FF2DAA', marginBottom: 10 }}>GHOST ARCHETYPES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ghosts.slice(0, 14).map((g) => (
                    <div key={g.id} style={{ padding: '4px 10px', background: `${g.state === 'ACTIVE' ? '#00FF8812' : g.state === 'FADING' ? '#FFD70012' : g.state === 'DORMANT' ? '#22222288' : '#FF2DAA12'}`, border: `1px solid ${g.state === 'ACTIVE' ? '#00FF8830' : '#33333344'}`, borderRadius: 20, fontSize: 9, fontWeight: 700, color: g.state === 'ACTIVE' ? '#00FF88' : g.state === 'FADING' ? '#FFD700' : '#555' }}>
                      {g.name} · {g.state}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Link href="/admin/bot-operations" style={{ fontSize: 10, color: '#AA2DFF', letterSpacing: 1, textDecoration: 'none' }}>View full bot operations →</Link>
            </div>
          </div>
        )}

        {/* Diagnostic quick links */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', fontWeight: 800, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>DIAGNOSTIC PANELS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {DIAG_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={{ padding: '14px 16px', background: `${l.color}08`, border: `1px solid ${l.color}20`, borderRadius: 10, textDecoration: 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: l.color }}>{l.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Status row */}
        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 10, fontSize: 12, color: '#FF4444' }}>
            API: {error}
          </div>
        )}
        {!loading && !error && users.length > 0 && (
          <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 8, fontSize: 11, color: '#00FF88' }}>
            {users.length} user{users.length !== 1 ? 's' : ''} loaded from API
          </div>
        )}

        {/* User management table */}
        <UserManagement users={users} artists={artists} />
      </div>
    </main>
  );
}
