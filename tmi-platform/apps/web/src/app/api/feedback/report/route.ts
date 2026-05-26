import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type FeedbackCategory = 'empty-room' | 'feed-lag' | 'idea' | 'bug';

export interface FeedbackReport {
  id: string;
  category: FeedbackCategory;
  message?: string;
  page?: string;
  timestamp: number;
}

interface IssueBucket {
  category: FeedbackCategory;
  count: number;
  lastMessage?: string;
  firstSeen: number;
  lastSeen: number;
}

// Module-level store — resets on cold start, persists across requests within the same instance
const REPORTS: FeedbackReport[] = [];
const BUCKETS = new Map<FeedbackCategory, IssueBucket>();

function addReport(report: FeedbackReport): IssueBucket {
  REPORTS.push(report);

  const existing = BUCKETS.get(report.category);
  if (existing) {
    existing.count++;
    existing.lastSeen = report.timestamp;
    if (report.message) existing.lastMessage = report.message;
    BUCKETS.set(report.category, existing);
    return existing;
  }

  const bucket: IssueBucket = {
    category: report.category,
    count: 1,
    lastMessage: report.message,
    firstSeen: report.timestamp,
    lastSeen: report.timestamp,
  };
  BUCKETS.set(report.category, bucket);
  return bucket;
}

export function getFeedbackSummary() {
  return {
    total: REPORTS.length,
    buckets: Array.from(BUCKETS.values()).sort((a, b) => b.count - a.count),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { category?: string; message?: string; page?: string };

    const validCategories: FeedbackCategory[] = ['empty-room', 'feed-lag', 'idea', 'bug'];
    const category = validCategories.includes(body.category as FeedbackCategory)
      ? (body.category as FeedbackCategory)
      : 'bug';

    const report: FeedbackReport = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category,
      message: typeof body.message === 'string' ? body.message.slice(0, 500) : undefined,
      page: typeof body.page === 'string' ? body.page.slice(0, 200) : undefined,
      timestamp: Date.now(),
    };

    const bucket = addReport(report);
    return NextResponse.json({ success: true, count: bucket.count, category });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  const summary = getFeedbackSummary();
  return NextResponse.json(summary);
}
