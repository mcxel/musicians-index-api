/**
 * StoreItemEngine — unified product catalog for all TMI stores.
 * Items map directly to STRIPE_PRODUCTS price IDs.
 * Revenue splits per REVENUE_SPLITS in lib/stripe/products.ts.
 */

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
export const CREATOR_ITEMS: StoreItem[] = [
  { id: 'shoutout',          name: 'Personalized Shoutout',    description: 'Artist records a custom shoutout for you',          price: 1500,  priceId: 'price_1TUWvpEL7B8tMf4Ns2TE2uX4', icon: '📣', category: 'shoutout',      creatorSplit: 0.80, mode: 'payment', badge: 'HOT' },
  { id: 'meet-greet',        name: 'Meet & Greet Pass',        description: 'One-on-one session with the artist',                 price: 2500,  priceId: 'price_1TUWSaEL7B8tMf4N74LrAyG',  icon: '🤝', category: 'experience',    creatorSplit: 0.80, mode: 'payment' },
  { id: 'beat-license',      name: 'Beat License',             description: 'Full license to use this beat commercially',         price: 2500,  priceId: 'price_beat_license',               icon: '🎹', category: 'beats',         creatorSplit: 0.75, mode: 'payment', badge: 'HOT' },
  { id: 'artist-boost',      name: 'Artist Discovery Boost',   description: 'Get featured in discovery for 7 days',               price: 1900,  priceId: 'price_artist_boost',               icon: '🚀', category: 'boosts',        creatorSplit: 0,    mode: 'payment', badge: 'LAUNCH' },
  { id: 'artist-spotlight',  name: 'Homepage Spotlight',       description: 'Featured on the TMI homepage for 24 hours',          price: 4900,  priceId: 'price_artist_spotlight',           icon: '⭐', category: 'boosts',        creatorSplit: 0,    mode: 'payment' },
  { id: 'nft-mint',          name: 'NFT Mint',                 description: 'Mint your track or art as an NFT on TMI',            price: 999,   priceId: 'price_nft_mint_fee',               icon: '💎', category: 'nft',           creatorSplit: 0.90, mode: 'payment', badge: 'NEW' },
  { id: 'artist-pro',        name: 'Artist Pro Monthly',       description: 'Verified badge, Beat Lab, analytics, priority booking', price: 1499, priceId: 'price_artist_pro_monthly',        icon: '🎤', category: 'subscription',  creatorSplit: 0,    mode: 'subscription', badge: 'HOT' },
  { id: 'ticket-standard',   name: 'Event Ticket',             description: 'Standard entry to a live event',                     price: 500,   priceId: 'price_ticket_standard',            icon: '🎟️', category: 'tickets',       creatorSplit: 0.90, mode: 'payment' },
  { id: 'ticket-vip',        name: 'VIP Event Ticket',         description: 'VIP access + front row energy',                      price: 1500,  priceId: 'price_ticket_vip',                 icon: '👑', category: 'tickets',       creatorSplit: 0.90, mode: 'payment', badge: 'LIMITED' },
];

