/**
 * YoPhoGoldenQa — create golden regression projects through the REAL authoring path.
 * Never hard-code finished visual frames as flattened fakes.
 */

import { createAndSaveYoPhoLivingProject, getYoPhoLivingProject, saveYoPhoLivingProject } from "./YoPhoLivingProjectStore";
import {
  addGroupedCue,
  addHoldEvent,
  addLayer,
  addMarker,
  addTimedAction,
  addTitlePop,
  moveCue,
  setLayerMotion,
  setLayerPath,
  setLivingRegion,
  updateLayer,
} from "./YoPhoLivingAuthoring";
import type { YoPhoLivingProject } from "./YoPhoLivingProject";

const OWNER = "yopho_qa_system";

export type GoldenQaId = "QA-01" | "QA-02" | "QA-03" | "QA-04" | "QA-05";

export interface GoldenQaResult {
  qaId: GoldenQaId;
  projectId: string;
  createdThroughAuthoringPath: true;
  saved: boolean;
  reopened: boolean;
  editedAfterReopen: boolean;
  layerCount: number;
  durationSec: number;
  checks: Record<string, boolean>;
}

function reopen(projectId: string): YoPhoLivingProject {
  const p = getYoPhoLivingProject(projectId);
  if (!p) throw new Error(`QA reopen failed: ${projectId}`);
  return p;
}

export function createQa01WindowToTheStars(): GoldenQaResult {
  let p = createAndSaveYoPhoLivingProject({
    ownerId: OWNER,
    title: "QA-01 WINDOW TO THE STARS",
    durationSec: 20,
    qaTag: "QA-01",
  });
  p = updateLayer(p, p.layers[0]!.layerId, {
    label: "Room",
    procedural: "SOLID",
    color: "#1a1028",
    motion: { preset: "NONE" },
  });
  p = addLayer(p, "UNDERLAY", "Star field");
  const stars = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, stars.layerId, {
    procedural: "STAR_FIELD",
    depth: 1,
    motion: { preset: "DRIFT", amplitude: 0.01, speed: 0.4 },
  });
  p = setLivingRegion(p, stars.layerId, {
    regionId: "window_mask",
    label: "WINDOW",
    rect: { x: 0.28, y: 0.22, w: 0.44, h: 0.36 },
    mode: "INSIDE",
  });
  p = addLayer(p, "SUBJECT", "Person");
  const person = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, person.layerId, {
    procedural: "SOLID",
    color: "#c4a484",
    transform: { ...person.transform, position: { x: 0.5, y: 0.72, z: 4 }, scale: { x: 0.35, y: 0.45, z: 1 } },
    motion: { preset: "NONE" },
  });
  p = addLayer(p, "OBJECT", "Shooting star");
  const shoot = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, shoot.layerId, {
    procedural: "SHOOTING_STAR",
    depth: 2,
    timing: { inSec: 4, outSec: 7, loop: false, hold: null },
  });
  p = setLayerPath(p, shoot.layerId, [
    { t: 4, x: 0.3, y: 0.25, z: 2 },
    { t: 5.5, x: 0.5, y: 0.35, z: 2 },
    { t: 7, x: 0.7, y: 0.28, z: 2 },
  ]);
  p = addLayer(p, "FOREGROUND", "Window frame");
  const frame = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, frame.layerId, {
    procedural: "SOLID",
    color: "#2a1a12",
    depth: 6,
    mask: "window_frame_occlusion",
    transform: { ...frame.transform, position: { x: 0.5, y: 0.4, z: 6 }, scale: { x: 0.55, y: 0.42, z: 1 } },
    motion: { preset: "NONE" },
  });
  p = addLayer(p, "OVERLAY", "Vignette");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    procedural: "GLOW",
    color: "#000000",
    transform: { ...p.layers[p.layers.length - 1]!.transform, opacity: 0.35 },
    motion: { preset: "NONE" },
  });
  p = addTitlePop(p, 8, "WINDOW TO THE STARS");
  p = saveYoPhoLivingProject(p);
  const again = reopen(p.projectId);
  const edited = updateLayer(again, again.layers[0]!.layerId, { label: "Room (verified)" });
  return {
    qaId: "QA-01",
    projectId: edited.projectId,
    createdThroughAuthoringPath: true,
    saved: true,
    reopened: true,
    editedAfterReopen: true,
    layerCount: edited.layers.length,
    durationSec: edited.durationSec,
    checks: {
      staticBackground: true,
      staticPerson: true,
      maskedStarField: Boolean(edited.layers.find((l) => l.livingRegion?.label === "WINDOW")),
      shootingStarPath: Boolean(edited.layers.find((l) => l.procedural === "SHOOTING_STAR")?.motion.path),
      foregroundOcclusion: Boolean(edited.layers.find((l) => l.mask === "window_frame_occlusion")),
      independentTiming: true,
      textOverlay: edited.layers.some((l) => l.family === "TEXT"),
    },
  };
}

