import { HOST_REGISTRY } from "./hostRegistry";
import { CO_HOST_REGISTRY } from "./coHostRegistry";
import { NPC_AVATAR_REGISTRY } from "./npcAvatarRegistry";
import { fireHostCue } from "./hostCueEngine";

export type RuntimeEntity = (typeof HOST_REGISTRY)[number] | (typeof CO_HOST_REGISTRY)[number] | (typeof NPC_AVATAR_REGISTRY)[number];

const runtimeLog: Array<{ id: string; entityId: string; action: string; detail: string; timestamp: number }> = [];
let runtimeCounter = 1;

function logRuntime(entityId: string, action: string, detail: string) {
  const entry = {
    id: `HRUN-${String(runtimeCounter++).padStart(6, "0")}`,
    entityId,
    action,
    detail,
    timestamp: Date.now(),
  };
  runtimeLog.push(entry);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:host-runtime", { detail: entry }));
  }
  return entry;
}

function getEntityById(id: string): RuntimeEntity | undefined {
  return [...HOST_REGISTRY, ...CO_HOST_REGISTRY, ...NPC_AVATAR_REGISTRY].find((e) => e.id === id);
}

export function setHostTask(entityId: string, task: string): boolean {
  const entity = getEntityById(entityId);
  if (!entity) return false;
  entity.currentTask = task;
  entity.animationState = "cue";
  logRuntime(entityId, "set-task", task);
  return true;
}

export function moveHostToRoute(entityId: string, route: string, location: string): boolean {
  const entity = getEntityById(entityId);
  if (!entity) return false;

  const blocked = entity.blockedRooms.some((room) => route.includes(room) || location.includes(room));
  if (blocked) {
    logRuntime(entityId, "blocked-route", `${route} @ ${location}`);
    return false;
  }

  entity.currentRoute = route;
  entity.currentLocation = location;
  entity.animationState = "transition";
  logRuntime(entityId, "move", `${route} @ ${location}`);
  return true;
}

export function triggerHostCue(entityId: string, cue: string): boolean {
  const entity = getEntityById(entityId);
  if (!entity) return false;
  entity.cueScript = cue;
  entity.voiceState = "speaking";
  entity.animationState = "speaking";
  fireHostCue(entityId, cue);
  logRuntime(entityId, "cue", cue);
  return true;
}

export function endHostCue(entityId: string): boolean {
  const entity = getEntityById(entityId);
  if (!entity) return false;
  entity.voiceState = "ready";
  entity.animationState = "idle";
  logRuntime(entityId, "cue-end", "return to idle");
  return true;
}

export function getHostRuntimeLog() {
  return [...runtimeLog];
}
