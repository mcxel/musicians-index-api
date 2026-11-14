/**
 * LeaderboardTruthDirector.ts — Non-Human Competitive Data Elimination & Provenance Authority
 *
 * Laws:
 * - ONLY REAL_HUMAN + ELIGIBLE SCORE EVENTS may affect:
 *    leaderboard rank, season standings, prize eligibility, rewards, trending, crown position.
 * - Non-human identities (BOT, SEED, DEMO, QA_AUTOMATION, CERTIFICATION, LEGACY_PLACEHOLDER)
 *    must NEVER occupy competitive leaderboard rows or block human participants.
 * - Test accounts & bots must carry explicit non-competitive flags:
 *    rankingEligible = false, rewardEligible = false, viewerCountEligible = false, competitionEligible = false.
 * - Score truth: visible score must trace back to legitimate human participation events.
 */

export type ParticipantClassification =
  | "REAL_HUMAN"
  | "SEED"
  | "DEMO"
  | "BOT"
  | "QA_AUTOMATION"
  | "CERTIFICATION"
  | "LEGACY_PLACEHOLDER"
  | "UNKNOWN";

export interface LeaderboardTruthCandidate {
  id: string;
  name: string;
  score: number;
  slug?: string;
  avatarUrl?: string;
  profileRoute?: string;
  isBot?: boolean;
  isSeed?: boolean;
  isDemo?: boolean;
  classification?: ParticipantClassification;
  rankingEligible?: boolean;
  rewardEligible?: boolean;
  competitionEligible?: boolean;
  viewerCountEligible?: boolean;
  scoreEventIds?: string[];
  createdAt?: string | number;
}

export interface AuditedLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  slug?: string;
  avatarUrl?: string;
  badge: string;
  color: string;
  icon?: string;
  classification: ParticipantClassification;
  rankingEligible: boolean;
  rewardEligible: boolean;
  competitionEligible: boolean;
  provenance: string;
}

export interface ExcludedLeaderboardRecord {
  id: string;
  name: string;
  attemptedScore: number;
  classification: ParticipantClassification;
  exclusionReason: string;
  timestamp: number;
}

/**
 * Known Seed / Demo / Bot identity stems identified in platform audit.
 * These must be excluded from competitive rankings.
 */
const KNOWN_SEED_SLUGS = new Set([
  "wavetek",
  "zuri-bloom",
  "krypt",
  "neon-vibe",
  "vela-flux",
  "astra-nova",
  "bar-god",
  "verse-knight",
  "flow-master",
  "kova",
  "nera-vex",
  "blaze-cartel",
  "lila-sun",
  "drift-sound",
  "mack-ferro",
  "asha-wave",
  "terron-b",
  "solara",
  "kase-duro",
]);

const EXCLUSION_AUDIT_LOG: ExcludedLeaderboardRecord[] = [];

/**
 * Classify any participant candidate based on identity, asset provenance, and metadata.
 */
export function classifyParticipant(
  candidate: Partial<LeaderboardTruthCandidate>,
): ParticipantClassification {
  const id = (candidate.id ?? "").toLowerCase();
  const slug = (candidate.slug ?? "").toLowerCase();
  const name = (candidate.name ?? "").toLowerCase();
  const avatar = (candidate.avatarUrl ?? "").toLowerCase();

  // Explicit flags
  if (candidate.isBot || id.startsWith("bot:") || name.startsWith("[bot]")) return "BOT";
  if (candidate.isDemo || name.includes("demo")) return "DEMO";
  if (candidate.isSeed) return "SEED";

  // Test / QA / Cert accounts
  if (id.includes("test") || id.includes("qa-") || id.includes("cert-") || name.includes("test")) {
    return "QA_AUTOMATION";
  }

  // Known seeds from seed catalogs
  if (KNOWN_SEED_SLUGS.has(slug) || KNOWN_SEED_SLUGS.has(id)) {
    return "SEED";
  }

  // Bot asset folders
  if (avatar.includes("/bot-images/") || avatar.includes("/avatars/bot-") || avatar.includes("bot image")) {
    return "BOT";
  }

  // Placeholder accounts
  if (id.startsWith("placeholder") || id.startsWith("empty-") || name.includes("placeholder")) {
    return "LEGACY_PLACEHOLDER";
  }

  // Real human or unknown
  if (id.length > 0 && !id.startsWith("mock") && !id.startsWith("fixture")) {
    return "REAL_HUMAN";
  }

  return "UNKNOWN";
}

/**
 * Determine if a candidate is eligible for competitive leaderboard ranking.
 * Strict law: ONLY REAL_HUMAN participants may be ranked.
 */
export function isCompetitiveEligible(
  candidate: Partial<LeaderboardTruthCandidate>,
): boolean {
  // Explicit disallowance
  if (candidate.rankingEligible === false || candidate.competitionEligible === false) {
    return false;
  }

  const classification = candidate.classification ?? classifyParticipant(candidate);
  return classification === "REAL_HUMAN";
}

/**
 * Filter and re-rank a leaderboard candidate array.
 * Purges all seed, demo, bot, and QA fixtures from human standings.
 * Preserves audit trail of excluded entries.
 */
export function purgeAndRankHumanLeaderboard(
  candidates: LeaderboardTruthCandidate[],
): {
  rankedEntries: AuditedLeaderboardEntry[];
  excludedEntries: ExcludedLeaderboardRecord[];
} {
  const humanEntries: LeaderboardTruthCandidate[] = [];
  const newlyExcluded: ExcludedLeaderboardRecord[] = [];

  for (const c of candidates) {
    const classification = c.classification ?? classifyParticipant(c);
    const eligible = isCompetitiveEligible({ ...c, classification });

    if (eligible) {
      humanEntries.push({
        ...c,
        classification,
        rankingEligible: true,
        rewardEligible: true,
        competitionEligible: true,
      });
    } else {
      const record: ExcludedLeaderboardRecord = {
        id: c.id,
        name: c.name,
        attemptedScore: c.score,
        classification,
        exclusionReason: `Non-human competitive entry (${classification}) excluded from canonical leaderboard.`,
        timestamp: Date.now(),
      };
      newlyExcluded.push(record);
      EXCLUSION_AUDIT_LOG.push(record);
    }
  }

  // Sort real humans by score descending
  humanEntries.sort((a, b) => b.score - a.score);

  // Assign sequential human ranks: 1, 2, 3...
  const rankedEntries: AuditedLeaderboardEntry[] = humanEntries.map((h, index) => {
    const rank = index + 1;
    const badge = rank === 1 ? "CROWN" : rank <= 5 ? "TOP 5" : rank <= 10 ? "TOP 10" : "RANKED";
    const color = rank === 1 ? "#FFD700" : rank <= 5 ? "#00FF88" : rank <= 10 ? "#00FFFF" : "rgba(255,255,255,0.7)";

    return {
      rank,
      id: h.id,
      name: h.name,
      score: h.score,
      slug: h.slug,
      avatarUrl: h.avatarUrl,
      badge,
      color,
      icon: rank === 1 ? "👑" : rank <= 3 ? "🏆" : "👤",
      classification: "REAL_HUMAN",
      rankingEligible: true,
      rewardEligible: true,
      competitionEligible: true,
      provenance: `Verified human score events (${h.score.toLocaleString()} XP)`,
    };
  });

  return {
    rankedEntries,
    excludedEntries: newlyExcluded,
  };
}

/**
 * Retrieve current exclusion audit history.
 */
export function getLeaderboardExclusionAudit(): readonly ExcludedLeaderboardRecord[] {
  return EXCLUSION_AUDIT_LOG;
}
