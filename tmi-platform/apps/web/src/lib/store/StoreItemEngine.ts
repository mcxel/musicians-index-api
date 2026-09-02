/**
 * StoreItemEngine — unified product catalog for all TMI stores.
 * Items map directly to STRIPE_PRODUCTS price IDs (lib/stripe/products.ts) —
 * the single canonical Stripe registry (Lane D, 2026-09-01). No item here may
 * carry a priceId that isn't real or isn't a registered STRIPE_PRODUCTS entry.
 * Revenue splits per REVENUE_SPLITS in lib/stripe/products.ts.
 */

import { getSubscriptionProduct, STRIPE_PRODUCTS } from '@/lib/stripe/products';

export type StoreCategory =
  | 'creator' | 'fan' | 'venue' | 'lobby'
  | 'beats' | 'boosts' | 'tickets' | 'merch'
  | 'nft' | 'experience' | 'avatar' | 'emote'
  | 'shoutout' | 'subscription';

export type StoreItem = {
  id: string;
  name: string;
  description: string;
  price: number;        // cents
  priceId: string;
  icon: string;
  category: StoreCategory;
  badge?: string;       // "NEW" | "HOT" | "LIMITED" | "LAUNCH"
  creatorSplit?: number; // 0–1 fraction going to creator
  mode: 'payment' | 'subscription';
  launchOnly?: boolean;
};

// ─── Creator / Performer Store ─────────────────────────────────────────────
// Rule 17: performer-facing UI must never carry ticket creation/allocation/
// selling affordances — a generic "buy an event ticket" item does not belong
// in the Creator store. (Formerly ticket-standard/ticket-vip here — removed.)
//
// Shoutout ($15) and Meet & Greet ($25) removed (Lane D, 2026-09-01): both
// hardcoded a "price_1..."-shaped Stripe ID as if verified real. A direct
// Stripe API lookup against both the configured test-mode and live-mode
// secret keys returned "No such price" for both — neither is a real,
// reachable Stripe object. Per instruction, hidden rather than replaced with
// an invented ID. The real, artist-set-priced equivalent already exists via
// ArtistCommerceProduct + /api/commerce/checkout (live at /store/creator's
// CreateProductPanel/StoreCanister) — products.ts's own SHOUTOUT/MEET_GREET
// entries are explicitly marked legacy/do-not-use for exactly this reason.
const PERFORMER_PRO = getSubscriptionProduct('performer', 'PRO');

export const CREATOR_ITEMS: StoreItem[] = [
  { id: 'beat-license',      name: 'Beat License',             description: 'Full license to use this beat commercially',         price: STRIPE_PRODUCTS.BEAT_LICENSE.price,     priceId: STRIPE_PRODUCTS.BEAT_LICENSE.priceId,     icon: '🎹', category: 'beats',         creatorSplit: 0.75, mode: 'payment', badge: 'HOT' },
  { id: 'artist-boost',      name: 'Artist Discovery Boost',   description: 'Get featured in discovery for 7 days',               price: STRIPE_PRODUCTS.ARTIST_BOOST.price,     priceId: STRIPE_PRODUCTS.ARTIST_BOOST.priceId,     icon: '🚀', category: 'boosts',        creatorSplit: 0,    mode: 'payment', badge: 'LAUNCH' },
  { id: 'artist-spotlight',  name: 'Homepage Spotlight',       description: 'Featured on the TMI homepage for 24 hours',          price: STRIPE_PRODUCTS.ARTIST_SPOTLIGHT.price, priceId: STRIPE_PRODUCTS.ARTIST_SPOTLIGHT.priceId, icon: '⭐', category: 'boosts',        creatorSplit: 0,    mode: 'payment' },
  { id: 'nft-mint',          name: 'NFT Mint',                 description: 'Mint your track or art as an NFT on TMI',            price: STRIPE_PRODUCTS.NFT_MINT_FEE.price,     priceId: STRIPE_PRODUCTS.NFT_MINT_FEE.priceId,     icon: '💎', category: 'nft',           creatorSplit: 0.90, mode: 'payment', badge: 'NEW' },
  // Sourced live from the Lane A canonical subscription registry — never a
  // second hardcoded performer-subscription price (was a fake $14.99/mo that
  // conflicted with the certified $2.99/mo Performer Pro).
  { id: 'artist-pro',        name: PERFORMER_PRO.name,         description: PERFORMER_PRO.features.slice(0, 3).join(' · '),      price: PERFORMER_PRO.price, priceId: PERFORMER_PRO.priceId, icon: '🎤', category: 'subscription', creatorSplit: 0, mode: 'subscription', badge: 'HOT' },
];

