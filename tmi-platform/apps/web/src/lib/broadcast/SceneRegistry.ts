export type SceneId =
  | 'MAIN_STAGE'
  | 'AUDIENCE'
  | 'VIP'
  | 'DJ_BOOTH'
  | 'BACKSTAGE'
  | 'OUTDOOR'
  | 'LOBBY'
  | 'GREEN_ROOM';

export interface SceneState {
  sceneId: SceneId;
  label: string;
  occupants: number;
  active: boolean;
  updatedAtMs: number;
}

const SCENES = new Map<SceneId, SceneState>([
  ['MAIN_STAGE', { sceneId: 'MAIN_STAGE', label: 'Main Stage', occupants: 0, active: true, updatedAtMs: Date.now() }],
  ['AUDIENCE', { sceneId: 'AUDIENCE', label: 'Audience', occupants: 0, active: false, updatedAtMs: Date.now() }],
  ['VIP', { sceneId: 'VIP', label: 'VIP', occupants: 0, active: false, updatedAtMs: Date.now() }],
  ['DJ_BOOTH', { sceneId: 'DJ_BOOTH', label: 'DJ Booth', occupants: 0, active: false, updatedAtMs: Date.now() }],
  ['BACKSTAGE', { sceneId: 'BACKSTAGE', label: 'Backstage', occupants: 0, active: false, updatedAtMs: Date.now() }],
  ['OUTDOOR', { sceneId: 'OUTDOOR', label: 'Outdoor', occupants: 0, active: false, updatedAtMs: Date.now() }],
  ['LOBBY', { sceneId: 'LOBBY', label: 'Lobby', occupants: 0, active: false, updatedAtMs: Date.now() }],
  ['GREEN_ROOM', { sceneId: 'GREEN_ROOM', label: 'Green Room', occupants: 0, active: false, updatedAtMs: Date.now() }],
]);

export function listScenes(): SceneState[] {
  return Array.from(SCENES.values());
}

export function getScene(sceneId: SceneId): SceneState | null {
  return SCENES.get(sceneId) ?? null;
}

export function getActiveScene(): SceneState | null {
  return listScenes().find((scene) => scene.active) ?? null;
}

export function focusScene(sceneId: SceneId): SceneState {
  const now = Date.now();
  for (const [id, scene] of SCENES.entries()) {
    SCENES.set(id, {
      ...scene,
      active: id === sceneId,
      updatedAtMs: now,
    });
  }
  return SCENES.get(sceneId)!;
}

export function setSceneOccupants(sceneId: SceneId, occupants: number): SceneState {
  const current = SCENES.get(sceneId);
  if (!current) throw new Error(`Unknown scene: ${sceneId}`);
  const next = {
    ...current,
    occupants: Math.max(0, occupants),
    updatedAtMs: Date.now(),
  };
  SCENES.set(sceneId, next);
  return next;
}

export function getSceneRegistrySummary(): {
  totalScenes: number;
  activeScene: SceneId | null;
  totalOccupants: number;
  updatedAtMs: number;
} {
  const scenes = listScenes();
  return {
    totalScenes: scenes.length,
    activeScene: scenes.find((scene) => scene.active)?.sceneId ?? null,
    totalOccupants: scenes.reduce((sum, scene) => sum + scene.occupants, 0),
    updatedAtMs: Date.now(),
  };
}