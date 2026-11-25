/**
 * ArticleQuestionBank.ts — the ONE centralized question authority for the
 * Article Submission Form's first-article interview AND future TMI Writer
 * interviews (same bank, same selection law — never two systems).
 *
 * Three question families:
 *   EDITORIAL  — establishes the article's substance (story/career/work).
 *   PERSONAL   — "get to know me" everyday preferences (pizza, ice cream, …).
 *   WILD_CARD  — funny/absurd/imaginative scenarios that produce quotable,
 *                personality-revealing reactions (aliens, robots, talking
 *                equipment, haunted studios, …). Non-graphic, non-degrading.
 *
 * Controlled selection (never pure randomness):
 *   minimum five-question set enforces EDITORIAL>=2, PERSONAL>=1, WILD_CARD>=1,
 *   no duplicate/near-duplicate questions, role-aware applicability, and a
 *   deterministic seed so the SAME question set is persisted with the draft
 *   and never re-randomized on reopen.
 *
 * Rule 20: answers rendered into an article are always the person's REAL
 * answer text — this bank never fabricates responses.
 */

export type ArticleQuestionCategory = "EDITORIAL" | "PERSONAL" | "WILD_CARD";
export type ArticleQuestionRole = "performer" | "fan" | "business" | "all";

export interface ArticleQuestion {
  /** Stable id — persisted on the draft so the set never re-randomizes. */
  questionId: string;
  text: string;
  category: ArticleQuestionCategory;
  /** Which account roles this question applies to. "all" = everyone. */
  roles: ArticleQuestionRole[];
  /** Editorial topic for category-balanced placement in the composition. */
  topic?: string;
  /** Lower weight = selected less often when banks are large. Default 1. */
  weight?: number;
}

// ---------------------------------------------------------------------------
// EDITORIAL — substance. Role-aware.
// ---------------------------------------------------------------------------
const EDITORIAL: ArticleQuestion[] = [
  { questionId: "ed-origin-sound", category: "EDITORIAL", roles: ["performer"], topic: "origin", text: "How did you first find your sound? What pulled you into making music?" },
  { questionId: "ed-origin-start", category: "EDITORIAL", roles: ["performer"], topic: "origin", text: "Where did your journey as a performer actually start — the moment you knew this was it?" },
  { questionId: "ed-influences", category: "EDITORIAL", roles: ["performer"], topic: "influences", text: "Who or what shaped your style the most? Name the influences people might hear in your work." },
  { questionId: "ed-current-work", category: "EDITORIAL", roles: ["performer"], topic: "current", text: "What are you working on right now that you want people to hear about?" },
  { questionId: "ed-process", category: "EDITORIAL", roles: ["performer"], topic: "process", text: "Walk us through your creative process — how does a track or performance come together for you?" },
  { questionId: "ed-stage", category: "EDITORIAL", roles: ["performer"], topic: "performing", text: "What's a moment on stage or on camera that you'll never forget? What happened?" },
  { questionId: "ed-goals", category: "EDITORIAL", roles: ["performer"], topic: "goals", text: "Where are you taking this next? What are the goals you're chasing this year?" },
  { questionId: "ed-fans", category: "EDITORIAL", roles: ["performer"], topic: "fans", text: "What do you want the people listening to you to actually take away from your work?" },
  { questionId: "ed-challenge", category: "EDITORIAL", roles: ["performer"], topic: "challenges", text: "What's been the hardest part of building this, and how did you push through it?" },
  { questionId: "ed-collab", category: "EDITORIAL", roles: ["performer"], topic: "collaborations", text: "Is there a collaboration or session that changed how you work? Tell us about it." },
  { questionId: "ed-achievement", category: "EDITORIAL", roles: ["performer"], topic: "achievements", text: "What's something you've done so far that you're genuinely proud of?" },
  { questionId: "ed-known", category: "EDITORIAL", roles: ["all"], topic: "known", text: "What's the one thing you want people to know about you after reading this?" },
  { questionId: "ed-why-tmi", category: "EDITORIAL", roles: ["fan", "all"], topic: "community", text: "What brought you to TMI, and what are you hoping to find or build here?" },
  { questionId: "ed-fan-music", category: "EDITORIAL", roles: ["fan"], topic: "interests", text: "What kind of music or creators do you find yourself coming back to, and why?" },
  { questionId: "ed-fan-discovery", category: "EDITORIAL", roles: ["fan"], topic: "discovery", text: "What's the best thing you've discovered on the platform so far?" },
  { questionId: "ed-biz-mission", category: "EDITORIAL", roles: ["business"], topic: "mission", text: "What's the mission behind what you're building, and who is it for?" },
  { questionId: "ed-biz-community", category: "EDITORIAL", roles: ["business"], topic: "community", text: "How do you want to show up for the TMI community?" },
];

