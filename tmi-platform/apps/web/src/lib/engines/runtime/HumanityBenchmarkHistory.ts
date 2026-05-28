/**
 * HumanityBenchmarkHistory
 * Civilization telemetry over time.
 *
 * Without history, you only know "it works now."
 * With history, you know when it stopped working — and why.
 *
 * Every benchmark run is recorded with full runtime metrics.
 * Successful runs generate mythology artifacts automatically.
 * Regressions are flagged with severity levels before they surface as incidents.
 */

import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { universalNow } from './UniversalClockRuntime';
import { mythFirstLegendary, mythPeakRecord } from './MythologyEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BenchmarkRunResult = 'pass' | 'fail' | 'degraded';

export interface BenchmarkRunRecord {
  id: string;
  runIndex: number;            // sequential run number
  timestamp: number;
  result: BenchmarkRunResult;

  // Population
  avatarCount: number;
  seatedCorrectly: number;
  occupancyPercent: number;    // seated/total × 100
  friendClusters: number;
  clusterCohesion: number;     // 0–1 how tightly bonded clusters stayed together

  // Timing
  reconstructionLatencyMs: number;   // time from spawn to full seat assignment
  beatSyncMs: number;                // time to first full beat phase sync
  rejoinLatencyMs: number;           // if persistence test ran

  // Network
  avgRttMs: number;
  worstRttMs: number;
  pulseGapCount: number;        // times pulse gap exceeded threshold
  sentinelAlerts: number;

  // Crowd energy
  avgCrowdEnergy: number;       // 0–1
  crowdEnergyVariance: number;  // std-dev equivalent
  peakEnergyReached: number;    // 0–1

  // Runtime
  activeLODLevel: 'near' | 'medium' | 'far' | 'mixed';
  failoverEvents: number;
  snapshotsCaptured: number;
  legendaryMomentsDetected: number;
  attentionSyncPercent: number;  // % of avatars on-stage during test

  // Environment
  runtimeVersion: string;
  environmentProfile: 'local' | 'staging' | 'production';
  persistenceTestRan: boolean;
  benchmarkRoomId: string;

  // Artifact references
  mythIds: string[];
  snapshotId: string | null;
  notes: string;
}

export type MetricKey = keyof Pick<BenchmarkRunRecord,
  | 'occupancyPercent' | 'friendClusters' | 'clusterCohesion'
  | 'reconstructionLatencyMs' | 'beatSyncMs' | 'avgRttMs' | 'worstRttMs'
  | 'pulseGapCount' | 'sentinelAlerts' | 'avgCrowdEnergy'
  | 'crowdEnergyVariance' | 'attentionSyncPercent' | 'failoverEvents'
  | 'legendaryMomentsDetected'
>;

// Metrics where lower is better (used for regression direction)
const LOWER_IS_BETTER: Set<MetricKey> = new Set([
  'reconstructionLatencyMs', 'beatSyncMs', 'avgRttMs', 'worstRttMs',
  'pulseGapCount', 'sentinelAlerts', 'crowdEnergyVariance', 'failoverEvents',
]);

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_HISTORY = 100;
const REGRESSION_THRESHOLD = 0.10;   // 10% degradation triggers regression flag
const DEGRADED_THRESHOLD = 0.90;     // occupancy < 90% = degraded, not pass
const MIN_ABS_DELTA: Partial<Record<MetricKey, number>> = {
  reconstructionLatencyMs: 10,
  beatSyncMs: 10,
  avgRttMs: 5,
  worstRttMs: 10,
  pulseGapCount: 1,
  sentinelAlerts: 1,
  failoverEvents: 1,
};

// ── Storage ───────────────────────────────────────────────────────────────────

const runs: BenchmarkRunRecord[] = [];
let runCounter = 0;
const historyHandlers = new Set<(run: BenchmarkRunRecord) => void>();
let hydrated = false;