// ─── Fan Identity / Experience Store ──────────────────────────────────────
const FAN_PRO = getSubscriptionProduct('fan', 'PRO');
const SEASON_PASSES: StoreItem[] = (
  ['SEASON_PASS_STARTER', 'SEASON_PASS_PLUS', 'SEASON_PASS_FAN', 'SEASON_PASS_ARTIST', 'SEASON_PASS_BUNDLE', 'SEASON_PASS_VIP'] as const
).map((key) => {
  const p = STRIPE_PRODUCTS[key];
  return {
    id: `season-pass-${key.replace('SEASON_PASS_', '').toLowerCase()}`,
    name: p.name,
    description: 'All season events, exclusive drops, champion eligibility',
    price: p.price,
    priceId: p.priceId,
    icon: '🎫',
    category: 'tickets' as const,
    creatorSplit: 0,
    mode: 'payment' as const,
    // "Fan Season Pass" ($9.99) matches the certified Lane A A6 tier
    badge: key === 'SEASON_PASS_FAN' ? 'LIMITED' : undefined,
  };
});

export const FAN_ITEMS: StoreItem[] = [
  { id: 'tip-small',         name: 'Tip $1',                   description: 'Send a quick tip to your favorite artist',           price: STRIPE_PRODUCTS.TIP_SMALL.price,  priceId: STRIPE_PRODUCTS.TIP_SMALL.priceId,  icon: '💸', category: 'experience',    creatorSplit: 0.90, mode: 'payment' },
  { id: 'tip-medium',        name: 'Tip $5',                   description: 'Show real support',                                  price: STRIPE_PRODUCTS.TIP_MEDIUM.price, priceId: STRIPE_PRODUCTS.TIP_MEDIUM.priceId, icon: '💵', category: 'experience',    creatorSplit: 0.90, mode: 'payment', badge: 'HOT' },
  { id: 'tip-large',         name: 'Tip $10',                  description: 'Go big for your artist',                             price: STRIPE_PRODUCTS.TIP_LARGE.price,  priceId: STRIPE_PRODUCTS.TIP_LARGE.priceId,  icon: '💰', category: 'experience',    creatorSplit: 0.90, mode: 'payment' },
  { id: 'tip-xl',            name: 'Tip $25',                  description: 'You\'re a real one',                                 price: STRIPE_PRODUCTS.TIP_XL.price,     priceId: STRIPE_PRODUCTS.TIP_XL.priceId,     icon: '🏆', category: 'experience',    creatorSplit: 0.90, mode: 'payment', badge: 'LIMITED' },
  { id: 'fan-club-RUBY',     name: 'Fan Club Ruby',            description: 'Monthly fan club membership — Ruby',                 price: STRIPE_PRODUCTS.FAN_CLUB_RUBY_MONTHLY.price,   priceId: STRIPE_PRODUCTS.FAN_CLUB_RUBY_MONTHLY.priceId,   icon: '🔺', category: 'subscription',  creatorSplit: 0.80, mode: 'subscription' },
  { id: 'fan-club-silver',   name: 'Fan Club Silver',          description: 'Silver fan club — exclusive content access',        price: STRIPE_PRODUCTS.FAN_CLUB_SILVER_MONTHLY.price, priceId: STRIPE_PRODUCTS.FAN_CLUB_SILVER_MONTHLY.priceId, icon: '🥈', category: 'subscription',  creatorSplit: 0.80, mode: 'subscription', badge: 'HOT' },
  { id: 'fan-club-gold',     name: 'Fan Club Gold',            description: 'Gold fan club — VIP access + bonus XP',             price: STRIPE_PRODUCTS.FAN_CLUB_GOLD_MONTHLY.price,   priceId: STRIPE_PRODUCTS.FAN_CLUB_GOLD_MONTHLY.priceId,   icon: '🥇', category: 'subscription',  creatorSplit: 0.80, mode: 'subscription' },
  // Sourced live from the Lane A canonical subscription registry — the full
  // Fan tier ladder (RUBY→DIAMOND) lives at /subscribe; this is only the
  // entry-tier upsell card so the Fan Store never carries a second, driftable
  // copy of subscription pricing (was two fake/conflicting SKUs: a $9.99
  // "TMI Pro Membership" and a $19.99 "TMI VIP Membership", neither real).
  { id: 'member-pro',        name: FAN_PRO.name,               description: FAN_PRO.features.slice(0, 3).join(' · '),            price: FAN_PRO.price,     priceId: FAN_PRO.priceId,                    icon: '⚡', category: 'subscription',  creatorSplit: 0,    mode: 'subscription', badge: 'LAUNCH' },
  ...SEASON_PASSES,
];

