/**
 * PerformerStageControlEngine
 * Real-time stage control surface for the active performer.
 * Manages camera selection, lighting scene, intro cinematic, and stage layout.
 */

import { worldStateEngine } from "@/lib/hub/WorldStateEngine";
import { Analytics } from '@/lib/analytics/PersonaAnalyticsEngine';

export type CameraAngle = "wide" | "center" | "close" | "profile" | "overhead" | "audience" | "pit";
export type LightingScene = "neutral" | "warm" | "cool" | "dramatic" | "blackout" | "strobe" | "rainbow" | "spotlight";
export type StageLayout = "solo" | "duo" | "band" | "battle_left" | "battle_right" | "cypher_center";

export interface StageControlState {
  roomId: string;
  performerId: string;
  activeCamera: CameraAngle;
  lightingScene: LightingScene;
  stageLayout: StageLayout;
  introQueuedAt: number | null;
  introDurationMs: number;
  micHot: boolean;
  monitorMix: number;        // 0-100
  crowdFeedbackEnabled: boolean;
  voiceFxActive: string | null;
  aiCoHostActive: boolean;
  meetGreetTimerMs: number | null;
  performanceQueueIndex: number;
  performanceQueueLength: number;
}

const stageStates = new Map<string, StageControlState>();
type StageControlListener = (state: StageControlState) => void;
const stageListeners = new Map<string, Set<StageControlListener>>();

function defaultStageControl(roomId: string, performerId: string): StageControlState {
  return {
    roomId, performerId,
    activeCamera: "center",
    lightingScene: "neutral",
    stageLayout: "solo",
    introQueuedAt: null,
    introDurationMs: 8_000,
    micHot: false,
    monitorMix: 70,
    crowdFeedbackEnabled: true,
    voiceFxActive: null,
    aiCoHostActive: false,
    meetGreetTimerMs: null,
    performanceQueueIndex: 0,
    performanceQueueLength: 1,
  };
}

function update(roomId: string, patch: Partial<StageControlState>): StageControlState {
  const current = stageStates.get(roomId)!;
  const updated = { ...current, ...patch };
  stageStates.set(roomId, updated);
  stageListeners.get(roomId)?.forEach(l => l(updated));
  return updated;
}

export function initStageControl(roomId: string, performerId: string): StageControlState {
  Analytics.livestreamEvent({ eventType: 'stage_init', streamId: roomId, userId: performerId, activePersona: 'performer' });
  const state = defaultStageControl(roomId, performerId);
  stageStates.set(roomId, state);
  return state;
}

export function switchCamera(roomId: string, camera: CameraAngle): StageControlState {
  Analytics.livestreamEvent({ eventType: `camera_switch_${camera}`, streamId: roomId, activePersona: 'performer' });
  const s = update(roomId, { activeCamera: camera });
  worldStateEngine.emit({ type: "stage_state_changed", roomId, payload: { camera } });
  return s;
}

export function setLightingScene(roomId: string, scene: LightingScene): StageControlState {
  return update(roomId, { lightingScene: scene });
}

export function setStageLayout(roomId: string, layout: StageLayout): StageControlState {
  return update(roomId, { stageLayout: layout });
}

export function queueIntro(roomId: string): StageControlState {
  return update(roomId, { introQueuedAt: Date.now() });
}

export function setMicHot(roomId: string, hot: boolean): StageControlState {
  Analytics.livestreamEvent({ eventType: hot ? 'mic_hot' : 'mic_off', streamId: roomId, activePersona: 'performer' });
  return update(roomId, { micHot: hot });
}

export function setMonitorMix(roomId: string, level: number): StageControlState {
  return update(roomId, { monitorMix: Math.max(0, Math.min(100, level)) });
}

export function setVoiceFx(roomId: string, fx: string | null): StageControlState {
  return update(roomId, { voiceFxActive: fx });
}

export function toggleAICoHost(roomId: string, active: boolean): StageControlState {
  return update(roomId, { aiCoHostActive: active });
}

export function startMeetGreetTimer(roomId: string, durationMs: number): StageControlState {
  return update(roomId, { meetGreetTimerMs: durationMs });
}

export function tickMeetGreetTimer(roomId: string, elapsedMs: number): StageControlState {
  const current = stageStates.get(roomId);
  if (!current?.meetGreetTimerMs) return current ?? defaultStageControl(roomId, "");
  const remaining = Math.max(0, current.meetGreetTimerMs - elapsedMs);
  return update(roomId, { meetGreetTimerMs: remaining === 0 ? null : remaining });
}

export function advancePerformanceQueue(roomId: string): StageControlState {
  const current = stageStates.get(roomId);
  if (!current) return defaultStageControl(roomId, "");
  const next = Math.min(current.performanceQueueIndex + 1, current.performanceQueueLength - 1);
  return update(roomId, { performanceQueueIndex: next });
}

export function getStageControlState(roomId: string): StageControlState | null {
  return stageStates.get(roomId) ?? null;
}

export function subscribeToStageControl(roomId: string, listener: StageControlListener): () => void {
  if (!stageListeners.has(roomId)) stageListeners.set(roomId, new Set());
  stageListeners.get(roomId)!.add(listener);
  const current = stageStates.get(roomId);
  if (current) listener(current);
  return () => stageListeners.get(roomId)?.delete(listener);
}
