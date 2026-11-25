/**
 * YoPhoLivingProjectStore — shared active project + card list for Quick/Drawer/Studio.
 * Persistence: localStorage (LOCAL_BROWSER_NOT_PRISMA_YET). Not Visual Creator Map.
 */

import {
  createYoPhoLivingProject,
  type YoPhoLivingProject,
  YOPHO_LIVING_PERSISTENCE,
} from "./YoPhoLivingProject";

const STORAGE_KEY = "tmi_yopho_living_projects_v1";
const ACTIVE_KEY = "tmi_yopho_living_active_v1";

type StoreShape = {
  projects: Record<string, YoPhoLivingProject>;
  activeProjectId: string | null;
};

function readStore(): StoreShape {
  if (typeof window === "undefined") return { projects: {}, activeProjectId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const active = localStorage.getItem(ACTIVE_KEY);
    const projects = raw ? (JSON.parse(raw) as Record<string, YoPhoLivingProject>) : {};
    return { projects, activeProjectId: active };
  } catch {
    return { projects: {}, activeProjectId: null };
  }
}

function writeStore(shape: StoreShape): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shape.projects));
  if (shape.activeProjectId) localStorage.setItem(ACTIVE_KEY, shape.activeProjectId);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function getYoPhoLivingPersistenceLabel(): typeof YOPHO_LIVING_PERSISTENCE {
  return YOPHO_LIVING_PERSISTENCE;
}

export function listYoPhoLivingProjects(): YoPhoLivingProject[] {
  const { projects } = readStore();
  return Object.values(projects).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getYoPhoLivingProject(projectId: string): YoPhoLivingProject | null {
  return readStore().projects[projectId] ?? null;
}

export function getActiveYoPhoLivingProject(): YoPhoLivingProject | null {
  const s = readStore();
  if (!s.activeProjectId) return null;
  return s.projects[s.activeProjectId] ?? null;
}

export function setActiveYoPhoLivingProject(projectId: string | null): void {
  const s = readStore();
  s.activeProjectId = projectId;
  writeStore(s);
}

export function saveYoPhoLivingProject(project: YoPhoLivingProject): YoPhoLivingProject {
  const s = readStore();
  const next = { ...project, updatedAt: new Date().toISOString() };
  s.projects[next.projectId] = next;
  if (!s.activeProjectId) s.activeProjectId = next.projectId;
  writeStore(s);
  return next;
}

export function createAndSaveYoPhoLivingProject(input: {
  ownerId: string;
  title: string;
  durationSec?: number;
  qaTag?: string;
}): YoPhoLivingProject {
  const project = createYoPhoLivingProject(input);
  return saveYoPhoLivingProject(project);
}

export function deleteYoPhoLivingProject(projectId: string): void {
  const s = readStore();
  delete s.projects[projectId];
  if (s.activeProjectId === projectId) s.activeProjectId = null;
  writeStore(s);
}

/** Test helper */
export function __resetYoPhoLivingStoreForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_KEY);
}
