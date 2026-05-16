/**
 * StageRevealEngine
 * Coordinates the performer reveal sequence — the cinematic moment between curtain open and performance start.
 */

export type RevealBeat =
  | "waiting"
  | "smoke_rising"
  | "spotlight_lock"
  | "performer_silhouette"
  | "performer_visible"
  | "intro_audio"
  | "hype_peak"
  | "performance_start";

export interface RevealSequenceState {
  roomId: string;
  beat: RevealBeat;
  performerId: string | null;
  performerName: string | null;
  smokeOpacity: number;        // 0-1
  spotlightRadius: number;     // 0-1
  performerOpacity: number;    // 0-1
  introAudioPlaying: boolean;
  hypeMeter: number;           // 0-100
  beatStartedAt: number;
}

const BEAT_ORDER: RevealBeat[] = [
  "waiting", "smoke_rising", "spotlight_lock", "performer_silhouette",
  "performer_visible", "intro_audio", "hype_peak", "performance_start",
];

const BEAT_DURATIONS: Record<RevealBeat, number> = {
  waiting:               0,
  smoke_rising:        800,
  spotlight_lock:      600,
  performer_silhouette: 700,
  performer_visible:   900,
  intro_audio:        1200,
  hype_peak:           600,
  performance_start:     0,
};

const BEAT_STATES: Record<RevealBeat, Partial<RevealSequenceState>> = {
  waiting:               { smokeOpacity: 0,    spotlightRadius: 0,   performerOpacity: 0,   introAudioPlaying: false, hypeMeter: 0  },
  smoke_rising:          { smokeOpacity: 0.8,  spotlightRadius: 0,   performerOpacity: 0,   introAudioPlaying: false, hypeMeter: 15 },
  spotlight_lock:        { smokeOpacity: 0.9,  spotlightRadius: 0.4, performerOpacity: 0,   introAudioPlaying: false, hypeMeter: 30 },
  performer_silhouette:  { smokeOpacity: 0.7,  spotlightRadius: 0.7, performerOpacity: 0.2, introAudioPlaying: false, hypeMeter: 55 },
  performer_visible:     { smokeOpacity: 0.4,  spotlightRadius: 1.0, performerOpacity: 1.0, introAudioPlaying: false, hypeMeter: 70 },
  intro_audio:           { smokeOpacity: 0.3,  spotlightRadius: 1.0, performerOpacity: 1.0, introAudioPlaying: true,  hypeMeter: 85 },
  hype_peak:             { smokeOpacity: 0.15, spotlightRadius: 1.0, performerOpacity: 1.0, introAudioPlaying: true,  hypeMeter: 100},
  performance_start:     { smokeOpacity: 0.1,  spotlightRadius: 1.0, performerOpacity: 1.0, introAudioPlaying: false, hypeMeter: 100},
};

const sequences = new Map<string, RevealSequenceState>();
type RevealListener = (state: RevealSequenceState) => void;
const revealListeners = new Map<string, Set<RevealListener>>();

function defaultReveal(roomId: string): RevealSequenceState {
  return { roomId, beat: "waiting", performerId: null, performerName: null, smokeOpacity: 0, spotlightRadius: 0, performerOpacity: 0, introAudioPlaying: false, hypeMeter: 0, beatStartedAt: Date.now() };
}

function setBeat(roomId: string, beat: RevealBeat): RevealSequenceState {
  const current = sequences.get(roomId) ?? defaultReveal(roomId);
  const updated: RevealSequenceState = { ...current, ...BEAT_STATES[beat], beat, beatStartedAt: Date.now() };
  sequences.set(roomId, updated);
  revealListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function startRevealSequence(roomId: string, performer: { performerId: string; performerName: string }): RevealSequenceState {
  const initial = { ...defaultReveal(roomId), ...performer };
  sequences.set(roomId, initial);
  return setBeat(roomId, "smoke_rising");
}

export async function runFullRevealSequence(roomId: string, performer: { performerId: string; performerName: string }): Promise<void> {
  startRevealSequence(roomId, performer);
  for (const beat of BEAT_ORDER.slice(1)) {
    const duration = BEAT_DURATIONS[beat];
    if (duration > 0) await new Promise(r => setTimeout(r, duration));
    setBeat(roomId, beat);
  }
}

export function advanceRevealBeat(roomId: string): RevealSequenceState {
  const current = sequences.get(roomId) ?? defaultReveal(roomId);
  const idx = BEAT_ORDER.indexOf(current.beat);
  const next = BEAT_ORDER[Math.min(idx + 1, BEAT_ORDER.length - 1)];
  return setBeat(roomId, next);
}

export function getRevealState(roomId: string): RevealSequenceState {
  return sequences.get(roomId) ?? defaultReveal(roomId);
}

export function subscribeToReveal(roomId: string, listener: RevealListener): () => void {
  if (!revealListeners.has(roomId)) revealListeners.set(roomId, new Set());
  revealListeners.get(roomId)!.add(listener);
  const current = sequences.get(roomId);
  if (current) listener(current);
  return () => revealListeners.get(roomId)?.delete(listener);
}

export function isRevealComplete(roomId: string): boolean {
  return sequences.get(roomId)?.beat === "performance_start";
}
