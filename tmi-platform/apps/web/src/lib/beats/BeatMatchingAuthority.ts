/**
 * BeatMatchingAuthority.ts
 *
 * Truthful, Explainable Candidate Fit Engine for TMI Experiences.
 * Evaluates candidate beats against requested experience profiles (Battles,
 * Cyphers, Challenges, Gauntlets, Games).
 *
 * Product Laws Enforced:
 * 1. Rights & Policy: Binary hard gates (0 or 1). Ineligible material cannot overcome clearance failure.
 * 2. Truthful Metadata: BPM and key are treated strictly as PRODUCER_DECLARED with transparent confidence.
 *    Never claims unverified machine-measured precision when live DSP is not connected.
 * 3. Configurable Experience Profiles: Supports multiple genres and styles without rigid hardcoded limits.
 * 4. Rotation & Fairness: Accounts for historical play counts to give newly submitted producer beats airplay.
 */

export type ExperienceType =
  | "battle"
  | "cypher"
  | "challenge"
  | "gauntlet"
  | "game"
  | "showcase";

export type ExperienceMatchingContext = {
  experienceType: ExperienceType;
  roomId?: string;
  lane?: string;
  round?: number;
  genreRequested?: string;
  targetBpm?: number;
  bpmTolerance?: number; // default +/- 15 BPM
  excludeBeatIds?: string[];
  allowExplicit?: boolean;
};

export type CandidateBeatInput = {
  id: string;
  title: string;
  genre?: string | null;
  genreJson?: string | null;
  bpm?: number | null;
  key?: string | null;
  tags?: string[] | null;
  producerId?: string | null;
  producerName?: string | null;
  status?: string | null;
  moderationStatus?: string | null;
  competitionEligible?: boolean | null;
  playCount?: number | null;
  audioAssetUrl?: string | null;
  previewUrl?: string | null;
  isExclusiveSold?: boolean;
};

export type BeatFitEvaluation = {
  beatId: string;
  eligible: boolean;
  fitScore: number; // 0 to 100
  reasons: string[];
  hardGateFailed?: string;
  confidence: {
    bpm: "PRODUCER_DECLARED";
    key: "PRODUCER_DECLARED";
    dspAnalysis: "UNAVAILABLE";
  };
};

/**
 * Evaluates candidate beat fitness against an experience context.
 */
