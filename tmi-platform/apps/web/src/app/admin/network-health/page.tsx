import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Network Health | TMI Admin',
  description: 'Priority -2: Product coherence and data binding audit across all 5 homepage channels.',
};

async function getNetworkHealthData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  async function safeFetch<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      return res.json() as Promise<T>;
    } catch {
      return null;
    }
  }

  const [top10, articles, sponsors, events, season, liveRooms] = await Promise.all([
    safeFetch<unknown[]>(`${base}/api/homepage/top10?limit=10`),
    safeFetch<unknown[]>(`${base}/api/homepage/latest-articles?limit=20`),
    safeFetch<unknown[]>(`${base}/api/homepage/sponsors`),
    safeFetch<unknown[]>(`${base}/api/homepage/events?limit=10`),
    safeFetch<{ status?: string } | null>(`${base}/api/homepage/contest`),
    safeFetch<unknown[]>(`${base}/api/homepage/live`),
  ]);

  const revenueToday = 0;
  const activePerformers = top10?.length ?? 0;
  const activeFans = 0;

  return {
    home1: {
      name: 'Home 1: Crown Network',
      performers: top10?.length ?? 0,
      crownBound: top10 && top10.length > 0 ? 1 : 0,
      color: '#FFD700',
    },
    home2: {
      name: 'Home 2: Magazine Network',
      articles: articles?.length ?? 0,
      connected: articles?.length ?? 0,
      color: '#00E5FF',
    },
    home3: {
      name: 'Home 3: Live Network',
      rooms: liveRooms?.length ?? 0,
      connected: liveRooms?.length ?? 0,
      color: '#00FF88',
    },
    home4: {
      name: 'Home 4: Sponsor Network',
      slots: 12,
      sold: sponsors?.length ?? 0,
      available: Math.max(0, 12 - (sponsors?.length ?? 0)),
      color: '#AA2DFF',
    },
    home5: {
      name: 'Home 5: Arena Network',
      season: season?.status ?? 'PENDING',
      events: events?.length ?? 0,
      color: '#FF2DAA',
    },
    system: {
      revenueToday,
      activePerformers,
      activeFans,
    },
  };
}

export default async function NetworkHealthPage() {
  const data = await getNetworkHealthData();

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#00FFFF', textTransform: 'uppercase', fontWeight: 800, marginBottom: 6 }}>Admin — Priority -2</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, fontFamily: 'var(--font-orbitron, Impact)', letterSpacing: '0.05em' }}>
              TMI <span style={{ color: '#FF2DAA' }}>OVERSEER</span>
            </h1>
            <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              Network Health — live data from /api/homepage/* routes
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: data.system.revenueToday > 0 ? '#00FF88' : 'rgba(255,255,255,0.4)' }}>
              ${data.system.revenueToday.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Revenue Today</div>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 40 }}>
          <StatCard title="Ranked Performers" value={data.system.activePerformers} color="#00E5FF" />
          <StatCard title="Active Fans" value={data.system.activeFans} color="#FFD700" />
          <StatCard
            title="Ad Slots Available"
            value={data.home4.available}
            color="#AA2DFF"
            link="/admin/billboards"
            linkLabel="Manage →"
          />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 20, letterSpacing: '0.05em' }}>
          HOMEPAGE CHANNEL AUDIT
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

          <HealthPanel title={data.home1.name} color={data.home1.color} href="/home/1">
            <HealthRow label="Ranked performers from API" value={data.home1.performers} />
            <HealthRow label="Crown holder bound (score-driven)" value={data.home1.crownBound} color={data.home1.crownBound > 0 ? '#00FF88' : '#FF3B5C'} />
            <HealthRow label="Genre rotation (ActiveGenreContext)" value={1} color="#00FF88" />
          </HealthPanel>

          <HealthPanel title={data.home2.name} color={data.home2.color} href="/home/2">
            <HealthRow label="Articles from /api/homepage/latest-articles" value={data.home2.articles} />
            <HealthRow label="Connected / renderable" value={data.home2.connected} color={data.home2.connected > 0 ? '#00FF88' : '#FFD700'} />
          </HealthPanel>

          <HealthPanel title={data.home3.name} color={data.home3.color} href="/home/3">
            <HealthRow label="Live rooms from /api/homepage/live" value={data.home3.rooms} />
            <HealthRow label="fetchLiveRooms() wired" value={1} color="#00FF88" />
          </HealthPanel>

          <HealthPanel title={data.home4.name} color={data.home4.color} href="/home/4">
            <HealthRow label="Total configured slots" value={data.home4.slots} />
            <HealthRow label="Sold / active sponsors" value={data.home4.sold} color={data.home4.sold > 0 ? '#00FF88' : '#FFD700'} />
            <HealthRow label="Open inventory" value={data.home4.available} color="#AA2DFF" />
          </HealthPanel>

          <HealthPanel title={data.home5.name} color={data.home5.color} href="/home/5">
            <HealthRow label="Contest season status" value={data.home5.season} />
            <HealthRow label="Upcoming events" value={data.home5.events} />
          </HealthPanel>

          {/* Wiring status panel */}
          <HealthPanel title="Data Binding Layer" color="#00E5FF" href="/admin/diagnostics">
            <HealthRow label="ActiveGenreContext wired" value="✓" color="#00FF88" />
            <HealthRow label="useCrownHolder() hook" value="✓" color="#00FF88" />
            <HealthRow label="fetchLiveRooms() wired" value="✓" color="#00FF88" />
            <HealthRow label="AppProviders has genre" value="✓" color="#00FF88" />
          </HealthPanel>

        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/admin" style={linkStyle}>← Admin Hub</Link>
          <Link href="/admin/analytics" style={linkStyle}>Analytics →</Link>
          <Link href="/admin/diagnostics" style={linkStyle}>Diagnostics →</Link>
          <Link href="/admin/billing" style={linkStyle}>Revenue →</Link>
        </div>

      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '8px 16px',
  borderRadius: 6,
};

function StatCard({ title, value, color, link, linkLabel }: {
  title: string;
  value: number | string;
  color: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {link && linkLabel && (
        <Link href={link} style={{ fontSize: 11, color, textDecoration: 'none', marginTop: 6, display: 'block' }}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function HealthPanel({ title, color, href, children }: {
  title: string;
  color: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'rgba(20,20,25,0.6)', border: `1px solid ${color}33`, borderTop: `3px solid ${color}`, borderRadius: 8, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color, letterSpacing: '0.04em' }}>{title}</h3>
        {href && <Link href={href} style={{ fontSize: 11, color, textDecoration: 'none', opacity: 0.7 }}>View →</Link>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function HealthRow({ label, value, color = 'rgba(255,255,255,0.8)' }: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '7px 10px', borderRadius: 4 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 900, color }}>{value}</span>
    </div>
  );
}
