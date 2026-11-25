import { getStarterInventory, type AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
import { buildAvatarNFTDraft, mintAvatarNFT } from "@/lib/avatar/avatarNFTEngine";
import { prisma } from "@/lib/prisma";
import type { AvatarInventoryItemRecord } from "@prisma/client";

export type AvatarSlot =
  | "skin"
  | "hair"
  | "eyes"
  | "accessory"
  | "outfit"
  | "prop"
  | "background"
  | "lighting"
  | "emote"
  | "instrument"
  | "aura"
  | "entrance";

export type AvatarProfile = {
  userId: string;
  displayName: string;
  skinTone: string;
  hairStyle: string;
  eyeStyle: string;
  updatedAt: string;
};

export type AvatarLoadout = {
  userId: string;
  slots: Record<AvatarSlot, string | null>;
  updatedAt: string;
};

export type AvatarNFTRecord = {
  tokenId: string;
  txHash: string;
  mintedAt: string;
  userId: string;
  rarityScore: number;
};

export type AvatarNFTRegistry = {
  userId: string;
  records: AvatarNFTRecord[];
};

export type AvatarUnlockLedger = {
  userId: string;
  xp: number;
  milestones: string[];
  lastUpdatedAt: string;
};

export type AvatarInventory = {
  userId: string;
  items: AvatarInventoryItem[];
  updatedAt: string;
};

const globalForAvatarPersistence = globalThis as unknown as {
  __tmiAvatarProfileStore?: Map<string, AvatarProfile>;
  __tmiAvatarLoadoutStore?: Map<string, AvatarLoadout>;
  __tmiAvatarNftRegistryStore?: Map<string, AvatarNFTRegistry>;
  __tmiAvatarUnlockLedgerStore?: Map<string, AvatarUnlockLedger>;
  __tmiAvatarInventoryStore?: Map<string, AvatarInventory>;
};

const profileStore =
  globalForAvatarPersistence.__tmiAvatarProfileStore ??
  (globalForAvatarPersistence.__tmiAvatarProfileStore = new Map<string, AvatarProfile>());
const loadoutStore =
  globalForAvatarPersistence.__tmiAvatarLoadoutStore ??
  (globalForAvatarPersistence.__tmiAvatarLoadoutStore = new Map<string, AvatarLoadout>());
const nftRegistryStore =
  globalForAvatarPersistence.__tmiAvatarNftRegistryStore ??
  (globalForAvatarPersistence.__tmiAvatarNftRegistryStore = new Map<string, AvatarNFTRegistry>());
const unlockLedgerStore =
  globalForAvatarPersistence.__tmiAvatarUnlockLedgerStore ??
  (globalForAvatarPersistence.__tmiAvatarUnlockLedgerStore = new Map<string, AvatarUnlockLedger>());
const inventoryStore =
  globalForAvatarPersistence.__tmiAvatarInventoryStore ??
  (globalForAvatarPersistence.__tmiAvatarInventoryStore = new Map<string, AvatarInventory>());

function nowIso(): string {
  return new Date().toISOString();
}

const SLOT_CATEGORY_ALLOWLIST: Record<AvatarSlot, AvatarInventoryItem["category"][]> = {
  skin: ["skins"],
  hair: ["collectibles", "hair"],
  eyes: ["eyes"],
  accessory: ["accessories", "hats", "glasses", "jewelry", "headphones", "shoes"],
  outfit: ["outfits", "jackets", "clothing", "tops", "bottoms", "sets"],
  prop: ["props", "mic-skins", "stage-skins", "vfx"],
  background: ["backgrounds"],
  lighting: ["lighting", "lighting-packs"],
  emote: ["emotes", "dances", "gestures", "action-emotes"],
  instrument: ["instruments"],
  aura: ["auras"],
  entrance: ["entrances"],
};

export function isAvatarSlot(value: unknown): value is AvatarSlot {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SLOT_CATEGORY_ALLOWLIST, value);
}

