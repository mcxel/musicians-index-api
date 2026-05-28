export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';
import { clearHistory, getHistoryStats, getRunHistory } from '@/lib/engines/runtime/HumanityBenchmarkHistory';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const search = request.nextUrl.searchParams;
    const limitInput = Number(search.get('limit') ?? 25);
    const windowInput = Number(search.get('window') ?? 8);
    const limit = Math.max(1, Math.min(100, Number.isFinite(limitInput) ? limitInput : 25));
    const windowSize = Math.max(2, Math.min(20, Number.isFinite(windowInput) ? windowInput : 8));

    const runs = getRunHistory(limit);
    const stats = getHistoryStats();
    let latestDiff: unknown = null;
    let trendReport: unknown[] = [];
    let health: { trajectory: string; passRate: number; criticalRegressions: string[]; summary: string } = {
      trajectory: 'insufficient-data',
      passRate: stats.passRate,
      criticalRegressions: [],
      summary: 'Diff analytics unavailable in this runtime.',
    };

    try {
      const diffModule = await import('@/lib/engines/runtime/BenchmarkDiffEngine');
      latestDiff = diffModule.diffLatestRuns();
      trendReport = diffModule.generateTrendReport(windowSize);
      health = diffModule.classifySystemHealth(windowSize);
    } catch (analyticsError) {
      health = {
        trajectory: 'stable',
        passRate: stats.passRate,
        criticalRegressions: [],
        summary: `Diff analytics fallback active: ${analyticsError instanceof Error ? analyticsError.message : String(analyticsError)}`,
      };
    }

    return NextResponse.json({
      ok: true,
      stats,
      health,
      latestDiff,
      trendReport,
      runs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to build humanity history payload',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    clearHistory();
    return NextResponse.json({ ok: true, cleared: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to clear history',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
