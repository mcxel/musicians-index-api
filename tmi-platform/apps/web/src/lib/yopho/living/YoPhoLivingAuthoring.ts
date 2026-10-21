/**
 * YoPhoLivingAuthoring — production command path for living cards.
 * Quick Card / Drawer / Studio / Golden QA all call these same functions.
 */

import {
  createEmptyLayer,
  defaultTransform,
  reconcileTimingForDuration,
  sortLayersBackToFront,
  supportedActionsForLayer,
  trackForAction,
  type YoPhoActionKind,
  type YoPhoCue,
  type YoPhoLivingLayer,
  type YoPhoLivingLayerFamily,
  type YoPhoLivingProject,
  type YoPhoLivingRegion,
  type YoPhoMarkerKind,
  type YoPhoMotionPresetId,
  type YoPhoTimedAction,
  type YoPhoTimelineEvent,
} from "./YoPhoLivingProject";
import { saveYoPhoLivingProject } from "./YoPhoLivingProjectStore";

function touch(project: YoPhoLivingProject): YoPhoLivingProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function addLayer(
  project: YoPhoLivingProject,
  family: YoPhoLivingLayerFamily,
  label?: string,
): YoPhoLivingProject {
  const order = project.layers.length;
  const layer = createEmptyLayer(family, order, project.durationSec, label);
  return saveYoPhoLivingProject(
    touch({ ...project, layers: [...project.layers, layer] }),
  );
}

export function updateLayer(
  project: YoPhoLivingProject,
  layerId: string,
  patch: Partial<YoPhoLivingLayer>,
): YoPhoLivingProject {
  return saveYoPhoLivingProject(
    touch({
      ...project,
      layers: project.layers.map((l) => (l.layerId === layerId ? { ...l, ...patch } : l)),
    }),
  );
}

export function setLayerMotion(
  project: YoPhoLivingProject,
  layerId: string,
  preset: YoPhoMotionPresetId,
  opts?: { amplitude?: number; speed?: number },
): YoPhoLivingProject {
  return updateLayer(project, layerId, {
    motion: { preset, amplitude: opts?.amplitude ?? 0.02, speed: opts?.speed ?? 1 },
  });
}

export function setLayerPath(
  project: YoPhoLivingProject,
  layerId: string,
  path: Array<{ t: number; x: number; y: number; z: number; roll?: number }>,
): YoPhoLivingProject {
  const layer = project.layers.find((l) => l.layerId === layerId);
  if (!layer) return project;
  return updateLayer(project, layerId, {
    motion: { ...layer.motion, preset: "FLY_BY", path },
  });
}

export function reorderLayer(
  project: YoPhoLivingProject,
  layerId: string,
  direction: "FORWARD" | "BACKWARD" | "FRONT" | "BACK",
): YoPhoLivingProject {
  const sorted = sortLayersBackToFront(project.layers);
  const idx = sorted.findIndex((l) => l.layerId === layerId);
  if (idx < 0) return project;
  const next = [...sorted];
  const [item] = next.splice(idx, 1);
  if (!item) return project;
  if (direction === "FORWARD") next.splice(Math.min(idx + 1, next.length), 0, item);
  else if (direction === "BACKWARD") next.splice(Math.max(idx - 1, 0), 0, item);
  else if (direction === "FRONT") next.push(item);
  else next.unshift(item);
  const layers = next.map((l, order) => ({ ...l, order, depth: order }));
  return saveYoPhoLivingProject(touch({ ...project, layers }));
}

export function setLivingRegion(
  project: YoPhoLivingProject,
  layerId: string,
  region: YoPhoLivingRegion,
): YoPhoLivingProject {
  return updateLayer(project, layerId, { livingRegion: region, family: "MEDIA_SURFACE" });
}

export function setMasterDuration(
  project: YoPhoLivingProject,
  durationSec: number,
): YoPhoLivingProject {
  return saveYoPhoLivingProject(reconcileTimingForDuration(project, durationSec));
}

export function setLoopPlayback(
  project: YoPhoLivingProject,
  loopPlayback: boolean,
): YoPhoLivingProject {
  return saveYoPhoLivingProject(touch({ ...project, loopPlayback }));
}

export type YoPhoEditScope = "WHOLE" | "AT_TIME";

