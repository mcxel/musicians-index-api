import type { AvatarInventoryItem } from "@/lib/avatar/avatarInventoryEngine";

export type AvatarNFTDraft = {
  tokenName: string;
  tokenDescription: string;
  imageHint: string;
  equippedItemIds: string[];
  mintableItemIds: string[];
  rarityScore: number;
};

export type AvatarMintResult = {
  tokenId: string;
  txHash: string;
  status: "queued" | "minted";
  createdAt: string;
};

export function buildAvatarNFTDraft(
  displayName: string,
  equippedItems: AvatarInventoryItem[],
): AvatarNFTDraft {
  const mintable = equippedItems.filter((item) => item.mintable);
  const rarityWeight = equippedItems.reduce((score, item) => {
    if (item.rarity === "legendary") return score + 4;
    if (item.rarity === "epic") return score + 3;
    if (item.rarity === "rare") return score + 2;
    return score + 1;
  }, 0);

  return {
    tokenName: `${displayName} Stage Avatar`,
    tokenDescription: "TMI Avatar Forge generated collectible linked to profile loadout.",
    imageHint: "avatar-preview-capture://latest",
    equippedItemIds: equippedItems.map((item) => item.id ?? item.itemId ?? ""),
    mintableItemIds: mintable.map((item) => item.id ?? item.itemId ?? ""),
    rarityScore: rarityWeight,
  };
}

export function mintAvatarNFT(draft: AvatarNFTDraft): AvatarMintResult {
  const id = Math.floor(Math.random() * 900000 + 100000).toString();
  const hashSeed = `${draft.tokenName}-${draft.rarityScore}-${Date.now()}`;
  let hash = 0;
  for (let index = 0; index < hashSeed.length; index += 1) {
    hash = (hash * 31 + hashSeed.charCodeAt(index)) >>> 0;
  }
  return {
    tokenId: `tmi-avatar-${id}`,
    txHash: `0x${hash.toString(16).padStart(32, "0")}`,
    status: "queued",
    createdAt: new Date().toISOString(),
  };
}
