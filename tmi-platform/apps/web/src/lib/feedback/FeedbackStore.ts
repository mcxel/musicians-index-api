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
  status?: 'NEW' | 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED';
  userId?: string;
}

export interface IssueBucket {
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

export interface PatchQueueItem {
  feedbackId: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  classification: FeedbackClass;
  page?: string;
  message?: string;
  timestamp: number;
}

// In-memory cache synced with canonical persistence
const REPORTS: FeedbackReport[] = [];
const BUCKETS = new Map<FeedbackCategory, IssueBucket>();
const AUTOMATED_PATCH_QUEUE: PatchQueueItem[] = [];
const FEED_TYPE = 'FEEDBACK_REPORT';
const FAR_FUTURE = new Date('2040-01-01T00:00:00Z');

export const DEFAULT_SEVERITY_BY_CATEGORY: Record<FeedbackCategory, FeedbackSeverity> = {
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

export const CATEGORY_CLASSIFICATION: Record<FeedbackCategory, FeedbackClass> = {
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

export function normalizeCategory(value: unknown): FeedbackCategory {
  if (typeof value !== 'string') return 'bug';
  const normalized = value.trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] ?? 'bug';
}

export function normalizeSeverity(value: unknown, category: FeedbackCategory): FeedbackSeverity {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return DEFAULT_SEVERITY_BY_CATEGORY[category];
}

export function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return ['BETA_FEEDBACK'];
  const tags = value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : ['BETA_FEEDBACK'];
}

export function shouldRouteToAutomatedPatchQueue(
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

export function addReport(report: FeedbackReport): IssueBucket {
  if (!report.status) report.status = 'NEW';
  
  // Avoid duplicate entries in memory cache
  const existingIdx = REPORTS.findIndex((r) => r.id === report.id);
  if (existingIdx >= 0) {
    REPORTS[existingIdx] = report;
  } else {
    REPORTS.unshift(report);
  }

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

/**
 * Persist report to canonical database (prisma.feedItem) with test/dev fallback.
 */
export async function persistReportToStorage(report: FeedbackReport): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.feedItem.create({
      data: {
        userId: report.userId ?? 'system',
        type: FEED_TYPE,
        entityId: report.id,
        entityType: 'feedback',
        data: report as object,
        expiresAt: FAR_FUTURE,
      },
    });
  } catch {
    // Graceful fallback to file backing for offline dev/unit tests
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const filePath = path.join(dataDir, 'feedback-queue.json');
      let current: FeedbackReport[] = [];
      if (fs.existsSync(filePath)) {
        try {
          current = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {}
      }
      current = [report, ...current.filter((r) => r.id !== report.id)].slice(0, 500);
      fs.writeFileSync(filePath, JSON.stringify(current, null, 2), 'utf-8');
    } catch {
      // Memory store is already updated via addReport
    }
  }
}

/**
 * Hydrate in-memory queue from canonical database or test fallback.
 */
export async function loadPersistedReports(): Promise<FeedbackReport[]> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const items = await prisma.feedItem.findMany({
      where: { type: FEED_TYPE },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    if (items.length > 0) {
      for (const item of items) {
        const rep = item.data as unknown as FeedbackReport;
        if (rep && rep.id && !REPORTS.some((r) => r.id === rep.id)) {
          addReport(rep);
          if (rep.routeToAutomatedPatchQueue && !AUTOMATED_PATCH_QUEUE.some((q) => q.feedbackId === rep.id)) {
            pushToAutomatedPatchQueue({
              feedbackId: rep.id,
              category: rep.category,
              severity: rep.severity,
              classification: rep.classification,
              page: rep.page,
              message: rep.message,
              timestamp: rep.timestamp,
            });
          }
        }
      }
      return getAllReports();
    }
  } catch {
    // Try file fallback
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'data', 'feedback-queue.json');
      if (fs.existsSync(filePath)) {
        const items = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as FeedbackReport[];
        for (const rep of items) {
          if (rep && rep.id && !REPORTS.some((r) => r.id === rep.id)) {
            addReport(rep);
          }
        }
      }
    } catch {}
  }
  return getAllReports();
}

export function getAllReports(): FeedbackReport[] {
  return [...REPORTS].sort((a, b) => b.timestamp - a.timestamp);
}

