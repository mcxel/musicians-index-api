'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

type BotStatus = 'RUNNING' | 'IDLE' | 'ERROR' | 'STOPPED';

interface BotDef {
  id: string;
  name: string;
  role: string;
  category: string;
  status: BotStatus;
  lastRun: string;
  jobsToday: number;
  icon: string;
  intervalLabel: string;
}

const INITIAL_BOTS: BotDef[] = [
  { id: 'promo-01',  name: 'Sponsor Placement Bot',     role: 'Places sponsor ads on surfaces',   category: 'PromoBot',      status: 'RUNNING', lastRun: '30 sec ago', jobsToday: 48, icon: '💼', intervalLabel: '30s' },
  { id: 'promo-02',  name: 'Artist Promo Drip Bot',     role: 'Drips artist promo content',       category: 'PromoBot',      status: 'RUNNING', lastRun: '1 min ago',  jobsToday: 24, icon: '🎤', intervalLabel: '60s' },
  { id: 'promo-10',  name: 'Billboard Rotation Bot',    role: 'Rotates billboard ads on HOME_4',  category: 'PromoBot',      status: 'RUNNING', lastRun: '15 sec ago', jobsToday: 192, icon: '🪧', intervalLabel: '15s' },
  { id: 'eng-01',   name: 'Crowd Energy Meter Bot',    role: 'Drives energy meter in live rooms', category: 'EngagementBot', status: 'RUNNING', lastRun: '5 sec ago',  jobsToday: 720, icon: '⚡', intervalLabel: '5s' },
  { id: 'eng-02',   name: 'Live Reaction Bot',          role: 'Fires reaction emotes in rooms',   category: 'EngagementBot', status: 'RUNNING', lastRun: '3 sec ago',  jobsToday: 1440, icon: '🔥', intervalLabel: '3s' },
  { id: 'eng-04',   name: 'Tip Animation Bot',          role: 'Triggers tip shoutout animations', category: 'EngagementBot', status: 'RUNNING', lastRun: '2 sec ago',  jobsToday: 2160, icon: '💰', intervalLabel: '2s' },
  { id: 'eng-09',   name: 'XP Award Bot',               role: 'Calculates and awards XP',         category: 'EngagementBot', status: 'RUNNING', lastRun: '15 sec ago', jobsToday: 192, icon: '🏅', intervalLabel: '15s' },
  { id: 'cnt-01',   name: 'Magazine Cover Editor Bot',  role: 'Updates homepage magazine cover',  category: 'ContentBot',    status: 'RUNNING', lastRun: '2 min ago',  jobsToday: 18, icon: '📖', intervalLabel: '2m' },
  { id: 'cnt-05',   name: 'NFT Metadata Validator Bot', role: 'Validates NFT mint metadata',      category: 'ContentBot',    status: 'RUNNING', lastRun: '45 sec ago', jobsToday: 38, icon: '◈',  intervalLabel: '45s' },
  { id: 'cnt-06',   name: 'Chart Rankings Bot',         role: 'Updates artist/beat charts',       category: 'ContentBot',    status: 'RUNNING', lastRun: '5 min ago',  jobsToday: 6, icon: '📊', intervalLabel: '5m' },
  { id: 'mod-01',   name: 'Chat Moderation Bot',        role: 'Scans chat for violations',        category: 'ModerationBot', status: 'RUNNING', lastRun: '1 sec ago',  jobsToday: 3600, icon: '🛡️', intervalLabel: '1s' },
  { id: 'mod-02',   name: 'Spam Filter Bot',            role: 'Blocks spam accounts & DMs',       category: 'ModerationBot', status: 'RUNNING', lastRun: '5 sec ago',  jobsToday: 720, icon: '🚫', intervalLabel: '5s' },
  { id: 'sup-01',   name: 'Support Ticket Bot',         role: 'Triages and auto-routes tickets',  category: 'SupportBot',    status: 'RUNNING', lastRun: '2 min ago',  jobsToday: 14, icon: '🎫', intervalLabel: '2m' },
  { id: 'news-01',  name: 'News Aggregator Bot',        role: 'Aggregates music news feeds',      category: 'NewsBot',       status: 'RUNNING', lastRun: '10 min ago', jobsToday: 3, icon: '📰', intervalLabel: '10m' },
  { id: 'anal-01',  name: 'Platform Analytics Bot',     role: 'Collects platform-wide stats',     category: 'AnalyticsBot',  status: 'RUNNING', lastRun: '30 sec ago', jobsToday: 48, icon: '📈', intervalLabel: '30s' },
  { id: 'rev-01',   name: 'Revenue Tracker Bot',        role: 'Tracks Stripe + tip revenue',      category: 'RevenueBot',    status: 'RUNNING', lastRun: '1 min ago',  jobsToday: 24, icon: '💵', intervalLabel: '60s' },
  { id: 'rev-02',   name: 'Payout Queue Bot',           role: 'Queues payout approvals',          category: 'RevenueBot',    status: 'IDLE',    lastRun: '1 hr ago',   jobsToday: 2, icon: '💸', intervalLabel: '5m' },
  { id: 'rec-01',   name: 'Session Recovery Bot',       role: 'Recovers dropped live sessions',   category: 'RecoveryBot',   status: 'RUNNING', lastRun: '5 min ago',  jobsToday: 1, icon: '♻️', intervalLabel: '5m' },
  { id: 'sen-01',   name: 'Sentinel Guard Bot',         role: 'Monitors for platform anomalies',  category: 'SentinelBot',   status: 'RUNNING', lastRun: '10 sec ago', jobsToday: 216, icon: '👁️', intervalLabel: '10s' },
  { id: 'sen-02',   name: 'Security Alert Bot',         role: 'Fires security alerts on threats', category: 'SentinelBot',   status: 'RUNNING', lastRun: '30 sec ago', jobsToday: 24, icon: '🔐', intervalLabel: '30s' },
];