/** Grant ownership of a catalog cosmetic — canonical CosmeticEntitlement persist path. */
export async function grantAvatarCosmetic(
  userId: string,
  item: AvatarInventoryItem,
): Promise<AvatarInventory> {
  const inventory = await getAvatarInventory(userId);
  const id = resolveItemId(item) || item.itemId;
  const existing = inventory.items.find((entry) => resolveItemId(entry) === id);
  if (existing) {
    const nextItems = inventory.items.map((entry) =>
      resolveItemId(entry) === id ? { ...entry, owned: true, updatedAt: Date.now() } : entry,
    );
    return saveAvatarInventory(userId, nextItems);
  }
  return saveAvatarInventory(userId, [
    { ...item, avatarId: userId, owned: true, equipped: item.equipped ?? false },
    ...inventory.items,
  ]);
}

function defaultProfile(userId: string): AvatarProfile {
  return {
    userId,
    displayName: "MC Charlie",
    skinTone: "#c0865e",
    hairStyle: "Fade",
    eyeStyle: "Neon Blue",
    updatedAt: nowIso(),
  };
}

function defaultLoadout(userId: string): AvatarLoadout {
  return {
    userId,
    slots: {
      skin: null,
      hair: null,
      eyes: "eye-neon-01",
      accessory: null,
      outfit: null,
      prop: null,
      background: null,
      lighting: null,
      emote: null,
      instrument: null,
      aura: null,
      entrance: null,
    },
    updatedAt: nowIso(),
  };
}

function defaultUnlockLedger(userId: string): AvatarUnlockLedger {
  return {
    userId,
    xp: 120,
    milestones: ["starter", "battle-RUBY"],
    lastUpdatedAt: nowIso(),
  };
}

function defaultNftRegistry(userId: string): AvatarNFTRegistry {
  return {
    userId,
    records: [],
  };
}

/** Test/ops helper — clears warm cache so the next read must hit Prisma (or defaults). */
export function clearAvatarPersistenceWarmCache(userId?: string): void {
  if (userId) {
    profileStore.delete(userId);
    loadoutStore.delete(userId);
    inventoryStore.delete(userId);
    nftRegistryStore.delete(userId);
    unlockLedgerStore.delete(userId);
    return;
  }
  profileStore.clear();
  loadoutStore.clear();
  inventoryStore.clear();
  nftRegistryStore.clear();
  unlockLedgerStore.clear();
}

export async function getAvatarProfile(userId: string): Promise<AvatarProfile> {
  const existing = profileStore.get(userId);
  if (existing) return existing;
  {
    const row = await prisma.avatarProfileRecord.findUnique({ where: { userId } });
    if (row) {
      const fromDb: AvatarProfile = {
        userId: row.userId,
        displayName: row.displayName,
        skinTone: row.skinTone,
        hairStyle: row.hairStyle,
        eyeStyle: row.eyeStyle,
        updatedAt: row.updatedAt.toISOString(),
      };
      profileStore.set(userId, fromDb);
      return fromDb;
    }
  }
  const created = defaultProfile(userId);
  profileStore.set(userId, created);
  return created;
}

