/**
 * Bebo Dialogue Engine — Monday Night Stage
 *
 * Pure-function dialogue generator for Bebo's comedy-host persona.
 * Follows the BotDJEngine pattern: template arrays, fillTemplate, pickIndex.
 * No side effects, no timers, no state — caller owns the state machine.
 *
 * Bebo's role: funny, fast-paced host who keeps energy high.
 * He reacts to live metrics (applause, boo, chat volume, vote count),
 * comments on performances, runs improv games between acts, and
 * redirects rough performers toward Practice Mode.
 * He NEVER attacks identity — humor stays focused on the performance.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type BeboReactionType =
  | "performance_great"       // crowd is loving the performance
  | "performance_nervous"     // performer started nervously
  | "lyrics_forgotten"        // performer forgot their lyrics
  | "singing_off_key"         // noticeably off-key singing
  | "boo_building"            // boos are climbing — pre-hook territory
  | "hook_incoming"           // Bebo is about to hook someone
  | "hook_aftermath"          // performer has just been hooked
  | "encore_earned"           // crowd is calling for an encore
  | "metric_applause_high"    // applause meter surging
  | "metric_boo_high"         // boo meter surging
  | "metric_chat_exploding"   // chat volume spiking
  | "metric_no_votes"         // nobody is voting
  | "show_open"               // Bebo opens the show
  | "act_transition"          // between performers
  | "next_performer_call"     // calling the next performer on stage
  | "catchphrase"             // random Bebo signature line
  | "improv_game_intro"       // introducing a mini improv game
  | "practice_redirect"       // redirecting a rough performer to Practice Mode
  | "kira_interplay_reply"    // responding to something Kira just said
  | "peek_from_backstage"     // Bebo leans around the curtain — crowd sees him watching
  | "on_stage_warning"        // Bebo has stepped onto the stage to issue a warning
  | "recovery_exit";          // crowd recovered — Bebo raises his hook and gracefully exits

export type BeboDialogue = {
  type: BeboReactionType;
  text: string;
  hostId: "bebo";
};

export type KiraInterplayContext = {
  kiraLine: string;
  performerName: string;
  funFact?: string;
};

// ── Utility ───────────────────────────────────────────────────────────────────

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

function pickIndex(arr: string[], seed: number): string {
  return arr[seed % arr.length] ?? arr[0] ?? "";
}

// ── Signature catchphrases ────────────────────────────────────────────────────

export const BEBO_CATCHPHRASES: string[] = [
  "Let's make some noise!",
  "Don't blink — you might miss your new favorite artist.",
  "The stage remembers confidence.",
  "Every legend starts somewhere.",
  "Next performer... you're up!",
  "Monday Night Stage — where careers are born.",
  "The audience is always right... except when they're wrong!",
  "Somebody better write this down, because history is happening.",
  "I came here to HOST and I am NOT leaving early.",
  "If you've got talent, tonight is your night. If you don't... I've got a hook.",
];

// ── Performance reaction lines ────────────────────────────────────────────────

const GREAT_PERFORMANCE_LINES: string[] = [
  "Now THAT'S what I'm talking about! Somebody better bookmark this performance because we're gonna be talking about it tomorrow.",
  "HOLD UP — did everyone just feel that? Because I think we just witnessed something special.",
  "{performer} showed UP tonight. Fans, hit that follow button before they forget who found them first.",
  "The energy in here just went through the roof and we are NOT coming down from this.",
  "I don't give standing ovations often... okay I give them every week, but this one is EARNED.",
  "That performance just moved up the leaderboard in real time. Check the rankings, people.",
];

const NERVOUS_START_LINES: string[] = [
  "Take your time! Half the audience was nervous just walking through the front door. You got this.",
  "Deep breath — the stage has seen a thousand nervous performers become legends. You're in good company.",
  "I see those nerves. Good. That means you care. Now show us what you've been practicing.",
  "The crowd is rooting for you. I am rooting for you. Even my hook is rooting for you. Prove us right.",
  "Nerves are just excitement that didn't get the memo yet. Channel it.",
];

const LYRICS_FORGOTTEN_LINES: string[] = [
  "Well... those lyrics escaped faster than my paycheck on rent day! Somebody catch 'em before they leave the building!",
  "The words took a vacation but the performer stayed — respect for not leaving with them.",
  "I've seen lyrics disappear mid-song before. Usually they come back in the second verse. Hang tight, everyone.",
  "Blank mind, full heart. It happens to the best of them. Shake it off and keep going.",
  "Even the greatest performers have had a lyric evacuation. The difference is what you do next.",
];

const OFF_KEY_LINES: string[] = [
  "That note wasn't in the song... but it was definitely confident!",
  "Some notes are written. Some notes are... discovered. That was a discovery.",
  "The key is... open for debate. But the energy? Undefeated.",
  "Fun fact: avant-garde vocalists have been doing that on purpose since the 1960s. Maybe {performer} is ahead of their time.",
  "That had a certain... creative interpretation of the melody. I'm choosing to call it artistic.",
];

const BOO_BUILDING_LINES: string[] = [
  "I'm just gonna say it — the crowd is trying to make a decision here. {performer}, this is your moment to change some minds.",
  "I hear some rumbling out there. The hook is warming up... but it hasn't committed yet. This is fixable.",
  "Crowd, give 'em a SECOND. {performer}, make the crowd give you a second.",
  "My hook is pacing backstage right now. It's nervous energy. Let's not let it come out here.",
];

const HOOK_INCOMING_LINES: string[] = [
  "I tried to hold back. The crowd spoke. You know what time it is.",
  "Nobody wants this moment. But somebody's got to keep the show moving.",
  "The numbers don't lie and tonight... the numbers did not cooperate for {performer}.",
  "This is not the end — this is chapter one. But tonight, chapter one closes here.",
];

const HOOK_AFTERMATH_LINES: string[] = [
  "Looks like tonight wasn't your championship round... but every great performer has a story before they have a standing ovation. Keep practicing and come back stronger.",
  "{performer} — the door is not closed. It is temporarily closed. Come back with a key made of rehearsal time.",
  "The stage will be here next Monday. And the Monday after that. TMI believes in second chances when they're earned.",
  "I've seen performers get hooked and come back to headline. Write that down.",
];

// ── Peek-from-backstage lines (OFFSTAGE → PEEK) ───────────────────────────────
// Bebo leans around the curtain. He hasn't interrupted yet — this is a visual warning.

const BEBO_PEEK_LINES: string[] = [
  "Uh-oh... I heard some boo birds flying around out there.",
  "Come on now... don't make me do my job tonight.",
  "You still got time! Win 'em back!",
  "I'm just gonna peek out here for a second. Don't mind me.",
  "The hook has eyes. The hook is watching. {performer}, now would be a great time to find another gear.",
  "I've been backstage all night minding my business... but the crowd is changing that equation.",
];

// ── On-stage warning lines (PEEK → ON_STAGE_WARNING) ─────────────────────────
// Bebo steps onto the stage. He delivers one improvised line and waits.

const BEBO_ON_STAGE_WARNING_LINES: string[] = [
  "The crowd sent for me. I'm here. {performer} — this is your moment to change some minds.",
  "I didn't want to come out here. But here I am. You've got one more verse to turn this around.",
  "The hook is warm. The crowd is restless. This is fixable — but it needs to be fixed right now.",
  "Nobody roots for me to use this thing. That's the whole point. Prove them right — and me wrong.",
  "I've seen this go either way. Right now, it's going the wrong way. {performer}, flip it.",
  "I'm standing here as a representative of the audience. They want to see something different. Give it to them.",
];

// ── Recovery exit lines (ON_STAGE_WARNING → RECOVERY_EXIT) ───────────────────
// The crowd swung back. Bebo acknowledges the recovery and gracefully exits.

const BEBO_RECOVERY_EXIT_LINES: string[] = [
  "That's more like it!",
  "See? I KNEW you had another gear. I'm going backstage now. Don't make me come back.",
  "Now KEEP it going!",
  "That's the performance we came for. The hook is going back on the wall.",
  "The crowd changed their mind. That's the best outcome in this building. Well done.",
  "I raised this hook and the crowd put it down for you. That's respect. Now finish strong.",
];

const ENCORE_EARNED_LINES: string[] = [
  "The crowd is not letting you leave! ENCORE! ENCORE! You heard them — get back up there.",
  "When was the last time I saw an encore request this loud? {performer}, you did THAT.",
  "They want more. I want more. The hook wants more. Give them MORE.",
];

// ── Metric-aware reaction lines ───────────────────────────────────────────────

const APPLAUSE_HIGH_LINES: string[] = [
  "Hold up... the applause meter is trying to break my computer!",
  "The applause detector just filed a workplace injury report. This is what we want!",
  "I have never seen this meter move this fast. Someone please make sure it's okay.",
  "{performer} broke the applause meter. Legal is going to be in touch.",
];

const BOO_HIGH_LINES: string[] = [
  "The boo meter is... speaking. Loudly. {performer}, we need a conversation.",
  "Okay the boo gauge is having a moment. I'm looking at the hook. The hook is looking at me.",
  "I don't want to alarm anyone but this meter is trending in a direction I don't love.",
];

const CHAT_EXPLODING_LINES: string[] = [
  "Somebody check the chat before it catches on fire.",
  "The chat is going absolutely feral right now and I am HERE for it.",
  "I cannot read chat fast enough. My eyes are not designed for this speed.",
  "Chat is saying things. A lot of things. All at once. Someone translate.",
];

const NO_VOTES_LINES: string[] = [
  "Y'all got thumbs, right? Hit that vote button before I start choosing for you!",
  "The vote counter has not moved and I am personally offended. VOTE.",
  "Is everyone just watching? Watching is free. Voting is ALSO free. Do the second thing.",
  "I see 200 people in this room and zero votes. I'm going to need an explanation.",
];

// ── Show flow lines ───────────────────────────────────────────────────────────

const SHOW_OPEN_LINES: string[] = [
  "GOOD EVENING and welcome to Monday Night Stage — the only show where your talent is the ticket! I'm Bebo, and we are LIVE!",
  "It is MONDAY. It is NIGHT. And this is the STAGE. I am Bebo and I have been waiting all week for this moment.",
  "Ladies and gentlemen, fans, performers, and anyone who accidentally clicked the wrong link — welcome to Monday Night Stage! Let's make some noise!",
  "The stage is set, the crowd is here, Kira is somewhere on the floor — and I am READY. Monday Night Stage is officially OPEN.",
];

const ACT_TRANSITION_LINES: string[] = [
  "One performance down. The bar has been set. Next performer — your job is to move it.",
  "That was act one. We have more where that came from. Hold tight.",
  "The show is moving, the crowd is engaged, and I still have a hook I haven't used yet. Exciting times.",
  "Quick check-in with the audience — everyone good? Great. Let's keep going.",
  "Between acts is where legends are made in the green room. Who's getting ready back there?",
];

const NEXT_PERFORMER_CALL_LINES: string[] = [
  "Next performer... you're up! {performer}, this is your moment — take it!",
  "Bringing to the stage right now — {performer}! Let's hear it!",
  "The audience is ready. The stage is ready. {performer} — it's YOUR time.",
  "Next up: {performer}! Kira, you want to say hi before they perform?",
  "Coming to the stage — {performer}. Everyone, give them the energy they need to deliver.",
];

// ── Improv game introductions ─────────────────────────────────────────────────

export const BEBO_IMPROV_GAMES: Array<{ name: string; intro: string }> = [
  {
    name: "Finish the Lyric",
    intro: "Alright, while we wait for our next performer — it's time for FINISH THE LYRIC! I start a line, you finish it in the chat. Ready? Here we go...",
  },
  {
    name: "Musical Charades",
    intro: "We're doing Musical Charades! I'll describe a song without naming it — artist, year, or any song title — and the first person in chat to get it wins bragging rights for the week.",
  },
  {
    name: "Guess the Instrument",
    intro: "Quick game — I'm going to describe the sound of an instrument and you tell me what it is. Prove you know your music theory. Starting now.",
  },
  {
    name: "Five-Second Freestyle",
    intro: "FIVE SECOND FREESTYLE! Pick a random word from chat and someone has to freestyle one bar using it. Chat, give me a word — GO.",
  },
  {
    name: "Emoji Acting Challenge",
    intro: "Emoji Acting! I'll post three emojis, and the first person in chat to correctly act out what they represent in one sentence wins. Eyes on the chat...",
  },
  {
    name: "Sound Effect Challenge",
    intro: "Sound Effect Challenge — this one's for the whole room. I need the best description of a sound effect for a performer walking out in complete silence. Chat, let's hear it.",
  },
  {
    name: "Audience Mimic Challenge",
    intro: "Audience Mimic! Pick a performer who just went on stage, describe their energy in three words. Most creative answer in chat wins eternal Bebo respect.",
  },
];

// ── Practice Mode redirect lines ─────────────────────────────────────────────

const PRACTICE_REDIRECT_LINES: string[] = [
  "The confidence was there. The timing got away from you a little. Spend some time in Practice Mode this week, tighten up those transitions, and come see me again next Monday. I love a comeback story.",
  "That performance had something in it — but 'something' needs work before it becomes 'everything.' Practice Mode is open 24/7. Use it before next Monday.",
  "Not every night is your night. The best performers know the difference between a rough draft and a final performance. This was a rough draft. Practice Mode — go.",
  "Here's what I saw: potential. Here's what needs work: execution. Fortunately, Practice Mode exists for exactly this reason. See you next week with the polished version.",
  "The stage doesn't care about effort — it cares about delivery. Work on the delivery this week. Practice Mode will give you the reps you need.",
];

// ── Kira interplay response lines ────────────────────────────────────────────

const KIRA_INTERPLAY_TEMPLATES: string[] = [
  // These are triggered after Kira says something — {kiraFact} = what Kira just shared
  "{kiraFact}? Well somebody better look out because confidence showed up before experience tonight!",
  "Did everyone hear that? {kiraFact}! The origin story is being written in real time!",
  "Kira with the deep dive as always. {kiraFact}. I respect the homework.",
  "Six months? A year? Doesn't matter — what I saw on that stage is not a beginner performance. {kiraFact} is the backstory. The talent is the headline.",
];

const KIRA_FOOD_INTERPLAY: string[] = [
  // Triggered when Kira shares a fun food fact from a random question
  "If {performer} wins tonight, {food} is on them. The audience heard it!",
  "The official food of a great performance is {food}. This has been decided.",
  "{food} choice noted. I'm judging the palate AND the performance tonight.",
];

// ── Public dialogue functions ─────────────────────────────────────────────────

export function beboReactToPerformance(
  type: "great" | "nervous" | "lyrics_forgotten" | "off_key" | "boo_building" | "encore_earned",
  seed: number,
  performerName = "Performer"
): BeboDialogue {
  const templateMap: Record<string, string[]> = {
    great: GREAT_PERFORMANCE_LINES,
    nervous: NERVOUS_START_LINES,
    lyrics_forgotten: LYRICS_FORGOTTEN_LINES,
    off_key: OFF_KEY_LINES,
    boo_building: BOO_BUILDING_LINES,
    encore_earned: ENCORE_EARNED_LINES,
  };

  const reactionMap: Record<string, BeboReactionType> = {
    great: "performance_great",
    nervous: "performance_nervous",
    lyrics_forgotten: "lyrics_forgotten",
    off_key: "singing_off_key",
    boo_building: "boo_building",
    encore_earned: "encore_earned",
  };

  const templates = templateMap[type] ?? GREAT_PERFORMANCE_LINES;
  const text = fillTemplate(pickIndex(templates, seed), { performer: performerName });
  return { type: reactionMap[type] ?? "performance_great", text, hostId: "bebo" };
}

export function beboHookCommentary(
  phase: "incoming" | "aftermath",
  seed: number,
  performerName = "Performer"
): BeboDialogue {
  const lines = phase === "incoming" ? HOOK_INCOMING_LINES : HOOK_AFTERMATH_LINES;
  const type: BeboReactionType = phase === "incoming" ? "hook_incoming" : "hook_aftermath";
  return {
    type,
    text: fillTemplate(pickIndex(lines, seed), { performer: performerName }),
    hostId: "bebo",
  };
}

export function beboMetricReact(
  metric: "applause_high" | "boo_high" | "chat_exploding" | "no_votes",
  seed: number,
  performerName = "Performer"
): BeboDialogue {
  const metricMap: Record<string, string[]> = {
    applause_high: APPLAUSE_HIGH_LINES,
    boo_high: BOO_HIGH_LINES,
    chat_exploding: CHAT_EXPLODING_LINES,
    no_votes: NO_VOTES_LINES,
  };
  const typeMap: Record<string, BeboReactionType> = {
    applause_high: "metric_applause_high",
    boo_high: "metric_boo_high",
    chat_exploding: "metric_chat_exploding",
    no_votes: "metric_no_votes",
  };
  return {
    type: typeMap[metric] ?? "metric_applause_high",
    text: fillTemplate(pickIndex(metricMap[metric] ?? APPLAUSE_HIGH_LINES, seed), {
      performer: performerName,
    }),
    hostId: "bebo",
  };
}

export function beboShowOpen(seed: number): BeboDialogue {
  return { type: "show_open", text: pickIndex(SHOW_OPEN_LINES, seed), hostId: "bebo" };
}

export function beboActTransition(seed: number): BeboDialogue {
  return { type: "act_transition", text: pickIndex(ACT_TRANSITION_LINES, seed), hostId: "bebo" };
}

export function beboCallNextPerformer(performerName: string, seed: number): BeboDialogue {
  return {
    type: "next_performer_call",
    text: fillTemplate(pickIndex(NEXT_PERFORMER_CALL_LINES, seed), { performer: performerName }),
    hostId: "bebo",
  };
}

export function beboCatchphrase(seed: number): BeboDialogue {
  return { type: "catchphrase", text: pickIndex(BEBO_CATCHPHRASES, seed), hostId: "bebo" };
}

export function beboImprovGame(seed: number): BeboDialogue {
  const game = BEBO_IMPROV_GAMES[seed % BEBO_IMPROV_GAMES.length] ?? BEBO_IMPROV_GAMES[0]!;
  return { type: "improv_game_intro", text: game.intro, hostId: "bebo" };
}

export function beboPracticeRedirect(seed: number): BeboDialogue {
  return { type: "practice_redirect", text: pickIndex(PRACTICE_REDIRECT_LINES, seed), hostId: "bebo" };
}

// ── State-machine dialogue functions (tied to BeboHookEngine stages) ──────────

/** Called when BeboHookEngine transitions OFFSTAGE → PEEK */
export function beboPeekFromBackstage(seed: number, performerName = "Performer"): BeboDialogue {
  return {
    type: "peek_from_backstage",
    text: fillTemplate(pickIndex(BEBO_PEEK_LINES, seed), { performer: performerName }),
    hostId: "bebo",
  };
}

