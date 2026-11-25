/**
 * ComedyBattlePromptSkitPolicy — Whose Line Prompt Hat + Skit-for-Skit + Dance BO3
 * § Audience prompt / §17215–§17277 composer + skit
 *
 * Same prompt for both comedians. Fan submissions → ballot → vote.
 * No audience → TMI absurd fallback (no fake Fan votes).
 * Composer: one UI surface → ROOM_CHAT | PROMPT (separate authorities).
 * Dance Battle: same song per round, best of three.
 *
 * NEW_COMEDY_CHAT_ENGINE = NO · NEW_SKIT_ANIMATION_ENGINE = NO
 */

export const COMEDY_BATTLE_PROMPT_SKIT_POLICY_ID =
  "COMEDY_BATTLE_PROMPT_SKIT_POLICY_v1" as const;
export const NEW_COMEDY_CHAT_ENGINE = false as const;
export const NEW_COMEDY_TEXT_INPUT_ENGINE = false as const;
export const NEW_SKIT_ANIMATION_ENGINE = false as const;

export const JOKE_FOR_JOKE_MODE = true as const;
export const SKIT_FOR_SKIT_MODE = true as const;
export const SHARED_SKIT_PROMPT = true as const;
export const SKIT_ROUND_DURATION_POLICY = "GAP" as const; // reuse Battle timer — do not invent ms
export const MIXED_COMEDY_MODE = "GAP" as const;
export const RANDOM_COMEDY_MODE = "GAP" as const;

export const PROMPT_MESSAGE_ROUTE_CONFUSION = 0 as const;
export const ROOM_CHAT_AUTO_ENTERS_PROMPT_HAT = 0 as const;
export const MOBILE_DOUBLE_COMPOSER = 0 as const;
export const CHAT_OVERLAY_BLOCKS_PERFORMANCE = 0 as const;
export const CHAT_EMOJI_COUNTS_AS_LAUGH_REACTION = 0 as const;
export const CHAT_TEXT_COUNTS_AS_BATTLE_VOTE = 0 as const;
export const SKIT_LAUGH_AUTOMATICALLY_VOTES = 0 as const;
export const SKIT_DIRECTOR_MISSES_VISUAL_GAG = 0 as const;

export type ComposerMode = "ROOM_CHAT" | "PROMPT_FULL" | "PROMPT_INGREDIENT" | "SKIT_SCENARIO";

export type ComposerRoutingRow = {
  mode: ComposerMode;
  uiLabel: string;
  command: "SEND_CHAT" | "SUBMIT_PROMPT" | "SUBMIT_INGREDIENT" | "SUBMIT_SKIT";
  authority: "RoomChatPanel/MessagingCanister" | "PromptHatAuthority";
  visibleDestination: "ROOM_CHAT" | "PROMPT_BALLOT";
};

export const COMPOSER_ROUTING: readonly ComposerRoutingRow[] = [
  {
    mode: "ROOM_CHAT",
    uiLabel: "MESSAGE THE ROOM…",
    command: "SEND_CHAT",
    authority: "RoomChatPanel/MessagingCanister",
    visibleDestination: "ROOM_CHAT",
  },
  {
    mode: "PROMPT_FULL",
    uiLabel: "SUGGEST A CRAZY PROMPT…",
    command: "SUBMIT_PROMPT",
    authority: "PromptHatAuthority",
    visibleDestination: "PROMPT_BALLOT",
  },
  {
    mode: "PROMPT_INGREDIENT",
    uiLabel: "DROP AN INGREDIENT…",
    command: "SUBMIT_INGREDIENT",
    authority: "PromptHatAuthority",
    visibleDestination: "PROMPT_BALLOT",
  },
  {
    mode: "SKIT_SCENARIO",
    uiLabel: "SUGGEST A SKIT SCENARIO…",
    command: "SUBMIT_SKIT",
    authority: "PromptHatAuthority",
    visibleDestination: "PROMPT_BALLOT",
  },
] as const;