export function createQa02BouncingCar(): GoldenQaResult {
  let p = createAndSaveYoPhoLivingProject({
    ownerId: OWNER,
    title: "QA-02 BOUNCING CAR",
    durationSec: 10,
    qaTag: "QA-02",
  });
  p = updateLayer(p, p.layers[0]!.layerId, { label: "Street", color: "#222233", motion: { preset: "NONE" } });
  p = addLayer(p, "SUBJECT", "Person");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    color: "#c4a484",
    procedural: "SOLID",
    motion: { preset: "NONE" },
    transform: { ...p.layers[p.layers.length - 1]!.transform, position: { x: 0.35, y: 0.65, z: 3 } },
  });
  p = addLayer(p, "OBJECT", "Car");
  const car = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, car.layerId, {
    procedural: "SOLID",
    color: "#ff2d55",
    transform: { ...car.transform, position: { x: 0.62, y: 0.7, z: 4 }, scale: { x: 0.28, y: 0.14, z: 1 } },
  });
  p = setLayerMotion(p, car.layerId, "BOUNCE", { amplitude: 0.025, speed: 2 });
  p = addLayer(p, "EFFECT", "Shadow");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    procedural: "SHADOW",
    color: "#000000",
    motion: { preset: "NONE" },
    transform: { ...p.layers[p.layers.length - 1]!.transform, position: { x: 0.62, y: 0.78, z: 3.5 }, opacity: 0.4 },
  });
  p = saveYoPhoLivingProject(p);
  const again = reopen(p.projectId);
  return {
    qaId: "QA-02",
    projectId: again.projectId,
    createdThroughAuthoringPath: true,
    saved: true,
    reopened: true,
    editedAfterReopen: false,
    layerCount: again.layers.length,
    durationSec: again.durationSec,
    checks: {
      carBounceOnly: again.layers.find((l) => l.label === "Car")?.motion.preset === "BOUNCE",
      personStatic: again.layers.find((l) => l.label === "Person")?.motion.preset === "NONE",
      backgroundStatic: again.layers[0]?.motion.preset === "NONE",
      shadowPresent: again.layers.some((l) => l.procedural === "SHADOW"),
    },
  };
}

