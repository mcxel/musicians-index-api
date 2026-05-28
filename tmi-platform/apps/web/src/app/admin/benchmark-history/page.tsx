'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  BenchmarkRunRecord,
  BenchmarkRunResult,
  MetricKey,
} from '@/lib/engines/runtime/HumanityBenchmarkHistory';
import type { BenchmarkDiff, WorldTrajectory, TrendReport } from '@/lib/engines/runtime/BenchmarkDiffEngine';
import type { MythRecord } from '@/lib/engines/runtime/MythologyEngine';

// ── Simulation helpers ─────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function generateSimulatedMetrics(index: number): Record<string, unknown> {
  const quality = Math.max(0.4, 1 - index * 0.02 + Math.random() * 0.15);
  const isStress = index % 5 === 0;
  return {
    avatarCount: isStress ? 50 : 20,
    seatedCorrectly: Math.floor((isStress ? 47 : 20) * quality),
    occupancyPercent: Math.min(100, randomBetween(85, 100) * quality),
    friendClusters: Math.floor(randomBetween(3, 7)),
    clusterCohesion: randomBetween(0.7, 0.98),
    reconstructionLatencyMs: Math.floor(randomBetween(80, 300) / quality),
    beatSyncMs: Math.floor(randomBetween(40, 120) / quality),
    rejoinLatencyMs: Math.floor(randomBetween(20, 80)),
    avgRttMs: Math.floor(randomBetween(10, isStress ? 80 : 30)),
    worstRttMs: Math.floor(randomBetween(30, isStress ? 200 : 80)),
    pulseGapCount: isStress ? Math.floor(randomBetween(0, 4)) : 0,
    sentinelAlerts: isStress && Math.random() > 0.7 ? 1 : 0,
    avgCrowdEnergy: randomBetween(0.55, 0.92),
    crowdEnergyVariance: randomBetween(0.02, 0.12),
    peakEnergyReached: randomBetween(0.75, 0.99),
    activeLODLevel: quality > 0.85 ? 'near' : quality > 0.7 ? 'medium' : 'mixed',
    failoverEvents: isStress && Math.random() > 0.8 ? 1 : 0,
    snapshotsCaptured: Math.floor(randomBetween(1, 5)),
    legendaryMomentsDetected: Math.floor(randomBetween(0, 3)),
    attentionSyncPercent: randomBetween(60, 95),
    runtimeVersion: '2.4.0',
    environmentProfile: 'local',
    persistenceTestRan: index % 3 === 0,
    benchmarkRoomId: 'bench-room-alpha',
    snapshotId: `snap-${Date.now().toString(36)}`,
  };
}

// ── Types & constants ─────────────────────────────────────────────────────────

interface PageData {
  history: BenchmarkRunRecord[];
  stats: {
    totalRuns: number; passRate: number; avgOccupancy: number;
    bestOccupancy: number; worstOccupancy: number; avgReconstructionMs: number;
    avgCrowdEnergy: number; totalLegendaryMoments: number; totalMythsGenerated: number;
  };
  health: { trajectory: WorldTrajectory; passRate: number; criticalRegressions: string[]; summary: string };
  latestDiff: BenchmarkDiff | null;
  trendReport: TrendReport[];
  series: Record<string, Array<{ runIndex: number; value: number; result: BenchmarkRunResult }>>;
  trends: Record<string, string>;
  myths: MythRecord[];
}

