export type AvatarInventoryCategory =
  | "skins" | "eyes" | "accessories" | "outfits" | "props" | "backgrounds"
  | "lighting" | "emotes" | "collectibles" | "hats" | "glasses" | "jewelry"
  | "jackets" | "mic-skins" | "stage-skins" | "lighting-packs" | "tickets" | "nfts";

export type AvatarRarity = "free" | "rare" | "epic" | "legendary";

export type AvatarInventoryItemType = "props" | "hats" | "gear" | "instruments" | "cosmetics";

export type AvatarInventoryItem = {
  itemId: string;
  id?: string;
  avatarId: string;
  type?: AvatarInventoryItemType;
  category?: AvatarInventoryCategory;
  name: string;
  rarity?: AvatarRarity;
  owned?: boolean;
  equipped: boolean;
  mintable?: boolean;
  tradeable?: boolean;
  sponsorLocked?: boolean;
  tierLocked?: boolean;
  unlockRequirement?: string;
  xpRequired?: number;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
};

type AvatarInventorySnapshot = {
  avatarId: string;
  items: AvatarInventoryItem[];
  updatedAt: number;
  syncedAt?: number;
};

const inventoryMap = new Map<string, AvatarInventoryItem[]>();

function key(avatarId: string): string {
  return avatarId.trim().toLowerCase();
}

function id(): string {
  return `avi_${Math.random().toString(36).slice(2, 10)}`;
}

export function startAvatarInventory(avatarId: string): AvatarInventorySnapshot {
  const k = key(avatarId);
  const items = inventoryMap.get(k) ?? [];
  inventoryMap.set(k, items);
  return { avatarId: k, items: [...items], updatedAt: Date.now() };
}

export function updateAvatarInventory(
  avatarId: string,
  updater: (items: AvatarInventoryItem[]) => AvatarInventoryItem[]
): AvatarInventorySnapshot {
  const k = key(avatarId);
  const current = inventoryMap.get(k) ?? [];
  const next = updater([...current]).map((item) => ({ ...item, avatarId: k, updatedAt: Date.now() }));
  inventoryMap.set(k, next);
  return { avatarId: k, items: [...next], updatedAt: Date.now() };
}

export function storeAvatarInventoryItem(input: {
  avatarId: string;
  type?: AvatarInventoryItemType;
  category?: AvatarInventoryCategory;
  name: string;
  rarity?: AvatarRarity;
  mintable?: boolean;
  metadata?: Record<string, unknown>;
}): AvatarInventoryItem {
  const k = key(input.avatarId);
  const now = Date.now();
  const newId = id();
  const item: AvatarInventoryItem = {
    id: newId,
    itemId: newId,
    avatarId: k,
    type: input.type,
    category: input.category,
    name: input.name,
    rarity: input.rarity ?? "free",
    owned: true,
    equipped: false,
    mintable: input.mintable ?? false,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };
  const current = inventoryMap.get(k) ?? [];
  current.unshift(item);
  inventoryMap.set(k, current.slice(0, 1000));
  return item;
}

export function equipAvatarInventoryItem(avatarId: string, itemId: string): AvatarInventoryItem | null {
  const k = key(avatarId);
  const items = inventoryMap.get(k) ?? [];
  const index = items.findIndex((i) => i.id === itemId || i.itemId === itemId);
  if (index < 0) return null;
  const next = { ...items[index], equipped: true, updatedAt: Date.now() };
  items[index] = next;
  inventoryMap.set(k, items);
  return next;
}

export function removeAvatarInventoryItem(avatarId: string, itemId: string): boolean {
  const k = key(avatarId);
  const items = inventoryMap.get(k) ?? [];
  const next = items.filter((i) => i.id !== itemId && i.itemId !== itemId);
  const removed = next.length !== items.length;
  if (removed) inventoryMap.set(k, next);
  return removed;
}

export function listAvatarInventory(avatarId: string): AvatarInventoryItem[] {
  return [...(inventoryMap.get(key(avatarId)) ?? [])];
}