function quantizeSec(value: number, max: number): number {
  const tenths = Math.round(value * 10) / 10;
  return Math.min(max, Math.max(0, tenths));
}

/**
 * WHOLE moves the layer for the entire card.
 * AT_TIME writes a keyframe at the playhead and leaves other times alone.
 */
export function applyLayerPosition(
  project: YoPhoLivingProject,
  layerId: string,
  scope: YoPhoEditScope,
  atSec: number,
  position: { x: number; y: number },
): YoPhoLivingProject {
  const layer = project.layers.find((l) => l.layerId === layerId);
  if (!layer) return project;
  if (scope === "WHOLE") {
    const dx = position.x - layer.transform.position.x;
    const dy = position.y - layer.transform.position.y;
    const path = layer.motion.path?.map((point) => ({
      ...point,
      x: point.x + dx,
      y: point.y + dy,
    }));
    return updateLayer(project, layerId, {
      transform: {
        ...layer.transform,
        position: { ...layer.transform.position, x: position.x, y: position.y },
      },
      motion: path ? { ...layer.motion, path } : layer.motion,
    });
  }
  const t = quantizeSec(atSec, project.durationSec);
  const existing = layer.motion.path
    ? [...layer.motion.path]
    : [{
        t: 0,
        x: layer.transform.position.x,
        y: layer.transform.position.y,
        z: layer.transform.position.z,
      }];
  const point = { t, x: position.x, y: position.y, z: layer.transform.position.z };
  const idx = existing.findIndex((p) => Math.abs(p.t - t) < 0.05);
  if (idx >= 0) existing[idx] = { ...existing[idx]!, ...point };
  else existing.push(point);
  existing.sort((a, b) => a.t - b.t);
  return updateLayer(project, layerId, {
    motion: { ...layer.motion, path: existing },
  });
}

export interface TimedActionRequest {
  kind: YoPhoActionKind;
  startSec: number;
  endSec: number;
  targetLayerId?: string | null;
  delaySec?: number;
  speed?: number;
  repeat?: number;
  easing?: YoPhoTimedAction["easing"];
  parameters?: Record<string, string | number | boolean>;
  snap?: boolean;
}

