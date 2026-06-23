'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  BOT_ACCOUNT_REGISTRY,
  getActiveBots,
  getDisplacedBots,
  type BotAccount,
  type BotAccountStatus,
} from '@/lib/bots/BotAccountRegistry';
import { RANKING_CATEGORIES } from '@/lib/bots/RankingOccupancyEngine';
import {
  runBotDisplacementSimulation,
  DEFAULT_SIM_USERS,
  type SimulationEvent,
  type SimulationResult,
  type SimulatedUser,
} from '@/lib/bots/BotRosterSimulator';

type FilterTab = 'ALL' | 'ACTIVE' | 'DISPLACED' | 'RETIRED';
type MainTab = 'ROSTER' | 'SIMULATION' | 'HEALTH';

const TIER_COLOR: Record<string, string> = {
  FREE:     '#888',
  PRO:      '#00BBFF',
  RUBY:     '#FF3366',
  SILVER:   '#B8C8D8',
  GOLD:     '#FFD700',
  PLATINUM: '#E8F0FF',
  DIAMOND:  '#00FFFF',
};

const STATUS_COLOR: Record<BotAccountStatus, string> = {
  ACTIVE:    '#00FF88',
  DISPLACED: '#FF8800',
  RETIRED:   '#555',
};

const EVENT_COLOR: Record<SimulationEvent['type'], string> = {
  XP_GAINED:          '#888',
  BOT_CHALLENGED:     '#FF8800',
  BOT_DISPLACED:      '#00FF88',
  SEAT_HELD:          '#00BBFF',
  USER_ENTERED_TOP3:  '#FFD700',
};

const EVENT_ICON: Record<SimulationEvent['type'], string> = {
  XP_GAINED:          '⚡',
  BOT_CHALLENGED:     '⚔️',
  BOT_DISPLACED:      '🏆',
  SEAT_HELD:          '🪑',
  USER_ENTERED_TOP3:  '👑',
};

function BotCard({ bot }: { bot: BotAccount }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: '#0a0614',
          border: `2px solid ${TIER_COLOR[bot.tier] ?? '#555'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>🤖</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#FF2DAA', background: 'rgba(255,45,170,0.12)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(255,45,170,0.3)' }}>[BOT]</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{bot.displayName}</span>
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{bot.id}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 20, background: STATUS_COLOR[bot.status] + '22', color: STATUS_COLOR[bot.status], border: `1px solid ${STATUS_COLOR[bot.status]}55` }}>{bot.status}</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 20, background: (TIER_COLOR[bot.tier] ?? '#555') + '22', color: TIER_COLOR[bot.tier] ?? '#555', border: `1px solid ${(TIER_COLOR[bot.tier] ?? '#555')}55` }}>{bot.tier}</span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.5 }}>{bot.bio}</p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {bot.genres.map((g) => (
          <span key={g} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,229,255,0.08)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.2)' }}>{g}</span>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#888' }}>Provisional XP</span>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
            {bot.provisionalScore.toLocaleString()} / {bot.humanTakeoverThreshold.toLocaleString()} to displace
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, (bot.provisionalScore / bot.humanTakeoverThreshold) * 100)}%`, background: TIER_COLOR[bot.tier] ?? '#555', borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {bot.assignments.map((a) => (
          <span key={`${a.category}-${a.rankPosition}`} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {a.category} #{a.rankPosition}
          </span>
        ))}
      </div>

      {bot.status === 'DISPLACED' && (
        <div style={{ fontSize: 11, color: '#FF8800', background: 'rgba(255,136,0,0.08)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,136,0,0.2)' }}>
          Displaced by <code style={{ fontSize: 11 }}>{bot.displacedByUserId}</code>
          {bot.displacedAt ? ` on ${new Date(bot.displacedAt).toLocaleDateString()}` : ''}
        </div>
      )}

      <Link href={bot.profileRoute} style={{ fontSize: 11, color: '#00E5FF', textDecoration: 'none', fontWeight: 600 }}>
        View Bot Profile →
      </Link>
    </div>
  );
}

