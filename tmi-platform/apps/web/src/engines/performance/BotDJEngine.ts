// Bot DJ Engine — Platform-controlled DJ persona for rolling sessions
// Generates: room announcements, beat picks, skip reactions, round transitions, hype, winner calls
// Pure function engine — no side effects, no timers, no state

import type { BeatEntry } from "./BeatQueueEngine";
import type { RotationSlot } from "./RollingCypherBattleEngine";

// ── Persona types ─────────────────────────────────────────────────────────────

export type DJStyle = "hype" | "smooth" | "announcer" | "drill";

export type BotDJPersona = {
  id: string;
  name: string;
  style: DJStyle;
  catchphrase: string;
};

export type DJActionType =
  | "announce_room"
  | "pick_beat"
  | "beat_locked"
  | "react_skip"
  | "transition_round"
  | "hype_players"
  | "announce_winner";

export type DJAction = {
  type: DJActionType;
  text: string;
  botId: string;
  beatId?: string;
  winnerId?: string;
};

export type SessionDJSequence = {
  roomAnnouncement: DJAction;
  beatPick: DJAction;
  beatLock: DJAction;
  transition: DJAction;
  hype: DJAction;
};

// ── Bot DJ roster ─────────────────────────────────────────────────────────────

export const BOT_DJ_ROSTER: BotDJPersona[] = [
  { id: "bot-dj-1", name: "DJ Cipher",    style: "hype",      catchphrase: "We keep it moving."        },
  { id: "bot-dj-2", name: "Wave.Cast",    style: "smooth",    catchphrase: "Smooth energy only."       },
  { id: "bot-dj-3", name: "The Selector", style: "announcer", catchphrase: "One selection at a time."  },
  { id: "bot-dj-4", name: "Apex.Drop",    style: "hype",      catchphrase: "No cap, all fire."         },
  { id: "bot-dj-5", name: "SoundLord.B",  style: "smooth",    catchphrase: "Let the beat speak."       },
  { id: "bot-dj-6", name: "Frequency",    style: "announcer", catchphrase: "Locked and loaded."        },
  { id: "bot-dj-7", name: "Krate.Digger", style: "drill",     catchphrase: "Every record has a story." },
  { id: "bot-dj-8", name: "LoopMaster",   style: "hype",      catchphrase: "Feel the rotation."        },
];

// ── Utility ───────────────────────────────────────────────────────────────────

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

function pickIndex(arr: string[], seed: number): string {
  return arr[seed % arr.length] ?? arr[0] ?? "";
}

export function getBotDJById(id: string): BotDJPersona {
  return BOT_DJ_ROSTER.find((b) => b.id === id) ?? BOT_DJ_ROSTER[0]!;
}

export function getBotDJForRotation(rotationIndex: number): BotDJPersona {
  return BOT_DJ_ROSTER[rotationIndex % BOT_DJ_ROSTER.length]!;
}

// ── Room announcements ────────────────────────────────────────────────────────

const ANNOUNCE_TEMPLATES: Record<DJStyle, string[]> = {
  hype: [
    "🎙️ Aye! {genre} {type} is OPEN. Slots filling fast — get in now.",
    "⚡ {label} loading up. Who's stepping in? Spots are live.",
    "🔥 New session dropping: {label}. Join the window before it locks.",
  ],
  smooth: [
    "🎵 {label} is now open. Take your spot.",
    "🌊 {genre} session live. Join before the window closes.",
    "✨ We're setting up a {type} — {genre} style. Come through.",
  ],
  announcer: [
    "📢 ATTENTION: {label} — join window is now open. {slots} slots available.",
    "🎤 {label} commencing. Performers, take your positions.",
    "🏟️ Platform session live: {label}. Entry window: {joinMin} minutes.",
  ],
  drill: [
    "💿 {label} spinning up. No cap.",
    "🎯 {genre} session is live. Step up or step aside.",
    "🔊 {label} on deck. {slots} slots. Real ones only.",
  ],
};

export function announceRoom(botId: string, slot: RotationSlot, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = fillTemplate(pickIndex(ANNOUNCE_TEMPLATES[bot.style], seed), {
    genre:   slot.genre,
    type:    slot.type,
    label:   slot.label,
    slots:   String(slot.slots),
    joinMin: String(Math.round(slot.joinWindowMs / 60000)),
  });
  return { type: "announce_room", text, botId };
}

// ── Beat pick + lock ──────────────────────────────────────────────────────────

const BEAT_PICK_LINES: Record<DJStyle, string[]> = {
  hype:      ["🎧 Dropping '{title}' by {producer}. Let's go!", "⚡ Queue locked: '{title}' — {bpm} BPM. Feel that?", "🔥 I'm loading up '{title}'. {producer} came through."],
  smooth:    ["🎵 Selected: '{title}' by {producer}. {bpm} BPM.", "🌊 Queue: '{title}'. Produced by {producer}.", "✨ '{title}' in the chamber. Vote or ride with it."],
  announcer: ["📢 Beat selection: '{title}' — {producer}, {bpm} BPM, {energy} energy.", "🎤 Loading '{title}' for this session.", "📻 Beat cued: '{title}' by {producer}."],
  drill:     ["💿 '{title}' — {bpm} BPM. No debate.", "🎯 I selected '{title}'. {producer} sent it.", "🔊 Running '{title}'. Skip if you want, I've got more."],
};

