/**
 * CrowdReactionEngine
 * Models aggregate crowd emotional state and drives personality responses.
 * Feeds into host behavior selection and Julius energy system.
 */

export type CrowdMood = "dead" | "warming" | "engaged" | "hyped" | "frenzy" | "riot";
export type CrowdSignal =
  | "tip"
  | "cheer"
  | "vote"
  | "emoji-storm"
  | "share"
  | "chat-surge"
  | "silence"
  | "seat-drop"
  | "join"
  | "leave";

export interface CrowdSignalEvent {
  signal: CrowdSignal;
  roomId: string;
  magnitude: number;   // 0-1
  timestamp: number;
}

export interface CrowdSnapshot {
  roomId: string;
  mood: CrowdMood;
  energyScore: number;        // 0-100
  peakScore: number;
  activeSignals: CrowdSignal[];
  signalCountLastMinute: number;
  lastUpdatedAt: number;
}

type CrowdListener = (snapshot: CrowdSnapshot) => void;

const SIGNAL_WEIGHTS: Record<CrowdSignal, number> = {
  "tip":          15,
  "cheer":        8,
  "vote":         6,
  "emoji-storm":  10,
  "share":        12,
  "chat-surge":   5,
  "join":         4,
  "silence":      -8,
  "seat-drop":    -5,
  "leave":        -6,
};

const MOOD_THRESHOLDS: Array<[CrowdMood, number]> = [
  ["riot",    90],
  ["frenzy",  75],
  ["hyped",   55],
  ["engaged", 35],
  ["warming", 15],
  ["dead",    0],
];

const DECAY_RATE = 0.97;     // per 2s tick
const WINDOW_MS = 60_000;

const roomSnapshots = new Map<string, CrowdSnapshot>();
const signalHistory = new Map<string, CrowdSignalEvent[]>();
const roomListeners = new Map<string, Set<CrowdListener>>();
const tickIntervals = new Map<string, ReturnType<typeof setInterval>>();

function deriveMood(score: number): CrowdMood {
  for (const [mood, threshold] of MOOD_THRESHOLDS) {
    if (score >= threshold) return mood;
  }
  return "dead";
}

function notify(roomId: string, snapshot: CrowdSnapshot): void {
  roomListeners.get(roomId)?.forEach(l => l(snapshot));
}

function tick(roomId: string): void {
  const snapshot = roomSnapshots.get(roomId);
  if (!snapshot) return;

  const now = Date.now();
  const history = (signalHistory.get(roomId) ?? []).filter(e => now - e.timestamp < WINDOW_MS);
  signalHistory.set(roomId, history);

  const decayed = Math.max(0, snapshot.energyScore * DECAY_RATE);
  const mood = deriveMood(decayed);
  const updated: CrowdSnapshot = {
    ...snapshot,
    energyScore: decayed,
    mood,
    signalCountLastMinute: history.length,
    activeSignals: [...new Set(history.map(e => e.signal))],
    lastUpdatedAt: now,
  };
  roomSnapshots.set(roomId, updated);
  notify(roomId, updated);
}

export function initCrowdRoom(roomId: string): CrowdSnapshot {
  const snapshot: CrowdSnapshot = {
    roomId, mood: "dead", energyScore: 0, peakScore: 0,
    activeSignals: [], signalCountLastMinute: 0, lastUpdatedAt: Date.now(),
  };
  roomSnapshots.set(roomId, snapshot);
  signalHistory.set(roomId, []);

  if (!tickIntervals.has(roomId)) {
    const interval = setInterval(() => tick(roomId), 2000);
    tickIntervals.set(roomId, interval);
  }

  return snapshot;
}

export function ingestSignal(roomId: string, signal: CrowdSignal, magnitude = 1): CrowdSnapshot {
  if (!roomSnapshots.has(roomId)) initCrowdRoom(roomId);

  const event: CrowdSignalEvent = { signal, roomId, magnitude, timestamp: Date.now() };
  const history = signalHistory.get(roomId) ?? [];
  signalHistory.set(roomId, [...history, event]);

  const snapshot = roomSnapshots.get(roomId)!;
  const delta = SIGNAL_WEIGHTS[signal] * magnitude;
  const newScore = Math.max(0, Math.min(100, snapshot.energyScore + delta));
  const peakScore = Math.max(snapshot.peakScore, newScore);
  const mood = deriveMood(newScore);

  const now = Date.now();
  const windowHistory = [...history, event].filter(e => now - e.timestamp < WINDOW_MS);
  const updated: CrowdSnapshot = {
    ...snapshot,
    energyScore: newScore,
    peakScore,
    mood,
    activeSignals: [...new Set(windowHistory.map(e => e.signal))],
    signalCountLastMinute: windowHistory.length,
    lastUpdatedAt: now,
  };
  roomSnapshots.set(roomId, updated);
  notify(roomId, updated);
  return updated;
}

export function getCrowdSnapshot(roomId: string): CrowdSnapshot | null {
  return roomSnapshots.get(roomId) ?? null;
}

export function subscribeToCrowdRoom(roomId: string, listener: CrowdListener): () => void {
  if (!roomListeners.has(roomId)) roomListeners.set(roomId, new Set());
  roomListeners.get(roomId)!.add(listener);
  const current = roomSnapshots.get(roomId);
  if (current) listener(current);
  return () => roomListeners.get(roomId)?.delete(listener);
}

export function destroyCrowdRoom(roomId: string): void {
  const interval = tickIntervals.get(roomId);
  if (interval) { clearInterval(interval); tickIntervals.delete(roomId); }
  roomSnapshots.delete(roomId);
  signalHistory.delete(roomId);
  roomListeners.delete(roomId);
}

export function getAllCrowdSnapshots(): CrowdSnapshot[] {
  return [...roomSnapshots.values()];
}
