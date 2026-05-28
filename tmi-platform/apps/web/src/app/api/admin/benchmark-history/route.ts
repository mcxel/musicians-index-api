import { NextRequest, NextResponse } from 'next/server';
import {
  recordBenchmarkRun,
  getRunHistory,
  getHistoryStats,
  getMetricSeries,
  getTrend,
  clearHistory,
} from '@/lib/engines/runtime/HumanityBenchmarkHistory';
import {
  diffLatestRuns,
  generateTrendReport,
  classifySystemHealth,
} from '@/lib/engines/runtime/BenchmarkDiffEngine';
import { getMyths } from '@/lib/engines/runtime/MythologyEngine';

export async function GET(): Promise<NextResponse> {
  const history = getRunHistory(30);
  const stats = getHistoryStats();
  const health = classifySystemHealth(5);
  const latestDiff = diffLatestRuns();
  const trendReport = generateTrendReport(10);
  const myths = getMyths({ limit: 6 });

  const seriesKeys = ['occupancyPercent', 'reconstructionLatencyMs', 'avgCrowdEnergy'] as const;
  const series = Object.fromEntries(
    seriesKeys.map((k) => [k, getMetricSeries(k, 15)])
  );
  const trends = Object.fromEntries(
    seriesKeys.map((k) => [k, getTrend(k)])
  );

  return NextResponse.json({ history, stats, health, latestDiff, trendReport, series, trends, myths });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({})) as { action?: string; metrics?: Record<string, unknown> };

  if (body.action === 'clear') {
    clearHistory();
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'record' && body.metrics) {
    const run = recordBenchmarkRun(body.metrics as Parameters<typeof recordBenchmarkRun>[0]);
    return NextResponse.json({ run });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
