/**
 * StreamHealthEngine
 * Real-time stream health monitoring for the performer's broadcast.
 * Tracks bitrate, latency, dropped frames, CPU/GPU load, and viewer count.
 */

export type StreamQuality = "excellent" | "good" | "degraded" | "poor" | "offline";

export interface StreamHealthSnapshot {
  timestamp: number;
  bitrateKbps: number;
  latencyMs: number;
  droppedFramesPct: number;   // 0-100
  cpuUsagePct: number;
  gpuUsagePct: number;
  viewerCount: number;
  peakViewerCount: number;
  encoderFps: number;
  quality: StreamQuality;
}

export interface StreamHealthState {
  roomId: string;
  performerId: string;
  current: StreamHealthSnapshot;
  history: StreamHealthSnapshot[];   // last 20 snapshots
  alertActive: boolean;
  alertReason: string | null;
  totalStreamMinutes: number;
  streamStartedAt: number | null;
  isLive: boolean;
}

const MAX_HISTORY = 20;

const streamStates = new Map<string, StreamHealthState>();
type StreamHealthListener = (state: StreamHealthState) => void;
const streamListeners = new Map<string, Set<StreamHealthListener>>();

function computeQuality(snap: Omit<StreamHealthSnapshot, "quality">): StreamQuality {
  if (snap.bitrateKbps < 100 || snap.latencyMs > 8000) return "offline";
  if (snap.droppedFramesPct > 20 || snap.bitrateKbps < 500) return "poor";
  if (snap.droppedFramesPct > 5 || snap.latencyMs > 3000) return "degraded";
  if (snap.droppedFramesPct > 1 || snap.latencyMs > 1500) return "good";
  return "excellent";
}

function computeAlert(snap: StreamHealthSnapshot): { active: boolean; reason: string | null } {
  if (snap.quality === "offline") return { active: true, reason: "Stream offline" };
  if (snap.quality === "poor") return { active: true, reason: "Very low quality — check encoder settings" };
  if (snap.droppedFramesPct > 10) return { active: true, reason: `High frame drop: ${snap.droppedFramesPct.toFixed(1)}%` };
  if (snap.latencyMs > 5000) return { active: true, reason: `High latency: ${snap.latencyMs}ms` };
  if (snap.cpuUsagePct > 90) return { active: true, reason: `CPU overloaded: ${snap.cpuUsagePct}%` };
  return { active: false, reason: null };
}

function defaultSnapshot(): Omit<StreamHealthSnapshot, "quality"> {
  return { timestamp: Date.now(), bitrateKbps: 0, latencyMs: 0, droppedFramesPct: 0, cpuUsagePct: 0, gpuUsagePct: 0, viewerCount: 0, peakViewerCount: 0, encoderFps: 0 };
}

export function initStreamHealth(roomId: string, performerId: string): StreamHealthState {
  const rawSnap = defaultSnapshot();
  const quality = computeQuality(rawSnap);
  const current: StreamHealthSnapshot = { ...rawSnap, quality };
  const state: StreamHealthState = {
    roomId, performerId, current, history: [], alertActive: false,
    alertReason: null, totalStreamMinutes: 0, streamStartedAt: null, isLive: false,
  };
  streamStates.set(roomId, state);
  return state;
}

export function startStream(roomId: string): StreamHealthState {
  const current = streamStates.get(roomId);
  if (!current) return initStreamHealth(roomId, "");
  const updated = { ...current, isLive: true, streamStartedAt: Date.now() };
  streamStates.set(roomId, updated);
  streamListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function ingestSnapshot(roomId: string, raw: Omit<StreamHealthSnapshot, "quality" | "timestamp">): StreamHealthState {
  const current = streamStates.get(roomId);
  if (!current) return initStreamHealth(roomId, "");

  const quality = computeQuality({ ...raw, timestamp: Date.now() });
  const snap: StreamHealthSnapshot = { ...raw, quality, timestamp: Date.now(), peakViewerCount: Math.max(raw.viewerCount, current.current.peakViewerCount) };
  const alert = computeAlert(snap);

  const history = [current.current, ...current.history].slice(0, MAX_HISTORY);
  const totalStreamMinutes = current.streamStartedAt
    ? Math.floor((Date.now() - current.streamStartedAt) / 60_000)
    : current.totalStreamMinutes;

  const updated: StreamHealthState = {
    ...current, current: snap, history, totalStreamMinutes,
    alertActive: alert.active, alertReason: alert.reason,
  };
  streamStates.set(roomId, updated);
  streamListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function stopStream(roomId: string): StreamHealthState {
  const current = streamStates.get(roomId);
  if (!current) return initStreamHealth(roomId, "");
  const updated = { ...current, isLive: false, streamStartedAt: null };
  streamStates.set(roomId, updated);
  streamListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function getStreamHealth(roomId: string): StreamHealthState | null {
  return streamStates.get(roomId) ?? null;
}

export function subscribeToStreamHealth(roomId: string, listener: StreamHealthListener): () => void {
  if (!streamListeners.has(roomId)) streamListeners.set(roomId, new Set());
  streamListeners.get(roomId)!.add(listener);
  const current = streamStates.get(roomId);
  if (current) listener(current);
  return () => streamListeners.get(roomId)?.delete(listener);
}
