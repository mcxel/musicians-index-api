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
  persistReportToStorage,
  loadPersistedReports,
  resolveReport,
} from '@/lib/feedback/FeedbackStore';
import prisma from '@/lib/prisma';
import { participationEconomyEngine } from '@/lib/economy/ParticipationEconomyEngine';
import { requireAdmin } from '@/app/api/admin/_utils/require-admin';

export const dynamic = 'force-dynamic';

async function resolveAuthedContext(req: NextRequest): Promise<{ userId: string; role: string } | null> {
  const email = req.cookies.get('tmi_user_email')?.value;
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null);
  if (!user?.id) return null;

  const role = (req.cookies.get('tmi_role')?.value ?? '').toLowerCase();
  return { userId: user.id, role };
}

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

    const authed = await resolveAuthedContext(req);
    if (authed) {
      report.userId = authed.userId;
      if (authed.role === 'performer' || authed.role === 'artist') {
        participationEconomyEngine.earn(authed.userId, 'performer', 'audience_engagement', {
          category,
          severity,
          classification,
        });
      } else {
        participationEconomyEngine.earn(authed.userId, 'fan', 'write_review', {
          category,
          severity,
          classification,
        });
      }
    }

    // Persist to database (prisma.feedItem) with test fallback
    await persistReportToStorage(report);

    return NextResponse.json({
      success: true,
      id: report.id,
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

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  await loadPersistedReports();
  const summary = getFeedbackSummary();
  return NextResponse.json(summary);
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: { action?: string; reportId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (body.action !== 'resolve' || !body.reportId) {
    return NextResponse.json({ error: 'Unsupported feedback action' }, { status: 400 });
  }

  await loadPersistedReports();
  const resolved = await resolveReport(body.reportId);
  return resolved
    ? NextResponse.json({ ok: true, reportId: body.reportId })
    : NextResponse.json({ error: 'Report not found' }, { status: 404 });
}
