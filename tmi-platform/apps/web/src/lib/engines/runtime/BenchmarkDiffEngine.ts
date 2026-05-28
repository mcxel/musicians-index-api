/**
 * BenchmarkDiffEngine
 * World evolution tracking — automatic comparison of benchmark runs.
 *
 * Computes per-metric deltas, detects regressions, generates narrative
 * diff reports, and classifies the overall run trajectory:
 *   improving / stable / degrading / volatile
 *
 * Called automatically when a new run is recorded.
 * The diff is available as structured data and as human-readable prose.
 */

import {
  type BenchmarkRunRecord,
  type MetricKey,
  type RegressionFlag,
  detectRegressions,
  getRunHistory,
  getLatestRun,
  getTrend,
} from './HumanityBenchmarkHistory';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DiffDirection = 'improved' | 'degraded' | 'unchanged';
export type WorldTrajectory = 'improving' | 'stable' | 'degrading' | 'volatile' | 'insufficient-data';

export interface MetricDiff {
  metric: MetricKey;
  label: string;
  previousValue: number;
  currentValue: number;
  delta: number;
  deltaPct: number;    // signed percent
  direction: DiffDirection;
  trend: ReturnType<typeof getTrend>;
  unit: string;
  lowerIsBetter: boolean;
}

export interface BenchmarkDiff {
  runA: BenchmarkRunRecord;
  runB: BenchmarkRunRecord;  // newer run
  metrics: MetricDiff[];
  regressions: RegressionFlag[];
  improvements: MetricDiff[];
  trajectory: WorldTrajectory;
  summaryProse: string;
  generatedAt: number;
}

// ── Metric metadata ───────────────────────────────────────────────────────────

const METRIC_META: Record<MetricKey, { label: string; unit: string; lowerIsBetter: boolean }> = {
  occupancyPercent:          { label: 'Seat Occupancy',         unit: '%',   lowerIsBetter: false },
  friendClusters:            { label: 'Friend Clusters',        unit: '',    lowerIsBetter: false },
  clusterCohesion:           { label: 'Cluster Cohesion',       unit: '%',   lowerIsBetter: false },
  reconstructionLatencyMs:   { label: 'Reconstruction Latency', unit: 'ms',  lowerIsBetter: true  },
  beatSyncMs:                { label: 'Beat Sync Time',         unit: 'ms',  lowerIsBetter: true  },
  avgRttMs:                  { label: 'Average RTT',            unit: 'ms',  lowerIsBetter: true  },
  worstRttMs:                { label: 'Worst RTT',              unit: 'ms',  lowerIsBetter: true  },
  pulseGapCount:             { label: 'Pulse Gaps',             unit: '',    lowerIsBetter: true  },
  sentinelAlerts:            { label: 'Sentinel Alerts',        unit: '',    lowerIsBetter: true  },
  avgCrowdEnergy:            { label: 'Avg Crowd Energy',       unit: '',    lowerIsBetter: false },
  crowdEnergyVariance:       { label: 'Energy Variance',        unit: '',    lowerIsBetter: true  },
  attentionSyncPercent:      { label: 'Attention Sync',         unit: '%',   lowerIsBetter: false },
  failoverEvents:            { label: 'Failover Events',        unit: '',    lowerIsBetter: true  },
  legendaryMomentsDetected:  { label: 'Legendary Moments',      unit: '',    lowerIsBetter: false },
};

const ALL_METRICS = Object.keys(METRIC_META) as MetricKey[];
const REGRESSION_THRESHOLD = 0.05;  // 5% change = direction change

// ── Diff computation ──────────────────────────────────────────────────────────

export function diffRuns(runA: BenchmarkRunRecord, runB: BenchmarkRunRecord): BenchmarkDiff {
  const metricDiffs: MetricDiff[] = [];

  for (const metric of ALL_METRICS) {
    const meta = METRIC_META[metric];
    const prev = runA[metric] as number;
    const curr = runB[metric] as number;
    const delta = curr - prev;
    const deltaPct = prev !== 0 ? delta / prev : 0;
    const absPct = Math.abs(deltaPct);

    let direction: DiffDirection = 'unchanged';
    if (absPct >= REGRESSION_THRESHOLD) {
      const improved = meta.lowerIsBetter ? delta < 0 : delta > 0;
      direction = improved ? 'improved' : 'degraded';
    }

    metricDiffs.push({
      metric,
      label: meta.label,
      previousValue: prev,
      currentValue: curr,
      delta,
      deltaPct: Math.round(deltaPct * 1000) / 10,
      direction,
      trend: getTrend(metric),
      unit: meta.unit,
      lowerIsBetter: meta.lowerIsBetter,
    });
  }

  const regressions = detectRegressions(runB, runA);
  const improvements = metricDiffs.filter((d) => d.direction === 'improved');
  const degradations = metricDiffs.filter((d) => d.direction === 'degraded');

  const trajectory = computeTrajectory(improvements.length, degradations.length, regressions);
  const summaryProse = generateProse(runA, runB, metricDiffs, regressions, improvements, trajectory);

  return {
    runA, runB,
    metrics: metricDiffs,
    regressions,
    improvements,
    trajectory,
    summaryProse,
    generatedAt: Date.now(),
  };
}

function computeTrajectory(
  improvements: number,
  degradations: number,
  regressions: RegressionFlag[],
): WorldTrajectory {
  const criticals = regressions.filter((r) => r.severity === 'critical').length;
  if (criticals > 0) return 'degrading';
  if (improvements === 0 && degradations === 0) return 'stable';
  const ratio = improvements / (improvements + degradations);
  if (ratio >= 0.7) return 'improving';
  if (ratio <= 0.3) return 'degrading';
  if (improvements > 0 && degradations > 0) return 'volatile';
  return 'stable';
}

