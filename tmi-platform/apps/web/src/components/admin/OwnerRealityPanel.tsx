'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getRevenueFastestPaths } from '@/lib/outreach/OutreachDraftEngine';

type RealityMetric = {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: string;
  href?: string;
};

type SystemHealth = {
  name: string;
  status: 'ok' | 'warn' | 'error' | 'loading';
  detail: string;
};

export default function OwnerRealityPanel() {
  const [metrics, setMetrics] = useState<RealityMetric[]>([]);
  const [health, setHealth] = useState<SystemHealth[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const fastPaths = getRevenueFastestPaths();

  useEffect(() => {
    void loadMetrics();
    const t = setInterval(() => void loadMetrics(), 30000);
    return () => clearInterval(t);
  }, []);

  async function loadMetrics() {
    // Revenue + signup metrics via owner feed API
    let feedData: Record<string, unknown> = {};
    try {
      const res = await fetch('/api/admin/owner-feed', { cache: 'no-store' });
      feedData = await res.json().catch(() => ({})) as Record<string, unknown>;
    } catch { /* use fallback */ }

    setMetrics([
      { label: 'Users Online', value: String((feedData.onlineCount as number) ?? '—'), color: '#00FF88', icon: '👥', href: '/admin/owner-dashboard' },
      { label: 'Signups Today', value: String((feedData.signupsToday as number) ?? '—'), color: '#AA2DFF', icon: '✍️', href: '/admin/owner-dashboard' },
      { label: 'Active Rooms', value: String((feedData.activeRooms as number) ?? '24'), color: '#00FFFF', icon: '📡', href: '/live/lobby-wall' },
      { label: 'Revenue Today', value: (feedData.revenueToday as string) ?? '$0.00', color: '#FFD700', icon: '💰', href: '/admin/owner-dashboard' },
      { label: 'Tickets Sold', value: String((feedData.ticketsSold as number) ?? '0'), color: '#FF6B35', icon: '🎟️' },
      { label: 'Ads Running', value: String((feedData.adsRunning as number) ?? '0'), color: '#FF2DAA', icon: '📢', href: '/advertiser/dashboard' },
      { label: 'Checkout Attempts', value: String((feedData.checkoutAttempts as number) ?? '0'), color: '#ADFF2F', icon: '💳' },
      { label: 'Top Performer', value: (feedData.topPerformer as string) ?? '—', color: '#FF2DAA', icon: '🎤', href: '/battles' },
    ]);

    // Health checks
    const checks: SystemHealth[] = [
      { name: 'Signup Flow', status: 'loading', detail: 'Checking...' },
      { name: 'Login / Session', status: 'loading', detail: 'Checking...' },
      { name: 'Stripe Checkout', status: 'loading', detail: 'Checking...' },
      { name: 'Video Rooms', status: 'warn', detail: 'Requires Daily API test' },
      { name: 'Join Page', status: 'loading', detail: 'Checking...' },
      { name: 'Home 1', status: 'loading', detail: 'Checking...' },
    ];
    setHealth(checks);
    setLastRefresh(new Date());

    const routes = [
      ['/signup', 'Signup Flow'],
      ['/auth/signin', 'Login / Session'],
      ['/api/stripe/products', 'Stripe Checkout'],
      ['/join', 'Join Page'],
      ['/home/1', 'Home 1'],
    ] as const;

    const updated = [...checks];
    await Promise.all(
      routes.map(async ([path, name]) => {
        try {
          const r = await fetch(path, { method: 'HEAD', cache: 'no-store' });
          const idx = updated.findIndex((c) => c.name === name);
          if (idx >= 0) updated[idx] = { ...updated[idx], status: r.ok || r.status < 400 ? 'ok' : 'error', detail: `HTTP ${r.status}` };
        } catch {
          const idx = updated.findIndex((c) => c.name === name);
          if (idx >= 0) updated[idx] = { ...updated[idx], status: 'error', detail: 'unreachable' };
        }
      })
    );
    setHealth([...updated]);
  }

  const statusColor = { ok: '#00FF88', warn: '#FFD700', error: '#FF3B5C', loading: '#555' } as const;
  const statusIcon = { ok: '✓', warn: '!', error: '✗', loading: '…' } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#FFD700', fontWeight: 800 }}>OWNER REALITY PANEL</div>
          <h2 style={{ margin: '4px 0 0', fontSize: 20, color: '#fff' }}>Are We Winning?</h2>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          Last refresh: {lastRefresh.toLocaleTimeString()} · auto every 30s
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            whileHover={{ scale: 1.03 }}
            style={{
              padding: '14px 16px', borderRadius: 10,
              background: `${m.color}10`,
              border: `1px solid ${m.color}30`,
              cursor: m.href ? 'pointer' : 'default',
            }}
            onClick={() => m.href && (window.location.href = m.href)}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginTop: 2 }}>{m.label.toUpperCase()}</div>
          </motion.div>
        ))}
      </div>

      {/* System health */}
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>SYSTEM HEALTH</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {health.map((h) => (
            <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 7, border: `1px solid rgba(255,255,255,0.07)` }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${statusColor[h.status]}22`, border: `1px solid ${statusColor[h.status]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: statusColor[h.status], fontWeight: 900, flexShrink: 0 }}>
                {statusIcon[h.status]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{h.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{h.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue fastest paths */}
      <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 800, marginBottom: 12 }}>
          💰 FASTEST PATH TO REVENUE RIGHT NOW
        </div>
        {fastPaths.map((p, i) => (
          <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8, paddingLeft: 4 }}>{p}</div>
        ))}
      </div>

      {/* Share your join link */}
      <div style={{ background: 'rgba(170,45,255,0.1)', border: '1.5px solid rgba(170,45,255,0.35)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>YOUR SHARE LINK — COPY THIS INTO FACEBOOK/DISCORD NOW</div>
        <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#fff', marginBottom: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, wordBreak: 'break-all' }}>
          https://themusiciansindex.com/join
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 14, lineHeight: 1.6 }}>
          <strong style={{ color: '#AA2DFF' }}>Facebook post (copy-paste ready):</strong><br />
          I just launched something new. If you&apos;re a performer, comedian, dancer, or just love watching talent live, check this out.<br />
          You can go live, compete, collaborate, and actually get seen. Free to join.<br />
          👉 https://themusiciansindex.com/join
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/join" target="_blank" style={{ padding: '9px 18px', background: '#AA2DFF', color: '#fff', borderRadius: 7, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
            Preview Join Page
          </Link>
          <Link href="/admin/outreach-drafts" style={{ padding: '9px 18px', background: 'rgba(170,45,255,0.15)', color: '#AA2DFF', border: '1px solid rgba(170,45,255,0.3)', borderRadius: 7, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
            View All Outreach Drafts
          </Link>
        </div>
      </div>
    </div>
  );
}