const BEAT_LOCK_LINES: Record<DJStyle, string[]> = {
  hype:      ["🔒 '{title}' is locked. No more skips — perform!", "⚡ Beat locked: '{title}'. Let's ride!", "🔥 '{title}' is in. {bpm} BPM all session."],
  smooth:    ["🔒 Locked in: '{title}'. We're going.", "🎵 '{title}' sealed. Focus.", "🌊 Beat sealed. Perform."],
  announcer: ["📢 Beat locked: '{title}', {bpm} BPM. No substitutions.", "🎤 '{title}' is the session beat.", "📻 Beat confirmed. Session begins."],
  drill:     ["💿 Locked. '{title}'. That's final.", "🎯 '{title}' — done. No skipping.", "🔊 Locked in. Move."],
};

export function pickBeat(botId: string, beat: BeatEntry, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = fillTemplate(pickIndex(BEAT_PICK_LINES[bot.style], seed), {
    title: beat.title, producer: beat.producerName, bpm: String(beat.bpm), energy: beat.energy,
  });
  return { type: "pick_beat", text, botId, beatId: beat.id };
}

export function announceBeatLocked(botId: string, beat: BeatEntry, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = fillTemplate(pickIndex(BEAT_LOCK_LINES[bot.style], seed), {
    title: beat.title, bpm: String(beat.bpm),
  });
  return { type: "beat_locked", text, botId, beatId: beat.id };
}

// ── Skip reactions ────────────────────────────────────────────────────────────

const SKIP_REACTION_LINES: Record<DJStyle, string[]> = {
  hype:      ["👎 Skip vote in. Loading next beat.", "⏩ Skipping — I've got something better.", "🔄 Rotating the queue. Watch this."],
  smooth:    ["〰️ Skipped. Next selection coming up.", "🌊 Moving on. Different vibe incoming.", "✨ Fair. Here's the next one."],
  announcer: ["📢 Skip threshold met. Advancing beat queue.", "🎤 Beat skipped by majority vote. Proceeding.", "📻 Queue advancing."],
  drill:     ["💿 They skipped it. Bet. Next.", "🎯 Skip registered. Loading.", "🔊 Next beat. No cap."],
};

export function reactToSkip(botId: string, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = pickIndex(SKIP_REACTION_LINES[bot.style], seed);
  return { type: "react_skip", text, botId };
}

// ── Round transitions ─────────────────────────────────────────────────────────

const TRANSITION_LINES: Record<DJStyle, string[]> = {
  hype:      ["⚡ Round's done. Scores locked. Next battle loading!", "🔥 That's a wrap. Fan vote window is OPEN.", "🏆 Time's up! Who got it? Vote now."],
  smooth:    ["🌊 Session complete. Judges reviewing.", "✨ And we're done. Results incoming.", "🎵 Performance closed. Vote now."],
  announcer: ["📢 Performance window closed. Judge review begins.", "🎤 Round complete. Fan vote now open.", "📻 Session ended. Tallying votes."],
  drill:     ["💿 That's it. Judges got it from here.", "🎯 Round closed. Who won? Vote.", "🔊 Done. Fan vote is live."],
};

export function transitionRound(botId: string, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = pickIndex(TRANSITION_LINES[bot.style], seed);
  return { type: "transition_round", text, botId };
}

// ── Hype lines ────────────────────────────────────────────────────────────────

const HYPE_LINES: Record<DJStyle, string[]> = {
  hype:      ["🔥 Keep the energy UP!", "⚡ Chat is going crazy. Let's go!", "🎙️ Show the crowd what you've got!", "🏟️ TMI is LIVE right now!"],
  smooth:    ["✨ Smooth performance. Keep it going.", "🌊 You've got the room. Own it.", "🎵 The crowd is feeling it."],
  announcer: ["📢 Crowd engagement is high. Performers, hold that energy.", "🎤 All eyes on the stage.", "📻 This session is live on the platform."],
  drill:     ["💿 Real ones recognize.", "🎯 No fillers, all killers.", "🔊 Platform watching."],
};

export function hypePlayers(botId: string, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = pickIndex(HYPE_LINES[bot.style], seed);
  return { type: "hype_players", text, botId };
}

// ── Winner announcement ───────────────────────────────────────────────────────

const WINNER_TEMPLATES: Record<DJStyle, string[]> = {
  hype:      ["🏆 WINNER: {winner}! The crowd has spoken. Crown XP incoming!", "⚡ {winner} TAKES IT! What a performance!", "🔥 {winner} is your winner. Respect!"],
  smooth:    ["🏆 {winner} wins this round. Well earned.", "🌊 The votes are in. {winner} takes the crown.", "✨ {winner}. Class act."],
  announcer: ["📢 Vote results: {winner} wins with majority fan vote.", "🎤 Winner declared: {winner}. Rewards processing.", "📻 {winner} is the session winner."],
  drill:     ["💿 {winner}. Undisputed.", "🎯 {winner} ran that. Period.", "🔊 {winner} — TMI certified."],
};

export function announceWinner(botId: string, winnerId: string, winnerName: string, seed = 0): DJAction {
  const bot = getBotDJById(botId);
  const text = fillTemplate(pickIndex(WINNER_TEMPLATES[bot.style], seed), { winner: winnerName });
  return { type: "announce_winner", text, botId, winnerId };
}

// ── Full session sequence ─────────────────────────────────────────────────────

export function buildSessionDJSequence(botId: string, slot: RotationSlot, beat: BeatEntry): SessionDJSequence {
  return {
    roomAnnouncement: announceRoom(botId, slot, 0),
    beatPick:         pickBeat(botId, beat, 0),
    beatLock:         announceBeatLocked(botId, beat, 0),
    transition:       transitionRound(botId, 0),
    hype:             hypePlayers(botId, 0),
  };
}