// ─── Venue Store (Performer Stages) ────────────────────────────────────────
// NOTE: a second, more sophisticated venue-skin commerce system exists at
// VenueSkinCommerce.ts / VENUE_SKINS (/store/venue-skins) — flagged for a
// Marcel convergence decision, not merged here (see products.ts comment).
export const VENUE_ITEMS: StoreItem[] = [
  { id: 'venue-club',        name: 'Underground Club',         description: 'Dark, intimate neon-lit venue for ciphers and battles', price: STRIPE_PRODUCTS.VENUE_UNDERGROUND_CLUB.price, priceId: STRIPE_PRODUCTS.VENUE_UNDERGROUND_CLUB.priceId, icon: '🏚️', category: 'venue', mode: 'payment', badge: 'LAUNCH' },
  { id: 'venue-theater',     name: 'Digital Theater',          description: 'Full stage with curtains — perfect for showcases',   price: STRIPE_PRODUCTS.VENUE_DIGITAL_THEATER.price,  priceId: STRIPE_PRODUCTS.VENUE_DIGITAL_THEATER.priceId,  icon: '🎭', category: 'venue', mode: 'payment' },
  { id: 'venue-arena',       name: 'TMI Arena',                description: 'Massive arena for championship events and battles',   price: STRIPE_PRODUCTS.VENUE_TMI_ARENA.price,        priceId: STRIPE_PRODUCTS.VENUE_TMI_ARENA.priceId,        icon: '🏟️', category: 'venue', mode: 'payment', badge: 'HOT' },
  { id: 'venue-outdoor',     name: 'Outdoor Stage',            description: 'Open-air festival stage with crowd simulation',      price: STRIPE_PRODUCTS.VENUE_OUTDOOR_STAGE.price,     priceId: STRIPE_PRODUCTS.VENUE_OUTDOOR_STAGE.priceId,     icon: '🌆', category: 'venue', mode: 'payment' },
  { id: 'venue-cypher',      name: 'Cipher Pit',               description: 'Underground energy — raw, circular, electric',       price: STRIPE_PRODUCTS.VENUE_CIPHER_PIT.price,        priceId: STRIPE_PRODUCTS.VENUE_CIPHER_PIT.priceId,        icon: '🔥', category: 'venue', mode: 'payment', badge: 'LAUNCH' },
];