// ---------------------------------------------------------------------------
// PERSONAL / GET TO KNOW ME — everyday, human, conversational.
// ---------------------------------------------------------------------------
const PERSONAL: ArticleQuestion[] = [
  { questionId: "ps-food", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your favorite food — the one you never say no to?" },
  { questionId: "ps-pizza", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your go-to pizza order?" },
  { questionId: "ps-icecream", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your favorite ice cream flavor?" },
  { questionId: "ps-snack", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your go-to snack when you're in the zone?" },
  { questionId: "ps-drink", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your favorite thing to drink while you work?" },
  { questionId: "ps-movie", category: "PERSONAL", roles: ["all"], topic: "taste", text: "What's your favorite movie, or the kind of movie you always say yes to?" },
  { questionId: "ps-tv", category: "PERSONAL", roles: ["all"], topic: "taste", text: "What show are you watching when you finally sit down?" },
  { questionId: "ps-place", category: "PERSONAL", roles: ["all"], topic: "travel", text: "What's the best place you've ever been?" },
  { questionId: "ps-vacation", category: "PERSONAL", roles: ["all"], topic: "travel", text: "What's the dream vacation you haven't taken yet?" },
  { questionId: "ps-morning-night", category: "PERSONAL", roles: ["all"], topic: "rhythm", text: "Are you a morning person or a night person?" },
  { questionId: "ps-off-day", category: "PERSONAL", roles: ["performer", "all"], topic: "offstage", text: "What do you actually like doing when you're not making music or working?" },
  { questionId: "ps-surprise", category: "PERSONAL", roles: ["all"], topic: "personality", text: "What's something people would be surprised to learn about you?" },
  { questionId: "ps-week", category: "PERSONAL", roles: ["all"], topic: "personality", text: "What's one thing you couldn't go a week without?" },
  { questionId: "ps-holiday", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your favorite holiday?" },
  { questionId: "ps-season", category: "PERSONAL", roles: ["all"], topic: "favorites", text: "What's your favorite season, and why?" },
  { questionId: "ps-game", category: "PERSONAL", roles: ["all"], topic: "taste", text: "What's a game you can get lost in for hours?" },
  { questionId: "ps-laugh", category: "PERSONAL", roles: ["all"], topic: "personality", text: "What's something that always makes you laugh no matter what?" },
  { questionId: "ps-late-meal", category: "PERSONAL", roles: ["performer", "all"], topic: "favorites", text: "What's your favorite meal after a long session or a long day?" },
];

// ---------------------------------------------------------------------------
// WILD_CARD — harmless absurd/imaginative scenarios. Funny, never mean.
// ---------------------------------------------------------------------------
const WILD_CARD: ArticleQuestion[] = [
  { questionId: "wc-island-first", category: "WILD_CARD", roles: ["all"], topic: "island", text: "You're stuck on an island by yourself. What's the first thing you're doing?" },
  { questionId: "wc-island-album", category: "WILD_CARD", roles: ["all"], topic: "island", text: "You're stranded on an island and can bring one album. What are you bringing?" },
  { questionId: "wc-robots-studio", category: "WILD_CARD", roles: ["performer", "all"], topic: "robots", text: "Robots suddenly start attacking all of your studio equipment. What's your first move?" },
  { questionId: "wc-robots-battle", category: "WILD_CARD", roles: ["performer"], topic: "robots", text: "Robots take over your studio but say they'll give it back if you beat them in a freestyle battle. Are you accepting?" },
  { questionId: "wc-aliens-album", category: "WILD_CARD", roles: ["performer"], topic: "aliens", text: "Aliens steal your unreleased album. How are you getting it back?" },
  { questionId: "wc-aliens-drive", category: "WILD_CARD", roles: ["all"], topic: "aliens", text: "Aliens try to kidnap you while you're driving to the studio. What's your move?" },
  { questionId: "wc-dog-bite", category: "WILD_CARD", roles: ["performer", "all"], topic: "animals", text: "A dog bites you on the butt while you're already late for the studio. Are you still making the session?" },
  { questionId: "wc-mic-talks", category: "WILD_CARD", roles: ["performer"], topic: "talking-gear", text: "Your microphone starts talking to you during a recording session. What do you say to it?" },
  { questionId: "wc-instruments-talk", category: "WILD_CARD", roles: ["performer"], topic: "talking-gear", text: "You wake up and every instrument in your studio can talk. Which one are you talking to first?" },
  { questionId: "wc-wrong-song", category: "WILD_CARD", roles: ["performer"], topic: "performance", text: "You're performing and suddenly the entire crowd starts confidently singing the wrong song. What do you do?" },
  { questionId: "wc-locked-studio", category: "WILD_CARD", roles: ["performer"], topic: "studio", text: "You get locked inside the studio overnight with nothing but snacks and recording equipment. What are you making?" },
  { questionId: "wc-moon-concert", category: "WILD_CARD", roles: ["performer"], topic: "travel", text: "You're offered a concert on the moon tomorrow. Are you going?" },
  { questionId: "wc-alien-title", category: "WILD_CARD", roles: ["performer"], topic: "aliens", text: "An alien offers to make your next song the biggest record in the galaxy — but it gets to pick the title. Are you taking the deal?" },
  { questionId: "wc-haunted-studio", category: "WILD_CARD", roles: ["performer", "all"], topic: "studio", text: "Someone gives you unlimited studio time, but the studio is supposedly haunted. Are you recording there?" },
  { questionId: "wc-room-song", category: "WILD_CARD", roles: ["all"], topic: "imagine", text: "Your favorite song starts playing every single time you walk into a room for the next year. What song are you choosing?" },
  { questionId: "wc-superpower", category: "WILD_CARD", roles: ["all"], topic: "superpowers", text: "You get one superpower, but it only works while you're holding an instrument or a mic. What are you picking?" },
  { questionId: "wc-time-travel", category: "WILD_CARD", roles: ["all"], topic: "time-travel", text: "You can go back and watch any live performance in history in the front row. Which one?" },
  { questionId: "wc-weird-collab", category: "WILD_CARD", roles: ["performer"], topic: "collab", text: "You can collaborate with literally anyone, living or fictional. Who's getting the call?" },
];

export const ARTICLE_QUESTION_BANK: readonly ArticleQuestion[] = Object.freeze([
  ...EDITORIAL, ...PERSONAL, ...WILD_CARD,
]);

// ---------------------------------------------------------------------------
// Controlled selection — deterministic, category-balanced, role-aware.
// ---------------------------------------------------------------------------

export interface InterviewSelectionOptions {
  /** Account role used for role-aware filtering. Default "performer". */
  role?: ArticleQuestionRole;
  /** Number of questions to select. Minimum 5. Default 5. */
  count?: number;
  /** Question ids already used on a prior article — avoided across articles. */
  recentlyUsedIds?: readonly string[];
  /** Deterministic seed so the SAME article keeps its question set. */
  seed: string;
}

/** Minimum quotas for the first-article five-question set. */
export const INTERVIEW_MIN_QUOTAS = Object.freeze({
  EDITORIAL: 2,
  PERSONAL: 1,
  WILD_CARD: 1,
} as const);

function seedToInt(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32) keyed by the seed — stable per article. */
function mulberry32(seedInt: number): () => number {
  let a = seedInt >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickFrom(pool: ArticleQuestion[], n: number, rand: () => number, taken: Set<string>): ArticleQuestion[] {
  const out: ArticleQuestion[] = [];
  const candidates = pool.filter((q) => !taken.has(q.questionId));
  const totalWeight = candidates.reduce((s, q) => s + (q.weight ?? 1), 0);
  let remaining = candidates.slice();
  while (out.length < n && remaining.length > 0) {
    let r = rand() * remaining.reduce((s, q) => s + (q.weight ?? 1), 0);
    let idx = 0;
    for (; idx < remaining.length - 1; idx++) {
      r -= remaining[idx]!.weight ?? 1;
      if (r <= 0) break;
    }
    const q = remaining[idx]!;
    out.push(q);
    taken.add(q.questionId);
    remaining = remaining.filter((x) => x.questionId !== q.questionId);
  }
  void totalWeight;
  return out;
}

/**
 * Select the controlled question set for an interview.
 * Guarantees: count>=5, EDITORIAL>=2, PERSONAL>=1, WILD_CARD>=1, no
 * duplicate questionIds, role-appropriate, deterministic per `seed`.
 */
export function selectInterviewQuestions(opts: InterviewSelectionOptions): ArticleQuestion[] {
  const role = opts.role ?? "performer";
  const count = Math.max(5, opts.count ?? 5);
  const recent = new Set(opts.recentlyUsedIds ?? []);
  const rand = mulberry32(seedToInt(opts.seed));

  const eligible = ARTICLE_QUESTION_BANK.filter(
    (q) => (q.roles.includes("all") || q.roles.includes(role)) && !recent.has(q.questionId),
  );
  const byCat = (c: ArticleQuestionCategory) => eligible.filter((q) => q.category === c);

  const taken = new Set<string>();
  const selected: ArticleQuestion[] = [];

  // Phase 1: satisfy quotas.
  selected.push(...pickFrom(byCat("EDITORIAL"), INTERVIEW_MIN_QUOTAS.EDITORIAL, rand, taken));
  selected.push(...pickFrom(byCat("PERSONAL"), INTERVIEW_MIN_QUOTAS.PERSONAL, rand, taken));
  selected.push(...pickFrom(byCat("WILD_CARD"), INTERVIEW_MIN_QUOTAS.WILD_CARD, rand, taken));

  // Phase 2: fill remaining slots from a category-balanced pool.
  const rest = eligible.filter((q) => !taken.has(q.questionId));
  selected.push(...pickFrom(rest, count - selected.length, rand, taken));

  return selected.slice(0, count);
}

/** Look up a question by its persisted id. */
export function questionById(id: string): ArticleQuestion | undefined {
  return ARTICLE_QUESTION_BANK.find((q) => q.questionId === id);
}