export function evaluateBeatFit(
  beat: CandidateBeatInput,
  context: ExperienceMatchingContext
): BeatFitEvaluation {
  const reasons: string[] = [];

  const confidence = {
    bpm: "PRODUCER_DECLARED" as const,
    key: "PRODUCER_DECLARED" as const,
    dspAnalysis: "UNAVAILABLE" as const,
  };

  // ─── GATE 1: Rights & Exclusive Lock ───
  if (beat.isExclusiveSold) {
    return {
      beatId: beat.id,
      eligible: false,
      fitScore: 0,
      hardGateFailed: "EXCLUSIVE_SOLD_LOCKED",
      reasons: ["Beat has been sold exclusively and is locked out of public event candidate pools."],
      confidence,
    };
  }

  const status = (beat.status ?? "").toUpperCase();
  if (status === "SOLD_EXCLUSIVE" || status === "EXCLUSIVE_LOCKED") {
    return {
      beatId: beat.id,
      eligible: false,
      fitScore: 0,
      hardGateFailed: "STATUS_EXCLUSIVE_SOLD",
      reasons: ["Beat status is marked SOLD_EXCLUSIVE."],
      confidence,
    };
  }

  if (Array.isArray(beat.tags) && beat.tags.includes("exclusively-sold")) {
    return {
      beatId: beat.id,
      eligible: false,
      fitScore: 0,
      hardGateFailed: "TAG_EXCLUSIVE_SOLD",
      reasons: ["Beat carries exclusively-sold tag."],
      confidence,
    };
  }

  // ─── GATE 2: Moderation & Policy ───
  const modStatus = (beat.moderationStatus ?? "").toUpperCase();
  if (modStatus === "REJECTED") {
    return {
      beatId: beat.id,
      eligible: false,
      fitScore: 0,
      hardGateFailed: "MODERATION_REJECTED",
      reasons: ["Beat has been rejected by moderation."],
      confidence,
    };
  }

  if (beat.competitionEligible === false) {
    return {
      beatId: beat.id,
      eligible: false,
      fitScore: 0,
      hardGateFailed: "COMPETITION_INELIGIBLE",
      reasons: ["Producer flagged this beat as ineligible for public competitions."],
      confidence,
    };
  }

  // ─── GATE 3: Exclusion List ───
  if (context.excludeBeatIds && context.excludeBeatIds.includes(beat.id)) {
    return {
      beatId: beat.id,
      eligible: false,
      fitScore: 0,
      hardGateFailed: "RECENTLY_PLAYED_EXCLUDED",
      reasons: ["Beat was recently played in this room or session and is excluded."],
      confidence,
    };
  }

  // ─── SCORING FACTORS (0 to 100) ───
  let score = 0;

  // 1. Genre / Style Fit (Max 45 points)
  const reqGenre = (context.genreRequested ?? "").trim().toLowerCase();
  const beatGenre = (beat.genre ?? "").toLowerCase();

  let parsedGenres: string[] = [];
  if (beat.genreJson) {
    try {
      const arr = JSON.parse(beat.genreJson);
      if (Array.isArray(arr)) parsedGenres = arr.map((g) => String(g).toLowerCase());
    } catch {
      /* ignore */
    }
  }

  if (!reqGenre || reqGenre === "all" || reqGenre === "open") {
    score += 35;
    reasons.push("Open genre category match (+35)");
  } else if (beatGenre === reqGenre || parsedGenres.includes(reqGenre)) {
    score += 45;
    reasons.push(`Direct genre match: ${beat.genre} (+45)`);
  } else if (
    (beat.tags && beat.tags.some((t) => t.toLowerCase().includes(reqGenre))) ||
    beatGenre.includes(reqGenre) ||
    reqGenre.includes(beatGenre)
  ) {
    score += 30;
    reasons.push(`Related genre / tag match: ${beat.genre} (+30)`);
  } else {
    score += 15;
    reasons.push(`Genre compatibility baseline: ${beat.genre || "Other"} (+15)`);
  }

  // 2. Tempo / BPM Proximity (Max 35 points)
  const declaredBpm = beat.bpm ?? 120;
  if (context.targetBpm != null && context.targetBpm > 0) {
    const delta = Math.abs(declaredBpm - context.targetBpm);
    const tolerance = context.bpmTolerance ?? 15;

    if (delta === 0) {
      score += 35;
      reasons.push(`Exact BPM match: ${declaredBpm} BPM (+35, producer declared)`);
    } else if (delta <= 5) {
      score += 30;
      reasons.push(`Within 5 BPM of target (${declaredBpm} vs ${context.targetBpm}) (+30)`);
    } else if (delta <= tolerance) {
      score += 20;
      reasons.push(`Within ${tolerance} BPM tolerance (${declaredBpm} vs ${context.targetBpm}) (+20)`);
    } else {
      score += 10;
      reasons.push(`BPM outside target window (${declaredBpm} vs ${context.targetBpm}) (+10)`);
    }
  } else {
    score += 25;
    reasons.push(`Declared tempo: ${declaredBpm} BPM (neutral target, +25)`);
  }

  // 3. Rotation Freshness & Fair Play (Max 20 points)
  const playCount = beat.playCount ?? 0;
  if (playCount === 0) {
    score += 20;
    reasons.push("New submission freshness boost (+20)");
  } else if (playCount < 3) {
    score += 16;
    reasons.push(`Low play count (${playCount}) rotation priority (+16)`);
  } else if (playCount < 10) {
    score += 12;
    reasons.push(`Moderate rotation count (${playCount}) (+12)`);
  } else {
    score += 8;
    reasons.push(`Standard rotation tier (${playCount} previous plays) (+8)`);
  }

  const finalScore = Math.min(Math.max(score, 0), 100);

  return {
    beatId: beat.id,
    eligible: true,
    fitScore: finalScore,
    reasons,
    confidence,
  };
}