function SimulationPanel() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [ticks, setTicks] = useState(20);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const runSim = useCallback(() => {
    setRunning(true);
    // Clone users so XP starts at 0 each run
    const users: SimulatedUser[] = DEFAULT_SIM_USERS.map((u) => ({ ...u, xp: 0 }));
    // Small delay so UI can update
    setTimeout(() => {
      const r = runBotDisplacementSimulation(users, ticks);
      setResult(r);
      setRunning(false);
    }, 50);
  }, [ticks]);

  const significantEvents = result?.events.filter(
    (e) => e.type !== 'XP_GAINED' && e.type !== 'SEAT_HELD'
  ) ?? [];
  const visibleEvents = showAllEvents ? significantEvents : significantEvents.slice(0, 20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Controls */}
      <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 12, padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: '#00E5FF' }}>
          Orbital Displacement Simulator
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>
          Simulates {DEFAULT_SIM_USERS.length} real users earning XP and challenging bot-held ranking seats.
          Verifies the in/out flow for the orbital wheel — bots are displaced, humans rise, seats flip ownership.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#aaa' }}>Activity Ticks:</label>
            <select
              value={ticks}
              onChange={(e) => setTicks(Number(e.target.value))}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            >
              {[10, 20, 30, 50, 100].map((n) => <option key={n} value={n}>{n} ticks (fast)</option>)}
            </select>
          </div>
          <button
            onClick={runSim}
            disabled={running}
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: running ? 'not-allowed' : 'pointer',
              background: running ? 'rgba(0,229,255,0.1)' : 'rgba(0,229,255,0.2)',
              border: '1px solid rgba(0,229,255,0.4)', color: '#00E5FF',
              letterSpacing: 0.5,
            }}
          >
            {running ? '⏳ Running…' : '▶ Run Simulation'}
          </button>
          {result && (
            <button
              onClick={() => setResult(null)}
              style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#888' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { label: 'Ticks Run', value: result.totalTicks, color: '#00E5FF' },
              { label: 'Bots Displaced', value: result.displacementsCompleted, color: '#00FF88' },
              { label: 'Human Seats', value: result.humanSeats, color: '#FFD700' },
              { label: 'Bot Seats Left', value: result.botSeats, color: '#FF8800' },
              { label: 'Total Events', value: result.events.length, color: '#B8C8D8' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Event log */}
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Significant Events {significantEvents.length > 20 && !showAllEvents && `(showing 20 of ${significantEvents.length})`}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {visibleEvents.length === 0 && (
                <div style={{ fontSize: 13, color: '#555', padding: '20px 0', textAlign: 'center' }}>
                  No displacement events — increase tick count to see more activity.
                </div>
              )}
              {visibleEvents.map((ev, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${EVENT_COLOR[ev.type]}22`,
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{EVENT_ICON[ev.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: EVENT_COLOR[ev.type], fontWeight: ev.type === 'BOT_DISPLACED' ? 800 : 400 }}>
                      {ev.message}
                    </div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Tick {ev.tick}</div>
                  </div>
                </div>
              ))}
            </div>
            {significantEvents.length > 20 && (
              <button
                onClick={() => setShowAllEvents(!showAllEvents)}
                style={{ marginTop: 10, padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#aaa' }}
              >
                {showAllEvents ? 'Show fewer' : `Show all ${significantEvents.length} events`}
              </button>
            )}
          </div>

          {/* Final roster */}
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#fff' }}>Final Roster State</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
              {result.finalRoster.map((seat, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8,
                  background: seat.type === 'HUMAN' ? 'rgba(0,255,136,0.05)' : 'rgba(255,136,0,0.04)',
                  border: `1px solid ${seat.type === 'HUMAN' ? 'rgba(0,255,136,0.2)' : 'rgba(255,136,0,0.15)'}`,
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 16 }}>{seat.type === 'HUMAN' ? '👤' : '🤖'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: seat.type === 'HUMAN' ? '#00FF88' : '#FF8800' }}>
                      {seat.category.toUpperCase()} #{seat.position}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{seat.occupant}</div>
                    {seat.score > 0 && <div style={{ fontSize: 10, color: '#555' }}>{seat.score.toLocaleString()} XP</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthPanel() {
  type ProbeResult = { route: string; status: 'OK' | 'WARN' | 'FAIL'; note: string; category: string; label: string };
  const [probeResults, setProbeResults] = useState<ProbeResult[] | null>(null);
  const [probing, setProbing] = useState(false);

  type ProbeCategory = 'Core' | 'Auth/Stripe' | 'Live/Seating' | 'Video/Audio' | 'Feeds/Images' | 'Hosts/Venues' | 'Home Pages';
  type ProbeEntry = { route: string; category: ProbeCategory; label: string };

  const PROBE_ROUTES: ProbeEntry[] = [
    // Core
    { route: '/api/health', category: 'Core', label: 'Health check' },
    // Auth / Stripe
    { route: '/api/auth/session', category: 'Auth/Stripe', label: 'Auth session' },
    { route: '/api/stripe/products', category: 'Auth/Stripe', label: 'Stripe products' },
    // Live / Seating
    { route: '/api/live/go', category: 'Live/Seating', label: 'Live session registry' },
    { route: '/api/live/audience', category: 'Live/Seating', label: 'Audience seat engine' },
    { route: '/live/lobby', category: 'Live/Seating', label: 'Live lobby page' },
    // Video / Audio
    { route: '/api/live/stream-token', category: 'Video/Audio', label: 'Stream token (video)' },
    { route: '/sounds/crowd-cheer.mp3', category: 'Video/Audio', label: 'Sound: crowd cheer' },
    { route: '/sounds/level-up.mp3', category: 'Video/Audio', label: 'Sound: level-up' },
    // Feeds / Images
    { route: '/api/performers', category: 'Feeds/Images', label: 'Performer feed' },
    { route: '/api/magazine/articles', category: 'Feeds/Images', label: 'Magazine article feed' },
    { route: '/tmi-curated/julius.png', category: 'Feeds/Images', label: 'Host portrait: Julius' },
    { route: '/tmi-curated/host-main.png', category: 'Feeds/Images', label: 'Host portrait: Main host' },
    { route: '/images/tmi-placeholder.jpg', category: 'Feeds/Images', label: 'Performer image fallback' },
    // Hosts / Venues
    { route: '/api/hosts', category: 'Hosts/Venues', label: 'Host registry API' },
    { route: '/api/venues', category: 'Hosts/Venues', label: 'Venue registry API' },
    { route: '/venues', category: 'Hosts/Venues', label: 'Venues page' },
    { route: '/bots', category: 'Hosts/Venues', label: 'Bot profiles page' },
    // Home Pages
    { route: '/home/1', category: 'Home Pages', label: 'Home 1 — Crown' },
    { route: '/home/2', category: 'Home Pages', label: 'Home 2 — Magazine' },
    { route: '/home/3', category: 'Home Pages', label: 'Home 3 — Live World' },
    { route: '/home/4', category: 'Home Pages', label: 'Home 4 — Marketplace' },
    { route: '/home/5', category: 'Home Pages', label: 'Home 5 — Arena' },
  ];

  const runProbes = useCallback(async () => {
    setProbing(true);
    const results = await Promise.all(
      PROBE_ROUTES.map(async ({ route, category, label }) => {
        try {
          const res = await fetch(route, { cache: 'no-store' });
          if (res.ok) return { route, category, label, status: 'OK' as const, note: `HTTP ${res.status}` };
          if (res.status === 401 || res.status === 403) return { route, category, label, status: 'WARN' as const, note: `HTTP ${res.status} (auth required)` };
          if (res.status === 404) return { route, category, label, status: 'WARN' as const, note: `HTTP 404 — route or asset missing` };
          if (res.status < 500) return { route, category, label, status: 'WARN' as const, note: `HTTP ${res.status}` };
          return { route, category, label, status: 'FAIL' as const, note: `HTTP ${res.status}` };
        } catch (err) {
          return { route, category, label, status: 'FAIL' as const, note: String(err).slice(0, 80) };
        }
      })
    );
    setProbeResults(results);
    setProbing(false);
  }, []);

  const OK_COLOR = '#00FF88';
  const WARN_COLOR = '#FF8800';
  const FAIL_COLOR = '#FF3366';
  const statusColor = (s: 'OK' | 'WARN' | 'FAIL') =>
    s === 'OK' ? OK_COLOR : s === 'WARN' ? WARN_COLOR : FAIL_COLOR;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.15)', borderRadius: 12, padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: '#FF2DAA' }}>Platform Health Probe</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888', lineHeight: 1.5 }}>
          Pings critical routes from the browser to verify they return real responses.
          Failed routes are flagged for developer review. Results are client-side only — no external service needed.
        </p>
        <button
          onClick={runProbes}
          disabled={probing}
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: probing ? 'not-allowed' : 'pointer',
            background: probing ? 'rgba(255,45,170,0.1)' : 'rgba(255,45,170,0.2)',
            border: '1px solid rgba(255,45,170,0.4)', color: '#FF2DAA',
          }}
        >
          {probing ? '⏳ Probing…' : '🔍 Run Health Probe'}
        </button>
      </div>

      {probeResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary banner */}
          {(() => {
            const fails = probeResults.filter((r) => r.status === 'FAIL').length;
            const warns = probeResults.filter((r) => r.status === 'WARN').length;
            const ok = probeResults.filter((r) => r.status === 'OK').length;
            if (fails > 0) {
              return (
                <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.25)', fontSize: 13, color: '#FF3366', lineHeight: 1.6 }}>
                  <strong>⚠ {fails} failure{fails > 1 ? 's' : ''} detected</strong> — {warns} warning{warns !== 1 ? 's' : ''}, {ok} OK.
                  Check the dev console or run <code style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>pnpm typecheck</code> from repo root.
                </div>
              );
            }
            if (warns > 0) {
              return (
                <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(255,136,0,0.06)', border: '1px solid rgba(255,136,0,0.2)', fontSize: 13, color: '#FF8800' }}>
                  ⚠ {warns} warning{warns !== 1 ? 's' : ''} — {ok} routes OK. Warnings are usually auth gates or missing optional assets.
                </div>
              );
            }
            return (
              <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', fontSize: 13, color: '#00FF88' }}>
                ✅ All {ok} probed routes responded successfully. Core platform is healthy.
              </div>
            );
          })()}

          {/* Group by category */}
          {Array.from(new Set(probeResults.map((r) => r.category))).map((cat) => {
            const catResults = probeResults.filter((r) => r.category === cat);
            return (
              <div key={cat}>
                <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>
                  {cat}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {catResults.map((r) => (
                    <div key={r.route} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.02)', border: `1px solid ${statusColor(r.status)}18`,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor(r.status), flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: '#bbb', flex: 1 }}>{r.label || r.route}</span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#555' }}>{r.route}</span>
                      <span style={{ fontSize: 11, color: statusColor(r.status), fontWeight: 700, minWidth: 36, textAlign: 'right' }}>{r.status}</span>
                      <span style={{ fontSize: 10, color: '#555', minWidth: 120, textAlign: 'right' }}>{r.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminBotRosterPage() {
  const [mainTab, setMainTab] = useState<MainTab>('ROSTER');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredBots = BOT_ACCOUNT_REGISTRY.filter((bot) => {
    const statusMatch = activeTab === 'ALL' || bot.status === activeTab;
    const categoryMatch = categoryFilter === 'all' || bot.assignments.some((a) => a.category === categoryFilter);
    return statusMatch && categoryMatch;
  });

  const activeCount = getActiveBots().length;
  const displacedCount = getDisplacedBots().length;
  const totalSeats = BOT_ACCOUNT_REGISTRY.length;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', padding: '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
        <Link href="/admin" style={{ color: '#00E5FF', textDecoration: 'none' }}>Admin</Link>
        <span>›</span>
        <Link href="/admin/bots" style={{ color: '#00E5FF', textDecoration: 'none' }}>Bots</Link>
        <span>›</span>
        <span style={{ color: '#fff' }}>Roster</span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, margin: 0, background: 'linear-gradient(90deg, #00E5FF, #FF2DAA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bot Performer Roster
        </h1>
        <p style={{ marginTop: 6, color: '#888', fontSize: 14, margin: '6px 0 0' }}>
          Provisional ranking-seat holders. Real users displace bots by earning more XP.
        </p>
      </div>

      {/* Stats rail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Slots', value: totalSeats, color: '#00E5FF' },
          { label: 'Active (Bot-held)', value: activeCount, color: '#00FF88' },
          { label: 'Displaced (Human)', value: displacedCount, color: '#FF8800' },
          { label: 'Categories', value: RANKING_CATEGORIES.length, color: '#FFD700' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
        {([['ROSTER', '🤖 Bot Roster'], ['SIMULATION', '▶ Simulation'], ['HEALTH', '🔍 Health Probe']] as [MainTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: mainTab === tab ? 800 : 400,
              cursor: 'pointer',
              border: 'none',
              borderBottom: mainTab === tab ? '2px solid #00E5FF' : '2px solid transparent',
              background: 'transparent',
              color: mainTab === tab ? '#00E5FF' : '#888',
              transition: 'all 150ms',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Roster tab */}
      {mainTab === 'ROSTER' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['ALL', 'ACTIVE', 'DISPLACED', 'RETIRED'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer',
                    border: '1px solid', borderColor: activeTab === tab ? '#00E5FF' : 'rgba(255,255,255,0.12)',
                    background: activeTab === tab ? 'rgba(0,229,255,0.15)' : 'transparent',
                    color: activeTab === tab ? '#00E5FF' : '#888',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}
            >
              <option value="all">All Categories</option>
              {RANKING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', '/')}</option>
              ))}
            </select>

            <span style={{ fontSize: 12, color: '#555', marginLeft: 'auto' }}>
              {filteredBots.length} bot{filteredBots.length !== 1 ? 's' : ''} shown
            </span>
          </div>

          {filteredBots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#555', fontSize: 14 }}>
              No bots match the current filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {filteredBots.map((bot) => <BotCard key={bot.id} bot={bot} />)}
            </div>
          )}
        </>
      )}

      {mainTab === 'SIMULATION' && <SimulationPanel />}
      {mainTab === 'HEALTH' && <HealthPanel />}

      {/* Footer note */}
      <div style={{ marginTop: 48, padding: '16px 20px', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)', borderRadius: 10, fontSize: 12, color: '#888', lineHeight: 1.6 }}>
        <strong style={{ color: '#00E5FF' }}>Bot Takeover Rule:</strong> When a real user&apos;s XP exceeds a bot&apos;s{' '}
        <em>Human Takeover Threshold</em>, the bot is automatically displaced and the seat becomes human-owned.
        Bots never gain XP after placement — they&apos;re always catchable. Every [BOT] label is always visible on public surfaces (Rule 20).
        The Simulation tab lets you test the full in/out flow before real users arrive.
      </div>
    </div>
  );
}
