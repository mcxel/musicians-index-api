import type { TmiOverlaySurface } from "@/lib/store/tmiOverlayEquipEngine";

export type TmiOverlayLoadout = {
  id: string;
  userId: string;
  name: string;
  slots: Partial<Record<TmiOverlaySurface, string>>;
  createdAt: number;
  updatedAt: number;
};

const LOADOUTS: TmiOverlayLoadout[] = [];

export function saveLoadout(userId: string, name: string, slots: Partial<Record<TmiOverlaySurface, string>>) {
  const existing = LOADOUTS.find((x) => x.userId === userId && x.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.slots = { ...slots };
    existing.updatedAt = Date.now();
    return existing;
  }
  const row: TmiOverlayLoadout = {
    id: `loadout_${Math.random().toString(36).slice(2, 10)}`,
    userId,
    name,
    slots: { ...slots },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  LOADOUTS.push(row);
  return row;
}

export function loadLoadout(userId: string, loadoutId: string) {
  return LOADOUTS.find((x) => x.userId === userId && x.id === loadoutId) ?? null;
}

export function switchLoadout(userId: string, fromLoadoutId: string, toLoadoutId: string) {
  const from = loadLoadout(userId, fromLoadoutId);
  const to = loadLoadout(userId, toLoadoutId);
  if (!from || !to) return { ok: false, reason: "LOADOUT_NOT_FOUND" } as const;
  return { ok: true, from, to } as const;
}

export function deleteLoadout(userId: string, loadoutId: string) {
  const i = LOADOUTS.findIndex((x) => x.userId === userId && x.id === loadoutId);
  if (i === -1) return { ok: false, reason: "LOADOUT_NOT_FOUND" } as const;
  LOADOUTS.splice(i, 1);
  return { ok: true } as const;
}

export function renameLoadout(userId: string, loadoutId: string, nextName: string) {
  const target = loadLoadout(userId, loadoutId);
  if (!target) return { ok: false, reason: "LOADOUT_NOT_FOUND" } as const;
  target.name = nextName;
  target.updatedAt = Date.now();
  return { ok: true, loadout: target } as const;
}

export function listLoadouts(userId: string) {
  return LOADOUTS.filter((x) => x.userId === userId);
}