function toInventoryItem(row: AvatarInventoryItemRecord): AvatarInventoryItem {
  return {
    itemId: row.itemId,
    id: row.itemId,
    avatarId: row.userId,
    type: (row.type ?? undefined) as AvatarInventoryItem["type"],
    category: (row.category ?? undefined) as AvatarInventoryItem["category"],
    name: row.name,
    rarity: row.rarity as AvatarInventoryItem["rarity"],
    owned: row.owned,
    equipped: row.equipped,
    mintable: row.mintable,
    tradeable: row.tradeable,
    sponsorLocked: row.sponsorLocked,
    tierLocked: row.tierLocked,
    unlockRequirement: row.unlockRequirement ?? undefined,
    xpRequired: row.xpRequired ?? undefined,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

/** Real DB-backed inventory. Seeds starter items on first access. */
export async function getAvatarInventory(userId: string): Promise<AvatarInventory> {
  {
    const rows = await prisma.avatarInventoryItemRecord.findMany({ where: { userId } });
    if (rows.length > 0) {
      const inv = { userId, items: rows.map(toInventoryItem), updatedAt: nowIso() };
      inventoryStore.set(userId, inv);
      return inv;
    }

    const starters = getStarterInventory();
    await prisma.avatarInventoryItemRecord.createMany({
      data: starters.map((item) => ({
        userId,
        itemId: item.itemId,
        type: item.type ?? null,
        category: item.category ?? null,
        name: item.name,
        rarity: item.rarity ?? "free",
        owned: item.owned ?? false,
        equipped: item.equipped,
        mintable: item.mintable ?? false,
        tradeable: item.tradeable ?? false,
        sponsorLocked: item.sponsorLocked ?? false,
        tierLocked: item.tierLocked ?? false,
        unlockRequirement: item.unlockRequirement ?? null,
        xpRequired: item.xpRequired ?? null,
        metadata: (item.metadata as object | undefined) ?? undefined,
      })),
      skipDuplicates: true,
    });
    const seeded = await prisma.avatarInventoryItemRecord.findMany({ where: { userId } });
    const inv = { userId, items: seeded.map(toInventoryItem), updatedAt: nowIso() };
    inventoryStore.set(userId, inv);
    return inv;
  }
}

function mergeLoadoutSlots(
  userId: string,
  slots: Partial<Record<AvatarSlot, string | null>> | Record<string, unknown>,
): Record<AvatarSlot, string | null> {
  const defaults = defaultLoadout(userId).slots;
  const next = { ...defaults };
  for (const key of Object.keys(defaults) as AvatarSlot[]) {
    if (key in slots) {
      const value = (slots as Record<string, unknown>)[key];
      next[key] = value === null || typeof value === "string" ? (value as string | null) : defaults[key];
    }
  }
  return next;
}

export async function getAvatarLoadout(userId: string): Promise<AvatarLoadout> {
  const existing = loadoutStore.get(userId);
  if (existing) {
    const merged: AvatarLoadout = {
      ...existing,
      slots: mergeLoadoutSlots(userId, existing.slots),
    };
    loadoutStore.set(userId, merged);
    return merged;
  }
  {
    const row = await prisma.avatarLoadoutRecord.findUnique({ where: { userId } });
    if (row) {
      const fromDb: AvatarLoadout = {
        userId: row.userId,
        slots: mergeLoadoutSlots(userId, (row.slots as Record<string, unknown>) ?? {}),
        updatedAt: row.updatedAt.toISOString(),
      };
      loadoutStore.set(userId, fromDb);
      return fromDb;
    }
  }
  const created = defaultLoadout(userId);
  loadoutStore.set(userId, created);
  return created;
}

export function getAvatarNFTRegistry(userId: string): AvatarNFTRegistry {
  const existing = nftRegistryStore.get(userId);
  if (existing) return existing;
  const created = defaultNftRegistry(userId);
  nftRegistryStore.set(userId, created);
  return created;
}

export function getAvatarUnlockLedger(userId: string): AvatarUnlockLedger {
  const existing = unlockLedgerStore.get(userId);
  if (existing) return existing;
  const created = defaultUnlockLedger(userId);
  unlockLedgerStore.set(userId, created);
  return created;
}

function resolveItemId(item: AvatarInventoryItem): string {
  return item.id ?? item.itemId ?? "";
}

export async function validateOwnership(userId: string, itemId: string): Promise<boolean> {
  const inventory = await getAvatarInventory(userId);
  return inventory.items.some((item) => resolveItemId(item) === itemId && item.owned !== false);
}

export async function validateEquipSlot(userId: string, slot: AvatarSlot, itemId: string): Promise<boolean> {
  const inventory = (await getAvatarInventory(userId)).items;
  const item = inventory.find((entry) => resolveItemId(entry) === itemId);
  if (!item) return false;
  const allowedCategories = SLOT_CATEGORY_ALLOWLIST[slot];
  return item.category ? allowedCategories.includes(item.category) : false;
}

export async function validateUnlockConditions(userId: string, itemId: string): Promise<boolean> {
  const inventory = (await getAvatarInventory(userId)).items;
  const item = inventory.find((entry) => resolveItemId(entry) === itemId);
  if (!item) return false;
  // Owned via points unlock / grant — entitlement already proven
  if (item.owned !== false && (item.unlockRequirement?.startsWith("points:") || item.unlockRequirement === "starter" || !item.unlockRequirement)) {
    return true;
  }
  const ledger = getAvatarUnlockLedger(userId);
  if ((item.xpRequired ?? 0) > ledger.xp) return false;
  if (item.unlockRequirement === "starter" || !item.unlockRequirement) return true;
  return ledger.milestones.includes(item.unlockRequirement);
}

export async function validateNFTMintEligibility(userId: string): Promise<boolean> {
  const inventory = (await getAvatarInventory(userId)).items;
  const equippedMintable = inventory.filter((item) => item.equipped && item.mintable);
  return equippedMintable.length > 0;
}

export async function saveAvatarProfile(
  userId: string,
  patch: Partial<Pick<AvatarProfile, "displayName" | "skinTone" | "hairStyle" | "eyeStyle">>,
): Promise<AvatarProfile> {
  const result = await saveAvatarChanges(userId, { profile: patch });
  return result.profile!;
}

export async function saveAvatarChanges(
  userId: string,
  changes: {
    profile?: Partial<Pick<AvatarProfile, "displayName" | "skinTone" | "hairStyle" | "eyeStyle">>;
    loadout?: Partial<Record<AvatarSlot, string | null>>;
  },
): Promise<{ profile?: AvatarProfile; loadout?: AvatarLoadout }> {
  const currentProfile = changes.profile ? await getAvatarProfile(userId) : undefined;
  const currentLoadout = changes.loadout ? await getAvatarLoadout(userId) : undefined;
  const profile = currentProfile && { ...currentProfile, ...changes.profile, updatedAt: nowIso() };
  const loadout = currentLoadout && {
    ...currentLoadout,
    slots: { ...currentLoadout.slots, ...changes.loadout },
    updatedAt: nowIso(),
  };
  await prisma.$transaction(async (tx) => {
    if (profile) {
      const { displayName, skinTone, hairStyle, eyeStyle } = profile;
      const data = { displayName, skinTone, hairStyle, eyeStyle };
      await tx.avatarProfileRecord.upsert({ where: { userId }, create: { userId, ...data }, update: data });
    }
    if (loadout) {
      await tx.avatarLoadoutRecord.upsert({
        where: { userId },
        create: { userId, slots: loadout.slots },
        update: { slots: loadout.slots },
      });
    }
  });
  if (profile) profileStore.set(userId, profile);
  if (loadout) loadoutStore.set(userId, loadout);
  return { profile, loadout };
}

/** Replaces the user's full item set (matches prior Map.set replace-all semantics). */
export async function saveAvatarInventory(userId: string, items: AvatarInventoryItem[]): Promise<AvatarInventory> {
  const updated: AvatarInventory = { userId, items, updatedAt: nowIso() };
  // Durable Prisma write is authoritative. Never report success from warm cache alone.
  await prisma.$transaction([
    prisma.avatarInventoryItemRecord.deleteMany({ where: { userId } }),
    prisma.avatarInventoryItemRecord.createMany({
      data: items.map((item) => ({
        userId,
        itemId: resolveItemId(item) || item.itemId,
        type: item.type ?? null,
        category: item.category ?? null,
        name: item.name,
        rarity: item.rarity ?? "free",
        owned: item.owned ?? false,
        equipped: item.equipped,
        mintable: item.mintable ?? false,
        tradeable: item.tradeable ?? false,
        sponsorLocked: item.sponsorLocked ?? false,
        tierLocked: item.tierLocked ?? false,
        unlockRequirement: item.unlockRequirement ?? null,
        xpRequired: item.xpRequired ?? null,
        metadata: (item.metadata as object | undefined) ?? undefined,
      })),
      skipDuplicates: true,
    }),
  ]);
  inventoryStore.set(userId, updated);
  return updated;
}

export async function equipAvatarItem(userId: string, itemId: string, slot: AvatarSlot): Promise<AvatarLoadout> {
  if (!(await validateOwnership(userId, itemId))) {
    throw new Error("ownership_validation_failed");
  }
  if (!(await validateUnlockConditions(userId, itemId))) {
    throw new Error("unlock_validation_failed");
  }
  if (!(await validateEquipSlot(userId, slot, itemId))) {
    throw new Error("slot_validation_failed");
  }

  const inventory = await getAvatarInventory(userId);
  const nextItems = inventory.items.map((item) => {
    const isCandidate = resolveItemId(item) === itemId;
    const isSameSlotCategory = item.category ? SLOT_CATEGORY_ALLOWLIST[slot].includes(item.category) : false;
    if (isCandidate) return { ...item, equipped: true };
    if (isSameSlotCategory) return { ...item, equipped: false };
    return item;
  });
  const current = await getAvatarLoadout(userId);
  const loadout = { ...current, slots: { ...current.slots, [slot]: itemId }, updatedAt: nowIso() };
  await prisma.$transaction(async (tx) => {
    for (const item of nextItems) {
      const result = await tx.avatarInventoryItemRecord.updateMany({
        where: { userId, itemId: resolveItemId(item) },
        data: { equipped: item.equipped },
      });
      if (result.count !== 1) throw new Error("avatar_inventory_changed");
    }
    await tx.avatarLoadoutRecord.upsert({
      where: { userId },
      create: { userId, slots: loadout.slots },
      update: { slots: loadout.slots },
    });
  });
  inventoryStore.set(userId, { userId, items: nextItems, updatedAt: nowIso() });
  loadoutStore.set(userId, loadout);
  return loadout;
}

export async function saveAvatarLoadout(
  userId: string,
  slotsPatch: Partial<Record<AvatarSlot, string | null>>,
): Promise<AvatarLoadout> {
  const result = await saveAvatarChanges(userId, { loadout: slotsPatch });
  return result.loadout!;
}

export async function mintAvatarForUser(userId: string, displayName: string): Promise<AvatarNFTRecord> {
  if (!(await validateNFTMintEligibility(userId))) {
    throw new Error("nft_eligibility_failed");
  }

  const equippedItems = (await getAvatarInventory(userId)).items.filter((item) => item.equipped);
  const draft = buildAvatarNFTDraft(displayName, equippedItems);
  const mintResult = mintAvatarNFT(draft);
  const record: AvatarNFTRecord = {
    tokenId: mintResult.tokenId,
    txHash: mintResult.txHash,
    mintedAt: nowIso(),
    userId,
    rarityScore: draft.rarityScore,
  };
  const registry = getAvatarNFTRegistry(userId);
  const nextRegistry: AvatarNFTRegistry = {
    ...registry,
    records: [record, ...registry.records],
  };
  nftRegistryStore.set(userId, nextRegistry);
  return record;
}

export async function getAvatarPersistenceSnapshot(userId: string) {
  const [AvatarProfile, AvatarInventory, AvatarLoadout] = await Promise.all([
    getAvatarProfile(userId),
    getAvatarInventory(userId),
    getAvatarLoadout(userId),
  ]);
  return {
    AvatarProfile,
    AvatarInventory,
    AvatarLoadout,
    AvatarNFTRegistry: getAvatarNFTRegistry(userId),
    AvatarUnlockLedger: getAvatarUnlockLedger(userId),
  };
}
