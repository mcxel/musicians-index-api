export type AvatarAccessoryType = "props" | "hats" | "gear" | "instruments" | "cosmetics";

export type AvatarAccessory = {
  accessoryId: string;
  avatarId: string;
  type: AvatarAccessoryType;
  label: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type AvatarAccessoryState = {
  avatarId: string;
  accessories: AvatarAccessory[];
  updatedAt: number;
};

const accessoryMap = new Map<string, AvatarAccessory[]>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

function id(): string {
  return `ava_${Math.random().toString(36).slice(2, 10)}`;
}

export function startAvatarAccessoryEngine(avatarId: string): AvatarAccessoryState {
  const k = key(avatarId);
  const accessories = accessoryMap.get(k) ?? [];
  accessoryMap.set(k, accessories);
  return { avatarId: k, accessories: [...accessories], updatedAt: Date.now() };
}

export function updateAvatarAccessoryEngine(
  avatarId: string,
  updater: (accessories: AvatarAccessory[]) => AvatarAccessory[]
): AvatarAccessoryState {
  const k = key(avatarId);
  const current = accessoryMap.get(k) ?? [];
  const next = updater([...current]).map((acc) => ({ ...acc, avatarId: k, updatedAt: Date.now() }));
  accessoryMap.set(k, next);
  return { avatarId: k, accessories: [...next], updatedAt: Date.now() };
}

export function saveAvatarAccessory(input: {
  avatarId: string;
  type: AvatarAccessoryType;
  label: string;
}): AvatarAccessory {
  const k = key(input.avatarId);
  const now = Date.now();
  const accessory: AvatarAccessory = {
    accessoryId: id(),
    avatarId: k,
    type: input.type,
    label: input.label,
    active: false,
    createdAt: now,
    updatedAt: now,
  };
  const list = accessoryMap.get(k) ?? [];
  list.unshift(accessory);
  accessoryMap.set(k, list.slice(0, 300));
  return accessory;
}

export function activateAvatarAccessory(avatarId: string, accessoryId: string): AvatarAccessory | null {
  const k = key(avatarId);
  const list = accessoryMap.get(k) ?? [];
  const idx = list.findIndex((a) => a.accessoryId === accessoryId);
  if (idx < 0) return null;
  const next = { ...list[idx], active: true, updatedAt: Date.now() };
  list[idx] = next;
  accessoryMap.set(k, list);
  return next;
}

export function recoverAvatarAccessories(avatarId: string): AvatarAccessoryState {
  return startAvatarAccessoryEngine(avatarId);
}

export function repeatAvatarAccessoryState(avatarId: string): AvatarAccessoryState {
  return startAvatarAccessoryEngine(avatarId);
}

export function returnAvatarAccessoryState(avatarId: string): AvatarAccessoryState {
  return startAvatarAccessoryEngine(avatarId);
}
