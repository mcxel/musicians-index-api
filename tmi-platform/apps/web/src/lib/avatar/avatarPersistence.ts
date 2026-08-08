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
  | "lighting";

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

const profileStore = new Map<string, AvatarProfile>();
const loadoutStore = new Map<string, AvatarLoadout>();
const nftRegistryStore = new Map<string, AvatarNFTRegistry>();
const unlockLedgerStore = new Map<string, AvatarUnlockLedger>();

function nowIso(): string {
  return new Date().toISOString();
}

const SLOT_CATEGORY_ALLOWLIST: Record<AvatarSlot, AvatarInventoryItem["category"][]> = {
  skin: ["skins"],
  hair: ["collectibles"],
  eyes: ["eyes"],
  accessory: ["accessories", "hats", "glasses", "jewelry"],
  outfit: ["outfits", "jackets"],
  prop: ["props", "mic-skins", "stage-skins"],
  background: ["backgrounds"],
  lighting: ["lighting", "lighting-packs"],
};

/** Grant ownership of a catalog cosmetic (points unlock / Flex bridge). */
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

export function getAvatarProfile(userId: string): AvatarProfile {
  const existing = profileStore.get(userId);
  if (existing) return existing;
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

/** Real DB-backed inventory (Rule 20 — was a serverless-unsafe in-memory Map). Seeds starter items on first access. */
export async function getAvatarInventory(userId: string): Promise<AvatarInventory> {
  const rows = await prisma.avatarInventoryItemRecord.findMany({ where: { userId } });
  if (rows.length > 0) {
    return { userId, items: rows.map(toInventoryItem), updatedAt: nowIso() };
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
  return { userId, items: seeded.map(toInventoryItem), updatedAt: nowIso() };
}

export function getAvatarLoadout(userId: string): AvatarLoadout {
  const existing = loadoutStore.get(userId);
  if (existing) return existing;
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

export function saveAvatarProfile(
  userId: string,
  patch: Partial<Pick<AvatarProfile, "displayName" | "skinTone" | "hairStyle" | "eyeStyle">>,
): AvatarProfile {
  const current = getAvatarProfile(userId);
  const next: AvatarProfile = {
    ...current,
    ...patch,
    updatedAt: nowIso(),
  };
  profileStore.set(userId, next);
  return next;
}

/** Replaces the user's full item set (matches prior Map.set replace-all semantics). */
export async function saveAvatarInventory(userId: string, items: AvatarInventoryItem[]): Promise<AvatarInventory> {
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
  return { userId, items, updatedAt: nowIso() };
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
  await saveAvatarInventory(userId, nextItems);

  const currentLoadout = getAvatarLoadout(userId);
  const nextLoadout: AvatarLoadout = {
    ...currentLoadout,
    slots: {
      ...currentLoadout.slots,
      [slot]: itemId,
    },
    updatedAt: nowIso(),
  };
  loadoutStore.set(userId, nextLoadout);
  return nextLoadout;
}

export function saveAvatarLoadout(userId: string, slotsPatch: Partial<Record<AvatarSlot, string | null>>): AvatarLoadout {
  const current = getAvatarLoadout(userId);
  const next: AvatarLoadout = {
    ...current,
    slots: {
      ...current.slots,
      ...slotsPatch,
    },
    updatedAt: nowIso(),
  };
  loadoutStore.set(userId, next);
  return next;
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
  return {
    AvatarProfile: getAvatarProfile(userId),
    AvatarInventory: await getAvatarInventory(userId),
    AvatarLoadout: getAvatarLoadout(userId),
    AvatarNFTRegistry: getAvatarNFTRegistry(userId),
    AvatarUnlockLedger: getAvatarUnlockLedger(userId),
  };
}
