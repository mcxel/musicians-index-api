import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type FeedbackCategory =
  | 'bug'
  | 'video-issue'
  | 'chat-issue'
  | 'login-issue'
  | 'suggestion'
  | 'battle-feedback'
  | 'visual-issue'
  | 'audio-issue'
  | 'feature-request'
  | 'report-user'
  | 'empty-room'
  | 'feed-lag'
  | 'idea';

export type FeedbackSeverity = 'high' | 'medium' | 'low';
export type FeedbackClass = 'trust-killer' | 'conversion-drag' | 'polish';

export interface FeedbackReport {
  id: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  classification: FeedbackClass;
  tags: string[];
  routeToAutomatedPatchQueue: boolean;
  message?: string;
  page?: string;
  timestamp: number;
}

interface IssueBucket {
  category: FeedbackCategory;
  count: number;
  severity: FeedbackSeverity;
  classification: FeedbackClass;
  tags: string[];
  routedToAutomatedPatchQueue: number;
  lastMessage?: string;
  firstSeen: number;
  lastSeen: number;
}

interface PatchQueueItem {
  feedbackId: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  classification: FeedbackClass;
  page?: string;
  message?: string;
  timestamp: number;
}

// Module-level store — resets on cold start, persists across requests within the same instance
const REPORTS: FeedbackReport[] = [];
const BUCKETS = new Map<FeedbackCategory, IssueBucket>();
const AUTOMATED_PATCH_QUEUE: PatchQueueItem[] = [];

const DEFAULT_SEVERITY_BY_CATEGORY: Record<FeedbackCategory, FeedbackSeverity> = {
  bug: 'high',
  'login-issue': 'high',
  'report-user': 'high',
  'video-issue': 'medium',
  'chat-issue': 'medium',
  'audio-issue': 'medium',
  'visual-issue': 'low',
  'battle-feedback': 'low',
  suggestion: 'low',
  'feature-request': 'low',
  'empty-room': 'medium',
  'feed-lag': 'medium',
  idea: 'low',
};

const CATEGORY_CLASSIFICATION: Record<FeedbackCategory, FeedbackClass> = {
  bug: 'trust-killer',
  'login-issue': 'trust-killer',
  'report-user': 'trust-killer',
  'video-issue': 'conversion-drag',
  'chat-issue': 'conversion-drag',
  'audio-issue': 'conversion-drag',
  'visual-issue': 'polish',
  'battle-feedback': 'polish',
  suggestion: 'polish',
  'feature-request': 'polish',
  'empty-room': 'conversion-drag',
  'feed-lag': 'conversion-drag',
  idea: 'polish',
};

const CATEGORY_ALIASES: Record<string, FeedbackCategory> = {
  'empty-room': 'empty-room',
  'feed-lag': 'feed-lag',
  idea: 'idea',
  bug: 'bug',
  'video-issue': 'video-issue',
  'chat-issue': 'chat-issue',
  'login-issue': 'login-issue',
  suggestion: 'suggestion',
  'battle-feedback': 'battle-feedback',
  'visual-issue': 'visual-issue',
  'audio-issue': 'audio-issue',
  'feature-request': 'feature-request',
  'report-user': 'report-user',
};

function normalizeCategory(value: unknown): FeedbackCategory {
  if (typeof value !== 'string') return 'bug';
  const normalized = value.trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] ?? 'bug';
}

function normalizeSeverity(value: unknown, category: FeedbackCategory): FeedbackSeverity {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return DEFAULT_SEVERITY_BY_CATEGORY[category];
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return ['BETA_FEEDBACK'];
  const tags = value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : ['BETA_FEEDBACK'];
}

function shouldRouteToAutomatedPatchQueue(
  category: FeedbackCategory,
  severity: FeedbackSeverity,
  nextCount: number,
): boolean {
  if (severity === 'high') return true;
  if (category === 'video-issue' || category === 'chat-issue' || category === 'login-issue') {
    return nextCount >= 2;
  }
  return nextCount >= 5;
}

function addReport(report: FeedbackReport): IssueBucket {
  REPORTS.push(report);

  const existing = BUCKETS.get(report.category);
  if (existing) {
    existing.count++;
    existing.lastSeen = report.timestamp;
    existing.severity = report.severity;
    existing.classification = report.classification;
    existing.tags = Array.from(new Set([...existing.tags, ...report.tags]));
    if (report.routeToAutomatedPatchQueue) existing.routedToAutomatedPatchQueue++;
    if (report.message) existing.lastMessage = report.message;
    BUCKETS.set(report.category, existing);
    return existing;
  }

  const bucket: IssueBucket = {
    category: report.category,
    count: 1,
    severity: report.severity,
    classification: report.classification,
    tags: [...report.tags],
    routedToAutomatedPatchQueue: report.routeToAutomatedPatchQueue ? 1 : 0,
    lastMessage: report.message,
    firstSeen: report.timestamp,
    lastSeen: report.timestamp,
  };
  BUCKETS.set(report.category, bucket);
  return bucket;
}

export function getFeedbackSummary() {
  const classTotals = REPORTS.reduce<Record<FeedbackClass, number>>(
    (acc, report) => {
      acc[report.classification] += 1;
      return acc;
    },
    { 'trust-killer': 0, 'conversion-drag': 0, polish: 0 },
  );

  return {
    total: REPORTS.length,
    automatedPatchQueueDepth: AUTOMATED_PATCH_QUEUE.length,
    classTotals,
    buckets: Array.from(BUCKETS.values()).sort((a, b) => b.count - a.count),
  };
}

export function getAutomatedPatchQueue() {
  return [...AUTOMATED_PATCH_QUEUE].sort((a, b) => b.timestamp - a.timestamp);
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
    const projectedCount = (BUCKETS.get(category)?.count ?? 0) + 1;
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
      AUTOMATED_PATCH_QUEUE.push({
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