export async function resolveReport(feedbackId: string): Promise<boolean> {
  const item = REPORTS.find((r) => r.id === feedbackId);
  if (item) item.status = 'RESOLVED';

  // Update in database if connected
  try {
    const { prisma } = await import('@/lib/prisma');
    const feedItem = await prisma.feedItem.findFirst({
      where: { type: FEED_TYPE, entityId: feedbackId },
    });
    if (feedItem) {
      const updated = { ...(feedItem.data as object), status: 'RESOLVED' };
      await prisma.feedItem.update({
        where: { id: feedItem.id },
        data: { data: updated },
      });
    }
  } catch {}

  return true;
}

/**
 * Format a feedback report for immediate copy/paste into Anti-Gravity or Cursor.
 */
export function formatFeedbackForAI(report: FeedbackReport): string {
  const isoTime = new Date(report.timestamp).toISOString();
  return [
    `============================================================`,
    `TMI BETA DEFECT REPORT — READY FOR AI FIX`,
    `============================================================`,
    `REPORT ID: ${report.id}`,
    `CATEGORY: ${report.category}`,
    `SEVERITY: ${report.severity.toUpperCase()}`,
    `CLASSIFICATION: ${report.classification}`,
    `ROUTE / PAGE: ${report.page ?? 'Not specified'}`,
    `TIMESTAMP: ${isoTime}`,
    `STATUS: ${report.status ?? 'NEW'}`,
    `TAGS: ${(report.tags || []).join(', ')}`,
    ``,
    `USER MESSAGE:`,
    `"${report.message || 'No description provided'}"`,
    ``,
    `INSTRUCTIONS FOR AI AGENT (ANTI-GRAVITY / CURSOR):`,
    `1. Trace the defect through canonical authority on: ${report.page || 'active route'}`,
    `2. Fix the underlying root cause without using fake local React state.`,
    `3. Ensure changes adhere to TMI Anti-Bloat Law (consolidate before create).`,
    `4. Verify with automated tests and prove pnpm --filter web typecheck passes cleanly.`,
    `============================================================`,
  ].join('\n');
}

/**
 * Format all pending feedback reports in a single combined AI instruction batch.
 */
export function formatAllQueuedForAI(): string {
  const pending = REPORTS.filter((r) => r.status !== 'RESOLVED');
  if (pending.length === 0) {
    return 'NO PENDING BETA FEEDBACK DEFECTS IN QUEUE.';
  }
  return [
    `============================================================`,
    `TMI BATCH BETA DEFECTS (${pending.length} ITEMS) — READY FOR AI FIX`,
    `============================================================`,
    ...pending.map((r, i) => `\n--- DEFECT #${i + 1} ---\n${formatFeedbackForAI(r)}`),
    `\n============================================================`,
  ].join('\n');
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
    reports: getAllReports(),
  };
}

export function getAutomatedPatchQueue() {
  return [...AUTOMATED_PATCH_QUEUE].sort((a, b) => b.timestamp - a.timestamp);
}

export function pushToAutomatedPatchQueue(item: PatchQueueItem) {
  AUTOMATED_PATCH_QUEUE.push(item);
}

export const FeedbackStore = {
  addReport,
  persistReportToStorage,
  loadPersistedReports,
  getAllReports,
  getFeedbackSummary,
  getAutomatedPatchQueue,
  pushToAutomatedPatchQueue,
  formatFeedbackForAI,
  formatAllQueuedForAI,
  submitReport: async (params: {
    title?: string;
    message?: string;
    description?: string;
    category?: unknown;
    severity?: unknown;
    page?: string;
    route?: string;
    deviceClass?: string;
    viewport?: string;
    browser?: string;
    os?: string;
    userId?: string;
    tags?: unknown;
  }) => {
    const cat = normalizeCategory(params.category);
    const sev = normalizeSeverity(params.severity, cat);
    const id = `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const report: FeedbackReport = {
      id,
      category: cat,
      severity: sev,
      classification: CATEGORY_CLASSIFICATION[cat] ?? 'polish',
      tags: normalizeTags(params.tags),
      routeToAutomatedPatchQueue: shouldRouteToAutomatedPatchQueue(cat, sev, 1),
      message: params.description || params.message || params.title || 'Beta feedback report',
      page: params.route || params.page || '/hub/fan',
      timestamp: Date.now(),
      status: 'NEW',
      userId: params.userId,
    };
    addReport(report);
    await persistReportToStorage(report);
    return report;
  },
  getReportById: (id: string) => {
    return REPORTS.find((r) => r.id === id);
  },
};