const RESULT_COLORS: Record<BenchmarkRunResult, string> = {
  pass: '#00FF88', degraded: '#FF9500', fail: '#FF2DAA',
};
const RESULT_ICONS: Record<BenchmarkRunResult, string> = {
  pass: '✓', degraded: '~', fail: '✗',
};
const TRAJECTORY_COLORS: Record<WorldTrajectory, string> = {
  improving: '#00FF88', stable: '#00FFFF', degrading: '#FF2DAA',
  volatile: '#FF9500', 'insufficient-data': 'rgba(255,255,255,0.3)',
};
const TRAJECTORY_ICONS: Record<WorldTrajectory, string> = {
  improving: '↑', stable: '→', degrading: '↓', volatile: '~', 'insufficient-data': '?',
};
const TREND_COLORS: Record<string, string> = {
  improving: '#00FF88', degrading: '#FF2DAA', stable: '#00FFFF', 'insufficient-data': 'rgba(255,255,255,0.3)',
};
const TREND_ARROWS: Record<string, string> = {
  improving: '↑', degrading: '↓', stable: '→', 'insufficient-data': '?',
};

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, color, height = 24, width = 80 }: { values: number[]; color: string; height?: number; width?: number }) {
  if (values.length < 2) return <div style={{ width, height, background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
  const lastX = (values.length - 1) * step;
  const lastY = height - ((values[values.length - 1]! - min) / range) * (height - 2) - 1;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function BenchmarkHistoryPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [selectedRun, setSelectedRun] = useState<BenchmarkRunRecord | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/benchmark-history', { cache: 'no-store' });
    if (res.ok) setData(await res.json() as PageData);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function runSimBatch(count: number) {
    setLoading(true);
    for (let i = 0; i < count; i++) {
      await fetch('/api/admin/benchmark-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'record', metrics: generateSimulatedMetrics(simIndex + i + 1) }),
      });
    }
    setSimIndex((n) => n + count);
    await load();
    setLoading(false);
  }

  async function handleClear() {
    await fetch('/api/admin/benchmark-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    });
    setSelectedRun(null);
    setSimIndex(0);
    await load();
  }

  const stats = data?.stats;
  const health = data?.health;
  const history = data?.history ?? [];
  const myths = data?.myths ?? [];
  const latestDiff = data?.latestDiff ?? null;
  const trendReport = data?.trendReport ?? [];
  const series = data?.series ?? {};
  const healthColor = TRAJECTORY_COLORS[health?.trajectory ?? 'insufficient-data'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0412', color: '#fff', fontFamily: 'monospace', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>
          TMI Admin — Systemic Intelligence
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '0.04em', color: '#00FF88' }}>
          Benchmark History
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', maxWidth: 680 }}>
          Civilization telemetry over time. Without history, you only know "it works now."
          With history, you know when it stopped working — and which metrics caused the regression.
          Runs persist across server restarts.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {[1, 3, 5, 10].map((n) => (
          <button key={n} onClick={() => { void runSimBatch(n); }} disabled={loading} style={{
            padding: '9px 16px', background: loading ? 'rgba(0,255,136,0.3)' : '#00FF88',
            border: 'none', borderRadius: 6, color: '#0a0412',
            fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', cursor: loading ? 'default' : 'pointer', textTransform: 'uppercase',
          }}>
            {loading ? '…' : `+${n} Run${n > 1 ? 's' : ''}`}
          </button>
        ))}
        <button onClick={() => { void handleClear(); }} style={{
          padding: '9px 16px', background: 'rgba(255,45,170,0.12)', border: '1px solid rgba(255,45,170,0.3)',
          borderRadius: 6, color: '#FF2DAA', fontSize: 9, fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase',
        }}>Clear</button>

        {stats && (
          <div style={{ marginLeft: 12, display: 'flex', gap: 16 }}>
            {[
              { label: 'Total Runs', value: stats.totalRuns, color: '#00FF88' },
              { label: 'Pass Rate', value: `${stats.passRate}%`, color: stats.passRate >= 80 ? '#00FF88' : stats.passRate >= 60 ? '#FF9500' : '#FF2DAA' },
              { label: 'Avg Occupancy', value: `${stats.avgOccupancy}%`, color: '#00FFFF' },
              { label: 'Avg Recon', value: `${stats.avgReconstructionMs}ms`, color: '#AA2DFF' },
              { label: 'Myths', value: stats.totalMythsGenerated, color: '#FFD700' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* System health banner */}
          {health && (
            <div style={{ background: `${healthColor}12`, border: `1px solid ${healthColor}44`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: healthColor }}>{TRAJECTORY_ICONS[health.trajectory]}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: healthColor, textTransform: 'capitalize' }}>
                    System {health.trajectory === 'insufficient-data' ? 'Awaiting Data' : health.trajectory}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{health.summary}</div>
                </div>
                {health.criticalRegressions.length > 0 && (
                  <div style={{ marginLeft: 'auto', background: 'rgba(255,45,170,0.15)', border: '1px solid rgba(255,45,170,0.4)', borderRadius: 6, padding: '6px 12px' }}>
                    <div style={{ fontSize: 8, color: '#FF2DAA', fontWeight: 900, textTransform: 'uppercase' }}>Critical Regressions</div>
                    {health.criticalRegressions.map((r) => <div key={r} style={{ fontSize: 9, color: '#FF2DAA' }}>⚠ {r}</div>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sparklines */}
          {Object.keys(series).length > 0 && history.length > 1 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>
                Key Metric Sparklines
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { key: 'occupancyPercent', label: 'Seat Occupancy %', color: '#00FF88' },
                  { key: 'reconstructionLatencyMs', label: 'Recon Latency ms', color: '#AA2DFF' },
                  { key: 'avgCrowdEnergy', label: 'Crowd Energy', color: '#FF2DAA' },
                ].map((s) => {
                  const vals = (series[s.key] ?? []).map((v) => s.key === 'avgCrowdEnergy' ? v.value * 100 : v.value);
                  const trend = data?.trends[s.key] ?? 'insufficient-data';
                  return (
                    <div key={s.key}>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                        {s.label} <span style={{ color: TREND_COLORS[trend] }}>{TREND_ARROWS[trend]}</span>
                      </div>
                      <Sparkline values={vals} color={s.color} width={120} height={28} />
                      <div style={{ fontSize: 8, color: TREND_COLORS[trend], marginTop: 3, fontWeight: 700 }}>{trend}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Run history table */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                Run History ({history.length})
              </div>
            </div>
            <div style={{ padding: '8px 12px' }}>
              {history.length === 0 ? (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: 12, textAlign: 'center' }}>
                  No runs yet — click "+ Runs" to simulate benchmark history
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '24px 36px 70px 70px 62px 62px 50px 50px 48px', gap: 4, fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', padding: '4px 0', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div></div><div>#</div><div>Occupancy</div><div>Recon ms</div><div>Avg RTT</div><div>Energy</div><div>Clusters</div><div>Alerts</div><div>Result</div>
                  </div>
                  {history.map((run) => {
                    const isSelected = selectedRun?.id === run.id;
                    const rc = RESULT_COLORS[run.result];
                    return (
                      <div key={run.id} onClick={() => setSelectedRun(isSelected ? null : run)} style={{
                        display: 'grid', gridTemplateColumns: '24px 36px 70px 70px 62px 62px 50px 50px 48px', gap: 4,
                        padding: '5px 4px', borderRadius: 5, cursor: 'pointer', marginBottom: 1,
                        background: isSelected ? `${rc}18` : 'transparent',
                      }}>
                        <div style={{ fontSize: 10, color: rc, fontWeight: 900 }}>{RESULT_ICONS[run.result]}</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>#{run.runIndex}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: run.occupancyPercent >= 100 ? '#00FF88' : run.occupancyPercent >= 90 ? '#FF9500' : '#FF2DAA' }}>
                          {run.occupancyPercent.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 9, color: run.reconstructionLatencyMs < 150 ? '#00FF88' : '#FF9500' }}>{run.reconstructionLatencyMs}ms</div>
                        <div style={{ fontSize: 9, color: run.avgRttMs < 30 ? '#00FF88' : '#FF9500' }}>{run.avgRttMs}ms</div>
                        <div style={{ fontSize: 9, color: '#00FFFF' }}>{(run.avgCrowdEnergy * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: 9, color: '#AA2DFF' }}>{run.friendClusters}</div>
                        <div style={{ fontSize: 9, color: run.sentinelAlerts > 0 ? '#FF2DAA' : 'rgba(255,255,255,0.3)' }}>{run.sentinelAlerts}</div>
                        <div style={{ fontSize: 8, color: rc, fontWeight: 900, textTransform: 'uppercase' }}>{run.result}</div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Latest diff */}
          {latestDiff && <DiffPanel diff={latestDiff} />}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedRun ? <RunDetail run={selectedRun} /> : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Click a run row to inspect its full telemetry</div>
            </div>
          )}

          {/* Trend report */}
          {trendReport.filter((t) => t.trend !== 'insufficient-data').length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 12 }}>Metric Trends</div>
              {trendReport.filter((t) => t.trend !== 'insufficient-data').slice(0, 8).map((t) => {
                const color = TREND_COLORS[t.trend] ?? '#fff';
                return (
                  <div key={t.metric} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                    <span style={{ fontSize: 9, color, width: 14, fontWeight: 900 }}>{TREND_ARROWS[t.trend]}</span>
                    <span style={{ fontSize: 9, color: '#fff', flex: 1 }}>{t.label}</span>
                    <Sparkline values={t.values} color={color} width={60} height={18} />
                    <span style={{ fontSize: 8, color, fontWeight: 900, width: 40, textAlign: 'right' }}>{t.lastValue}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Auto-generated myths */}
          {myths.length > 0 && (
            <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,215,0,0.5)', textTransform: 'uppercase', marginBottom: 10 }}>Auto-Generated Myths</div>
              {myths.map((m) => (
                <div key={m.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
                  <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 700, lineHeight: 1.4 }}>{m.headline}</div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>sig: {m.significance.toFixed(2)} · {m.witnesses} witnesses</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RunDetail({ run }: { run: BenchmarkRunRecord }) {
  const rc = RESULT_COLORS[run.result];
  const fields = [
    { label: 'Result',      value: run.result.toUpperCase(),                    color: rc },
    { label: 'Seated',      value: `${run.seatedCorrectly}/${run.avatarCount}`, color: '#fff' },
    { label: 'Occupancy',   value: `${run.occupancyPercent.toFixed(1)}%`,       color: rc },
    { label: 'Clusters',    value: run.friendClusters,                          color: '#AA2DFF' },
    { label: 'Cohesion',    value: `${(run.clusterCohesion * 100).toFixed(0)}%`, color: '#AA2DFF' },
    { label: 'Recon',       value: `${run.reconstructionLatencyMs}ms`,          color: '#00FFFF' },
    { label: 'Beat Sync',   value: `${run.beatSyncMs}ms`,                       color: '#00FFFF' },
    { label: 'Avg RTT',     value: `${run.avgRttMs}ms`,                         color: '#00FF88' },
    { label: 'Worst RTT',   value: `${run.worstRttMs}ms`,                       color: run.worstRttMs > 100 ? '#FF9500' : '#00FF88' },
    { label: 'Gaps',        value: run.pulseGapCount,                           color: run.pulseGapCount > 0 ? '#FF9500' : '#00FF88' },
    { label: 'Alerts',      value: run.sentinelAlerts,                          color: run.sentinelAlerts > 0 ? '#FF2DAA' : '#00FF88' },
    { label: 'Energy',      value: `${(run.avgCrowdEnergy * 100).toFixed(0)}%`, color: '#FF2DAA' },
    { label: 'Peak',        value: `${(run.peakEnergyReached * 100).toFixed(0)}%`, color: '#FFD700' },
    { label: 'Attn Sync',   value: `${run.attentionSyncPercent.toFixed(0)}%`,   color: '#00FFFF' },
    { label: 'Failovers',   value: run.failoverEvents,                          color: run.failoverEvents > 0 ? '#FF9500' : '#00FF88' },
    { label: 'LOD',         value: run.activeLODLevel,                          color: '#AA2DFF' },
    { label: 'Legendaries', value: run.legendaryMomentsDetected,                color: '#FFD700' },
    { label: 'Persistence', value: run.persistenceTestRan ? 'yes' : 'no',       color: run.persistenceTestRan ? '#00FF88' : 'rgba(255,255,255,0.3)' },
  ];
  return (
    <div style={{ background: `${rc}10`, border: `1px solid ${rc}44`, borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: rc }}>Run #{run.runIndex}</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{new Date(run.timestamp).toLocaleString()}</div>
        </div>
        {run.mythIds.length > 0 && (
          <div style={{ padding: '4px 8px', background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 5 }}>
            <span style={{ fontSize: 8, color: '#FFD700', fontWeight: 900 }}>⚡ {run.mythIds.length} myth(s)</span>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {fields.map((f) => (
          <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.label}</span>
            <span style={{ fontSize: 9, color: f.color, fontWeight: 700 }}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiffPanel({ diff }: { diff: BenchmarkDiff }) {
  const trajColor = TRAJECTORY_COLORS[diff.trajectory];
  const improved = diff.improvements.length;
  const degraded = diff.metrics.filter((m) => m.direction === 'degraded').length;
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
          Diff #{diff.runA.runIndex} → #{diff.runB.runIndex}
        </div>
        <div style={{ padding: '4px 10px', background: `${trajColor}22`, border: `1px solid ${trajColor}44`, borderRadius: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: trajColor, textTransform: 'capitalize' }}>
            {TRAJECTORY_ICONS[diff.trajectory]} {diff.trajectory}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
        {diff.summaryProse}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ padding: '4px 10px', background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 5 }}>
          <span style={{ fontSize: 9, color: '#00FF88', fontWeight: 900 }}>↑ {improved} improved</span>
        </div>
        <div style={{ padding: '4px 10px', background: 'rgba(255,45,170,0.12)', border: '1px solid rgba(255,45,170,0.3)', borderRadius: 5 }}>
          <span style={{ fontSize: 9, color: '#FF2DAA', fontWeight: 900 }}>↓ {degraded} degraded</span>
        </div>
      </div>
      {diff.metrics.filter((m) => m.direction !== 'unchanged').slice(0, 8).map((m) => {
        const color = m.direction === 'improved' ? '#00FF88' : '#FF2DAA';
        return (
          <div key={m.metric} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 9 }}>
            <span style={{ color, width: 12, fontWeight: 900 }}>{m.direction === 'improved' ? '↑' : '↓'}</span>
            <span style={{ color: '#fff', flex: 1 }}>{m.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{m.previousValue}{m.unit}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
            <span style={{ color, fontWeight: 700 }}>{m.currentValue}{m.unit}</span>
            <span style={{ color, fontSize: 8, width: 40, textAlign: 'right' }}>{m.deltaPct > 0 ? '+' : ''}{m.deltaPct}%</span>
          </div>
        );
      })}
    </div>
  );
}
