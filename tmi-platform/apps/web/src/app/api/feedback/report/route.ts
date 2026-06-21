import { NextRequest, NextResponse } from 'next/server';
import {
  type FeedbackReport,
  type FeedbackSeverity,
  CATEGORY_CLASSIFICATION,
  addReport,
  getFeedbackSummary,
  normalizeCategory,
  normalizeSeverity,
  normalizeTags,
  pushToAutomatedPatchQueue,
  shouldRouteToAutomatedPatchQueue,
} from '@/lib/feedback/FeedbackStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      category?: string;
      severity?: FeedbackSeverity;
      tags?: string[];
      message?: string;
      page?: string;
    };

    const category = normalizeCategory(body.category);
    const severity = normalizeSeverity(body.severity, category);
    const tags = normalizeTags(body.tags);
    const classification = CATEGORY_CLASSIFICATION[category];
    const projectedCount = (getFeedbackSummary().buckets.find((b) => b.category === category)?.count ?? 0) + 1;
    const routeToAutomatedPatchQueue = shouldRouteToAutomatedPatchQueue(category, severity, projectedCount);

    const report: FeedbackReport = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category,
      severity,
      classification,
      tags,
      routeToAutomatedPatchQueue,
      message: typeof body.message === 'string' ? body.message.slice(0, 500) : undefined,
      page: typeof body.page === 'string' ? body.page.slice(0, 200) : undefined,
      timestamp: Date.now(),
    };

    if (routeToAutomatedPatchQueue) {
      pushToAutomatedPatchQueue({
        feedbackId: report.id,
        category: report.category,
        severity: report.severity,
        classification: report.classification,
        page: report.page,
        message: report.message,
        timestamp: report.timestamp,
      });
    }

    const bucket = addReport(report);
    return NextResponse.json({
      success: true,
      count: bucket.count,
      category,
      severity,
      classification,
      routeToAutomatedPatchQueue,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  const summary = getFeedbackSummary();
  return NextResponse.json(summary);
}