/** Called when BeboHookEngine transitions PEEK → ON_STAGE_WARNING */
export function beboOnStageWarning(seed: number, performerName = "Performer"): BeboDialogue {
  return {
    type: "on_stage_warning",
    text: fillTemplate(pickIndex(BEBO_ON_STAGE_WARNING_LINES, seed), { performer: performerName }),
    hostId: "bebo",
  };
}

/** Called when BeboHookEngine transitions ON_STAGE_WARNING → RECOVERY_EXIT */
export function beboRecoveryExit(seed: number, performerName = "Performer"): BeboDialogue {
  return {
    type: "recovery_exit",
    text: fillTemplate(pickIndex(BEBO_RECOVERY_EXIT_LINES, seed), { performer: performerName }),
    hostId: "bebo",
  };
}

export function beboKiraInterplay(
  context: KiraInterplayContext,
  seed: number
): BeboDialogue {
  // If Kira shared a food fact, use food-specific interplay
  if (context.funFact && /pizza|taco|burger|sushi|ramen|chicken|rice|pasta/i.test(context.funFact)) {
    const text = fillTemplate(pickIndex(KIRA_FOOD_INTERPLAY, seed), {
      performer: context.performerName,
      food: context.funFact,
    });
    return { type: "kira_interplay_reply", text, hostId: "bebo" };
  }
  const text = fillTemplate(pickIndex(KIRA_INTERPLAY_TEMPLATES, seed), {
    kiraFact: context.kiraLine,
    performer: context.performerName,
  });
  return { type: "kira_interplay_reply", text, hostId: "bebo" };
}
