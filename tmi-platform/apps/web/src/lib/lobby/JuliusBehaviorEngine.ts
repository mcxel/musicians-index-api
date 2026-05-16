/**
 * JuliusBehaviorEngine
 * AI behavior system for Julius, the TMI mascot/host avatar.
 * Drives Julius's reactions, movements, dialogue, and stage presence.
 */

export type JuliusMood = "neutral" | "excited" | "hype" | "curious" | "celebrating" | "calming" | "teasing" | "dramatic";
export type JuliusAction =
  | "idle"
  | "pointing_at_stage"
  | "jumping"
  | "waving"
  | "clapping"
  | "shushing"
  | "hyping_crowd"
  | "announcing"
  | "dancing"
  | "bowing";

export interface JuliusLine {
  text: string;
  mood: JuliusMood;
  triggeredBy: string;
}

export interface JuliusState {
  roomId: string;
  mood: JuliusMood;
  action: JuliusAction;
  dialogueLine: JuliusLine | null;
  isVisible: boolean;
  position: "stage-left" | "stage-right" | "center" | "crowd" | "offstage";
  energyLevel: number;        // 0-100
  lastActionAt: number | null;
  lineHistory: JuliusLine[];
}

const MOOD_LINES: Record<JuliusMood, string[]> = {
  neutral:     ["Welcome to TMI!", "The show is heating up.", "Keep your eyes on the stage."],
  excited:     ["Oh snap! Did you see that?!", "Things are getting REAL up here!", "I can feel the energy!"],
  hype:        ["WE ARE LIVE BABY!", "The crowd is GOING OFF!", "This is what we came for!"],
  curious:     ["Hmm... what's next?", "Something big is brewing...", "I've got a feeling about this one."],
  celebrating: ["YESSSS! Champion energy!", "That's what I'm TALKING about!", "The crowd has spoken!"],
  calming:     ["Take a breath, folks.", "We'll be right back at it.", "Enjoy the moment."],
  teasing:     ["You think you know what's coming?", "I know something you don't...", "Place your bets now!"],
  dramatic:    ["The TENSION in this arena...", "Hearts pounding. Mine included.", "History... being made."],
};

const MOOD_ACTIONS: Record<JuliusMood, JuliusAction> = {
  neutral:     "idle",
  excited:     "pointing_at_stage",
  hype:        "hyping_crowd",
  curious:     "waving",
  celebrating: "jumping",
  calming:     "shushing",
  teasing:     "dancing",
  dramatic:    "announcing",
};

const MAX_HISTORY = 20;

const juliusStates = new Map<string, JuliusState>();
type JuliusListener = (state: JuliusState) => void;
const juliusListeners = new Map<string, Set<JuliusListener>>();

function pickLine(mood: JuliusMood): string {
  const lines = MOOD_LINES[mood];
  return lines[Math.floor(Math.random() * lines.length)];
}

function notify(roomId: string, state: JuliusState): void {
  juliusListeners.get(roomId)?.forEach(l => l(state));
}

export function initJulius(roomId: string): JuliusState {
  const state: JuliusState = {
    roomId, mood: "neutral", action: "idle", dialogueLine: null,
    isVisible: true, position: "stage-left", energyLevel: 50,
    lastActionAt: null, lineHistory: [],
  };
  juliusStates.set(roomId, state);
  return state;
}

export function setJuliusMood(roomId: string, mood: JuliusMood, trigger: string): JuliusState {
  const current = juliusStates.get(roomId) ?? initJulius(roomId);
  const text = pickLine(mood);
  const line: JuliusLine = { text, mood, triggeredBy: trigger };
  const action = MOOD_ACTIONS[mood];

  const updated: JuliusState = {
    ...current, mood, action, dialogueLine: line,
    lastActionAt: Date.now(),
    lineHistory: [line, ...current.lineHistory].slice(0, MAX_HISTORY),
  };
  juliusStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function setJuliusPosition(roomId: string, position: JuliusState["position"]): JuliusState {
  const current = juliusStates.get(roomId) ?? initJulius(roomId);
  const updated = { ...current, position };
  juliusStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function setJuliusAction(roomId: string, action: JuliusAction): JuliusState {
  const current = juliusStates.get(roomId) ?? initJulius(roomId);
  const updated = { ...current, action, lastActionAt: Date.now() };
  juliusStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function setJuliusEnergy(roomId: string, level: number): JuliusState {
  const current = juliusStates.get(roomId) ?? initJulius(roomId);
  const clipped = Math.max(0, Math.min(100, level));
  const mood: JuliusMood = clipped >= 85 ? "hype" : clipped >= 65 ? "excited" : clipped >= 40 ? "neutral" : "calming";
  return setJuliusMood(roomId, mood, `energy:${clipped}`);
}

export function hideJulius(roomId: string): JuliusState {
  const current = juliusStates.get(roomId) ?? initJulius(roomId);
  const updated = { ...current, isVisible: false, action: "offstage" as JuliusAction };
  juliusStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function showJulius(roomId: string): JuliusState {
  const current = juliusStates.get(roomId) ?? initJulius(roomId);
  const updated = { ...current, isVisible: true };
  juliusStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function getJuliusState(roomId: string): JuliusState | null {
  return juliusStates.get(roomId) ?? null;
}

export function subscribeToJulius(roomId: string, listener: JuliusListener): () => void {
  if (!juliusListeners.has(roomId)) juliusListeners.set(roomId, new Set());
  juliusListeners.get(roomId)!.add(listener);
  const current = juliusStates.get(roomId);
  if (current) listener(current);
  return () => juliusListeners.get(roomId)?.delete(listener);
}