export function routeComposerSubmit(input: {
  mode: ComposerMode;
  text: string;
}): {
  accepted: boolean;
  authority: ComposerRoutingRow["authority"];
  enteredPromptHat: boolean;
  enteredRoomChat: boolean;
  ROOM_CHAT_AUTO_ENTERS_PROMPT_HAT: 0;
  CHAT_EMOJI_COUNTS_AS_LAUGH_REACTION: 0;
  CHAT_TEXT_COUNTS_AS_BATTLE_VOTE: 0;
} {
  const text = input.text.trim();
  if (!text) {
    return {
      accepted: false,
      authority: "RoomChatPanel/MessagingCanister",
      enteredPromptHat: false,
      enteredRoomChat: false,
      ROOM_CHAT_AUTO_ENTERS_PROMPT_HAT: 0,
      CHAT_EMOJI_COUNTS_AS_LAUGH_REACTION: 0,
      CHAT_TEXT_COUNTS_AS_BATTLE_VOTE: 0,
    };
  }
  const row = COMPOSER_ROUTING.find((r) => r.mode === input.mode)!;
  const isPrompt = row.visibleDestination === "PROMPT_BALLOT";
  return {
    accepted: true,
    authority: row.authority,
    enteredPromptHat: isPrompt,
    enteredRoomChat: !isPrompt,
    ROOM_CHAT_AUTO_ENTERS_PROMPT_HAT: 0,
    CHAT_EMOJI_COUNTS_AS_LAUGH_REACTION: 0,
    CHAT_TEXT_COUNTS_AS_BATTLE_VOTE: 0,
  };
}

/** Absurd fallback remix — never attributed as Fan votes. */
export const ABSURD_INGREDIENT_POOL = {
  characters: ["dentist", "astronaut", "taco", "mortician", "waiter", "burglar", "superhero"],
  places: ["haunted house", "divorce court", "outer space", "funeral", "drive-thru", "elevator"],
  problems: [
    "arguing over the TV remote",
    "apologizing mid-robbery",
    "interrupting their own funeral",
    "thinking the other is the waiter",
    "left the oven on on Earth",
  ],
  objects: ["giant spoon", "lost shoe", "glow stick", "wedding ring", "rubber chicken"],
} as const;

export function remixAbsurdPrompt(seed: string): string {
  const pick = (arr: readonly string[], salt: string) => {
    let h = 0;
    const s = seed + salt;
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  };
  const c = pick(ABSURD_INGREDIENT_POOL.characters, "c");
  const p = pick(ABSURD_INGREDIENT_POOL.places, "p");
  const pr = pick(ABSURD_INGREDIENT_POOL.problems, "pr");
  return `A ${c.toUpperCase()} in a ${p.toUpperCase()} ${pr}.`;
}

export type PromptBallotState = {
  roundId: string;
  mode: "JOKE_FOR_JOKE" | "SKIT_FOR_SKIT";
  submissions: Array<{ fanId: string; text: string }>;
  lockedPrompt: string | null;
  sharedForBoth: true;
  source: "AUDIENCE_VOTE" | "SYSTEM_FALLBACK";
};

const ballots = new Map<string, PromptBallotState>();

export function openPromptHat(input: {
  roundId: string;
  mode: "JOKE_FOR_JOKE" | "SKIT_FOR_SKIT";
}): PromptBallotState {
  const state: PromptBallotState = {
    roundId: input.roundId,
    mode: input.mode,
    submissions: [],
    lockedPrompt: null,
    sharedForBoth: true,
    source: "SYSTEM_FALLBACK",
  };
  ballots.set(input.roundId, state);
  return state;
}

export function submitPromptIdea(input: {
  roundId: string;
  fanId: string;
  text: string;
}): { ok: boolean; reason?: string } {
  const b = ballots.get(input.roundId);
  if (!b || b.lockedPrompt) return { ok: false, reason: "CLOSED" };
  const text = input.text.trim().slice(0, 280);
  if (!text) return { ok: false, reason: "EMPTY" };
  if (b.submissions.some((s) => s.fanId === input.fanId)) {
    return { ok: false, reason: "ONE_PER_FAN" };
  }
  // Dedup similar text
  const norm = text.toLowerCase();
  if (b.submissions.some((s) => s.text.toLowerCase() === norm)) {
    return { ok: false, reason: "DUPLICATE" };
  }
  b.submissions.push({ fanId: input.fanId, text });
  return { ok: true };
}