// ─── Fan Identity / Experience Store ──────────────────────────────────────
export const FAN_ITEMS: StoreItem[] = [
  { id: 'tip-small',         name: 'Tip $1',                   description: 'Send a quick tip to your favorite artist',           price: 100,   priceId: 'price_tip_small',                  icon: '💸', category: 'experience',    creatorSplit: 0.90, mode: 'payment' },
  { id: 'tip-medium',        name: 'Tip $5',                   description: 'Show real support',                                  price: 500,   priceId: 'price_1TUWKrEL7B8tMf4NVceVcW4i', icon: '💵', category: 'experience',    creatorSplit: 0.90, mode: 'payment', badge: 'HOT' },
  { id: 'tip-large',         name: 'Tip $10',                  description: 'Go big for your artist',                             price: 1000,  priceId: 'price_tip_large',                  icon: '💰', category: 'experience',    creatorSplit: 0.90, mode: 'payment' },
  { id: 'tip-xl',            name: 'Tip $25',                  description: 'You\'re a real one',                                 price: 2500,  priceId: 'price_tip_xl',                     icon: '🏆', category: 'experience',    creatorSplit: 0.90, mode: 'payment', badge: 'LIMITED' },
  { id: 'fan-club-bronze',   name: 'Fan Club Bronze',          description: 'Monthly fan club membership — Bronze',               price: 299,   priceId: 'price_fan_club_bronze',            icon: '🥉', category: 'subscription',  creatorSplit: 0.85, mode: 'subscription' },
  { id: 'fan-club-silver',   name: 'Fan Club Silver',          description: 'Silver fan club — exclusive content access',        price: 499,   priceId: 'price_fan_club_silver',            icon: '🥈', category: 'subscription',  creatorSplit: 0.85, mode: 'subscription', badge: 'HOT' },
  { id: 'fan-club-gold',     name: 'Fan Club Gold',            description: 'Gold fan club — VIP access + bonus XP',             price: 999,   priceId: 'price_fan_club_gold',              icon: '🥇', category: 'subscription',  creatorSplit: 0.85, mode: 'subscription' },
  { id: 'member-pro',        name: 'TMI Pro Membership',       description: 'All live rooms, HD streams, no ads, bonus XP',      price: 999,   priceId: 'price_1TUWI4EL7B8tMf4NHs74ydgc', icon: '⚡', category: 'subscription',  creatorSplit: 0,    mode: 'subscription', badge: 'LAUNCH' },
  { id: 'member-vip',        name: 'TMI VIP Membership',       description: 'VIP rooms, spotlight badge, exclusive drops',       price: 1999,  priceId: 'price_member_vip_monthly',         icon: '💎', category: 'subscription',  creatorSplit: 0,    mode: 'subscription' },
  { id: 'season-pass',       name: 'Season Pass',              description: 'All season events, exclusive merch, champion eligibility', price: 4999, priceId: 'price_season_pass',           icon: '🎫', category: 'tickets',       creatorSplit: 0,    mode: 'payment', badge: 'LIMITED' },
];

// ─── Venue Store (Performer Stages) ────────────────────────────────────────
export const VENUE_ITEMS: StoreItem[] = [
  { id: 'venue-club',        name: 'Underground Club',         description: 'Dark, intimate neon-lit venue for ciphers and battles', price: 1999, priceId: 'price_artist_boost',             icon: '🏚️', category: 'venue', mode: 'payment', badge: 'LAUNCH' },
  { id: 'venue-theater',     name: 'Digital Theater',          description: 'Full stage with curtains — perfect for showcases',   price: 3999,  priceId: 'price_artist_spotlight',           icon: '🎭', category: 'venue', mode: 'payment' },
  { id: 'venue-arena',       name: 'TMI Arena',                description: 'Massive arena for championship events and battles',   price: 9999,  priceId: 'price_sponsor_room_naming',        icon: '🏟️', category: 'venue', mode: 'payment', badge: 'HOT' },
  { id: 'venue-outdoor',     name: 'Outdoor Stage',            description: 'Open-air festival stage with crowd simulation',      price: 2999,  priceId: 'price_artist_boost',               icon: '🌆', category: 'venue', mode: 'payment' },
  { id: 'venue-cypher',      name: 'Cipher Pit',               description: 'Underground energy — raw, circular, electric',       price: 1499,  priceId: 'price_booking_fee',                icon: '🔥', category: 'venue', mode: 'payment', badge: 'LAUNCH' },
];

// ─── Lobby Skins (Fan Environments) ────────────────────────────────────────
export const LOBBY_ITEMS: StoreItem[] = [
  { id: 'lobby-neon',        name: 'Neon Lounge',              description: 'Electric purple and cyan — the default flex',        price: 499,   priceId: 'price_tip_medium',                 icon: '💡', category: 'lobby', mode: 'payment', badge: 'HOT' },
  { id: 'lobby-cinema',      name: 'Movie Theater',            description: 'Big screen energy — feel the premiere',              price: 799,   priceId: 'price_tip_large',                  icon: '🎬', category: 'lobby', mode: 'payment' },
  { id: 'lobby-futuristic',  name: 'Futuristic Space',         description: 'Floating platforms, stars — pure sci-fi',            price: 999,   priceId: 'price_fan_club_bronze',            icon: '🚀', category: 'lobby', mode: 'payment', badge: 'NEW' },
  { id: 'lobby-cypher',      name: 'Underground Cipher',       description: 'Street cred locked in — brick, graffiti, raw',       price: 499,   priceId: 'price_tip_medium',                 icon: '🎙️', category: 'lobby', mode: 'payment', badge: 'LAUNCH' },
  { id: 'lobby-chill',       name: 'Chill Lounge',             description: 'Warm lighting, couch energy — laid back',            price: 299,   priceId: 'price_tip_small',                  icon: '🛋️', category: 'lobby', mode: 'payment' },
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
