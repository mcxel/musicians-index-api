'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getEventLog,
  getEventSummary,
  emitEvent,
  Analytics,
  type PersonaAnalyticsEvent,
  type PersonaEventSummary,
} from '@/lib/analytics/PersonaAnalyticsEngine';
import { PERSONA_META, type PersonaType } from '@/lib/identity/MultiPersonaEngine';

const PERSONA_COLORS: Record<string, string> = {
  fan:          '#FF2DAA',
  artist:       '#00FFFF',
  producer:     '#AA2DFF',
  performer:    '#FFD700',
  dj:           '#FF6B1A',
  host:         '#00FF88',
  sponsor:      '#FFD700',
  advertiser:   '#FFA500',
  venue:        '#7C3AED',
  'group-member': '#06B6D4',
  admin:        '#FF6B1A',
  moderator:    '#F59E0B',
};

const DOMAIN_ICONS: Record<string, string> = {
  xp:          '⭐',
  revenue:     '💰',
  storefront:  '🛒',
  engagement:  '❤️',
  moderation:  '🛡️',
  livestream:  '📡',
  ranking:     '🏆',
  group:       '👥',
  session:     '🔄',
  diagnostics: '🔧',
  advertiser:  '📢',
  sponsor:     '🤝',
  contest:     '⚡',
};

