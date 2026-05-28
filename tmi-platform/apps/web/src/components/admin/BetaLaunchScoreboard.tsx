'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Types pulled from the feedback API shape ────────────────────────────────

interface FeedbackSummary {
  total: number;
  automatedPatchQueueDepth: number;
  classTotals: {
    'trust-killer': number;
    'conversion-drag': number;
    polish: number;
  };
  buckets: Array<{
    category: string;
    count: number;
    severity: 'high' | 'medium' | 'low';
    classification: string;
    routedToAutomatedPatchQueue: number;
    lastMessage?: string;
    lastSeen: number;
  }>;
}

interface LiveEntry {
  userId: string;
  displayName: string;
  role?: string;
  viewerCount: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

type GoNoGo = 'GO' | 'WARN' | 'NO-GO' | 'PENDING';

function GoNoGoBadge({ status }: { status: GoNoGo }) {
  const COLOR: Record<GoNoGo, string> = {
    'GO':      '#00FF88',
    'WARN':    '#FFD700',
    'NO-GO':   '#FF2DAA',
    'PENDING': 'rgba(255,255,255,0.3)',
  };
  const c = COLOR[status];
  return (
    <span style={{
      fontSize: 8, fontWeight: 900, letterSpacing: '0.15em',
      color: c, background: `${c}14`, border: `1px solid ${c}44`,
      borderRadius: 3, padding: '2px 6px', whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function KpiCard({
  label, value, color, sublabel,
}: { label: string; value: string | number; color: string; sublabel?: string }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: `${color}07`,
      border: `1px solid ${color}22`,
      borderRadius: 8,
    }}>
      <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 28, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase' }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2, letterSpacing: '0.06em' }}>{sublabel}</div>
      )}
    </div>
  );
}

// ─── System health rows ──────────────────────────────────────────────────────

