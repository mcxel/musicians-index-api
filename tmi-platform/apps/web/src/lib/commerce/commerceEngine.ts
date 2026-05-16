export type CommerceCategory =
  | "beats"
  | "instrumentals"
  | "nfts"
  | "merch"
  | "prizes"
  | "giveaways"
  | "bundles";

export type CommerceItem = {
  id: string;
  name: string;
  category: CommerceCategory;
  price: number;
  stock: number;
  creatorId: string;
  venueId: string;
  sponsorId: string;
};

export type CommerceCheckout = {
  checkoutId: string;
  items: CommerceItem[];
  subtotal: number;
  creatorRoyalty: number;
  sponsorSplit: number;
  venueCut: number;
  platformNet: number;
  payoutSplits: {
    creatorRoyaltyPct: number;
    sponsorSplitPct: number;
    venueCutPct: number;
  };
};

const catalog: CommerceItem[] = [
  { id: "beat-1", name: "Midnight Crown", category: "beats", price: 25, stock: 120, creatorId: "creator-a", venueId: "test-venue", sponsorId: "s1" },
  { id: "inst-1", name: "Neon Drumline", category: "instrumentals", price: 19, stock: 80, creatorId: "creator-b", venueId: "test-venue", sponsorId: "s2" },
  { id: "nft-1", name: "Mic Relic NFT", category: "nfts", price: 45, stock: 40, creatorId: "creator-c", venueId: "test-venue", sponsorId: "s1" },
  { id: "merch-1", name: "TMI Arena Hoodie", category: "merch", price: 65, stock: 35, creatorId: "creator-a", venueId: "test-venue", sponsorId: "s3" },
  { id: "prize-1", name: "Contest Power Pack", category: "prizes", price: 35, stock: 24, creatorId: "creator-d", venueId: "test-venue", sponsorId: "s4" },
  { id: "give-1", name: "Sponsor Gift Crate", category: "giveaways", price: 15, stock: 60, creatorId: "creator-e", venueId: "test-venue", sponsorId: "s2" },
  { id: "bundle-1", name: "Battle Ready Bundle", category: "bundles", price: 99, stock: 18, creatorId: "creator-a", venueId: "test-venue", sponsorId: "s1" },
];

export function listCommerceItems(category?: CommerceCategory): CommerceItem[] {
  if (!category) return catalog;
  return catalog.filter((item) => item.category === category);
}

export function syncInventory(itemId: string, qty: number): CommerceItem | null {
  const item = catalog.find((entry) => entry.id === itemId);
  if (!item) return null;
  item.stock = Math.max(0, item.stock - qty);
  return item;
}

export function checkout(items: Array<{ itemId: string; qty: number }>): CommerceCheckout {
  const selected: CommerceItem[] = [];
  for (const item of items) {
    const found = catalog.find((entry) => entry.id === item.itemId);
    if (!found) continue;
    if (found.stock < item.qty) throw new Error(`insufficient_stock:${found.id}`);
    for (let i = 0; i < item.qty; i += 1) selected.push(found);
  }

  const subtotal = selected.reduce((sum, item) => sum + item.price, 0);
  const creatorRoyalty = subtotal * 0.2;
  const sponsorSplit = subtotal * 0.1;
  const venueCut = subtotal * 0.25;
  const platformNet = subtotal - creatorRoyalty - sponsorSplit - venueCut;

  for (const item of items) {
    syncInventory(item.itemId, item.qty);
  }

  return {
    checkoutId: `chk-${Math.floor(Math.random() * 900000 + 100000)}`,
    items: selected,
    subtotal,
    creatorRoyalty,
    sponsorSplit,
    venueCut,
    platformNet,
    payoutSplits: {
      creatorRoyaltyPct: 20,
      sponsorSplitPct: 10,
      venueCutPct: 25,
    },
  };
}