const STATUS_COLOR: Record<BotStatus, string> = {
  RUNNING: '#00FF88',
  IDLE: '#FFD700',
  ERROR: '#FF4444',
  STOPPED: '#555',
};

const CAT_COLOR: Record<string, string> = {
  PromoBot: '#FFD700', EngagementBot: '#FF2DAA', ContentBot: '#AA2DFF',
  ModerationBot: '#FF4444', SupportBot: '#00FFFF', NewsBot: '#00FF88',
  AnalyticsBot: '#38bdf8', RevenueBot: '#22c55e', RecoveryBot: '#f97316',
  SentinelBot: '#e879f9',
};

export default function AdminBotsPage() {
  const [bots, setBots] = useState<BotDef[]>(INITIAL_BOTS);
  const [filter, setFilter] = useState<string>('ALL');
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = ['ALL', ...Array.from(new Set(INITIAL_BOTS.map(b => b.category)))];

  const toggleBot = useCallback((id: string) => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      const next: BotStatus = b.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
      setLogs(l => ({ ...l, [id]: [...(l[id] ?? []), `[${new Date().toLocaleTimeString()}] Status changed → ${next}`] }));
      return { ...b, status: next, lastRun: next === 'RUNNING' ? 'just now' : b.lastRun };
    }));
  }, []);

  const restartBot = useCallback((id: string) => {
    setBots(prev => prev.map(b => {
      if (b.id !== id) return b;
      setLogs(l => ({ ...l, [id]: [...(l[id] ?? []), `[${new Date().toLocaleTimeString()}] Restarted`] }));
      return { ...b, status: 'RUNNING', lastRun: 'just now', errorCount: 0 };
    }));
  }, []);

  const viewLogs = useCallback((id: string) => {
    setLogs(l => ({ ...l, [id]: [...(l[id] ?? [`[system] No new logs since boot`]), `[${new Date().toLocaleTimeString()}] Log refresh requested`] }));
    setExpanded(prev => prev === id ? null : id);
  }, []);

  const filtered = filter === 'ALL' ? bots : bots.filter(b => b.category === filter);
  const running = bots.filter(b => b.status === 'RUNNING').length;
  const errors = bots.filter(b => b.status === 'ERROR').length;
  const stopped = bots.filter(b => b.status === 'STOPPED').length;
  const totalJobs = bots.reduce((s, b) => s + b.jobsToday, 0);

  const stopAll = () => setBots(prev => prev.map(b => ({ ...b, status: b.status === 'RUNNING' ? 'STOPPED' : b.status })));
  const startAll = () => setBots(prev => prev.map(b => ({ ...b, status: 'RUNNING', lastRun: 'just now' })));

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: '#666' }}>
        <Link href="/admin" style={{ color: '#666', textDecoration: 'none' }}>← Admin</Link>
        <span>/</span>
        <span style={{ color: '#AA2DFF' }}>Bot Orchestration</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 6 }}>SYSTEM AUTOMATION</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Bot Orchestration</h1>
          <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Monitor, start, stop, and inspect all {INITIAL_BOTS.length} TMI platform bots.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startAll} style={{ padding: '8px 16px', background: '#00FF8822', border: '1px solid #00FF88', color: '#00FF88', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>START ALL</button>
          <button onClick={stopAll} style={{ padding: '8px 16px', background: '#FF444422', border: '1px solid #FF4444', color: '#FF4444', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>STOP ALL</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'TOTAL BOTS', value: bots.length, color: '#fff' },
          { label: 'RUNNING', value: running, color: '#00FF88' },
          { label: 'STOPPED', value: stopped, color: '#555' },
          { label: 'ERRORS', value: errors, color: '#FF4444' },
          { label: 'JOBS TODAY', value: totalJobs.toLocaleString(), color: '#FFD700' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}20`, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 7, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: '5px 14px', borderRadius: 16, border: `1px solid ${filter === c ? (CAT_COLOR[c] ?? '#fff') : '#333'}`, background: filter === c ? `${CAT_COLOR[c] ?? '#fff'}18` : 'transparent', color: filter === c ? (CAT_COLOR[c] ?? '#fff') : '#666', fontSize: 9, fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>

      {/* Bot grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(bot => (
          <div key={bot.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${bot.status === 'ERROR' ? '#FF444440' : bot.status === 'RUNNING' ? `${STATUS_COLOR[bot.status]}15` : '#1a1a2e'}`, borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: STATUS_COLOR[bot.status] }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingLeft: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{bot.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{bot.name}</div>
                  <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>{bot.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ padding: '2px 7px', borderRadius: 6, background: `${STATUS_COLOR[bot.status]}15`, color: STATUS_COLOR[bot.status], fontSize: 7, fontWeight: 900, letterSpacing: 1 }}>{bot.status}</div>
                <div style={{ padding: '1px 6px', borderRadius: 4, background: `${CAT_COLOR[bot.category] ?? '#888'}15`, color: CAT_COLOR[bot.category] ?? '#888', fontSize: 7, letterSpacing: 1 }}>{bot.category}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 9, color: '#555', marginBottom: 12, paddingLeft: 8 }}>
              <span>Last: {bot.lastRun}</span>
              <span>{bot.jobsToday.toLocaleString()} jobs today</span>
              <span>Interval: {bot.intervalLabel}</span>
            </div>

            <div style={{ display: 'flex', gap: 6, paddingLeft: 8 }}>
              <button onClick={() => toggleBot(bot.id)} style={{ flex: 1, padding: '7px', borderRadius: 6, border: `1px solid ${bot.status === 'RUNNING' ? '#FF444440' : '#00FF8840'}`, background: bot.status === 'RUNNING' ? '#FF444410' : '#00FF8810', color: bot.status === 'RUNNING' ? '#FF4444' : '#00FF88', fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>
                {bot.status === 'RUNNING' ? 'STOP' : 'START'}
              </button>
              <button onClick={() => restartBot(bot.id)} style={{ flex: 1, padding: '7px', borderRadius: 6, border: '1px solid #FFD70030', background: '#FFD70008', color: '#FFD700', fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>RESTART</button>
              <button onClick={() => viewLogs(bot.id)} style={{ flex: 1, padding: '7px', borderRadius: 6, border: '1px solid #33334a', background: 'transparent', color: '#888', fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: 1 }}>{expanded === bot.id ? 'HIDE' : 'LOGS'}</button>
            </div>

            {expanded === bot.id && (
              <div style={{ marginTop: 10, padding: '8px 10px', background: '#000', borderRadius: 6, fontFamily: 'monospace', fontSize: 9, color: '#00FF88', maxHeight: 80, overflowY: 'auto' }}>
                {(logs[bot.id] ?? [`[system] Bot ${bot.id} online — interval ${bot.intervalLabel}`]).map((line, i) => (
                  <div key={i} style={{ marginBottom: 2 }}>{line}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
