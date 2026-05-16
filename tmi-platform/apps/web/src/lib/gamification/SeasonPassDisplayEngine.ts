// SeasonPassDisplayEngine
// Controls: weighted product rotation, animation state machine, live notification queue
// Season Pass appears at 40% frequency; store items share remaining 60%

export type StoreItemType =
  | "season_pass"
  | "gold_tee"
  | "nft_drop"
  | "beat_pack"
  | "ticket_bundle"
  | "sponsor_gift";

export type StoreRotationItem = {
  id: string;
  type: StoreItemType;
  label: string;
  sublabel: string;
  emoji: string;
  accentColor: string;
  price: string;
  href: string;
  weight: number; // relative rotation weight
};

export type AnimationState =
  | "idle"
  | "hover"
  | "glow_pulse"
  | "tilt"
  | "light_sweep"
  | "level_up"
  | "reward_reveal"
  | "rotating_out"
  | "rotating_in";

export type UnlockNotification = {
  id: string;
  performerName: string;
  rewardLabel: string;
  timestamp: number;
};

// Weighted rotation catalog — Season Pass has 4x weight of others
export const ROTATION_CATALOG: StoreRotationItem[] = [
  {
    id: "season-pass-s1",
    type: "season_pass",
    label: "Season 1 Pass",
    sublabel: "The Rise · Guitar Pass",
    emoji: "🎸",
    accentColor: "#AA2DFF",
    price: "$24.99",
    href: "/shop/season-pass",
    weight: 40,
  },
  {
    id: "gold-tee",
    type: "gold_tee",
    label: "Gold Tee",
    sublabel: "TMI Season 1 Merch",
    emoji: "👕",
    accentColor: "#FFD700",
    price: "$38.00",
    href: "/shop",
    weight: 15,
  },
  {
    id: "nft-drop-s1",
    type: "nft_drop",
    label: "Season 1 Crown NFT",
    sublabel: "Limited · 500 minted",
    emoji: "👑",
    accentColor: "#c4b5fd",
    price: "0.08 ETH",
    href: "/shop/nft",
    weight: 15,
  },
  {
    id: "beat-pack-1",
    type: "beat_pack",
    label: "Producer Beat Pack",
    sublabel: "50 stems · royalty-free",
    emoji: "🎹",
    accentColor: "#00FF88",
    price: "$19.99",
    href: "/shop/beats",
    weight: 15,
  },
  {
    id: "ticket-bundle",
    type: "ticket_bundle",
    label: "Event Ticket Bundle",
    sublabel: "5 events · General+VIP",
    emoji: "🎟️",
    accentColor: "#FF2DAA",
    price: "$89.00",
    href: "/events",
    weight: 10,
  },
  {
    id: "sponsor-gift",
    type: "sponsor_gift",
    label: "Sponsor Gift Box",
    sublabel: "SoundWave · $150 value",
    emoji: "🎁",
    accentColor: "#FF6B35",
    price: "Free w/ Pass",
    href: "/shop/gifts",
    weight: 5,
  },
];

// ── Weighted random selector ──────────────────────────────────────────────────

const _totalWeight = ROTATION_CATALOG.reduce((s, i) => s + i.weight, 0);

export function pickNextRotationItem(excludeId?: string): StoreRotationItem {
  const pool = excludeId ? ROTATION_CATALOG.filter((i) => i.id !== excludeId) : ROTATION_CATALOG;
  const poolWeight = pool.reduce((s, i) => s + i.weight, 0);
  let rand = Math.random() * poolWeight;
  for (const item of pool) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return pool[0]!;
}

export function getSeasonPassItem(): StoreRotationItem {
  return ROTATION_CATALOG.find((i) => i.type === "season_pass")!;
}

export function getRotationInterval(): number {
  // 8–12 seconds per rotation
  return 8000 + Math.random() * 4000;
}

// ── Animation state machine ───────────────────────────────────────────────────

export type AnimationConfig = {
  hoverScale: number;      // 1.04
  tiltDegrees: number;     // ±3deg
  glowPulseMin: number;    // opacity
  glowPulseMax: number;    // opacity
  lightSweepDuration: number; // ms
  levelUpBurstDuration: number; // ms
};

export const ANIMATION_CONFIG: AnimationConfig = {
  hoverScale: 1.04,
  tiltDegrees: 3,
  glowPulseMin: 0.15,
  glowPulseMax: 0.5,
  lightSweepDuration: 1200,
  levelUpBurstDuration: 800,
};

// ── Live unlock notification queue ────────────────────────────────────────────

let _notifCounter = 0;
const _notifQueue: UnlockNotification[] = [];
const MAX_QUEUE_SIZE = 8;

export function pushUnlockNotification(performerName: string, rewardLabel: string): UnlockNotification {
  const notif: UnlockNotification = {
    id: `notif-${++_notifCounter}`,
    performerName,
    rewardLabel,
    timestamp: Date.now(),
  };
  _notifQueue.unshift(notif);
  if (_notifQueue.length > MAX_QUEUE_SIZE) _notifQueue.pop();
  return notif;
}

export function getRecentNotifications(limit = 3): UnlockNotification[] {
  return _notifQueue.slice(0, limit);
}

export function clearNotifications(): void {
  _notifQueue.length = 0;
}

// Seed demo notifications so Home 2 has something to show immediately
pushUnlockNotification("Julius.B", "Battle Ticket");
pushUnlockNotification("KOVA", "NFT Drop");
pushUnlockNotification("Bass.Nero", "Season 1 Pass Level 5");
pushUnlockNotification("Nera Vex", "Gold Tee");
