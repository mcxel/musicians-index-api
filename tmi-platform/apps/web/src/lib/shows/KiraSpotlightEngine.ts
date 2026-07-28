/**
 * Kira Spotlight Engine — Monday Night Stage
 *
 * Pure-function question library and performer spotlight dialogue system.
 * Kira is the audience correspondent: she asks performers questions before/after
 * their performances, engages the crowd, and creates the personal connections
 * that make Monday Night Stage feel like more than a talent contest.
 *
 * Design rules:
 * - Never ask the same questions in the same order.
 * - Questions are sampled randomly from three pools (beginning, ending, funny).
 * - AI memory lines recognise returning performers and reference past appearances.
 * - Audience participation prompts use the 8-reaction emoji set.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type KiraQuestionPool = "beginning" | "ending" | "funny_random";

export type KiraDialogueType =
  | "question_before"       // before the performance
  | "question_after"        // after the performance
  | "funny_random"          // occasional wild-card
  | "audience_prompt"       // engaging the crowd
  | "returning_performer"   // AI memory — recognising a returning artist
  | "act_intro";            // brief intro before Kira hands off to performer

export type KiraDialogue = {
  type: KiraDialogueType;
  text: string;
  hostId: "kira";
};

export type KiraReturnContext = {
  performerName: string;
  lastAppearance: string;         // e.g. "last month", "six weeks ago"
  lastSong?: string;              // song they performed last time
  lastGoal?: string;              // goal they mentioned e.g. "1,000 followers"
  goalAchieved?: boolean;
  followerCount?: number;
};

// ── Utility ───────────────────────────────────────────────────────────────────

function pickIndex(arr: string[], seed: number): string {
  return arr[seed % arr.length] ?? arr[0] ?? "";
}

/** Selects `count` unique questions from `pool` using the seed to vary order. */
export function pickQuestions(
  pool: KiraQuestionPool,
  count: number,
  seed: number
): string[] {
  const source = {
    beginning: KIRA_BEGINNING_QUESTIONS,
    ending: KIRA_ENDING_QUESTIONS,
    funny_random: KIRA_FUNNY_QUESTIONS,
  }[pool];

  // Fisher-Yates-style shuffle based on seed so the order is deterministic
  // but varies per show — same seed = same rotation, different seed = different rotation
  const copy = [...source];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (seed + i * 31) % (i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

// ── Beginning questions (before the performance) ──────────────────────────────

export const KIRA_BEGINNING_QUESTIONS: string[] = [
  "Where are you performing from tonight?",
  "How long have you been making music?",
  "Who inspired you to start performing?",
  "What does your stage name mean?",
  "Who's watching you tonight — shout them out!",
  "What's your dream venue to perform in?",
  "What made you choose this particular song?",
  "How are you feeling right now, honestly?",
  "Who's your biggest supporter, and do they know how much they mean to you?",
  "Have you ever performed live in front of an audience before?",
  "What's one thing you want the audience to feel while you're performing?",
  "What does this performance mean to you personally?",
  "Is there a story behind this song?",
  "What was the moment you decided this is what you want to do?",
  "Are you representing your city or town tonight? Tell us about it.",
];

// ── Ending questions (after the performance) ──────────────────────────────────

export const KIRA_ENDING_QUESTIONS: string[] = [
  "How did that feel to be up there?",
  "Would you do anything differently next time?",
  "What's next for you — what are you working on?",
  "Where can everyone follow you after tonight?",
  "Anything you want to say directly to your supporters watching right now?",
  "What would getting booked mean for your career?",
  "Is there a message you want people to take away from that performance?",
  "What would you say to someone watching tonight who's thinking about performing for the first time?",
  "That performance — how long have you been working on it?",
  "If you could perform with anyone — living or legendary — who would it be?",
];

// ── Funny random questions (occasional, to humanise performers) ───────────────

export const KIRA_FUNNY_QUESTIONS: string[] = [
  "I have to ask — pineapple on pizza. Yes or no?",
  "If your microphone could talk, what would it say about you?",
  "What's the most unusual place you've ever practiced?",
  "Coffee before a performance, or after?",
  "If your music had a superpower, what would it be?",
  "What is your pre-show ritual — be honest.",
  "If you had to describe your sound using only a food, what would it be?",
  "What's the most embarrassing song you secretly love?",
  "Night owl or early bird — and does it affect your music?",
  "If tonight's performance was a movie, what genre would it be?",
  "What emoji best describes your energy right now?",
  "You're performing for one person who isn't in this room — who is it?",
];

// ── Audience participation prompts ────────────────────────────────────────────
// Kira directs the crowd to use the 8-reaction system:
// 👍 Like | ❤️ Love | 👏 Applause | 🔥 Fire | ⭐ Star | 🎤 Encore | 😂 Funny | 😮 Wow

export const KIRA_AUDIENCE_PROMPTS: string[] = [
  "Audience, what did you think of that performance? React right now — 👏 if you were impressed, 🔥 if it was fire!",
  "Did that chorus get stuck in your head? If it did, show it with a ❤️ in the reactions!",
  "Would you book this performer for an event? Hit the ⭐ if the answer is yes.",
  "Should we bring them back for an encore? Drop 🎤 in the reactions if you want MORE.",
  "On a scale of 👍 to 🔥 — where did that land for you? React now, I'm watching.",
  "Be honest with your reactions — every response helps our performers grow. What are you giving?",
  "Chat and react at the same time — I want to see both. Give {performer} your honest score.",
  "New rule: if you're not reacting, you're just watching. That's fine, but reacting is more fun.",
];

// ── AI memory lines (returning performer recognition) ────────────────────────

const RETURNING_PERFORMER_TEMPLATES: Record<string, string> = {
  with_song:
    "Welcome back, {performer}! Last time you performed {lastSong} and had the whole room talking about it. Tonight you're bringing something new — let's see how you've grown.",
  with_goal_achieved:
    "Welcome back! {performer}, last time you told us your goal was {lastGoal}. We checked — congratulations, you made it! Now what's the next milestone?",
  with_goal_pending:
    "Good to see you again, {performer}! You mentioned last time that your goal was {lastGoal} — how's that coming along? The audience wants to know.",
  generic:
    "Welcome back to Monday Night Stage, {performer}! It's been {lastAppearance} — the stage missed you. Let's see where you are now.",
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

// ── Act introduction lines ────────────────────────────────────────────────────

const ACT_INTRO_TEMPLATES: string[] = [
  "Coming to the stage right now — {performer}. I got a chance to talk with them before the show. {teaser}",
  "{performer} has something special prepared for us tonight. {teaser}",
  "This is {performer}. {teaser} Ladies and gentlemen, let them show you what they've got.",
  "Give it up for {performer}! {teaser}",
];

// ── Public dialogue functions ─────────────────────────────────────────────────

export function kiraAskQuestion(
  pool: KiraQuestionPool,
  seed: number,
  performerName = "Performer"
): KiraDialogue {
  const questions = pickQuestions(pool, 1, seed);
  const question = questions[0] ?? pickIndex(KIRA_BEGINNING_QUESTIONS, seed);
  const typeMap: Record<KiraQuestionPool, KiraDialogueType> = {
    beginning: "question_before",
    ending: "question_after",
    funny_random: "funny_random",
  };
  return {
    type: typeMap[pool],
    text: fillTemplate(question, { performer: performerName }),
    hostId: "kira",
  };
}

/** Returns 1–3 questions, always in a fresh random order. */
export function kiraSpotlightSet(
  pools: KiraQuestionPool[],
  seed: number,
  performerName = "Performer"
): KiraDialogue[] {
  return pools.map((pool, i) => kiraAskQuestion(pool, seed + i * 7, performerName));
}

export function kiraAudiencePrompt(
  seed: number,
  performerName = "Performer"
): KiraDialogue {
  return {
    type: "audience_prompt",
    text: fillTemplate(pickIndex(KIRA_AUDIENCE_PROMPTS, seed), { performer: performerName }),
    hostId: "kira",
  };
}

export function kiraReturningPerformer(context: KiraReturnContext): KiraDialogue {
  let templateKey: keyof typeof RETURNING_PERFORMER_TEMPLATES = "generic";
  if (context.lastGoal && context.goalAchieved === true) templateKey = "with_goal_achieved";
  else if (context.lastGoal && context.goalAchieved === false) templateKey = "with_goal_pending";
  else if (context.lastSong) templateKey = "with_song";

  return {
    type: "returning_performer",
    text: fillTemplate(RETURNING_PERFORMER_TEMPLATES[templateKey], {
      performer: context.performerName,
      lastAppearance: context.lastAppearance,
      lastSong: context.lastSong ?? "",
      lastGoal: context.lastGoal ?? "",
    }),
    hostId: "kira",
  };
}

export function kiraActIntro(
  performerName: string,
  teaser: string,
  seed: number
): KiraDialogue {
  return {
    type: "act_intro",
    text: fillTemplate(pickIndex(ACT_INTRO_TEMPLATES, seed), {
      performer: performerName,
      teaser,
    }),
    hostId: "kira",
  };
}