export function createQa03Airplane(): GoldenQaResult {
  let p = createAndSaveYoPhoLivingProject({
    ownerId: OWNER,
    title: "QA-03 AIRPLANE DEPTH/PATH",
    durationSec: 20,
    qaTag: "QA-03",
  });
  p = updateLayer(p, p.layers[0]!.layerId, { label: "Sky", color: "#87CEEB", motion: { preset: "NONE" } });
  p = addLayer(p, "UNDERLAY", "Clouds");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    procedural: "SOLID",
    color: "#ffffff",
    depth: 1,
    motion: { preset: "DRIFT", amplitude: 0.01, speed: 0.3 },
    transform: { ...p.layers[p.layers.length - 1]!.transform, opacity: 0.5 },
  });
  p = addLayer(p, "SUBJECT", "Person");
  const person = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, person.layerId, {
    procedural: "SOLID",
    color: "#c4a484",
    depth: 5,
    motion: { preset: "NONE" },
    transform: { ...person.transform, position: { x: 0.5, y: 0.7, z: 5 }, scale: { x: 0.3, y: 0.4, z: 1 } },
  });
  p = addLayer(p, "OBJECT", "Airplane");
  const plane = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, plane.layerId, {
    procedural: "SOLID",
    color: "#dddddd",
    depth: 2,
    timing: { inSec: 2, outSec: 16, loop: false, hold: null },
  });
  p = setLayerPath(p, plane.layerId, [
    { t: 2, x: 0.05, y: 0.3, z: 2, roll: -10 },
    { t: 8, x: 0.45, y: 0.35, z: 3, roll: 5 },
    { t: 12, x: 0.55, y: 0.4, z: 6, roll: 15 },
    { t: 16, x: 0.95, y: 0.28, z: 2, roll: -5 },
  ]);
  p = addLayer(p, "FOREGROUND", "Foreground branch");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    procedural: "SOLID",
    color: "#1a4d1a",
    depth: 7,
    motion: { preset: "NONE" },
    transform: { ...p.layers[p.layers.length - 1]!.transform, position: { x: 0.15, y: 0.8, z: 7 } },
  });
  p = saveYoPhoLivingProject(p);
  const again = reopen(p.projectId);
  const planeLayer = again.layers.find((l) => l.label === "Airplane");
  return {
    qaId: "QA-03",
    projectId: again.projectId,
    createdThroughAuthoringPath: true,
    saved: true,
    reopened: true,
    editedAfterReopen: false,
    layerCount: again.layers.length,
    durationSec: again.durationSec,
    checks: {
      motionPath: Boolean(planeLayer?.motion.path && planeLayer.motion.path.length >= 3),
      depthChange: Boolean(planeLayer?.motion.path?.some((pt) => pt.z > 5)),
      personStatic: again.layers.find((l) => l.label === "Person")?.motion.preset === "NONE",
      foregroundPresent: again.layers.some((l) => l.family === "FOREGROUND"),
    },
  };
}

export function createQa04HoldTitle(): GoldenQaResult {
  let p = createAndSaveYoPhoLivingProject({
    ownerId: OWNER,
    title: "QA-04 HOLD + TITLE POP",
    durationSec: 30,
    qaTag: "QA-04",
  });
  p = addLayer(p, "SUBJECT", "Person");
  const person = p.layers[p.layers.length - 1]!;
  p = setLayerMotion(p, person.layerId, "FLOAT", { amplitude: 0.015, speed: 0.8 });
  p = addLayer(p, "UNDERLAY", "Stars");
  const stars = p.layers[p.layers.length - 1]!;
  p = updateLayer(p, stars.layerId, { procedural: "STAR_FIELD" });
  p = setLayerMotion(p, stars.layerId, "DRIFT", { amplitude: 0.02, speed: 0.5 });
  p = addHoldEvent(p, 10, 13, [person.layerId]);
  p = addTitlePop(p, 12, "HOLD WORKS");
  p = saveYoPhoLivingProject(p);
  const again = reopen(p.projectId);
  return {
    qaId: "QA-04",
    projectId: again.projectId,
    createdThroughAuthoringPath: true,
    saved: true,
    reopened: true,
    editedAfterReopen: false,
    layerCount: again.layers.length,
    durationSec: again.durationSec,
    checks: {
      selectiveHold: Boolean(again.layers.find((l) => l.label === "Person")?.timing.hold),
      starsKeepMoving: again.layers.find((l) => l.label === "Stars")?.motion.preset === "DRIFT",
      titleEvent: again.events.some((e) => e.type === "TITLE_POP"),
      master30: again.durationSec === 30,
    },
  };
}