export interface TimedActionResult {
  project: YoPhoLivingProject;
  accepted: boolean;
  reason?: "AUDIO_UNAVAILABLE" | "ACTION_UNSUPPORTED" | "MISSING_START" | "BAD_WINDOW";
  actionId?: string;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function isActionActive(action: YoPhoTimedAction, t: number): boolean {
  if (!action.enabled) return false;
  const start = action.startSec + action.delaySec;
  return t >= start && t < action.endSec;
}

export function addMarker(
  project: YoPhoLivingProject,
  kind: YoPhoMarkerKind,
  atSec: number,
  label?: string,
): YoPhoLivingProject {
  const marker = {
    markerId: newId("mk"),
    kind,
    label: label ?? kind,
    atSec: quantizeSec(atSec, project.durationSec),
  };
  return saveYoPhoLivingProject(touch({
    ...project,
    markers: [...(project.markers ?? []), marker],
  }));
}

function snapStart(project: YoPhoLivingProject, startSec: number, snap: boolean): number {
  const start = quantizeSec(startSec, project.durationSec);
  if (!snap) return start;
  const near = (project.markers ?? []).find((marker) => Math.abs(marker.atSec - start) <= 0.3);
  return near ? near.atSec : start;
}

function ensureLayer(
  project: YoPhoLivingProject,
  family: YoPhoLivingLayerFamily,
  label: string,
  preferredId?: string | null,
): { project: YoPhoLivingProject; layerId: string } {
  const preferred = preferredId ? project.layers.find((layer) => layer.layerId === preferredId) : null;
  if (preferred && preferred.family === family) return { project, layerId: preferred.layerId };
  const labeled = project.layers.find((layer) => layer.family === family && layer.label === label);
  if (labeled) return { project, layerId: labeled.layerId };
  const next = addLayer(project, family, label);
  const created = next.layers[next.layers.length - 1]!;
  return { project: next, layerId: created.layerId };
}

export function addTimedAction(
  project: YoPhoLivingProject,
  request: TimedActionRequest,
): TimedActionResult {
  if (!Number.isFinite(request.startSec)) {
    return { project, accepted: false, reason: "MISSING_START" };
  }
  const startSec = snapStart(project, request.startSec, request.snap !== false);
  const endSec = quantizeSec(request.endSec, project.durationSec);
  if (endSec <= startSec) return { project, accepted: false, reason: "BAD_WINDOW" };
  const target = request.targetLayerId
    ? project.layers.find((layer) => layer.layerId === request.targetLayerId) ?? null
    : null;
  if (request.kind === "LAYER_MOTION" && (!target || !supportedActionsForLayer(target).includes("LAYER_MOTION"))) {
    return { project, accepted: false, reason: "ACTION_UNSUPPORTED" };
  }
  if (request.kind === "REVEAL" && target && !supportedActionsForLayer(target).includes("REVEAL")) {
    return { project, accepted: false, reason: "ACTION_UNSUPPORTED" };
  }

  let next = project;
  let targetLayerId: string | null = target?.layerId ?? null;
  if (request.kind === "RAIN") {
    const rain = ensureLayer(next, "EFFECT", "Rain", targetLayerId);
    next = updateLayer(rain.project, rain.layerId, {
      procedural: "RAIN",
      color: "#9fd7ff",
      timing: { inSec: startSec, outSec: endSec, loop: false, hold: null },
    });
    targetLayerId = rain.layerId;
  } else if (request.kind === "TITLE_ENTER" || request.kind === "BRANDING") {
    const text = ensureLayer(next, "TEXT", request.kind === "BRANDING" ? "Brand" : "Title", targetLayerId);
    next = updateLayer(text.project, text.layerId, {
      color: request.kind === "BRANDING" ? "#FFD700" : "#FFFFFF",
      timing: { inSec: startSec, outSec: endSec, loop: false, hold: null },
      motion: { preset: "POP", amplitude: 0.04, speed: request.speed ?? 1 },
    });
    targetLayerId = text.layerId;
  } else if (request.kind === "REVEAL") {
    const subject = ensureLayer(next, "SUBJECT", "Subject", targetLayerId);
    next = updateLayer(subject.project, subject.layerId, {
      timing: { inSec: startSec, outSec: endSec, loop: false, hold: null },
    });
    targetLayerId = subject.layerId;
  } else if (request.kind === "LIGHTING") {
    const light = ensureLayer(next, "LIGHT", "Light", targetLayerId);
    next = updateLayer(light.project, light.layerId, {
      procedural: "GLOW",
      color: "#ffd7a0",
      timing: { inSec: startSec, outSec: endSec, loop: false, hold: null },
    });
    targetLayerId = light.layerId;
  } else if (request.kind === "LAYER_MOTION" && targetLayerId) {
    next = updateLayer(next, targetLayerId, {
      timing: { inSec: startSec, outSec: endSec, loop: false, hold: null },
      motion: { preset: "SLIDE", amplitude: 0.08, speed: request.speed ?? 1 },
    });
  }

  const action: YoPhoTimedAction = {
    actionId: newId("act"),
    track: trackForAction(request.kind),
    kind: request.kind,
    targetLayerId,
    startSec,
    endSec,
    delaySec: request.delaySec ?? 0,
    speed: request.speed ?? 1,
    repeat: request.repeat ?? 1,
    easing: request.easing ?? "LINEAR",
    enabled: true,
    cueId: null,
    parameters: request.parameters ?? {},
  };
  const event: YoPhoTimelineEvent = {
    eventId: newId("ev"),
    atSec: startSec,
    type: "CUSTOM",
    layerIds: targetLayerId ? [targetLayerId] : [],
    payload: { kind: request.kind, endSec },
  };
  next = saveYoPhoLivingProject(touch({
    ...next,
    actions: [...(next.actions ?? []), action],
    events: [...next.events, event],
  }));
  return { project: next, accepted: true, actionId: action.actionId };
}

export function retimeAction(
  project: YoPhoLivingProject,
  actionId: string,
  startSec: number,
  endSec: number,
): YoPhoLivingProject {
  const start = quantizeSec(startSec, project.durationSec);
  const end = quantizeSec(endSec, project.durationSec);
  if (end <= start) return project;
  const actions = (project.actions ?? []).map((action) =>
    action.actionId === actionId ? { ...action, startSec: start, endSec: end } : action,
  );
  const moved = actions.find((action) => action.actionId === actionId);
  let next: YoPhoLivingProject = { ...project, actions };
  if (moved?.targetLayerId) {
    const layer = next.layers.find((item) => item.layerId === moved.targetLayerId);
    if (layer) {
      next = {
        ...next,
        layers: next.layers.map((item) =>
          item.layerId === layer.layerId
            ? { ...item, timing: { ...item.timing, inSec: start, outSec: end } }
            : item,
        ),
      };
    }
  }
  return saveYoPhoLivingProject(touch(next));
}

export function addGroupedCue(
  project: YoPhoLivingProject,
  label: string,
  atSec: number,
  members: TimedActionRequest[],
): { project: YoPhoLivingProject; cueId: string } {
  let next = project;
  const cueId = newId("cue");
  const stored: YoPhoCue["members"] = [];
  for (const member of members) {
    const relative = member.startSec;
    const result = addTimedAction(next, {
      ...member,
      startSec: atSec + relative,
      endSec: atSec + (member.endSec - member.startSec) + relative,
      snap: false,
    });
    next = result.project;
    if (result.accepted && result.actionId) stored.push({ actionId: result.actionId, offsetSec: relative });
  }
  const cue: YoPhoCue = { cueId, label, atSec: quantizeSec(atSec, next.durationSec), members: stored };
  next = saveYoPhoLivingProject(touch({
    ...next,
    cues: [...(next.cues ?? []), cue],
    actions: (next.actions ?? []).map((action) =>
      stored.some((member) => member.actionId === action.actionId) ? { ...action, cueId } : action,
    ),
  }));
  return { project: next, cueId };
}

export function moveCue(
  project: YoPhoLivingProject,
  cueId: string,
  atSec: number,
): YoPhoLivingProject {
  const cue = (project.cues ?? []).find((item) => item.cueId === cueId);
  if (!cue) return project;
  const nextAt = quantizeSec(atSec, project.durationSec);
  let next = project;
  for (const member of cue.members) {
    const action = (next.actions ?? []).find((item) => item.actionId === member.actionId);
    if (!action) continue;
    const span = action.endSec - action.startSec;
    next = retimeAction(next, action.actionId, nextAt + member.offsetSec, nextAt + member.offsetSec + span);
  }
  return saveYoPhoLivingProject(touch({
    ...next,
    cues: (next.cues ?? []).map((item) => (item.cueId === cueId ? { ...item, atSec: nextAt } : item)),
  }));
}

export function evaluateCameraAtTime(project: YoPhoLivingProject, t: number): { zoom: number } {
  const active = (project.actions ?? []).filter((action) => action.kind === "CAMERA_ZOOM" && isActionActive(action, t));
  const action = active[active.length - 1];
  if (!action) return { zoom: 1 };
  const start = action.startSec + action.delaySec;
  const span = Math.max(0.0001, action.endSec - start);
  const u = Math.min(1, Math.max(0, (t - start) / span));
  const eased = action.easing === "EASE_IN" ? u * u : u;
  const amount = typeof action.parameters.zoom === "number" ? action.parameters.zoom : 1.2;
  return { zoom: 1 + (amount - 1) * eased };
}

export function addHoldEvent(
  project: YoPhoLivingProject,
  atSec: number,
  endSec: number,
  layerIds: string[],
): YoPhoLivingProject {
  const holdEvent: YoPhoTimelineEvent = {
    eventId: `ev_hold_${Date.now().toString(36)}`,
    atSec,
    type: "HOLD_SELECTED",
    layerIds,
  };
  const resumeEvent: YoPhoTimelineEvent = {
    eventId: `ev_resume_${Date.now().toString(36)}`,
    atSec: endSec,
    type: "RESUME_SELECTED",
    layerIds,
  };
  const layers = project.layers.map((l) =>
    layerIds.includes(l.layerId)
      ? { ...l, timing: { ...l.timing, hold: { startSec: atSec, endSec } } }
      : l,
  );
  return saveYoPhoLivingProject(
    touch({ ...project, layers, events: [...project.events, holdEvent, resumeEvent] }),
  );
}

export function addTitlePop(
  project: YoPhoLivingProject,
  atSec: number,
  text: string,
): YoPhoLivingProject {
  let next = addLayer(project, "TEXT", text);
  const textLayer = next.layers[next.layers.length - 1]!;
  next = updateLayer(next, textLayer.layerId, {
    color: "#FFD700",
    timing: { inSec: atSec, outSec: Math.min(atSec + 5, next.durationSec), loop: false, hold: null },
    motion: { preset: "POP", amplitude: 0.05, speed: 1.2 },
    transform: defaultTransform({ position: { x: 0.5, y: 0.18, z: 8 } }),
  });
  const ev: YoPhoTimelineEvent = {
    eventId: `ev_title_${Date.now().toString(36)}`,
    atSec,
    type: "TITLE_POP",
    layerIds: [textLayer.layerId],
    payload: { text },
  };
  return saveYoPhoLivingProject(touch({ ...next, events: [...next.events, ev] }));
}

export function evaluateLayerAtTime(
  layer: YoPhoLivingLayer,
  t: number,
  masterDuration: number,
): { visible: boolean; held: boolean; offsetX: number; offsetY: number; roll: number } {
  const inWindow = t >= layer.timing.inSec && t <= layer.timing.outSec;
  if (!layer.visible || !inWindow) {
    return { visible: false, held: false, offsetX: 0, offsetY: 0, roll: 0 };
  }
  const held = Boolean(
    layer.timing.hold && t >= layer.timing.hold.startSec && t < layer.timing.hold.endSec,
  );
  if (held) {
    return { visible: true, held, offsetX: 0, offsetY: 0, roll: 0 };
  }

  if (layer.motion.path && layer.motion.path.length >= 1) {
    const path = layer.motion.path;
    let a = path[0]!;
    let b = path[path.length - 1]!;
    for (let i = 0; i < path.length - 1; i++) {
      if (t >= path[i]!.t && t <= path[i + 1]!.t) {
        a = path[i]!;
        b = path[i + 1]!;
        break;
      }
    }
    const span = Math.max(0.0001, b.t - a.t);
    const u = Math.min(1, Math.max(0, (t - a.t) / span));
    return {
      visible: true,
      held: false,
      offsetX: a.x + (b.x - a.x) * u - layer.transform.position.x,
      offsetY: a.y + (b.y - a.y) * u - layer.transform.position.y,
      roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * u,
    };
  }

  if (layer.motion.preset === "NONE") {
    return { visible: true, held: false, offsetX: 0, offsetY: 0, roll: 0 };
  }

  const amp = layer.motion.amplitude ?? 0.02;
  const speed = layer.motion.speed ?? 1;
  const phase = (t / masterDuration) * Math.PI * 2 * speed;
  switch (layer.motion.preset) {
    case "BOUNCE":
      return { visible: true, held: false, offsetX: 0, offsetY: -Math.abs(Math.sin(phase)) * amp, roll: Math.sin(phase) * 2 };
    case "FLOAT":
    case "DRIFT":
      return { visible: true, held: false, offsetX: Math.sin(phase) * amp, offsetY: Math.cos(phase) * amp * 0.5, roll: 0 };
    case "SWAY":
      return { visible: true, held: false, offsetX: Math.sin(phase) * amp, offsetY: 0, roll: Math.sin(phase) * 4 };
    case "PULSE":
    case "GLOW":
      return { visible: true, held: false, offsetX: 0, offsetY: 0, roll: 0 };
    case "FLY_BY":
    case "SLIDE":
      return { visible: true, held: false, offsetX: ((t % masterDuration) / masterDuration - 0.5) * 0.4, offsetY: 0, roll: 0 };
    case "SPIN":
      return { visible: true, held: false, offsetX: 0, offsetY: 0, roll: (t * 60 * speed) % 360 };
    case "SHAKE":
      return { visible: true, held: false, offsetX: Math.sin(phase * 8) * amp * 0.5, offsetY: Math.cos(phase * 7) * amp * 0.5, roll: 0 };
    case "POP":
      return { visible: true, held: false, offsetX: 0, offsetY: -Math.max(0, 1 - (t - layer.timing.inSec)) * amp, roll: 0 };
    default:
      return { visible: true, held: false, offsetX: 0, offsetY: 0, roll: 0 };
  }
}
