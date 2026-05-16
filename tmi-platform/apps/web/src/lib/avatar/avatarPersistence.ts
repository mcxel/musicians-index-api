import { getStarterInventory, type AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";
import { buildAvatarNFTDraft, mintAvatarNFT } from "@/lib/avatar/avatarNFTEngine";

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
const inventoryStore = new Map<string, AvatarInventory>();
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

function defaultInventory(userId: string): AvatarInventory {
  return {
    userId,
    items: getStarterInventory(),
    updatedAt: nowIso(),
  };
}

function defaultUnlockLedger(userId: string): AvatarUnlockLedger {
  return {
    userId,
    xp: 120,
    milestones: ["starter", "battle-bronze"],
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

export function getAvatarInventory(userId: string): AvatarInventory {
  const existing = inventoryStore.get(userId);
  if (existing) return existing;
  const created = defaultInventory(userId);
  inventoryStore.set(userId, created);
  return created;
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

export function validateOwnership(userId: string, itemId: string): boolean {
  return getAvatarInventory(userId).items.some((item) => resolveItemId(item) === itemId && item.owned !== false);
}

export function validateEquipSlot(userId: string, slot: AvatarSlot, itemId: string): boolean {
  const inventory = getAvatarInventory(userId).items;
  const item = inventory.find((entry) => resolveItemId(entry) === itemId);
  if (!item) return false;
  const allowedCategories = SLOT_CATEGORY_ALLOWLIST[slot];
  return item.category ? allowedCategories.includes(item.category) : false;
}

export function validateUnlockConditions(userId: string, itemId: string): boolean {
  const inventory = getAvatarInventory(userId).items;
  const item = inventory.find((entry) => resolveItemId(entry) === itemId);
  if (!item) return false;
  const ledger = getAvatarUnlockLedger(userId);
  if ((item.xpRequired ?? 0) > ledger.xp) return false;
  if (item.unlockRequirement === "starter" || !item.unlockRequirement) return true;
  return ledger.milestones.includes(item.unlockRequirement);
}

export function validateNFTMintEligibility(userId: string): boolean {
  const inventory = getAvatarInventory(userId).items;
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

export function saveAvatarInventory(userId: string, items: AvatarInventoryItem[]): AvatarInventory {
  const next: AvatarInventory = {
    userId,
    items,
    updatedAt: nowIso(),
  };
  inventoryStore.set(userId, next);
  return next;
}

export function equipAvatarItem(userId: string, itemId: string, slot: AvatarSlot): AvatarLoadout {
  if (!validateOwnership(userId, itemId)) {
    throw new Error("ownership_validation_failed");
  }
  if (!validateUnlockConditions(userId, itemId)) {
    throw new Error("unlock_validation_failed");
  }
  if (!validateEquipSlot(userId, slot, itemId)) {
    throw new Error("slot_validation_failed");
  }

  const inventory = getAvatarInventory(userId);
  const nextItems = inventory.items.map((item) => {
    const isCandidate = resolveItemId(item) === itemId;
    const isSameSlotCategory = item.category ? SLOT_CATEGORY_ALLOWLIST[slot].includes(item.category) : false;
    if (isCandidate) return { ...item, equipped: true };
    if (isSameSlotCategory) return { ...item, equipped: false };
    return item;
  });
  saveAvatarInventory(userId, nextItems);

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

export function mintAvatarForUser(userId: string, displayName: string): AvatarNFTRecord {
  if (!validateNFTMintEligibility(userId)) {
    throw new Error("nft_eligibility_failed");
  }

  const equippedItems = getAvatarInventory(userId).items.filter((item) => item.equipped);
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

export function getAvatarPersistenceSnapshot(userId: string) {
  return {
    AvatarProfile: getAvatarProfile(userId),
    AvatarInventory: getAvatarInventory(userId),
    AvatarLoadout: getAvatarLoadout(userId),
    AvatarNFTRegistry: getAvatarNFTRegistry(userId),
    AvatarUnlockLedger: getAvatarUnlockLedger(userId),
  };
}
