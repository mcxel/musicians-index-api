'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getPlatformSurvivabilitySummary,
  getAllReports,
  registerRoom,
  buildReport,
  type RoomSurvivabilityReport,
  type RoomHealthGrade,
} from '@/lib/runtime/RuntimeSurvivabilityOrchestrator';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

// ── Color maps ────────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<RoomHealthGrade, string> = {
  A: '#00FF88',
  B: '#00FFFF',
  C: '#FFD700',
  D: '#FFA500',
  F: '#FF2DAA',
};

const DECISION_COLOR: Record<string, string> = {
  healthy:      '#00FF88',
  monitor:      '#00FFFF',
  'soft-recover': '#FFD700',
  'hard-recover': '#FFA500',
  quarantine:   '#FF2DAA',
  escalate:     '#FF0044',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreBar(score: number) {
  const color =
    score >= 85 ? '#00FF88' :
    score >= 70 ? '#00FFFF' :
    score >= 55 ? '#FFD700' :
    score >= 30 ? '#FFA500' :
    '#FF2DAA';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
    </div>
  );
}

function chip(label: string, color: string) {
  return (
    <span key={label} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', border: `1px solid ${color}44`, background: `${color}11`, color }}>
      {label.toUpperCase()}
    </span>
  );
}

// ── Seed demo rooms so the page shows useful data immediately ─────────────────

const DEMO_ROOMS: ChatRoomId[] = ['venue-room', 'cypher-arena', 'monthly-idol'];

