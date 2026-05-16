/**
 * CrowdIntensityAnalyzer
 * Synthesizes crowd energy signals into a unified intensity score and heatmap.
 * Reads tips, reactions, chat velocity, viewer count, and encore pressure.
 */

export type IntensityZone = "cold" | "warm" | "hot" | "explosive";

export interface CrowdSignal {
  type: "tip" | "reaction" | "chat" | "cheer" | "vote" | "share";
  weight: number;
  receivedAt: number;
}

export interface CrowdHeatmapCell {
  zone: string;
  intensity: number;   // 0-100
}

export interface CrowdIntensityState {
  roomId: string;
  intensityScore: number;         // 0-100
  zone: IntensityZone;
  signalBuffer: CrowdSignal[];    // rolling 30s window
  chatVelocity: number;           // messages per minute
  reactionRate: number;           // reactions per minute
  viewerTrend: "rising" | "stable" | "falling";
  heatmap: CrowdHeatmapCell[];
  encorePressure: number;         // 0-100 — appetite for encore
  peakIntensity: number;
  peakAt: number | null;
  windowStartMs: number;
}

const SIGNAL_WEIGHTS: Record<CrowdSignal["type"], number> = {
  tip: 10, cheer: 5, vote: 4, reaction: 3, chat: 1, share: 6,
};

const WINDOW_MS = 30_000;
const MAX_BUFFER = 500;

const crowdStates = new Map<string, CrowdIntensityState>();
type CrowdListener = (state: CrowdIntensityState) => void;
const crowdListeners = new Map<string, Set<CrowdListener>>();

function zoneFromScore(score: number): IntensityZone {
  if (score >= 80) return "explosive";
  if (score >= 55) return "hot";
  if (score >= 30) return "warm";
  return "cold";
}

function computeIntensity(signals: CrowdSignal[], windowMs: number): number {
  const now = Date.now();
  const recent = signals.filter(s => now - s.receivedAt < windowMs);
  const raw = recent.reduce((sum, s) => sum + s.weight, 0);
  return Math.min(100, Math.round(raw * 2));
}

function defaultHeatmap(): CrowdHeatmapCell[] {
  return ["front_left", "front_center", "front_right", "mid_left", "mid_center", "mid_right", "back"].map(zone => ({ zone, intensity: 0 }));
}

export function initCrowdIntensity(roomId: string): CrowdIntensityState {
  const state: CrowdIntensityState = {
    roomId, intensityScore: 0, zone: "cold", signalBuffer: [],
    chatVelocity: 0, reactionRate: 0, viewerTrend: "stable",
    heatmap: defaultHeatmap(), encorePressure: 0,
    peakIntensity: 0, peakAt: null, windowStartMs: Date.now(),
  };
  crowdStates.set(roomId, state);
  return state;
}

export function ingestSignal(roomId: string, type: CrowdSignal["type"]): CrowdIntensityState {
  const current = crowdStates.get(roomId) ?? initCrowdIntensity(roomId);
  const signal: CrowdSignal = { type, weight: SIGNAL_WEIGHTS[type], receivedAt: Date.now() };
  const now = Date.now();

  const signalBuffer = [...current.signalBuffer, signal]
    .filter(s => now - s.receivedAt < WINDOW_MS)
    .slice(-MAX_BUFFER);

  const intensityScore = computeIntensity(signalBuffer, WINDOW_MS);
  const zone = zoneFromScore(intensityScore);

  const chatSignals = signalBuffer.filter(s => s.type === "chat");
  const reactionSignals = signalBuffer.filter(s => s.type === "reaction");
  const chatVelocity = Math.round((chatSignals.length / WINDOW_MS) * 60_000);
  const reactionRate = Math.round((reactionSignals.length / WINDOW_MS) * 60_000);

  const peakIntensity = Math.max(current.peakIntensity, intensityScore);
  const peakAt = peakIntensity > current.peakIntensity ? now : current.peakAt;

  const encoreSignals = signalBuffer.filter(s => s.type === "cheer" || s.type === "vote");
  const encorePressure = Math.min(100, encoreSignals.length * 5);

  const updated: CrowdIntensityState = {
    ...current, signalBuffer, intensityScore, zone, chatVelocity, reactionRate,
    peakIntensity, peakAt, encorePressure,
  };
  crowdStates.set(roomId, updated);
  crowdListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function setViewerTrend(roomId: string, trend: CrowdIntensityState["viewerTrend"]): CrowdIntensityState {
  const current = crowdStates.get(roomId) ?? initCrowdIntensity(roomId);
  const updated = { ...current, viewerTrend: trend };
  crowdStates.set(roomId, updated);
  crowdListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function updateHeatmapZone(roomId: string, zone: string, intensity: number): CrowdIntensityState {
  const current = crowdStates.get(roomId) ?? initCrowdIntensity(roomId);
  const heatmap = current.heatmap.map(cell =>
    cell.zone === zone ? { ...cell, intensity: Math.max(0, Math.min(100, intensity)) } : cell
  );
  const updated = { ...current, heatmap };
  crowdStates.set(roomId, updated);
  crowdListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function getCrowdIntensity(roomId: string): CrowdIntensityState | null {
  return crowdStates.get(roomId) ?? null;
}

export function subscribeToCrowdIntensity(roomId: string, listener: CrowdListener): () => void {
  if (!crowdListeners.has(roomId)) crowdListeners.set(roomId, new Set());
  crowdListeners.get(roomId)!.add(listener);
  const current = crowdStates.get(roomId);
  if (current) listener(current);
  return () => crowdListeners.get(roomId)?.delete(listener);
}
