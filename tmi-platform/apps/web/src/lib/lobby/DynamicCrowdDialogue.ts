/**
 * DynamicCrowdDialogue
 * Generates contextual crowd dialogue lines that populate the lobby chat rail.
 * Adapts to current show state, crowd energy, and event beats.
 */

export type DialogueContext =
  | "pre_show_waiting"
  | "performer_announced"
  | "show_live"
  | "hype_peak"
  | "battle_active"
  | "vote_open"
  | "winner_announced"
  | "encore"
  | "show_ended"
  | "idle";

export interface CrowdLine {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  context: DialogueContext;
  isBot: boolean;
  sentAt: number;
  reactionCount: number;
}

export interface DialogueState {
  roomId: string;
  context: DialogueContext;
  recentLines: CrowdLine[];
  lineVelocity: number;     // lines per minute
  activeAvatarCount: number;
  sentimentScore: number;   // 0-100
}

const CONTEXT_LINES: Record<DialogueContext, string[]> = {
  pre_show_waiting:    ["Who's ready?!", "Can't wait for this one", "Heard tonight is going to be CRAZY", "First time catching a live — hyped", "Nova better bring the heat"],
  performer_announced: ["LETS GOOOOO", "I knew it!", "They're really doing this tonight 👀", "Nobody is ready for what's coming", "The chat is already going off"],
  show_live:           ["WE ARE LIVE", "This beat is hard", "The stage presence is REAL", "Best part of my week right here", "Someone tip this artist rn"],
  hype_peak:           ["I CANNOT 🔥🔥🔥", "THE CROWD IS FERAL", "My ears are blessed", "This is historical", "CARRY ME TO THE STAGE"],
  battle_active:       ["Left side is slept on fr", "Nah right side got this easy", "Both of them going CRAZY", "This battle is too close", "Who's judging, I need names"],
  vote_open:           ["Vote is OPEN", "My vote already in", "Y'all voting with your hearts or your ears?", "Best battle of the season — VOTE NOW", "Can't believe I get to decide this"],
  winner_announced:    ["Called it!!!", "Honestly deserved", "Both were legends tonight", "The right person won 🏆", "GGs to both — insane battle"],
  encore:              ["ENCORE ENCORE ENCORE", "They heard us!!!!", "One more song NO cap", "The crowd pulled it off 🔥", "Tonight will not be forgotten"],
  show_ended:          ["That was everything", "See y'all next show", "Go follow them NOW", "Best live I've attended", "Night well spent — worth every second"],
  idle:                ["When does the show start?", "Chat feel different tonight", "This is my third show this month lol", "TMI keeps delivering", "🎤"],
};

const AVATAR_NAMES = ["CipherFan01", "BeatWatcher", "NovaNation", "CrowdKid", "LobbyLion", "StageRider", "VenueVibe", "ChantMaster", "TipQueen", "ArenaVoice"];

const MAX_LINES = 100;

const dialogueStates = new Map<string, DialogueState>();
type DialogueListener = (state: DialogueState) => void;
const dialogueListeners = new Map<string, Set<DialogueListener>>();
const dialogueIntervals = new Map<string, ReturnType<typeof setInterval>>();

function pickLine(context: DialogueContext): string {
  const lines = CONTEXT_LINES[context];
  return lines[Math.floor(Math.random() * lines.length)];
}

function pickAuthor(): { authorName: string; authorId: string } {
  const name = AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];
  return { authorName: name, authorId: `bot_${name.toLowerCase()}` };
}

function computeSentiment(lines: CrowdLine[]): number {
  const positive = lines.filter(l => /go|fire|love|YES|amazing|🔥|🏆|💎|hype/i.test(l.text)).length;
  return Math.min(100, Math.round((positive / Math.max(1, lines.length)) * 100 * 1.5));
}

function notify(roomId: string, state: DialogueState): void {
  dialogueListeners.get(roomId)?.forEach(l => l(state));
}

export function initCrowdDialogue(roomId: string): DialogueState {
  const state: DialogueState = {
    roomId, context: "idle", recentLines: [], lineVelocity: 0, activeAvatarCount: 0, sentimentScore: 50,
  };
  dialogueStates.set(roomId, state);
  return state;
}

export function setDialogueContext(roomId: string, context: DialogueContext, avatarCount?: number): DialogueState {
  const current = dialogueStates.get(roomId) ?? initCrowdDialogue(roomId);
  const updated = { ...current, context, activeAvatarCount: avatarCount ?? current.activeAvatarCount };
  dialogueStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function injectLine(roomId: string, text: string, authorName: string, isBot = false): CrowdLine {
  const current = dialogueStates.get(roomId) ?? initCrowdDialogue(roomId);
  const line: CrowdLine = {
    id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text, authorName, authorId: `user_${authorName.toLowerCase()}`,
    context: current.context, isBot, sentAt: Date.now(), reactionCount: 0,
  };
  const recentLines = [line, ...current.recentLines].slice(0, MAX_LINES);
  const sentimentScore = computeSentiment(recentLines);
  const updated = { ...current, recentLines, sentimentScore };
  dialogueStates.set(roomId, updated);
  notify(roomId, updated);
  return line;
}

export function startAutoDial(roomId: string, intervalMs = 4000): () => void {
  const existing = dialogueIntervals.get(roomId);
  if (existing) clearInterval(existing);

  const interval = setInterval(() => {
    const state = dialogueStates.get(roomId);
    if (!state) return;
    const { authorName } = pickAuthor();
    injectLine(roomId, pickLine(state.context), authorName, true);
  }, intervalMs);

  dialogueIntervals.set(roomId, interval);
  return () => {
    clearInterval(interval);
    dialogueIntervals.delete(roomId);
  };
}

export function getCrowdDialogue(roomId: string): DialogueState | null {
  return dialogueStates.get(roomId) ?? null;
}

export function subscribeToDialogue(roomId: string, listener: DialogueListener): () => void {
  if (!dialogueListeners.has(roomId)) dialogueListeners.set(roomId, new Set());
  dialogueListeners.get(roomId)!.add(listener);
  const current = dialogueStates.get(roomId);
  if (current) listener(current);
  return () => dialogueListeners.get(roomId)?.delete(listener);
}
