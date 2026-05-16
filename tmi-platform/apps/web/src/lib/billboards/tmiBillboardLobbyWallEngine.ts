import { listBillboardRoutes, type TmiBillboardRouteRecord } from "@/lib/billboards/tmiBillboardRouteRegistry";

export type TmiBillboardLobbyWallState = {
  activeId: string | null;
  nextId: string | null;
  rotateEveryMs: number;
  startedAt: number;
};

const ROTATE_EVERY_MS = 120000;

export function getBillboardLobbyWallState(now = Date.now()): TmiBillboardLobbyWallState {
  const rows = listBillboardRoutes();
  if (!rows.length) {
    return { activeId: null, nextId: null, rotateEveryMs: ROTATE_EVERY_MS, startedAt: now };
  }

  const index = Math.floor(now / ROTATE_EVERY_MS) % rows.length;
  const nextIndex = (index + 1) % rows.length;
  return {
    activeId: rows[index]?.id ?? null,
    nextId: rows[nextIndex]?.id ?? null,
    rotateEveryMs: ROTATE_EVERY_MS,
    startedAt: now - (now % ROTATE_EVERY_MS),
  };
}

export function getActiveBillboardRecord(now = Date.now()): TmiBillboardRouteRecord | null {
  const wall = getBillboardLobbyWallState(now);
  if (!wall.activeId) return null;
  return listBillboardRoutes().find((row) => row.id === wall.activeId) ?? null;
}
