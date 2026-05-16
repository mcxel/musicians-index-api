// Store Rotation Engine — bot-controlled category rotation across all item types.
// Items are time-limited; expired items return at regular price at returnsAt.
// Never blank: falls back to fan_items if active window has no live items.

export type StoreItemCategory =
  | "fan_items"
  | "performer_items"
  | "emotes"
  | "action_icons"
  | "avatar_buttons"
  | "props"
  | "clothing"
  | "seat_move_ups"
  | "nfts"
  | "beat_packs"
  | "limited_drops"
  | "weekly_items"
  | "cash_items"
  | "points_items";

export type StoreItemStatus = "available" | "limited" | "sale" | "expiring" | "returning";
export type StoreCurrency = "USD" | "TMI_POINTS" | "TMI_CASH";

export interface StoreItem {
  id: string;
  slug: string;
  name: string;
  category: StoreItemCategory;
  price: number;
  currency: StoreCurrency;
  status: StoreItemStatus;
  /** ISO timestamp when sale/limited window closes. null = permanent */
  expiresAt: string | null;
  /** ISO timestamp when sold-out item returns at regular price */
  returnsAt: string | null;
  accent: string;
  emoji: string;
  route: string;
}

// ─── ROTATION WINDOWS ────────────────────────────────────────────────────────

export interface RotationWindow {
  category: StoreItemCategory;
  durationMs: number;
  label: string;
  accent: string;
  emoji: string;
}

export const ROTATION_WINDOWS: RotationWindow[] = [
  { category: "fan_items",       durationMs: 12_000, label: "Fan Items",       accent: "#00FFFF", emoji: "🎟️" },
  { category: "performer_items", durationMs: 12_000, label: "Performer Gear",  accent: "#FF2DAA", emoji: "🎤" },
  { category: "emotes",          durationMs: 10_000, label: "Emotes",          accent: "#f0abfc", emoji: "😄" },
  { category: "action_icons",    durationMs: 10_000, label: "Action Icons",    accent: "#fb923c", emoji: "⚡" },
  { category: "avatar_buttons",  durationMs: 10_000, label: "Avatar Buttons",  accent: "#c4b5fd", emoji: "🎭" },
  { category: "props",           durationMs: 10_000, label: "Stage Props",     accent: "#86efac", emoji: "🎸" },
  { category: "clothing",        durationMs: 12_000, label: "Clothing",        accent: "#fcd34d", emoji: "👕" },
  { category: "seat_move_ups",   durationMs:  8_000, label: "Seat Upgrades",   accent: "#FFD700", emoji: "💺" },
  { category: "nfts",            durationMs: 14_000, label: "NFTs",            accent: "#AA2DFF", emoji: "🖼️" },
  { category: "beat_packs",      durationMs: 12_000, label: "Beat Packs",      accent: "#00FF88", emoji: "🎵" },
  { category: "limited_drops",   durationMs: 10_000, label: "Limited Drops",   accent: "#FF4444", emoji: "🔥" },
  { category: "weekly_items",    durationMs: 12_000, label: "Weekly Items",    accent: "#67e8f9", emoji: "📅" },
  { category: "cash_items",      durationMs: 10_000, label: "Cash Items",      accent: "#4ade80", emoji: "💰" },
  { category: "points_items",    durationMs: 10_000, label: "Points Items",    accent: "#a78bfa", emoji: "⭐" },
];

const TOTAL_CYCLE_MS = ROTATION_WINDOWS.reduce((s, w) => s + w.durationMs, 0);

// ─── SEED CATALOG ────────────────────────────────────────────────────────────

function expiry(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3_600_000).toISOString();
}

