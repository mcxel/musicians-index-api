// Championship & Yearly Awards Engine
// Weekly belt → Monthly champion → Yearly crown/trophy
// All disciplines: bands, comedians, dancers, actors, singers, producers, DJs, etc.
// Fan votes weighted by Season Pass tier

export type CompetitionCategory =
  | "battle-of-the-band"
  | "comedian"
  | "joke-off"
  | "dancer"
  | "actor"
  | "singer"
  | "producer"
  | "dj"
  | "rapper"
  | "instrumentalist"
  | "cypher-king"
  | "song-challenge";

export const CATEGORY_LABELS: Record<CompetitionCategory, string> = {
  "battle-of-the-band": "Battle of the Band",
  "comedian":           "Best Comedian",
  "joke-off":           "Joke-Off Champion",
  "dancer":             "Best Dancer",
  "actor":              "Best Actor",
  "singer":             "Best Singer",
  "producer":           "Best Producer",
  "dj":                 "Best DJ",
  "rapper":             "Best Rapper / Emcee",
  "instrumentalist":    "Best Instrumentalist",
  "cypher-king":        "Cypher King",
  "song-challenge":     "Song Challenge Winner",
};

export const CATEGORY_ICONS: Record<CompetitionCategory, string> = {
  "battle-of-the-band": "🎸",
  "comedian":           "🎭",
  "joke-off":           "😂",
  "dancer":             "💃",
  "actor":              "🎬",
  "singer":             "🎤",
  "producer":           "🎛️",
  "dj":                 "🎧",
  "rapper":             "🎙️",
  "instrumentalist":    "🎺",
  "cypher-king":        "👑",
  "song-challenge":     "🏆",
};

export type ChampionshipPeriod = "weekly" | "monthly" | "yearly";

export type ChampionAward = "belt" | "trophy" | "crown";

export const PERIOD_AWARD: Record<ChampionshipPeriod, ChampionAward> = {
  weekly:  "belt",
  monthly: "trophy",
  yearly:  "crown",
};

// Season Pass multipliers for fan vote weight
export const VOTE_WEIGHT_BY_PASS: Record<string, number> = {
  none:  1.0,
  base:  1.5,
  pro:   2.5,
  elite: 4.0,
};

export type VoteRecord = {
  voteId: string;
  voterId: string;
  artistId: string;
  category: CompetitionCategory;
  period: string;   // "2026-W21" | "2026-05" | "2026"
  baseWeight: number;
  seasonPassTier: string;
  weightedValue: number;
  castAtMs: number;
};

export type ChampionRecord = {
  championId: string;
  artistId: string;
  artistName: string;
  category: CompetitionCategory;
  periodType: ChampionshipPeriod;
  period: string;
  rawVotes: number;
  weightedVotes: number;
  prizeAmountCents: number;
  sponsorIds: string[];
  award: ChampionAward;
  awardedAtMs: number;
};

export type CategoryLeaderboard = {
  category: CompetitionCategory;
  period: string;
  entries: Array<{
    artistId: string;
    artistName: string;
    weightedVotes: number;
    rank: number;
  }>;
};

export class ChampionshipYearlyEngine {
  private votes: VoteRecord[] = [];
  private champions: ChampionRecord[] = [];
  private voteCounter = 1;
  private championCounter = 1;

  castVote(
    voterId: string,
    artistId: string,
    artistName: string,
    category: CompetitionCategory,
    period: string,
    seasonPassTier: string = "none",
  ): VoteRecord {
    const multiplier = VOTE_WEIGHT_BY_PASS[seasonPassTier] ?? 1.0;
    const vote: VoteRecord = {
      voteId: `v-${this.voteCounter++}`,
      voterId,
      artistId,
      category,
      period,
      baseWeight: 1,
      seasonPassTier,
      weightedValue: multiplier,
      castAtMs: Date.now(),
    };
    this.votes.push(vote);
    return vote;
  }

  getLeaderboard(category: CompetitionCategory, period: string): CategoryLeaderboard {
    const relevant = this.votes.filter(
      (v) => v.category === category && v.period === period,
    );

    const tally = new Map<string, { artistName: string; weighted: number }>();
    for (const v of relevant) {
      const existing = tally.get(v.artistId) ?? { artistName: v.artistId, weighted: 0 };
      existing.weighted += v.weightedValue;
      tally.set(v.artistId, existing);
    }

    const entries = Array.from(tally.entries())
      .map(([artistId, { artistName, weighted }]) => ({ artistId, artistName, weightedVotes: weighted, rank: 0 }))
      .sort((a, b) => b.weightedVotes - a.weightedVotes)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return { category, period, entries };
  }

  crownChampion(
    category: CompetitionCategory,
    periodType: ChampionshipPeriod,
    period: string,
    prizeAmountCents: number,
    sponsorIds: string[] = [],
  ): ChampionRecord | null {
    const board = this.getLeaderboard(category, period);
    const winner = board.entries[0];
    if (!winner) return null;

    const record: ChampionRecord = {
      championId: `champ-${this.championCounter++}`,
      artistId: winner.artistId,
      artistName: winner.artistName,
      category,
      periodType,
      period,
      rawVotes: this.votes.filter((v) => v.artistId === winner.artistId && v.period === period).length,
      weightedVotes: winner.weightedVotes,
      prizeAmountCents,
      sponsorIds,
      award: PERIOD_AWARD[periodType],
      awardedAtMs: Date.now(),
    };

    this.champions.push(record);
    return record;
  }

  getChampions(category?: CompetitionCategory, periodType?: ChampionshipPeriod): ChampionRecord[] {
    return this.champions.filter((c) =>
      (!category || c.category === category) &&
      (!periodType || c.periodType === periodType),
    );
  }

  getRecentChampions(limit = 10): ChampionRecord[] {
    return [...this.champions]
      .sort((a, b) => b.awardedAtMs - a.awardedAtMs)
      .slice(0, limit);
  }

  getAllCategories(): CompetitionCategory[] {
    return Object.keys(CATEGORY_LABELS) as CompetitionCategory[];
  }
}

export const championshipYearlyEngine = new ChampionshipYearlyEngine();