interface HealthRow {
  system: string;
  status: GoNoGo;
  note: string;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function BetaLaunchScoreboard() {
  const [feedback, setFeedback]   = useState<FeedbackSummary | null>(null);
  const [liveUsers, setLiveUsers] = useState<LiveEntry[]>([]);
  const [authOk, setAuthOk]       = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchAll = useCallback(async () => {
    // Feedback summary
    try {
      const r = await fetch('/api/feedback/report', { cache: 'no-store' });
      if (r.ok) setFeedback(await r.json() as FeedbackSummary);
    } catch {}

    // Live users
    try {
      const r = await fetch('/api/live/go', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json() as { live?: LiveEntry[] };
        setLiveUsers(d.live ?? []);
      }
    } catch {}

    // Auth health
    try {
      const r = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
      setAuthOk(r.ok);
    } catch { setAuthOk(false); }

    setLastRefresh(Date.now());
  }, []);

  useEffect(() => {
    void fetchAll();
    const id = setInterval(() => void fetchAll(), 15_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // ── Derived health rows ────────────────────────────────────────────────────

  const trustKillers   = feedback?.classTotals['trust-killer'] ?? 0;
  const convDrag       = feedback?.classTotals['conversion-drag'] ?? 0;
  const patchQueueDepth = feedback?.automatedPatchQueueDepth ?? 0;
  const totalFeedback  = feedback?.total ?? 0;

  const healthRows: HealthRow[] = [
    {
      system: 'Auth / Session',
      status: authOk === null ? 'PENDING' : authOk ? 'GO' : 'NO-GO',
      note: authOk === null ? 'Checking…' : authOk ? 'Session endpoint responding' : 'Auth endpoint unreachable',
    },
    {
      system: 'Live Rooms',
      status: liveUsers.length >= 0 ? 'GO' : 'WARN',
      note: `${liveUsers.length} user${liveUsers.length !== 1 ? 's' : ''} broadcasting`,
    },
    {
      system: 'Feedback Pipeline',
      status: feedback === null ? 'PENDING' : 'GO',
      note: feedback === null ? 'Connecting…' : `${totalFeedback} reports received`,
    },
    {
      system: 'Trust Killers',
      status: trustKillers === 0 ? 'GO' : trustKillers <= 2 ? 'WARN' : 'NO-GO',
      note: trustKillers === 0 ? 'None active' : `${trustKillers} open — review patch queue`,
    },
    {
      system: 'Patch Queue',
      status: patchQueueDepth === 0 ? 'GO' : patchQueueDepth <= 3 ? 'WARN' : 'NO-GO',
      note: patchQueueDepth === 0 ? 'Clear' : `${patchQueueDepth} item${patchQueueDepth !== 1 ? 's' : ''} awaiting triage`,
    },
    {
      system: 'Stripe / Checkout',
      status: 'PENDING',
      note: 'Connect Stripe webhook for live status',
    },
  ];

  const overallStatus: GoNoGo =
    healthRows.some((r) => r.status === 'NO-GO') ? 'NO-GO'
    : healthRows.some((r) => r.status === 'WARN') ? 'WARN'
    : healthRows.every((r) => r.status === 'GO') ? 'GO'
    : 'PENDING';

  const overallColor: Record<GoNoGo, string> = {
    'GO':      '#00FF88',
    'WARN':    '#FFD700',
    'NO-GO':   '#FF2DAA',
    'PENDING': 'rgba(255,255,255,0.3)',
  };

  // Top buckets to show in trust-killer queue
  const topBuckets = (feedback?.buckets ?? [])
    .filter((b) => b.severity === 'high' || b.classification === 'trust-killer')
    .slice(0, 5);

  return (
    <div style={{ color: '#fff', fontFamily: "'Inter',sans-serif" }}>

      {/* ── Overall status header ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, padding: '14px 18px',
        background: `${overallColor[overallStatus]}08`,
        border: `1px solid ${overallColor[overallStatus]}30`,
        borderRadius: 10,
      }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
            WAVE 1 LAUNCH STATUS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: "'Bebas Neue','Impact',sans-serif",
              fontSize: 32, color: overallColor[overallStatus], lineHeight: 1,
            }}>
              {overallStatus}
            </span>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              Beta Season Active<br />
              <span style={{ color: '#AA2DFF', fontWeight: 700 }}>Wave 1 Burn-In</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 4, letterSpacing: '0.1em' }}>
            LAST REFRESH
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
            {timeAgo(lastRefresh)}
          </div>
          <button
            onClick={() => void fetchAll()}
            style={{
              marginTop: 6, padding: '4px 10px', fontSize: 8, fontWeight: 900,
              border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer', letterSpacing: '0.1em',
              borderRadius: 3,
            }}
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        <KpiCard label="Trust Killers"    value={trustKillers}    color="#FF2DAA"   sublabel="High severity open" />
        <KpiCard label="Conversion Drag"  value={convDrag}        color="#FFD700"   sublabel="Medium severity" />
        <KpiCard label="Patch Queue"      value={patchQueueDepth} color="#AA2DFF"   sublabel="Items awaiting triage" />
        <KpiCard label="Total Reports"    value={totalFeedback}   color="#00FFFF"   sublabel="Beta feedback received" />
        <KpiCard label="Broadcasting"     value={liveUsers.length} color="#00FF88"  sublabel="Users live right now" />
      </div>

      {/* ── System health grid ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
          SYSTEM HEALTH
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {healthRows.map((row) => (
            <div key={row.system} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', minWidth: 130 }}>{row.system}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{row.note}</span>
              </div>
              <GoNoGoBadge status={row.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust-killer queue ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.25em', color: '#FF2DAA' }}>
            TRUST KILLER QUEUE
          </div>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            {topBuckets.length === 0 ? 'CLEAR' : `${topBuckets.length} OPEN`}
          </span>
        </div>

        {topBuckets.length === 0 ? (
          <div style={{
            padding: '20px', textAlign: 'center',
            background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)',
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>✓</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#00FF88' }}>No trust killers active</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              Wave 1 burn-in is clean
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {topBuckets.map((b) => (
              <div key={b.category} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(255,45,170,0.05)',
                border: '1px solid rgba(255,45,170,0.18)',
                borderRadius: 6, gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 900, letterSpacing: '0.12em',
                      color: b.severity === 'high' ? '#FF2DAA' : '#FFD700',
                      background: b.severity === 'high' ? 'rgba(255,45,170,0.12)' : 'rgba(255,215,0,0.12)',
                      border: `1px solid ${b.severity === 'high' ? 'rgba(255,45,170,0.3)' : 'rgba(255,215,0,0.3)'}`,
                      borderRadius: 3, padding: '1px 5px',
                    }}>
                      {b.severity.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                      {b.category.replace(/-/g, ' ')}
                    </span>
                    <span style={{ fontSize: 9, color: '#FF2DAA', fontWeight: 900 }}>×{b.count}</span>
                  </div>
                  {b.lastMessage && (
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      &quot;{b.lastMessage}&quot;
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                    {timeAgo(b.lastSeen)}
                  </div>
                  {b.routedToAutomatedPatchQueue > 0 && (
                    <div style={{ fontSize: 7, color: '#AA2DFF', fontWeight: 800, marginTop: 2, letterSpacing: '0.08em' }}>
                      IN PATCH QUEUE
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Operator quick links ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { href: '/admin/overseer',     label: 'OVERSEER DECK',    color: '#00FFFF' },
          { href: '/admin/observatory',   label: 'OBSERVATORY',      color: '#AA2DFF' },
          { href: '/admin/live',          label: 'CONTROL ROOM',     color: '#FF2DAA' },
          { href: '/admin/revenue',       label: 'REVENUE',          color: '#FFD700' },
          { href: '/admin/launch-gates',  label: 'LAUNCH GATES',     color: '#00FF88' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: '7px 14px', borderRadius: 4, fontSize: 8, fontWeight: 900,
              border: `1px solid ${l.color}33`,
              background: `${l.color}08`,
              color: l.color, textDecoration: 'none', letterSpacing: '0.12em',
            }}
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