function generateProse(
  runA: BenchmarkRunRecord,
  runB: BenchmarkRunRecord,
  metrics: MetricDiff[],
  regressions: RegressionFlag[],
  improvements: MetricDiff[],
  trajectory: WorldTrajectory,
): string {
  const trajLabel = {
    improving: 'improving across key metrics',
    stable: 'holding stable — no significant delta',
    degrading: 'showing signs of degradation',
    volatile: 'volatile — mixed signals across metrics',
    'insufficient-data': 'baseline only — no trend available yet',
  }[trajectory];

  const lines: string[] = [
    `Run #${runB.runIndex} vs Run #${runA.runIndex} — world is ${trajLabel}.`,
  ];

  const occDiff = metrics.find((m) => m.metric === 'occupancyPercent')!;
  if (Math.abs(occDiff.deltaPct) >= 1) {
    lines.push(`Seat occupancy: ${runA.occupancyPercent}% → ${runB.occupancyPercent}% (${occDiff.deltaPct > 0 ? '+' : ''}${occDiff.deltaPct}%).`);
  }

  const reconDiff = metrics.find((m) => m.metric === 'reconstructionLatencyMs')!;
  if (Math.abs(reconDiff.deltaPct) >= 5) {
    lines.push(`Reconstruction latency ${reconDiff.direction === 'improved' ? 'improved' : 'slowed'}: ${runA.reconstructionLatencyMs}ms → ${runB.reconstructionLatencyMs}ms.`);
  }

  const energyDiff = metrics.find((m) => m.metric === 'avgCrowdEnergy')!;
  if (Math.abs(energyDiff.deltaPct) >= 5) {
    lines.push(`Crowd energy shifted: ${(runA.avgCrowdEnergy * 100).toFixed(0)}% → ${(runB.avgCrowdEnergy * 100).toFixed(0)}%.`);
  }

  if (regressions.length > 0) {
    const critical = regressions.filter((r) => r.severity === 'critical');
    if (critical.length) {
      lines.push(`⚠ CRITICAL: ${critical.map((r) => METRIC_META[r.metric].label).join(', ')} degraded >25%.`);
    } else {
      lines.push(`${regressions.length} warning(s): ${regressions.map((r) => METRIC_META[r.metric].label).join(', ')}.`);
    }
  }

  if (improvements.length > 0 && regressions.length === 0) {
    lines.push(`${improvements.length} metric(s) improved with no regressions — clean evolution.`);
  }

  if (runB.legendaryMomentsDetected > runA.legendaryMomentsDetected) {
    lines.push(`Legendary activity increased: ${runA.legendaryMomentsDetected} → ${runB.legendaryMomentsDetected} moments detected.`);
  }

  return lines.join(' ');
}

// ── Multi-run analysis ────────────────────────────────────────────────────────

export interface TrendReport {
  metric: MetricKey;
  label: string;
  values: number[];
  trend: ReturnType<typeof getTrend>;
  min: number;
  max: number;
  avg: number;
  lastValue: number;
}

export function generateTrendReport(windowSize = 10): TrendReport[] {
  const history = getRunHistory(windowSize).reverse();  // oldest first
  if (history.length < 2) return [];

  return ALL_METRICS.map((metric) => {
    const values = history.map((r) => r[metric] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    return {
      metric,
      label: METRIC_META[metric].label,
      values,
      trend: getTrend(metric, windowSize),
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      lastValue: values[values.length - 1] ?? 0,
    };
  });
}

/**
 * Compare the last two runs automatically.
 * Returns null if fewer than 2 runs exist.
 */
export function diffLatestRuns(): BenchmarkDiff | null {
  const history = getRunHistory(2).reverse();
  if (history.length < 2) return null;
  return diffRuns(history[0]!, history[1]!);
}

/**
 * Classify the overall system health from the last N runs.
 */
export function classifySystemHealth(windowSize = 5): {
  trajectory: WorldTrajectory;
  passRate: number;
  criticalRegressions: string[];
  summary: string;
} {
  const history = getRunHistory(windowSize);
  if (!history.length) {
    return { trajectory: 'insufficient-data', passRate: 0, criticalRegressions: [], summary: 'No benchmark runs recorded.' };
  }

  const passRate = Math.round((history.filter((r) => r.result === 'pass').length / history.length) * 100);
  const latest = getLatestRun();
  if (!latest || history.length < 2) {
    return { trajectory: 'insufficient-data', passRate, criticalRegressions: [], summary: 'Baseline only — run more benchmarks to establish trend.' };
  }

  const previous = history[1];
  const regressions = previous ? detectRegressions(latest, previous) : [];
  const criticalRegressions = regressions
    .filter((r) => r.severity === 'critical')
    .map((r) => METRIC_META[r.metric].label);

  const trajectory = criticalRegressions.length > 0 ? 'degrading'
    : passRate >= 80 ? 'improving'
    : passRate >= 60 ? 'stable'
    : 'degrading';

  const summary = criticalRegressions.length > 0
    ? `System degrading — critical regressions in: ${criticalRegressions.join(', ')}.`
    : passRate === 100
    ? `System stable — ${history.length} consecutive runs all passing.`
    : `System at ${passRate}% pass rate over last ${history.length} runs.`;

  return { trajectory, passRate, criticalRegressions, summary };
}