export function saveAvatarInventory(avatarId: string): AvatarInventorySnapshot {
  const k = key(avatarId);
  return { avatarId: k, items: listAvatarInventory(k), updatedAt: Date.now() };
}

export function recoverAvatarInventory(avatarId: string): AvatarInventorySnapshot {
  return startAvatarInventory(avatarId);
}

export function repeatAvatarInventory(avatarId: string): AvatarInventorySnapshot {
  return saveAvatarInventory(avatarId);
}

export function returnAvatarInventory(avatarId: string): AvatarInventorySnapshot {
  return saveAvatarInventory(avatarId);
}

const STARTER_ITEMS: AvatarInventoryItem[] = [
  { itemId: "skin-starter-01",  id: "skin-starter-01",  avatarId: "", name: "Starter Skin Tone A",   category: "skins",         rarity: "free",      owned: true,  equipped: true,  mintable: false, xpRequired: 0,   unlockRequirement: "starter",                   createdAt: 0, updatedAt: 0 },
  { itemId: "eye-neon-01",      id: "eye-neon-01",      avatarId: "", name: "Neon Eyes",             category: "eyes",          rarity: "rare",      owned: true,  equipped: true,  mintable: true,  xpRequired: 40,  unlockRequirement: "starter",                   createdAt: 0, updatedAt: 0 },
  { itemId: "hat-crown-01",     id: "hat-crown-01",     avatarId: "", name: "Crown Hat",             category: "hats",          rarity: "legendary", owned: false, equipped: false, mintable: true,  xpRequired: 180, unlockRequirement: "reach avatar tier 3",       createdAt: 0, updatedAt: 0 },
  { itemId: "emote-dance-01",   id: "emote-dance-01",   avatarId: "", name: "Dance Burst",           category: "emotes",        rarity: "epic",      owned: true,  equipped: true,  mintable: true,  xpRequired: 60,  unlockRequirement: "starter",                   createdAt: 0, updatedAt: 0 },
  { itemId: "mic-neon",         id: "mic-neon",         avatarId: "", name: "Neon Mic Skin",         category: "mic-skins",     rarity: "rare",      owned: true,  equipped: false, mintable: true,  xpRequired: 30,  unlockRequirement: "starter",                   createdAt: 0, updatedAt: 0 },
  { itemId: "light-aurora",     id: "light-aurora",     avatarId: "", name: "Aurora Lighting Pack",  category: "lighting-packs",rarity: "epic",      owned: false, equipped: false, mintable: true,  xpRequired: 220, unlockRequirement: "win 3 live battles",        createdAt: 0, updatedAt: 0 },
  { itemId: "outfit-gold-tee",  id: "outfit-gold-tee",  avatarId: "", name: "First Issue Gold Tee",  category: "outfits",       rarity: "legendary", owned: false, equipped: false, mintable: true,  xpRequired: 0,   unlockRequirement: "purchase with 850 TMI Points", createdAt: 0, updatedAt: 0 },
];

export function getStarterInventory(): AvatarInventoryItem[] {
  return STARTER_ITEMS.map((item) => ({ ...item }));
}

export function equipItem(items: AvatarInventoryItem[], itemId: string): AvatarInventoryItem[] {
  return items.map((item) => {
    if (item.id === itemId && item.owned) return { ...item, equipped: true };
    if (item.id !== itemId && item.category === items.find((x) => x.id === itemId)?.category) return { ...item, equipped: false };
    return item;
  });
}

export function unequipItem(items: AvatarInventoryItem[], itemId: string): AvatarInventoryItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, equipped: false } : item));
}

export function syncInventoryToProfile(items: AvatarInventoryItem[]) {
  const equipped = items.filter((item) => item.equipped).map((item) => item.id);
  return { syncedAt: new Date().toISOString(), equipped, inventoryCount: items.filter((item) => item.owned).length };
}