const STORE_DIR = path.join(process.cwd(), '.tmi-data');
const STORE_FILE = path.join(STORE_DIR, 'humanity-benchmark-history.json');

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function hydrateFromDisk(): void {
  if (hydrated) return;
  hydrated = true;

  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    if (!raw.trim()) return;

    const parsed = JSON.parse(raw) as {
      runCounter?: number;
      runs?: BenchmarkRunRecord[];
    };

    if (Array.isArray(parsed.runs)) {
      runs.splice(0, runs.length, ...parsed.runs.slice(-MAX_HISTORY));
    }

    if (typeof parsed.runCounter === 'number' && Number.isFinite(parsed.runCounter)) {
      runCounter = parsed.runCounter;
    } else if (runs.length > 0) {
      runCounter = Math.max(...runs.map((run) => run.runIndex));
    }
  } catch (error) {
    console.error('[HumanityBenchmarkHistory] Failed to hydrate history:', error);
  }
}

function persistToDisk(): void {
  try {
    ensureStoreDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify({ runCounter, runs }, null, 2), 'utf8');
  } catch (error) {
    console.error('[HumanityBenchmarkHistory] Failed to persist history:', error);
  }
}

// ── ID gen ────────────────────────────────────────────────────────────────────

function runId(index: number): string {
  return `bench-${Date.now().toString(36)}-${String(index).padStart(3, '0')}`;
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function recordBenchmarkRun(
  metrics: Omit<BenchmarkRunRecord, 'id' | 'runIndex' | 'timestamp' | 'result' | 'mythIds' | 'notes'> & { notes?: string },
): BenchmarkRunRecord {
  hydrateFromDisk();
  const index = ++runCounter;
  const now = universalNow();

  const result: BenchmarkRunResult =
    metrics.occupancyPercent >= 100 && metrics.sentinelAlerts === 0 ? 'pass' :
    metrics.occupancyPercent >= DEGRADED_THRESHOLD * 100 ? 'degraded' : 'fail';

  const mythIds: string[] = [];

  // Auto-generate mythology on key milestones
  if (result === 'pass' && index === 1) {
    const myth = mythFirstLegendary('platform', metrics.benchmarkRoomId, metrics.avatarCount, metrics.snapshotId ?? undefined);
    if (myth) mythIds.push(myth.id);
  }
  if (metrics.peakEnergyReached >= 0.95) {
    const myth = mythPeakRecord('platform', metrics.benchmarkRoomId, metrics.peakEnergyReached, 3, metrics.avatarCount, metrics.snapshotId ?? undefined);
    if (myth) mythIds.push(myth.id);
  }

  const record: BenchmarkRunRecord = {
    ...metrics,
    id: runId(index),
    runIndex: index,
    timestamp: now,
    result,
    mythIds,
    notes: metrics.notes ?? '',
  };

  runs.push(record);
  if (runs.length > MAX_HISTORY) runs.shift();
  persistToDisk();

  for (const h of historyHandlers) {
    try { h(record); } catch { /* ignore */ }
  }

  return record;
}

export function onBenchmarkRun(handler: (run: BenchmarkRunRecord) => void): () => void {
  historyHandlers.add(handler);
  return () => historyHandlers.delete(handler);
}

// ── Query API ─────────────────────────────────────────────────────────────────

export function getRunHistory(limit = 20): BenchmarkRunRecord[] {
  hydrateFromDisk();
  return runs.slice(-limit).reverse();
}

export function getLatestRun(): BenchmarkRunRecord | null {
  hydrateFromDisk();
  return runs[runs.length - 1] ?? null;
}

export function getRunById(id: string): BenchmarkRunRecord | undefined {
  hydrateFromDisk();
  return runs.find((r) => r.id === id);
}

export function getRunByIndex(index: number): BenchmarkRunRecord | undefined {
  hydrateFromDisk();
  return runs.find((r) => r.runIndex === index);
}

export function getPassRuns(): BenchmarkRunRecord[] {
  hydrateFromDisk();
  return runs.filter((r) => r.result === 'pass');
}

export function getFailRuns(): BenchmarkRunRecord[] {
  hydrateFromDisk();
  return runs.filter((r) => r.result !== 'pass');
}

export function getTrend(metric: MetricKey, windowSize = 5): 'improving' | 'degrading' | 'stable' | 'insufficient-data' {
  hydrateFromDisk();
  const window = runs.slice(-windowSize);
  if (window.length < 2) return 'insufficient-data';

  const first = window[0]![metric] as number;
  const last = window[window.length - 1]![metric] as number;
  if (first === 0) return 'stable';

  const changePct = (last - first) / first;
  const threshold = 0.05;  // 5% change = trend

  const higherIsBetter = !LOWER_IS_BETTER.has(metric);
  if (Math.abs(changePct) < threshold) return 'stable';
  if (changePct > 0) return higherIsBetter ? 'improving' : 'degrading';
  return higherIsBetter ? 'degrading' : 'improving';
}

export function getMetricSeries(metric: MetricKey, limit = 20): Array<{ runIndex: number; value: number; result: BenchmarkRunResult }> {
  hydrateFromDisk();
  return runs.slice(-limit).map((r) => ({
    runIndex: r.runIndex,
    value: r[metric] as number,
    result: r.result,
  }));
}

export function getHistoryStats(): {
  totalRuns: number;
  passRate: number;
  avgOccupancy: number;
  bestOccupancy: number;
  worstOccupancy: number;
  avgReconstructionMs: number;
  avgCrowdEnergy: number;
  totalLegendaryMoments: number;
  totalMythsGenerated: number;
} {
  hydrateFromDisk();
  if (!runs.length) {
    return { totalRuns: 0, passRate: 0, avgOccupancy: 0, bestOccupancy: 0, worstOccupancy: 0, avgReconstructionMs: 0, avgCrowdEnergy: 0, totalLegendaryMoments: 0, totalMythsGenerated: 0 };
  }
  const passCount = runs.filter((r) => r.result === 'pass').length;
  const avgOcc = runs.reduce((s, r) => s + r.occupancyPercent, 0) / runs.length;
  const avgRecon = runs.reduce((s, r) => s + r.reconstructionLatencyMs, 0) / runs.length;
  const avgEnergy = runs.reduce((s, r) => s + r.avgCrowdEnergy, 0) / runs.length;
  const totalLeg = runs.reduce((s, r) => s + r.legendaryMomentsDetected, 0);
  const totalMyths = runs.reduce((s, r) => s + r.mythIds.length, 0);

  return {
    totalRuns: runs.length,
    passRate: Math.round((passCount / runs.length) * 100),
    avgOccupancy: Math.round(avgOcc * 10) / 10,
    bestOccupancy: Math.max(...runs.map((r) => r.occupancyPercent)),
    worstOccupancy: Math.min(...runs.map((r) => r.occupancyPercent)),
    avgReconstructionMs: Math.round(avgRecon),
    avgCrowdEnergy: Math.round(avgEnergy * 100) / 100,
    totalLegendaryMoments: totalLeg,
    totalMythsGenerated: totalMyths,
  };
}

export function clearHistory(): void {
  runs.length = 0;
  runCounter = 0;
  persistToDisk();
}

// ── Regression helpers ────────────────────────────────────────────────────────

export interface RegressionFlag {
  metric: MetricKey;
  previousValue: number;
  currentValue: number;
  changePct: number;
  direction: 'worse' | 'better';
  severity: 'critical' | 'warning' | 'info';
}

export function detectRegressions(current: BenchmarkRunRecord, previous: BenchmarkRunRecord): RegressionFlag[] {
  const TRACKED_METRICS: MetricKey[] = [
    'occupancyPercent', 'reconstructionLatencyMs', 'avgRttMs',
    'pulseGapCount', 'sentinelAlerts', 'avgCrowdEnergy',
    'clusterCohesion', 'attentionSyncPercent', 'failoverEvents',
  ];

  const flags: RegressionFlag[] = [];

  for (const metric of TRACKED_METRICS) {
    const prev = previous[metric] as number;
    const curr = current[metric] as number;
    if (prev === 0) continue;

    const changePct = (curr - prev) / prev;
    const lowerIsBetter = LOWER_IS_BETTER.has(metric);
    const isWorse = lowerIsBetter ? changePct > 0 : changePct < 0;
    const absPct = Math.abs(changePct);
    const absDelta = Math.abs(curr - prev);
    const minDelta = MIN_ABS_DELTA[metric] ?? 0;

    if (absPct < REGRESSION_THRESHOLD || absDelta < minDelta) continue;

    flags.push({
      metric,
      previousValue: prev,
      currentValue: curr,
      changePct: Math.round(changePct * 1000) / 10,  // percent with 1 decimal
      direction: isWorse ? 'worse' : 'better',
      severity: absPct > 0.25 ? 'critical' : absPct > 0.15 ? 'warning' : 'info',
    });
  }

  return flags;
}