function ensureDemoRooms() {
  DEMO_ROOMS.forEach((id) => registerRoom(id));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SurvivabilityDiagnosticsPage() {
  const [summary,  setSummary]  = useState<ReturnType<typeof getPlatformSurvivabilitySummary> | null>(null);
  const [reports,  setReports]  = useState<RoomSurvivabilityReport[]>([]);
  const [selected, setSelected] = useState<RoomSurvivabilityReport | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureDemoRooms();
    // Rebuild reports so scores reflect latest watchdog pulse
    DEMO_ROOMS.forEach((id) => buildReport(id));
    setSummary(getPlatformSurvivabilitySummary());
    const all = getAllReports();
    setReports(all);
    if (selected) {
      const updated = all.find((r) => r.roomId === selected.roomId);
      if (updated) setSelected(updated);
    }
    setTick((n) => n + 1);
  }, [selected]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 5_000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const s = summary;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Link href="/admin/diagnostics" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← DIAGNOSTICS
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Runtime Survivability
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Tick #{tick} · Feed staleness · Overlay desync · Room health grades · Quarantine decisions
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              style={{ padding: '8px 16px', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', borderRadius: 8, border: `1px solid ${autoRefresh ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.12)'}`, background: autoRefresh ? 'rgba(0,255,136,0.08)' : 'transparent', color: autoRefresh ? '#00FF88' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            >
              {autoRefresh ? '● AUTO-REFRESH ON' : '○ AUTO-REFRESH OFF'}
            </button>
            <button
              onClick={refresh}
              style={{ padding: '8px 16px', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', borderRadius: 8, border: '1px solid rgba(0,255,255,0.3)', background: 'rgba(0,255,255,0.06)', color: '#00FFFF', cursor: 'pointer' }}
            >
              REFRESH NOW
            </button>
          </div>
        </div>

        {/* Platform summary strip */}
        {s && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'TOTAL ROOMS',      value: s.totalRooms,       color: '#00FFFF' },
              { label: 'HEALTHY',          value: s.healthyRooms,     color: '#00FF88' },
              { label: 'DEGRADED',         value: s.degradedRooms,    color: '#FFD700' },
              { label: 'QUARANTINED',      value: s.quarantinedRooms, color: '#FF2DAA' },
              { label: 'AVG SCORE',        value: `${s.averageScore}/100`, color: s.averageScore >= 85 ? '#00FF88' : s.averageScore >= 55 ? '#FFD700' : '#FF2DAA' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Critical alerts */}
        {s && s.criticalAlerts.length > 0 && (
          <div style={{ marginBottom: 28, background: 'rgba(255,0,68,0.06)', border: '1px solid rgba(255,0,68,0.2)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: '#FF0044', marginBottom: 8 }}>CRITICAL ALERTS</div>
            {s.criticalAlerts.map((a, i) => (
              <div key={i} style={{ fontSize: 11, color: 'rgba(255,100,100,0.85)', marginBottom: 3 }}>⚠ {a}</div>
            ))}
          </div>
        )}

        {/* Room list + detail */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>

          {/* Room list */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>ROOM HEALTH</div>
            {reports.length === 0 && (
              <div style={{ padding: '24px 16px', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                No rooms registered yet — rooms auto-register when users join.
              </div>
            )}
            {reports.map((r) => (
              <div
                key={r.roomId}
                onClick={() => setSelected(selected?.roomId === r.roomId ? null : r)}
                style={{ background: selected?.roomId === r.roomId ? 'rgba(0,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected?.roomId === r.roomId ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 900, color: GRADE_COLOR[r.grade], marginRight: 10 }}>{r.grade}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{r.roomId}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {r.quarantined && chip('QUARANTINED', '#FF2DAA')}
                    {chip(r.decision, DECISION_COLOR[r.decision] ?? '#fff')}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>FEED SCORE</div>
                    {scoreBar(r.feedScore)}
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>OVERLAY SCORE</div>
                    {scoreBar(r.overlayScore)}
                  </div>
                </div>

                {r.alerts.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {r.alerts.map((a) => (
                      <span key={a} style={{ fontSize: 9, color: '#FFA500', background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.2)', borderRadius: 6, padding: '2px 6px' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Room detail panel */}
          {selected && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,255,0.15)', borderRadius: 12, padding: '20px 18px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: GRADE_COLOR[selected.grade], lineHeight: 1 }}>{selected.grade}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{selected.roomId}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { label: 'OVERALL SCORE',  value: selected.overallScore },
                  { label: 'FEED SCORE',     value: selected.feedScore },
                  { label: 'OVERLAY SCORE',  value: selected.overlayScore },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
                    {scoreBar(value)}
                  </div>
                ))}
              </div>

              <div style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'DECISION',      value: selected.decision,      color: DECISION_COLOR[selected.decision] },
                  { label: 'RECOVERY COUNT', value: selected.recoveryCount, color: '#fff' },
                  { label: 'STALE FEEDS',   value: selected.staleFeedCount,  color: selected.staleFeedCount  > 0 ? '#FFA500' : '#00FF88' },
                  { label: 'FROZEN FEEDS',  value: selected.frozenFeedCount, color: selected.frozenFeedCount > 0 ? '#FF2DAA' : '#00FF88' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
                  </div>
                ))}
              </div>

              {selected.quarantined && (
                <div style={{ background: 'rgba(255,45,170,0.06)', border: '1px solid rgba(255,45,170,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#FF2DAA', marginBottom: 4 }}>QUARANTINED</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{selected.quarantineReason ?? 'unknown reason'}</div>
                </div>
              )}

              {selected.desyncedOverlays.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>DESYNCED OVERLAYS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.desyncedOverlays.map((o) => chip(o, '#FFA500'))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>ACTIVE FEEDS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selected.activeFeeds.map((f) => {
                    const [type, status] = f.split(':');
                    const statusColor = status === 'healthy' ? '#00FF88' : status === 'slow' ? '#FFD700' : status === 'stale' ? '#FFA500' : '#FF2DAA';
                    return (
                      <div key={f} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{type}</span>
                        <span style={{ color: statusColor, fontWeight: 700 }}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                Last report: {new Date(selected.generatedAt).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>

        {/* Engine legend */}
        <div style={{ marginTop: 36, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.2)', marginBottom: 14 }}>SURVIVABILITY ENGINE LEGEND</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
            {[
              { name: 'FeedRecoveryEngine', desc: 'Feed staleness · replay · reconnect · reseed', color: '#00FFFF' },
              { name: 'OverlaySyncRepairEngine', desc: 'Desync detection · soft-patch · hard-remount · evict', color: '#AA2DFF' },
              { name: 'RuntimeSurvivabilityOrchestrator', desc: 'Health synthesis · quarantine · escalation · watchdog', color: '#FFD700' },
              { name: 'RuntimeQuarantineMode', desc: 'Room isolation · reason codes · TTL expiry', color: '#FF2DAA' },
            ].map(({ name, desc, color }) => (
              <div key={name} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}22`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