export const STORE_CATALOG: StoreItem[] = [
  { id: "fi-01", slug: "fan-badge-gold",        name: "Gold Fan Badge",         category: "fan_items",       price: 299,   currency: "TMI_POINTS", status: "available", expiresAt: null,           returnsAt: null,              accent: "#00FFFF", emoji: "🏅", route: "/store/fan-badge-gold" },
  { id: "fi-02", slug: "fan-confetti-drop",     name: "Confetti Drop",          category: "fan_items",       price: 149,   currency: "TMI_POINTS", status: "available", expiresAt: null,           returnsAt: null,              accent: "#00FFFF", emoji: "🎊", route: "/store/fan-confetti-drop" },
  { id: "fi-03", slug: "fan-hype-banner",       name: "Hype Banner",            category: "fan_items",       price: 199,   currency: "TMI_POINTS", status: "limited",   expiresAt: expiry(48),     returnsAt: expiry(30 * 24),   accent: "#00FFFF", emoji: "🏳️", route: "/store/fan-hype-banner" },
  { id: "pi-01", slug: "performer-spotlight",   name: "Stage Spotlight",        category: "performer_items", price: 4.99,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#FF2DAA", emoji: "💡", route: "/store/performer-spotlight" },
  { id: "pi-02", slug: "performer-smoke-ring",  name: "Smoke Ring Effect",      category: "performer_items", price: 2.99,  currency: "USD",         status: "sale",      expiresAt: expiry(72),     returnsAt: null,              accent: "#FF2DAA", emoji: "💨", route: "/store/performer-smoke-ring" },
  { id: "em-01", slug: "emote-crown-toss",      name: "Crown Toss",             category: "emotes",          price: 99,    currency: "TMI_POINTS", status: "available", expiresAt: null,           returnsAt: null,              accent: "#f0abfc", emoji: "👑", route: "/store/emote-crown-toss" },
  { id: "em-02", slug: "emote-mic-drop",        name: "Mic Drop",               category: "emotes",          price: 149,   currency: "TMI_POINTS", status: "limited",   expiresAt: expiry(7 * 24), returnsAt: null,              accent: "#f0abfc", emoji: "🎤", route: "/store/emote-mic-drop" },
  { id: "ai-01", slug: "action-hype-wave",      name: "Hype Wave",              category: "action_icons",    price: 79,    currency: "TMI_POINTS", status: "available", expiresAt: null,           returnsAt: null,              accent: "#fb923c", emoji: "🌊", route: "/store/action-hype-wave" },
  { id: "ai-02", slug: "action-fire-stamp",     name: "Fire Stamp",             category: "action_icons",    price: 99,    currency: "TMI_POINTS", status: "sale",      expiresAt: expiry(24),     returnsAt: null,              accent: "#fb923c", emoji: "🔥", route: "/store/action-fire-stamp" },
  { id: "av-01", slug: "avatar-neon-outline",   name: "Neon Outline",           category: "avatar_buttons",  price: 1.99,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#c4b5fd", emoji: "✨", route: "/store/avatar-neon-outline" },
  { id: "av-02", slug: "avatar-gold-frame",     name: "Gold Frame",             category: "avatar_buttons",  price: 3.49,  currency: "USD",         status: "limited",   expiresAt: expiry(36),     returnsAt: null,              accent: "#c4b5fd", emoji: "🖼️", route: "/store/avatar-gold-frame" },
  { id: "pr-01", slug: "prop-guitar-glow",      name: "Glow Guitar",            category: "props",           price: 3.99,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#86efac", emoji: "🎸", route: "/store/prop-guitar-glow" },
  { id: "pr-02", slug: "prop-mic-stand",        name: "Vintage Mic Stand",      category: "props",           price: 2.49,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#86efac", emoji: "🎙️", route: "/store/prop-mic-stand" },
  { id: "cl-01", slug: "clothing-neon-jacket",  name: "Neon Jacket",            category: "clothing",        price: 5.99,  currency: "USD",         status: "sale",      expiresAt: expiry(48),     returnsAt: null,              accent: "#fcd34d", emoji: "🧥", route: "/store/clothing-neon-jacket" },
  { id: "cl-02", slug: "clothing-crown-tee",    name: "Crown Tee",              category: "clothing",        price: 3.99,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#fcd34d", emoji: "👕", route: "/store/clothing-crown-tee" },
  { id: "su-01", slug: "seat-vip-upgrade",      name: "VIP Seat Upgrade",       category: "seat_move_ups",   price: 9.99,  currency: "USD",         status: "limited",   expiresAt: expiry(48),     returnsAt: expiry(14 * 24),   accent: "#FFD700", emoji: "💺", route: "/store/seat-vip-upgrade" },
  { id: "su-02", slug: "seat-floor-access",     name: "Floor Access Pass",      category: "seat_move_ups",   price: 14.99, currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#FFD700", emoji: "🎫", route: "/store/seat-floor-access" },
  { id: "nf-01", slug: "nft-crown-genesis",     name: "Crown Genesis #001",     category: "nfts",            price: 49.99, currency: "USD",         status: "limited",   expiresAt: expiry(72),     returnsAt: expiry(90 * 24),   accent: "#AA2DFF", emoji: "🖼️", route: "/store/nft-crown-genesis" },
  { id: "bp-01", slug: "beat-pack-trap-season", name: "Trap Season Pack",       category: "beat_packs",      price: 14.99, currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#00FF88", emoji: "🎵", route: "/store/beat-pack-trap-season" },
  { id: "bp-02", slug: "beat-pack-soul-cuts",   name: "Soul Cuts Vol.1",        category: "beat_packs",      price: 11.99, currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#00FF88", emoji: "🎶", route: "/store/beat-pack-soul-cuts" },
  { id: "cl-03", slug: "first-issue-gold-tee",  name: "First Issue Gold Tee",   category: "clothing",        price: 850,   currency: "TMI_POINTS", status: "limited",   expiresAt: expiry(7 * 24), returnsAt: expiry(7 * 24),    accent: "#FFD700", emoji: "👕", route: "/store/first-issue-gold-tee" },
  { id: "ld-01", slug: "limited-royal-badge",   name: "Royal Badge (Limited)",  category: "limited_drops",   price: 299,   currency: "TMI_POINTS", status: "expiring",  expiresAt: expiry(6),      returnsAt: expiry(30 * 24),   accent: "#FF4444", emoji: "👑", route: "/store/limited-royal-badge" },
  { id: "ld-02", slug: "limited-hologram-ring", name: "Hologram Ring",          category: "limited_drops",   price: 4.99,  currency: "USD",         status: "limited",   expiresAt: expiry(12),     returnsAt: expiry(60 * 24),   accent: "#FF4444", emoji: "💍", route: "/store/limited-hologram-ring" },
  { id: "wi-01", slug: "weekly-fan-pass",       name: "Weekly Fan Pass",        category: "weekly_items",    price: 1.99,  currency: "USD",         status: "available", expiresAt: expiry(7 * 24), returnsAt: null,              accent: "#67e8f9", emoji: "📅", route: "/store/weekly-fan-pass" },
  { id: "ca-01", slug: "cash-500",              name: "500 TMI Cash",           category: "cash_items",      price: 4.99,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#4ade80", emoji: "💰", route: "/store/cash-500" },
  { id: "ca-02", slug: "cash-1200",             name: "1,200 TMI Cash",         category: "cash_items",      price: 9.99,  currency: "USD",         status: "sale",      expiresAt: expiry(24),     returnsAt: null,              accent: "#4ade80", emoji: "💵", route: "/store/cash-1200" },
  { id: "po-01", slug: "points-1000-boost",     name: "1,000 Points Boost",     category: "points_items",    price: 0.99,  currency: "USD",         status: "sale",      expiresAt: expiry(24),     returnsAt: null,              accent: "#a78bfa", emoji: "⭐", route: "/store/points-1000-boost" },
  { id: "po-02", slug: "points-5000-bundle",    name: "5,000 Points Bundle",    category: "points_items",    price: 3.99,  currency: "USD",         status: "available", expiresAt: null,           returnsAt: null,              accent: "#a78bfa", emoji: "🌟", route: "/store/points-5000-bundle" },
];

// ─── ENGINE FUNCTIONS ─────────────────────────────────────────────────────────

export function getActiveWindow(now = Date.now()): RotationWindow {
  const position = now % TOTAL_CYCLE_MS;
  let elapsed = 0;
  for (const win of ROTATION_WINDOWS) {
    elapsed += win.durationMs;
    if (position < elapsed) return win;
  }
  return ROTATION_WINDOWS[0]!;
}

export function getNextWindowMs(now = Date.now()): number {
  const active = getActiveWindow(now);
  const position = now % TOTAL_CYCLE_MS;
  let elapsed = 0;
  for (const win of ROTATION_WINDOWS) {
    elapsed += win.durationMs;
    if (win.category === active.category) break;
  }
  return Math.max(200, elapsed - position);
}

export function getItemsForCategory(category: StoreItemCategory, now = Date.now()): StoreItem[] {
  return STORE_CATALOG.filter(
    (item) => item.category === category && !isItemExpired(item, now),
  );
}

export function isItemExpired(item: StoreItem, now = Date.now()): boolean {
  if (!item.expiresAt) return false;
  return new Date(item.expiresAt).getTime() < now;
}

export function formatTimeLeft(expiresAt: string, now = Date.now()): string {
  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatPrice(item: StoreItem): string {
  if (item.currency === "USD") return `$${item.price.toFixed(2)}`;
  if (item.currency === "TMI_POINTS") return `${item.price} pts`;
  return `${item.price} cash`;
}
