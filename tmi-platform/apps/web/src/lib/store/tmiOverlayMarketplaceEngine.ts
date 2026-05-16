export type TmiOverlayCategory =
  | "profile"
  | "video"
  | "venue"
  | "magazine"
  | "billboard"
  | "game"
  | "seat"
  | "reaction"
  | "transition"
  | "starfield-burst"
  | "mirror-light"
  | "sponsor-badge"
  | "cypher-battle"
  | "homepage-issue"
  | "lobby-wall";

export type TmiOverlayRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "seasonal"
  | "founder"
  | "sponsor-exclusive"
  | "event-winner"
  | "diamond-only";

export type TmiOverlayMarketplaceItem = {
  id: string;
  title: string;
  category: TmiOverlayCategory;
  rarity: TmiOverlayRarity;
  priceCoins: number;
  route: string;
  backRoute: string;
  state: "active" | "locked";
  lockReason?: string;
};

const MARKET_ITEMS: TmiOverlayMarketplaceItem[] = [
  {
    id: "ovr-profile-neon-v1",
    title: "Neon Profile Halo",
    category: "profile",
    rarity: "common",
    priceCoins: 250,
    route: "/store/overlays/ovr-profile-neon-v1",
    backRoute: "/store/overlays",
    state: "active",
  },
  {
    id: "ovr-homepage-starburst-legend",
    title: "Homepage Starburst Legend Pack",
    category: "transition",
    rarity: "legendary",
    priceCoins: 4800,
    route: "/store/overlays/ovr-homepage-starburst-legend",
    backRoute: "/store/overlays",
    state: "locked",
    lockReason: "PAYMENT_LOCKED_UNTIL_PROVIDER_READY",
  },
];

export function listOverlayMarketplaceItems(): TmiOverlayMarketplaceItem[] {
  return MARKET_ITEMS;
}

export function getOverlayMarketplaceItem(id: string): TmiOverlayMarketplaceItem | undefined {
  return MARKET_ITEMS.find((row) => row.id === id);
}