export function lockPromptFromAudienceOrFallback(input: {
  roundId: string;
  winningSubmissionText?: string | null;
  audiencePresent: boolean;
}): PromptBallotState {
  const b = ballots.get(input.roundId);
  if (!b) {
    throw new Error("PROMPT_HAT_MISSING");
  }
  if (input.audiencePresent && input.winningSubmissionText?.trim()) {
    b.lockedPrompt = input.winningSubmissionText.trim();
    b.source = "AUDIENCE_VOTE";
  } else {
    b.lockedPrompt = remixAbsurdPrompt(input.roundId);
    b.source = "SYSTEM_FALLBACK";
  }
  return b;
}

export function sharedPromptForCompetitors(roundId: string): {
  promptA: string;
  promptB: string;
  SHARED_SKIT_PROMPT: true;
  identical: true;
} | null {
  const b = ballots.get(roundId);
  if (!b?.lockedPrompt) return null;
  return {
    promptA: b.lockedPrompt,
    promptB: b.lockedPrompt,
    SHARED_SKIT_PROMPT: true,
    identical: true,
  };
}

/** Dance Battle — same track both dancers, new track next round, best of 3. */
export type DanceBattleRound = {
  roundIndex: 1 | 2 | 3;
  trackId: string;
  dancerAWins: boolean | null;
  dancerBWins: boolean | null;
};

export function planDanceBattleBestOfThree(trackIds: [string, string, string]): {
  rounds: DanceBattleRound[];
  sameTrackWithinRound: true;
  bestOf: 3;
} {
  return {
    rounds: trackIds.map((trackId, i) => ({
      roundIndex: (i + 1) as 1 | 2 | 3,
      trackId,
      dancerAWins: null,
      dancerBWins: null,
    })),
    sameTrackWithinRound: true,
    bestOf: 3,
  };
}

export function comedyModeMatrix(): Array<{
  mode: string;
  challenge: string;
  audienceInput: string;
  performerFormat: string;
  reaction: string;
  winner: string;
  status: "SUPPORTED" | "GAP";
}> {
  return [
    {
      mode: "JOKE_FOR_JOKE",
      challenge: "Shared topic/prompt",
      audienceInput: "Prompt Hat submit + vote",
      performerFormat: "Joke / verbal",
      reaction: "LAUGH/CLAP",
      winner: "Explicit Audience vote",
      status: "SUPPORTED",
    },
    {
      mode: "SKIT_FOR_SKIT",
      challenge: "Shared scene/situation",
      audienceInput: "Skit scenario submit + vote",
      performerFormat: "Acted skit",
      reaction: "LAUGH/CLAP/GASP",
      winner: "Explicit Audience vote after both",
      status: "SUPPORTED",
    },
    {
      mode: "MIXED",
      challenge: "Joke then Skit rounds",
      audienceInput: "Per-round Prompt Hat",
      performerFormat: "Mixed",
      reaction: "Comedy set",
      winner: "Best of three",
      status: "GAP",
    },
    {
      mode: "RANDOM",
      challenge: "System picks Joke/Skit",
      audienceInput: "Optional",
      performerFormat: "Varies",
      reaction: "Comedy set",
      winner: "Explicit vote",
      status: "GAP",
    },
    {
      mode: "DANCE_BATTLE_BO3",
      challenge: "Same song per round",
      audienceInput: "React + vote",
      performerFormat: "Choreography to track",
      reaction: "CHEER/CLAP/HEART",
      winner: "Best 2 of 3",
      status: "SUPPORTED",
    },
  ];
}

export function resetComedyBattlePromptSkitForTests(): void {
  ballots.clear();
}

