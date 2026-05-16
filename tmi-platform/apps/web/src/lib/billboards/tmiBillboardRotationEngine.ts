import { getBillboardLobbyWallState } from "@/lib/billboards/tmiBillboardLobbyWallEngine";

export type TmiBillboardRotationSnapshot = {
  activeId: string | null;
  nextId: string | null;
  remainingMs: number;
  rotateEveryMs: number;
};

export function getBillboardRotationSnapshot(now = Date.now()): TmiBillboardRotationSnapshot {
  const wall = getBillboardLobbyWallState(now);
  const elapsed = now - wall.startedAt;
  const remainingMs = Math.max(0, wall.rotateEveryMs - elapsed);

  return {
    activeId: wall.activeId,
    nextId: wall.nextId,
    remainingMs,
    rotateEveryMs: wall.rotateEveryMs,
  };
}