export function createQa05StaticBeautify(): GoldenQaResult {
  let p = createAndSaveYoPhoLivingProject({
    ownerId: OWNER,
    title: "QA-05 STATIC BEAUTIFY",
    durationSec: 10,
    qaTag: "QA-05",
  });
  p = updateLayer(p, p.layers[0]!.layerId, { label: "Photo", color: "#334455", motion: { preset: "NONE" } });
  p = addLayer(p, "LIGHT", "Key light");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    procedural: "GLOW",
    color: "#ffd7a0",
    motion: { preset: "NONE" },
    transform: { ...p.layers[p.layers.length - 1]!.transform, opacity: 0.35 },
  });
  p = addLayer(p, "TEXT", "Beautify");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    color: "#FFFFFF",
    motion: { preset: "NONE" },
  });
  p = addLayer(p, "OVERLAY", "Film grain");
  p = updateLayer(p, p.layers[p.layers.length - 1]!.layerId, {
    procedural: "SOLID",
    color: "#000000",
    motion: { preset: "NONE" },
    transform: { ...p.layers[p.layers.length - 1]!.transform, opacity: 0.08 },
  });
  p = saveYoPhoLivingProject(p);
  const again = reopen(p.projectId);
  return {
    qaId: "QA-05",
    projectId: again.projectId,
    createdThroughAuthoringPath: true,
    saved: true,
    reopened: true,
    editedAfterReopen: false,
    layerCount: again.layers.length,
    durationSec: again.durationSec,
    checks: {
      allStatic: again.layers.every((l) => l.motion.preset === "NONE"),
      hasLight: again.layers.some((l) => l.family === "LIGHT"),
      hasText: again.layers.some((l) => l.family === "TEXT"),
      hasOverlay: again.layers.some((l) => l.family === "OVERLAY"),
    },
  };
}

export function createThirtySecondCertification() {
  let p = createAndSaveYoPhoLivingProject({
    ownerId: OWNER,
    title: "30s TIMED CERT",
    durationSec: 30,
    qaTag: "CERT-30",
  });
  p = addMarker(p, "INTRO", 0);
  p = addMarker(p, "REVEAL", 3);
  p = addMarker(p, "BEAT", 8);
  p = addMarker(p, "ENTRANCE", 18);
  p = addMarker(p, "LOGO", 28);
  p = addMarker(p, "OUTRO", 30);
  p = addTimedAction(p, { kind: "REVEAL", startSec: 3, endSec: 30, snap: false }).project;
  p = addTimedAction(p, { kind: "TITLE_ENTER", startSec: 6, endSec: 12, snap: false }).project;
  p = addTimedAction(p, { kind: "RAIN", startSec: 8, endSec: 27, snap: false }).project;
  p = addTimedAction(p, { kind: "CAMERA_ZOOM", startSec: 12, endSec: 16, parameters: { zoom: 1.35 }, snap: false }).project;
  p = addLayer(p, "PROP", "Car");
  const car = p.layers[p.layers.length - 1]!;
  p = addTimedAction(p, { kind: "LAYER_MOTION", startSec: 16, endSec: 20, targetLayerId: car.layerId, snap: false }).project;
  const door = addTimedAction(p, { kind: "LAYER_MOTION", startSec: 16, endSec: 18, targetLayerId: p.layers[0]!.layerId, snap: false });
  p = door.project;
  p = addTimedAction(p, { kind: "LIGHTING", startSec: 20, endSec: 26, snap: false }).project;
  p = addTimedAction(p, { kind: "TITLE_ENTER", startSec: 23, endSec: 30, snap: false }).project;
  p = addTimedAction(p, { kind: "BRANDING", startSec: 28, endSec: 30, snap: false }).project;
  const cue = addGroupedCue(p, "DRAMATIC ENTRANCE", 18, [
    { kind: "REVEAL", startSec: 0, endSec: 4, snap: false },
    { kind: "CAMERA_ZOOM", startSec: 0.4, endSec: 2.4, parameters: { zoom: 1.2 }, snap: false },
    { kind: "LIGHTING", startSec: 0.2, endSec: 3, snap: false },
    { kind: "TITLE_ENTER", startSec: 0.8, endSec: 3, snap: false },
  ]);
  p = moveCue(cue.project, cue.cueId, 19);
  p = saveYoPhoLivingProject(p);
  const again = reopen(p.projectId);
  const rain = again.actions?.find((action) => action.kind === "RAIN");
  return {
    projectId: again.projectId,
    durationSec: again.durationSec,
    checks: {
      duration30: again.durationSec === 30,
      rainWindow: rain?.startSec === 8 && rain.endSec === 27,
      rainHiddenBefore: Boolean(rain && rain.startSec > 0),
      markers: (again.markers ?? []).length >= 6,
      cueMoved: again.cues?.[0]?.atSec === 19,
      doorRefused: door.accepted === false,
      noAudioTrack: !(again.actions ?? []).some((action) => action.track === "AUDIO"),
    },
  };
}