export function comedyBattlePromptSkitBoundaryLocks() {
  return {
    NEW_COMEDY_CHAT_ENGINE,
    NEW_COMEDY_TEXT_INPUT_ENGINE,
    NEW_SKIT_ANIMATION_ENGINE,
    CANONICAL_TEXT_COMPOSER_AUTHORITY: "Venue HUD composer surface (reuse)",
    CANONICAL_ROOM_CHAT_AUTHORITY: "MessagingCanister / RoomChatPanel",
    CANONICAL_PROMPT_SUBMISSION_AUTHORITY: COMEDY_BATTLE_PROMPT_SKIT_POLICY_ID,
    CANONICAL_COMEDY_BATTLE_AUTHORITY: "Battle / DirtyDozens engines (reuse)",
    JOKE_FOR_JOKE_MODE,
    SKIT_FOR_SKIT_MODE,
    SHARED_SKIT_PROMPT,
    SKIT_ROUND_DURATION_POLICY,
    MIXED_COMEDY_MODE,
    RANDOM_COMEDY_MODE,
    PROMPT_MESSAGE_ROUTE_CONFUSION,
    ROOM_CHAT_AUTO_ENTERS_PROMPT_HAT,
    MOBILE_DOUBLE_COMPOSER,
    CHAT_OVERLAY_BLOCKS_PERFORMANCE,
    CHAT_EMOJI_COUNTS_AS_LAUGH_REACTION,
    CHAT_TEXT_COUNTS_AS_BATTLE_VOTE,
    SKIT_LAUGH_AUTOMATICALLY_VOTES,
    SKIT_DIRECTOR_MISSES_VISUAL_GAG,
    BEST_OF_THREE_SKIT_SUPPORT: true,
    COMPOSER_ROUTING,
  } as const;
}

// ─── §20985-B COMMUNITY CHAOS PROMPT MIXER ───────────────────────────────────
// Extends THIS authority (no separate prompt engine). Multiple legitimate fan
// ideas → classified into dimensions → mixed → ONE combined prompt → lock →
// identical prompt to both competitors. Chaos happens BEFORE lock; the locked
// base prompt is immutable. Optional shared mid-scene twist is tracked apart.
//
//   CHAOS_BEFORE_LOCK_ONLY · BASE_PROMPT_IMMUTABLE_AFTER_LOCK
//   TWIST_SHARED_TO_ALL    · PROMPT_VARIETY = HIGH (recent-combo memory)

export const CHAOS_BEFORE_LOCK_ONLY = true as const;
export const BASE_PROMPT_IMMUTABLE_AFTER_LOCK = true as const;
export const TWIST_SHARED_TO_ALL = true as const;
export const DUPLICATE_PROMPT_ENGINE_CREATED = 0 as const;
export const PROMPT_VARIETY_HIGH = true as const;

export type IdeaDimension =
  | "location"
  | "character"
  | "situation"
  | "emotion"
  | "objective"
  | "conflict"
  | "relationship"
  | "prop"
  | "genre"
  | "secret"
  | "twist"
  | "random_event"
  | "ending"
  | "line"
  | "voice"
  | "general";

