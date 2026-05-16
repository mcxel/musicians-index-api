/**
 * HostStageDirector
 * Controls the host's stage presence, cue script, and show flow direction.
 * Coordinates Julius + AI co-host commentary with live performance arc.
 */

export type HostCue =
  | "welcome"
  | "introduce_performer"
  | "hype_countdown"
  | "announce_battle"
  | "call_votes"
  | "announce_winner"
  | "prompt_encore"
  | "tease_next"
  | "close_show"
  | "fill_ad_break"
  | "crowd_pump";

export interface HostScript {
  cue: HostCue;
  lines: string[];
  durationMs: number;
  followUpCue: HostCue | null;
}

export interface HostDirectorState {
  roomId: string;
  currentCue: HostCue | null;
  cueStartedAt: number | null;
  scriptHistory: HostCue[];
  nextCue: HostCue | null;
  hostName: string;
  autoAdvance: boolean;
}

const SCRIPTS: Record<HostCue, HostScript> = {
  welcome:            { cue: "welcome",            lines: ["Welcome to TMI — the stage where legends are born!", "Tonight is going to be electric. Are you ready?"],       durationMs: 8000,  followUpCue: null },
  introduce_performer: { cue: "introduce_performer", lines: ["Put your hands together for your performer!", "Coming to the stage — give it up!"],                          durationMs: 5000,  followUpCue: "hype_countdown" },
  hype_countdown:     { cue: "hype_countdown",     lines: ["3... 2... 1... IT'S TIME!", "The moment you've been waiting for is HERE!"],                                   durationMs: 6000,  followUpCue: null },
  announce_battle:    { cue: "announce_battle",    lines: ["BATTLE TIME! Two artists. One winner. Let the people decide!", "May the best performer take the crown!"],     durationMs: 7000,  followUpCue: "call_votes" },
  call_votes:         { cue: "call_votes",         lines: ["Voting is OPEN! Make your voice heard!", "Who deserves the W? YOU decide!"],                                  durationMs: 45000, followUpCue: "announce_winner" },
  announce_winner:    { cue: "announce_winner",    lines: ["And the winner is... the CROWD! What a performance!", "The votes are in — history has been made!"],           durationMs: 8000,  followUpCue: "prompt_encore" },
  prompt_encore:      { cue: "prompt_encore",      lines: ["Does this legend deserve an encore? Make some noise!", "If you want more — LET US HEAR IT!"],                 durationMs: 10000, followUpCue: null },
  tease_next:         { cue: "tease_next",         lines: ["Before we go... somebody's up next that you do NOT want to miss.", "Stay tuned. Big things incoming."],       durationMs: 6000,  followUpCue: null },
  close_show:         { cue: "close_show",         lines: ["That's a wrap on tonight! You were an INCREDIBLE audience.", "See you next time on TMI. Good night!"],        durationMs: 8000,  followUpCue: null },
  fill_ad_break:      { cue: "fill_ad_break",      lines: ["We'll be right back — grab some water, you've earned it.", "Short break! Don't go anywhere."],               durationMs: 30000, followUpCue: null },
  crowd_pump:         { cue: "crowd_pump",         lines: ["I need to hear you LOUDER!", "Come on — this crowd can do better than that!"],                               durationMs: 5000,  followUpCue: null },
};

const directorStates = new Map<string, HostDirectorState>();
type DirectorListener = (state: HostDirectorState) => void;
const directorListeners = new Map<string, Set<DirectorListener>>();
const cueTimers = new Map<string, ReturnType<typeof setTimeout>>();

function notify(roomId: string, state: HostDirectorState): void {
  directorListeners.get(roomId)?.forEach(l => l(state));
}

export function initHostDirector(roomId: string, hostName = "Julius", autoAdvance = false): HostDirectorState {
  const state: HostDirectorState = {
    roomId, currentCue: null, cueStartedAt: null, scriptHistory: [],
    nextCue: null, hostName, autoAdvance,
  };
  directorStates.set(roomId, state);
  return state;
}

export function deliverCue(roomId: string, cue: HostCue): HostDirectorState {
  const current = directorStates.get(roomId) ?? initHostDirector(roomId);
  const script = SCRIPTS[cue];

  // Clear existing auto-advance timer
  const existingTimer = cueTimers.get(roomId);
  if (existingTimer) clearTimeout(existingTimer);

  const updated: HostDirectorState = {
    ...current,
    currentCue: cue,
    cueStartedAt: Date.now(),
    scriptHistory: [cue, ...current.scriptHistory].slice(0, 20),
    nextCue: script.followUpCue,
  };
  directorStates.set(roomId, updated);
  notify(roomId, updated);

  // Auto-advance to followUpCue if enabled
  if (current.autoAdvance && script.followUpCue) {
    const timer = setTimeout(() => {
      deliverCue(roomId, script.followUpCue!);
    }, script.durationMs);
    cueTimers.set(roomId, timer);
  }

  return updated;
}

export function clearCurrentCue(roomId: string): HostDirectorState {
  const current = directorStates.get(roomId) ?? initHostDirector(roomId);
  const existing = cueTimers.get(roomId);
  if (existing) { clearTimeout(existing); cueTimers.delete(roomId); }
  const updated = { ...current, currentCue: null, cueStartedAt: null, nextCue: null };
  directorStates.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function getScript(cue: HostCue): HostScript {
  return SCRIPTS[cue];
}

export function getCurrentLine(roomId: string): string | null {
  const state = directorStates.get(roomId);
  if (!state?.currentCue) return null;
  const script = SCRIPTS[state.currentCue];
  return script.lines[0] ?? null;
}

export function getHostDirector(roomId: string): HostDirectorState | null {
  return directorStates.get(roomId) ?? null;
}

export function subscribeToHostDirector(roomId: string, listener: DirectorListener): () => void {
  if (!directorListeners.has(roomId)) directorListeners.set(roomId, new Set());
  directorListeners.get(roomId)!.add(listener);
  const current = directorStates.get(roomId);
  if (current) listener(current);
  return () => directorListeners.get(roomId)?.delete(listener);
}
