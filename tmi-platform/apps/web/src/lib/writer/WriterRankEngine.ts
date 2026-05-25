// WriterRankEngine — score writers based on performance + consistency.
// Score feeds into Pro-Legacy Ledger milestones and hiring/ranking displays.

export type WriterTier = "Rookie" | "Staff" | "Featured" | "Senior" | "Editor";

export interface WriterScore {
  writerId: string;
  xp: number;
  tier: WriterTier;
  articlesPublished: number;
  totalViews: number;
  avgEngagement: number;
  assignmentsCompleted: number;
  badgeCount: number;
  consistency: number; // 0-100
  lastPublishedAt?: string;
}

const scores = new Map<string, WriterScore>();

function calcTier(xp: number): WriterTier {
  if (xp >= 5000) return "Editor";
  if (xp >= 2000) return "Senior";
  if (xp >= 800)  return "Featured";
  if (xp >= 200)  return "Staff";
  return "Rookie";
}

/** Recalculate and upsert score for a writer */
export function updateScore(
  writerId: string,
  delta: {
    articles?: number;
    views?: number;
    engagement?: number;
    assignments?: number;
    badges?: number;
    consistencyPoints?: number;
  },
): WriterScore {
  const current = scores.get(writerId) ?? {
    writerId,
    xp: 0,
    tier: "Rookie" as WriterTier,
    articlesPublished: 0,
    totalViews: 0,
    avgEngagement: 0,
    assignmentsCompleted: 0,
    badgeCount: 0,
    consistency: 0,
    lastPublishedAt: undefined,
  };

  const articlesPublished  = current.articlesPublished  + (delta.articles    ?? 0);
  const totalViews         = current.totalViews         + (delta.views       ?? 0);
  const assignmentsCompleted = current.assignmentsCompleted + (delta.assignments ?? 0);
  const badgeCount         = current.badgeCount         + (delta.badges      ?? 0);
  const consistency        = Math.min(100, current.consistency + (delta.consistencyPoints ?? 0));
  const avgEngagement      = delta.engagement != null
    ? (current.avgEngagement + delta.engagement) / 2
    : current.avgEngagement;

  // XP formula: articles × 50 + views / 100 + assignments × 80 + badges × 30 + consistency
  const xp = Math.round(
    articlesPublished * 50 +
    totalViews / 100 +
    assignmentsCompleted * 80 +
    badgeCount * 30 +
    consistency
  );

  const updated: WriterScore = {
    writerId,
    xp,
    tier: calcTier(xp),
    articlesPublished,
    totalViews,
    avgEngagement,
    assignmentsCompleted,
    badgeCount,
    consistency,
    lastPublishedAt: delta.articles ? new Date().toISOString() : current.lastPublishedAt,
  };

  scores.set(writerId, updated);
  return updated;
}

export function getScore(writerId: string): WriterScore {
  return scores.get(writerId) ?? {
    writerId,
    xp: 0,
    tier: "Rookie",
    articlesPublished: 0,
    totalViews: 0,
    avgEngagement: 0,
    assignmentsCompleted: 0,
    badgeCount: 0,
    consistency: 0,
  };
}

export function getLeaderboard(limit = 10): WriterScore[] {
  return [...scores.values()]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

export const TIER_COLOR: Record<WriterTier, string> = {
  Rookie:   "#94a3b8",
  Staff:    "#00FF88",
  Featured: "#00FFFF",
  Senior:   "#FFD700",
  Editor:   "#FF2DAA",
};

/** Compute score from wall items — shortcut for profile pages without explicit tracking */
export function scoreWriter(writerId: string): WriterScore & { tierColor: string } {
  const score = getScore(writerId);
  return { ...score, tierColor: TIER_COLOR[score.tier] };
}

/** Human-readable tier label for UI display */
export function getWriterTierLabel(tier: WriterTier): string {
  const LABELS: Record<WriterTier, string> = {
    Rookie:   "Rookie Writer",
    Staff:    "Staff Writer",
    Featured: "Featured Writer",
    Senior:   "Senior Writer",
    Editor:   "Editor",
  };
  return LABELS[tier];
}
