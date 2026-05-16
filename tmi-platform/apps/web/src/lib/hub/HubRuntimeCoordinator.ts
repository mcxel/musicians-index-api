/**
 * HubRuntimeCoordinator
 * Master boot and coordination point for all TMI hub subsystems.
 * Call initHubRuntime() once at the app boundary. Everything else reads from here.
 */

import { worldStateEngine, type WorldSnapshot } from "@/lib/hub/WorldStateEngine";
import { getWorldPulse, type PresencePulse } from "@/lib/hub/GlobalPresenceBus";
import { setHubContext, type HubContext, type HUDLayout } from "@/lib/hub/UniversalHUDOrchestrator";
import { getExperience, type ExperienceState } from "@/lib/hub/LiveExperienceCoordinator";

export type RuntimeStatus = "uninitialized" | "booting" | "ready" | "degraded" | "offline";

export interface HubRuntimeState {
  status: RuntimeStatus;
  bootedAt: number | null;
  activeHubContext: HubContext;
  worldSnapshot: WorldSnapshot;
  presencePulse: PresencePulse;
  activeRoomId: string | null;
  experienceState: ExperienceState | null;
  hudLayout: HUDLayout;
}

export interface HubRuntimeConfig {
  defaultContext?: HubContext;
  enableWorldSync?: boolean;
  enablePresenceSync?: boolean;
}

let runtimeStatus: RuntimeStatus = "uninitialized";
let bootedAt: number | null = null;
let activeHubContext: HubContext = "fan-home";
let activeRoomId: string | null = null;
const statusListeners = new Set<(state: HubRuntimeState) => void>();

function buildState(): HubRuntimeState {
  return {
    status: runtimeStatus,
    bootedAt,
    activeHubContext,
    worldSnapshot: worldStateEngine.getSnapshot(),
    presencePulse: getWorldPulse(),
    activeRoomId,
    experienceState: activeRoomId ? getExperience(activeRoomId) : null,
    hudLayout: { context: activeHubContext, modules: [], timestamp: Date.now() },
  };
}

function notify(): void {
  const state = buildState();
  statusListeners.forEach(l => l(state));
}

export function initHubRuntime(config: HubRuntimeConfig = {}): HubRuntimeState {
  if (runtimeStatus === "ready") return buildState();

  runtimeStatus = "booting";
  bootedAt = null;
  notify();

  // Set initial hub context
  activeHubContext = config.defaultContext ?? "fan-home";
  setHubContext(activeHubContext);

  // Subscribe world state for change propagation
  if (config.enableWorldSync !== false) {
    worldStateEngine.subscribe(() => notify());
  }

  runtimeStatus = "ready";
  bootedAt = Date.now();
  notify();

  return buildState();
}

export function setActiveRoom(roomId: string | null): void {
  activeRoomId = roomId;
  notify();
}

export function switchHubContext(context: HubContext): void {
  activeHubContext = context;
  setHubContext(context);
  notify();
}

export function getHubRuntimeState(): HubRuntimeState {
  return buildState();
}

export function subscribeToRuntime(listener: (state: HubRuntimeState) => void): () => void {
  statusListeners.add(listener);
  listener(buildState());
  return () => statusListeners.delete(listener);
}

export function isRuntimeReady(): boolean {
  return runtimeStatus === "ready";
}

export function markDegraded(reason: string): void {
  runtimeStatus = "degraded";
  worldStateEngine.emit({ type: "hub_deactivated", payload: { reason } });
  notify();
}

export function getRuntimeStatus(): RuntimeStatus {
  return runtimeStatus;
}
