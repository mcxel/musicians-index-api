// WriterBadgeSystem — achievement badges for editorial performance.
// Badges earned by hitting milestones tracked by WriterRankEngine.

export type WriterBadgeId =
  | "first-publish"
  | "top-interviewer"
  | "breaking-news"
  | "five-star-feature"
  | "sponsored-writer"
  | "consistent-voice"
  | "viral-article"
  | "crowd-favorite"
  | "editorial-choice"
  | "senior-contributor";

export interface WriterBadge {
  id: WriterBadgeId;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const BADGE_CATALOG: Record<WriterBadgeId, WriterBadge> = {
  "first-publish":       { id: "first-publish",       name: "First Publish",         description: "Published your first TMI article",          icon: "🖊️",  color: "#94a3b8", rarity: "common" },
  "top-interviewer":     { id: "top-interviewer",     name: "Top Interviewer",        description: "Conducted 5+ interviews on TMI",             icon: "🎙️",  color: "#00FFFF", rarity: "rare" },
  "breaking-news":       { id: "breaking-news",       name: "Breaking News",          description: "First article on a trending TMI story",      icon: "⚡",   color: "#FFD700", rarity: "rare" },
  "five-star-feature":   { id: "five-star-feature",   name: "5-Star Feature",         description: "Feature article with 90%+ engagement",       icon: "⭐",   color: "#FFD700", rarity: "rare" },
  "sponsored-writer":    { id: "sponsored-writer",    name: "Sponsored Writer",       description: "Completed a paid sponsor article",           icon: "💼",   color: "#00FF88", rarity: "rare" },
  "consistent-voice":    { id: "consistent-voice",    name: "Consistent Voice",       description: "Published 4+ weeks in a row",                icon: "🔥",   color: "#FF6B35", rarity: "rare" },
  "viral-article":       { id: "viral-article",       name: "Viral Article",          description: "Article reached 10,000+ views",              icon: "🌍",   color: "#FF2DAA", rarity: "epic" },
  "crowd-favorite":      { id: "crowd-favorite",      name: "Crowd Favorite",         description: "Most-shared article in a magazine issue",     icon: "👏",   color: "#AA2DFF", rarity: "epic" },
  "editorial-choice":    { id: "editorial-choice",    name: "Editorial Choice",       description: "Featured by the TMI editorial team",          icon: "📌",   color: "#FF2DAA", rarity: "epic" },
  "senior-contributor":  { id: "senior-contributor",  name: "Senior Contributor",     description: "Published 50+ articles on TMI",               icon: "🏆",   color: "#FFD700", rarity: "legendary" },
};

const earnedBadges = new Map<string, Set<WriterBadgeId>>(); // writerId → badge ids

export function awardBadge(writerId: string, badgeId: WriterBadgeId): boolean {
  const set = earnedBadges.get(writerId) ?? new Set();
  if (set.has(badgeId)) return false; // already earned
  set.add(badgeId);
  earnedBadges.set(writerId, set);
  return true;
}

export function getBadges(writerId: string): WriterBadge[] {
  const ids = earnedBadges.get(writerId) ?? new Set();
  return [...ids].map((id) => BADGE_CATALOG[id]);
}

export function hasBadge(writerId: string, badgeId: WriterBadgeId): boolean {
  return earnedBadges.get(writerId)?.has(badgeId) ?? false;
}

/** Auto-award badges based on current score thresholds */
export function checkAndAwardMilestones(
  writerId: string,
  stats: { articlesPublished: number; totalViews: number; assignmentsCompleted: number },
): WriterBadgeId[] {
  const awarded: WriterBadgeId[] = [];

  if (stats.articlesPublished >= 1 && awardBadge(writerId, "first-publish"))
    awarded.push("first-publish");
  if (stats.articlesPublished >= 50 && awardBadge(writerId, "senior-contributor"))
    awarded.push("senior-contributor");
  if (stats.totalViews >= 10000 && awardBadge(writerId, "viral-article"))
    awarded.push("viral-article");
  if (stats.assignmentsCompleted >= 1 && awardBadge(writerId, "sponsored-writer"))
    awarded.push("sponsored-writer");

  return awarded;
}

/** Alias for getBadges + normalized shape for UI display */
export function getEarnedBadges(writerId: string): (WriterBadge & { label: string; color: string })[] {
  return getBadges(writerId).map((b) => ({
    ...b,
    label: b.name,
    color: RARITY_COLOR[b.rarity],
  }));
}

export const RARITY_COLOR: Record<WriterBadge["rarity"], string> = {
  common:    "#94a3b8",
  rare:      "#00FFFF",
  epic:      "#AA2DFF",
  legendary: "#FFD700",
};
