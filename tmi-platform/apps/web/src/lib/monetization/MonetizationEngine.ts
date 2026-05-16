/**
 * TMI Monetization Engine
 * Central registry for all purchase action types and their routing.
 * Connects subscriptions, tip jars, ticket sales, NFT purchases, and merch checkout.
 */

export type MonetizationAction =
  | "subscribe"
  | "tip"
  | "ticket"
  | "nft"
  | "merch"
  | "beat"
  | "season-pass"
  | "gift";

export interface MonetizationTarget {
  artistSlug?: string;
  eventId?: string;
  battleId?: string;
  itemId?: string;
}

export interface MonetizationOption {
  action: MonetizationAction;
  label: string;
  description: string;
  accent: string;
  route: (target: MonetizationTarget) => string;
  available: (target: MonetizationTarget) => boolean;
}

const OPTIONS: MonetizationOption[] = [
  {
    action: "subscribe",
    label: "Subscribe",
    description: "Unlock full access + supporter badge",
    accent: "#00FFFF",
    route: ({ artistSlug }) =>
      artistSlug ? `/subscriptions?artist=${artistSlug}` : "/subscriptions",
    available: () => true,
  },
  {
    action: "tip",
    label: "Send Tip",
    description: "100% goes to the artist",
    accent: "#FF2DAA",
    route: ({ artistSlug }) =>
      artistSlug ? `/tip/${artistSlug}` : "/tip",
    available: ({ artistSlug }) => !!artistSlug,
  },
  {
    action: "ticket",
    label: "Get Tickets",
    description: "Live events and battle seats",
    accent: "#FFD700",
    route: ({ eventId, battleId }) =>
      eventId
        ? `/tickets/${eventId}`
        : battleId
        ? `/tickets?battle=${battleId}`
        : "/tickets",
    available: () => true,
  },
  {
    action: "nft",
    label: "NFT Drop",
    description: "Exclusive digital collectibles",
    accent: "#AA2DFF",
    route: ({ artistSlug, itemId }) =>
      itemId
        ? `/nft-marketplace/${itemId}`
        : artistSlug
        ? `/nft-marketplace?artist=${artistSlug}`
        : "/nft-marketplace",
    available: () => true,
  },
  {
    action: "merch",
    label: "Merch",
    description: "Official store drops",
    accent: "#FF6B35",
    route: ({ artistSlug }) =>
      artistSlug ? `/shop?artist=${artistSlug}` : "/shop",
    available: () => true,
  },
  {
    action: "beat",
    label: "Buy Beat",
    description: "License beats and instrumentals",
    accent: "#00FF88",
    route: ({ artistSlug }) =>
      artistSlug ? `/beats?producer=${artistSlug}` : "/beats",
    available: () => true,
  },
  {
    action: "season-pass",
    label: "Season Pass",
    description: "Season-long unlock bundle",
    accent: "#FFD700",
    route: () => "/season-pass",
    available: () => true,
  },
  {
    action: "gift",
    label: "Send Gift",
    description: "Live reaction gifts and emotes",
    accent: "#FF2DAA",
    route: ({ artistSlug }) =>
      artistSlug ? `/gift?to=${artistSlug}` : "/gift",
    available: ({ artistSlug }) => !!artistSlug,
  },
];

/**
 * Returns monetization options filtered by which are available for this target.
 * Pass `actions` to restrict to a specific subset.
 */
export function getMonetizationOptions(
  target: MonetizationTarget,
  actions?: MonetizationAction[]
): Array<MonetizationOption & { href: string }> {
  return OPTIONS.filter(
    (opt) =>
      opt.available(target) &&
      (!actions || actions.includes(opt.action))
  ).map((opt) => ({
    ...opt,
    href: opt.route(target),
  }));
}

/** Quick builder — resolve a single action href for a given target */
export function monetizationHref(
  action: MonetizationAction,
  target: MonetizationTarget
): string {
  const opt = OPTIONS.find((o) => o.action === action);
  return opt ? opt.route(target) : "/";
}