// ─── Lobby Skins (Fan Environments) ────────────────────────────────────────
// Ids/prices are canon per FanLobbySkinRegistry.ts's FAN_LOBBY_SKIN_CANON —
// that file is the visual/product vocabulary, this is the commerce layer.
export const LOBBY_ITEMS: StoreItem[] = [
  { id: 'lobby-neon',        name: 'Neon Lounge',              description: 'Electric purple and cyan — the default flex',        price: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_NEON.price,        priceId: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_NEON.priceId,        icon: '💡', category: 'lobby', mode: 'payment', badge: 'HOT' },
  { id: 'lobby-cinema',      name: 'Movie Theater',            description: 'Big screen energy — feel the premiere',              price: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_CINEMA.price,      priceId: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_CINEMA.priceId,      icon: '🎬', category: 'lobby', mode: 'payment' },
  { id: 'lobby-futuristic',  name: 'Futuristic Space',         description: 'Floating platforms, stars — pure sci-fi',            price: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_FUTURISTIC.price,  priceId: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_FUTURISTIC.priceId,  icon: '🚀', category: 'lobby', mode: 'payment', badge: 'NEW' },
  { id: 'lobby-cypher',      name: 'Underground Cipher',       description: 'Street cred locked in — brick, graffiti, raw',       price: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_CYPHER.price,      priceId: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_CYPHER.priceId,      icon: '🎙️', category: 'lobby', mode: 'payment', badge: 'LAUNCH' },
  { id: 'lobby-chill',       name: 'Chill Lounge',             description: 'Warm lighting, couch energy — laid back',            price: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_CHILL.price,       priceId: STRIPE_PRODUCTS.FAN_LOBBY_SKIN_CHILL.priceId,       icon: '🛋️', category: 'lobby', mode: 'payment' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
export function getAllStoreItems(): StoreItem[] {
  return [...CREATOR_ITEMS, ...FAN_ITEMS, ...VENUE_ITEMS, ...LOBBY_ITEMS];
}

export function getItemsByCategory(cat: StoreCategory): StoreItem[] {
  return getAllStoreItems().filter((i) => i.category === cat);
}

export function getCheckoutUrl(item: StoreItem): string {
  return `/api/stripe/checkout?priceId=${encodeURIComponent(item.priceId)}&mode=${item.mode}`;
}

export function formatPrice(cents: number): string {
  if (cents % 100 === 0) return `$${cents / 100}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function findStoreItemById(itemId: string): StoreItem | undefined {
  return getAllStoreItems().find((i) => i.id === itemId);
}

export function findStoreItemByPriceId(priceId: string): StoreItem | undefined {
  return getAllStoreItems().find((i) => i.priceId === priceId);
}

/**
 * Stripe webhook fulfillment for StoreItemEngine catalog purchases.
 *
 * Delegates the actual durable write to StoreItemOwnershipEngine.persistStoreItemOwnership()
 * — the canonical implementation (Prisma store_item_ownerships table + an
 * OwnershipRuntime same-request signal), already the one the real webhook
 * calls directly. This wrapper stays useful for callers that want the
 * subscription-mode guard (subscriptions are fulfilled via the subscription
 * webhook branch, never this one) without importing the commerce-layer file.
 * Idempotent — duplicate webhook deliveries upsert onto the same
 * (userId, itemId) row rather than creating a duplicate.
 */
export async function fulfillStoreItemPurchase(input: {
  buyerId: string;
  itemId: string;
  stripePaymentId: string;
}): Promise<{ ok: true; skuId: string } | { ok: false; reason: string }> {
  const item = findStoreItemById(input.itemId);
  if (!item) return { ok: false, reason: 'item_not_found' };
  if (item.mode === 'subscription') {
    return { ok: false, reason: 'subscription_fulfilled_via_subscription_webhook' };
  }

  const { persistStoreItemOwnership } = await import('@/lib/commerce/StoreItemOwnershipEngine');
  return persistStoreItemOwnership({
    userId: input.buyerId,
    itemId: item.id,
    stripePaymentId: input.stripePaymentId,
    pricePaidCents: item.price,
  });
}