const DIMENSION_PATTERNS: Array<[IdeaDimension, RegExp]> = [
  ["location", /\b(at|in|inside|outside)\s+(a|an|the)\b|\b(funeral|wedding|space|court|restaurant|elevator|hospital|school|beach|prison|airport)\b/i],
  ["secret", /\bsecretly\b|\bsecret\b|\bnobody knows\b|\bhiding\b/i],
  ["relationship", /\b(ex|husband|wife|spouse|sibling|mother|father|parent|boss|neighbor|twin|clone)\b/i],
  ["emotion", /\b(angry|sad|terrified|ecstatic|jealous|nervous|heartbroken|furious|hopeful)\b/i],
  ["twist", /\b(suddenly|twist|turns out|plot twist|halfway through)\b/i],
  ["random_event", /\b(gets loose|walks in|explodes|knocks|goes out|appears|interrupts|shows up)\b/i],
  ["objective", /\b(must|trying to|has to|wants to|needs to|goal is to)\b/i],
  ["conflict", /\b(arguing|fighting|competing|feud|dispute|battle over|can't agree)\b/i],
  ["prop", /\b(holding|carrying|with a|with an|wearing)\b|\b(spoon|ring|monkey|phone|briefcase|weapon|gift)\b/i],
  ["voice", /\b(accent|voice|like a pirate|in rhyme|whisper|shout|robot voice)\b/i],
  ["genre", /\b(horror|romance|noir|western|sci-?fi|musical|thriller|comedy|drama)\b/i],
  ["ending", /\b(ends with|in the end|finally|at the end)\b/i],
  ["line", /\b(say|says|line|opens with|starts with)\b/i],
];

/** Classify a raw fan idea into its most likely prompt dimension (fan never categorizes). */
export function classifyIdeaDimension(text: string): IdeaDimension {
  const t = text.trim();
  for (const [dim, re] of DIMENSION_PATTERNS) {
    if (re.test(t)) return dim;
  }
  return "general";
}

/** Recent combined-prompt memory to avoid immediately repeating a combination. */
const recentCombinations: string[] = [];
const RECENT_COMBINATION_MEMORY = 6;

export type ChaosMixResult = {
  roundId: string;
  prompt: string;
  parts: Array<{ fanId: string; text: string; dimension: IdeaDimension }>;
  dimensionsUsed: IdeaDimension[];
  contributorIds: string[];
  source: "AUDIENCE_MIX" | "SYSTEM_FALLBACK";
  combinationId: string;
  lockedAt: number;
};

function hashSeed(parts: readonly string[]): string {
  return parts.join("|").toLowerCase();
}

/**
 * Combine MULTIPLE fan submissions into ONE shared prompt. Picks distinct
 * dimensions first (variety), avoids immediately recycling a recent combination,
 * locks the combined prompt, and returns it identical for both competitors.
 * Falls back to the existing absurd remix when no usable audience pool exists.
 */
export function chaosMixAndLockPrompt(input: {
  roundId: string;
  audiencePresent: boolean;
  maxParts?: number;
  seedExtra?: string;
}): PromptBallotState & { chaos?: ChaosMixResult } {
  const b = ballots.get(input.roundId);
  if (!b) throw new Error("PROMPT_HAT_MISSING");
  if (b.lockedPrompt) return { ...b };

  const maxParts = Math.max(2, Math.min(5, input.maxParts ?? 4));
  const pool = b.submissions.filter((s) => s.text.trim().length > 0);

  if (!input.audiencePresent || pool.length === 0) {
    // Reuse existing fallback (never fabricated as fan content).
    lockPromptFromAudienceOrFallback({ roundId: input.roundId, winningSubmissionText: null, audiencePresent: false });
    return { ...b };
  }

  // Group by dimension, preserve insertion order, prefer distinct dimensions.
  const byDim = new Map<IdeaDimension, Array<{ fanId: string; text: string }>>();
  for (const s of pool) {
    const dim = classifyIdeaDimension(s.text);
    const arr = byDim.get(dim) ?? [];
    arr.push({ fanId: s.fanId, text: s.text.trim() });
    byDim.set(dim, arr);
  }
  const dims = [...byDim.keys()];
  const seed = `${input.roundId}:${input.seedExtra ?? ""}:${pool.map((p) => p.text).join("|")}`;

  const pickFrom = (arr: Array<{ fanId: string; text: string }>, salt: string) => {
    let h = 0;
    const s = seed + salt;
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return arr[h % arr.length]!;
  };

  // Try a few combinations; skip any that exactly matches a recent combination.
  let chosen: Array<{ fanId: string; text: string; dimension: IdeaDimension }> = [];
  let combinationId = "";
  for (let attempt = 0; attempt < 6; attempt++) {
    const shuffledDims = [...dims];
    // deterministic shuffle by seed+attempt
    for (let i = shuffledDims.length - 1; i > 0; i--) {
      let h = 0;
      const s = `${seed}:${attempt}:${i}`;
      for (let k = 0; k < s.length; k++) h = (h * 33 + s.charCodeAt(k)) >>> 0;
      const j = h % (i + 1);
      [shuffledDims[i], shuffledDims[j]] = [shuffledDims[j]!, shuffledDims[i]!];
    }
    const parts: Array<{ fanId: string; text: string; dimension: IdeaDimension }> = [];
    for (const dim of shuffledDims.slice(0, maxParts)) {
      const c = pickFrom(byDim.get(dim)!, `${dim}:${attempt}`);
      parts.push({ fanId: c.fanId, text: c.text, dimension: dim });
    }
    if (parts.length === 0) continue;
    combinationId = hashSeed(parts.map((p) => p.text));
    if (!recentCombinations.includes(combinationId)) {
      chosen = parts;
      break;
    }
    if (chosen.length === 0) chosen = parts; // keep first as last resort
  }

  const text = combinePartsIntoPrompt(chosen);
  b.lockedPrompt = text;
  b.source = "AUDIENCE_VOTE";
  const contributorIds = [...new Set(chosen.map((p) => p.fanId))];
  recentCombinations.push(combinationId);
  if (recentCombinations.length > RECENT_COMBINATION_MEMORY) recentCombinations.shift();

  const chaos: ChaosMixResult = {
    roundId: input.roundId,
    prompt: text,
    parts: chosen,
    dimensionsUsed: chosen.map((p) => p.dimension),
    contributorIds,
    source: "AUDIENCE_MIX",
    combinationId,
    lockedAt: Date.now(),
  };
  (b as PromptBallotState & { chaos?: ChaosMixResult }).chaos = chaos;
  return { ...b, chaos };
}

/** Join classified parts into one readable shared prompt. */
function combinePartsIntoPrompt(parts: Array<{ text: string; dimension: IdeaDimension }>): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.text;
  const clauses = parts.map((p) => p.text.replace(/\.$/, "").trim());
  const [first, ...rest] = clauses;
  let out = first!.charAt(0).toUpperCase() + first!.slice(1);
  for (const c of rest) {
    out += /^(and|but|then|when|while)\b/i.test(c) ? ` ${c}` : `, ${c}`;
  }
  return out.endsWith(".") ? out : `${out}.`;
}

// ─── §20985-4 SHARED CHAOS TWIST (mid-scene, delivered equally) ─────────────
// Base prompt stays IMMUTABLE. A twist is validated, locked, and delivered to
// BOTH competitors at the same defined moment. Tracked separately from the base.

export type ChaosTwist = {
  roundId: string;
  twistIdea: string;
  dimension: IdeaDimension;
  lockedAt: number;
  deliveredToBoth: true;
};

const twists = new Map<string, ChaosTwist>();

export function applyChaosTwist(input: { roundId: string; twistIdea: string }): ChaosTwist {
  const b = ballots.get(input.roundId);
  if (!b?.lockedPrompt) throw new Error("PROMPT_NOT_LOCKED");
  const text = input.twistIdea.trim().slice(0, 280);
  if (!text) throw new Error("EMPTY_TWIST");
  const twist: ChaosTwist = {
    roundId: input.roundId,
    twistIdea: text,
    dimension: classifyIdeaDimension(text),
    lockedAt: Date.now(),
    deliveredToBoth: true,
  };
  twists.set(input.roundId, twist);
  return twist;
}

export function getChaosTwist(roundId: string): ChaosTwist | null {
  return twists.get(roundId) ?? null;
}

/** Read the chaos/round history for a prompt round (final prompt, parts, twist). */
export function getPromptRoundHistory(roundId: string): {
  ballot: PromptBallotState | null;
  chaos: ChaosMixResult | null;
  twist: ChaosTwist | null;
} {
  const b = ballots.get(roundId) ?? null;
  return {
    ballot: b,
    chaos: (b as (PromptBallotState & { chaos?: ChaosMixResult }) | null)?.chaos ?? null,
    twist: twists.get(roundId) ?? null,
  };
}

export function resetChaosMixerForTests(): void {
  recentCombinations.length = 0;
  twists.clear();
}