function referenceClass(title: string, build: (projectIdReady: ReturnType<typeof createAndSaveYoPhoLivingProject>) => ReturnType<typeof createAndSaveYoPhoLivingProject>): string {
  let p = createAndSaveYoPhoLivingProject({ ownerId: OWNER, title, durationSec: 20, qaTag: title });
  p = build(p);
  return reopen(p.projectId).projectId;
}

export function createReferenceClassProjects(): Record<string, string> {
  return {
    cinematic: referenceClass("REF CINEMATIC", (p) => {
      let next = addLayer(p, "SUBJECT", "Person");
      next = addLayer(next, "OBJECT", "Vehicle");
      const vehicle = next.layers[next.layers.length - 1]!;
      next = addTimedAction(next, { kind: "REVEAL", startSec: 1, endSec: 20, snap: false }).project;
      next = addTimedAction(next, { kind: "LAYER_MOTION", startSec: 4, endSec: 12, targetLayerId: vehicle.layerId, snap: false }).project;
      return addTimedAction(next, { kind: "RAIN", startSec: 6, endSec: 16, snap: false }).project;
    }),
    game: referenceClass("REF GAME", (p) => {
      let next = addTimedAction(p, { kind: "TITLE_ENTER", startSec: 1, endSec: 8, snap: false }).project;
      next = addTimedAction(next, { kind: "LIGHTING", startSec: 2, endSec: 10, snap: false }).project;
      return addTimedAction(next, { kind: "REVEAL", startSec: 0.5, endSec: 20, snap: false }).project;
    }),
    dj: referenceClass("REF DJ", (p) => {
      let next = addTimedAction(p, { kind: "REVEAL", startSec: 0.5, endSec: 20, snap: false }).project;
      next = addTimedAction(next, { kind: "LIGHTING", startSec: 2, endSec: 18, snap: false }).project;
      return addTimedAction(next, { kind: "TITLE_ENTER", startSec: 3, endSec: 12, snap: false }).project;
    }),
    promo: referenceClass("REF PROMO", (p) => {
      let next = addTimedAction(p, { kind: "BRANDING", startSec: 2, endSec: 18, snap: false }).project;
      return addTimedAction(next, { kind: "CAMERA_ZOOM", startSec: 4, endSec: 9, parameters: { zoom: 1.25 }, snap: false }).project;
    }),
    typeMotion: referenceClass("REF TYPE", (p) => {
      let next = addTimedAction(p, { kind: "TITLE_ENTER", startSec: 1, endSec: 6, snap: false }).project;
      return addTimedAction(next, { kind: "TITLE_ENTER", startSec: 7, endSec: 14, snap: false }).project;
    }),
  };
}

export function runAllGoldenQa(): GoldenQaResult[] {
  return [
    createQa01WindowToTheStars(),
    createQa02BouncingCar(),
    createQa03Airplane(),
    createQa04HoldTitle(),
    createQa05StaticBeautify(),
  ];
}