export default function PersonaAnalyticsDiagnosticsPage() {
  const [summary,  setSummary]  = useState<PersonaEventSummary | null>(null);
  const [events,   setEvents]   = useState<PersonaAnalyticsEvent[]>([]);
  const [filter,   setFilter]   = useState<string>('all');
  const [autoFire, setAutoFire] = useState(false);
  const [ticker,   setTicker]   = useState(0);

  const refresh = useCallback(() => {
    setSummary(getEventSummary());
    setEvents(getEventLog({ limit: 50 }));
    setTicker((n) => n + 1);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-fire synthetic events for demo/testing
  useEffect(() => {
    if (!autoFire) return;
    const personas: PersonaType[] = ['fan', 'artist', 'producer', 'performer', 'dj', 'sponsor'];
    const domains = ['xp', 'revenue', 'engagement', 'ranking', 'session'] as const;
    const interval = setInterval(() => {
      const persona = personas[Math.floor(Math.random() * personas.length)];
      const domain  = domains[Math.floor(Math.random() * domains.length)];
      emitEvent({
        eventName:             `${domain}.synthetic_test`,
        domain,
        value:                 Math.floor(Math.random() * 100),
        activePersonaOverride: persona,
      });
      refresh();
    }, 800);
    return () => clearInterval(interval);
  }, [autoFire, refresh]);

  function fireTestSwitch() {
    Analytics.personaSwitch({ from: 'fan', to: 'artist' });
    refresh();
  }

  function fireTestXP() {
    Analytics.xp({ delta: 250, source: 'manual-test', activePersona: 'artist' });
    refresh();
  }

  function fireTestRevenue() {
    Analytics.revenue({ amount: 4.99, product: 'beat-purchase', activePersona: 'producer' });
    refresh();
  }

  const filteredEvents = filter === 'all'
    ? events
    : events.filter((e) => e.activePersona === filter || e.domain === filter);

  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '40px 24px', fontFamily: 'inherit', color: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Link href="/admin/diagnostics/governance" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            ← Governance
          </Link>
          <Link href="/admin/observatory" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            Observatory →
          </Link>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#AA2DFF', marginBottom: 4 }}>
          Persona Analytics Diagnostics
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
          Live event telemetry tagged by active persona · tick #{ticker}
        </p>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          <div style={cardStyle('#AA2DFF')}>
            <div style={labelStyle()}>Total Events</div>
            <div style={bigNumStyle('#AA2DFF')}>{summary?.totalEvents ?? 0}</div>
          </div>
          {summary && Object.entries(summary.byPersona).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([persona, count]) => (
            <div key={persona} style={cardStyle(PERSONA_COLORS[persona] ?? '#fff')}>
              <div style={labelStyle()}>{PERSONA_META[persona as PersonaType]?.label ?? persona}</div>
              <div style={bigNumStyle(PERSONA_COLORS[persona] ?? '#fff')}>{count}</div>
            </div>
          ))}
        </div>

        {/* Domain breakdown */}
        {summary && Object.keys(summary.byDomain).length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Events by Domain</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {Object.entries(summary.byDomain).sort((a, b) => b[1] - a[1]).map(([domain, count]) => (
                <div key={domain} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px' }}>
                  <span>{DOMAIN_ICONS[domain] ?? '•'}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{domain}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#AA2DFF' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={refresh}       style={btnStyle('#00FFFF')}>↺ Refresh</button>
          <button onClick={fireTestSwitch} style={btnStyle('#FF2DAA')}>Fire: persona_switch</button>
          <button onClick={fireTestXP}    style={btnStyle('#AA2DFF')}>Fire: xp.earned</button>
          <button onClick={fireTestRevenue} style={btnStyle('#FFD700')}>Fire: revenue.received</button>
          <button
            onClick={() => setAutoFire((v) => !v)}
            style={btnStyle(autoFire ? '#FF4D4D' : '#00FF88')}
          >
            {autoFire ? '⏹ Stop Auto-Fire' : '▶ Auto-Fire (800ms)'}
          </button>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {['all', 'fan', 'artist', 'producer', 'xp', 'revenue', 'session', 'engagement'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:      '4px 12px',
                borderRadius: 20,
                border:       `1px solid ${filter === f ? '#AA2DFF' : 'rgba(255,255,255,0.12)'}`,
                background:   filter === f ? 'rgba(170,45,255,0.15)' : 'transparent',
                color:        filter === f ? '#AA2DFF' : 'rgba(255,255,255,0.4)',
                fontSize:     11,
                fontWeight:   700,
                cursor:       'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Event log */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Event Log ({filteredEvents.length} shown)
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
              max 50 · rolling
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div style={{ padding: 24, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
              No events yet — fire one above or switch personas using the HUD.
            </div>
          ) : (
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {filteredEvents.map((evt) => {
                const color = PERSONA_COLORS[evt.activePersona] ?? '#fff';
                return (
                  <div key={evt.eventId} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                      {new Date(evt.ts).toISOString().slice(11, 19)}
                    </span>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{evt.eventName}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        {DOMAIN_ICONS[evt.domain]} {evt.domain}
                        {evt.value !== undefined && <span style={{ marginLeft: 8, color: '#FFD700' }}>+{evt.value}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}14`, padding: '2px 8px', borderRadius: 5, textAlign: 'center' }}>
                      {evt.activePersona}
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textAlign: 'right' }}>
                      {evt.eventId.slice(-8)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Architecture note */}
        <div style={{ marginTop: 28, background: 'rgba(170,45,255,0.05)', border: '1px solid rgba(170,45,255,0.2)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#AA2DFF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Integration Points
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'PersonaSwitcher.tsx — fires session.persona_switch on every switch',
              'Analytics.xp() — wire into XP award calls with activePersona',
              'Analytics.revenue() — wire into Stripe webhook for per-persona revenue',
              'Analytics.vote() — wire into vote submission handlers',
              'Analytics.contestEntry() — wire into battle/cypher/game entry flows',
              'Analytics.livestreamEvent() — wire into PerformerStageControlEngine',
              'Analytics.ranking() — wire into crown/chart update events',
              '_dispatch() — replace stub with PostHog / Mixpanel / Amplitude SDK',
            ].map((point) => (
              <div key={point} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#AA2DFF', marginTop: 1 }}>→</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function cardStyle(color: string): React.CSSProperties {
  return {
    background:   `${color}08`,
    border:       `1px solid ${color}30`,
    borderRadius: 10,
    padding:      '14px 16px',
  };
}

function labelStyle(): React.CSSProperties {
  return { fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 };
}

function bigNumStyle(color: string): React.CSSProperties {
  return { fontSize: 28, fontWeight: 900, color };
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding:      '8px 14px',
    borderRadius: 8,
    border:       `1px solid ${color}44`,
    background:   `${color}14`,
    color,
    fontSize:     11,
    fontWeight:   700,
    cursor:       'pointer',
  };
}
