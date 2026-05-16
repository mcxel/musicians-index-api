export type GiveawayStatus = "upcoming" | "active" | "ended" | "cancelled";
export type GiveawayPrizeType = "cash" | "merch" | "ticket" | "shoutout" | "beat-license" | "fan-club" | "xp-bonus";

export interface GiveawayEntry {
  eventId: string;
  userId: string;
  enteredAt: number;
}

export interface GiveawayPrize {
  type: GiveawayPrizeType;
  label: string;
  value?: string;
  icon: string;
}

export interface Giveaway {
  id: string;
  eventId: string;
  title: string;
  description: string;
  prizes: GiveawayPrize[];
  status: GiveawayStatus;
  startAt: number;
  endAt: number;
  maxEntries?: number;
  entryCount: number;
  sponsorName?: string;
  roomId?: string;
  requiresAuth: boolean;
  requiresTicket: boolean;
  freeToEnter: boolean;
}

const GIVEAWAY_STORE: Map<string, Giveaway> = new Map();
const ENTRY_STORE: Map<string, Set<string>> = new Map();

export const SEED_GIVEAWAYS: Giveaway[] = [
  {
    id: "gw-001",
    eventId: "monday-cypher-s1-ep12",
    title: "Monday Cypher Episode 12 — Grand Drop",
    description: "Enter for a chance to win merch, beat licenses, and a shoutout from this week's Cypher champion.",
    prizes: [
      { type: "merch",        label: "TMI Hoodie Bundle",     value: "3 pieces",      icon: "👕" },
      { type: "beat-license", label: "Premium Beat License",  value: "1 exclusive",   icon: "🎵" },
      { type: "shoutout",     label: "Artist Shoutout",       value: "from Wavetek",  icon: "🎤" },
      { type: "xp-bonus",     label: "XP Bonus",              value: "500 XP",        icon: "⭐" },
    ],
    status: "active",
    startAt: Date.now() - 1000 * 60 * 30,
    endAt:   Date.now() + 1000 * 60 * 90,
    maxEntries: 5000,
    entryCount: 1247,
    sponsorName: "BeatGear Co",
    roomId: "monday-cypher",
    requiresAuth: true,
    requiresTicket: false,
    freeToEnter: true,
  },
  {
    id: "gw-002",
    eventId: "monday-stage-apr-21",
    title: "Monday Stage Live Drop — April 21",
    description: "Neon Vibe is giving away a VIP season pass and exclusive digital collectibles to three lucky fans.",
    prizes: [
      { type: "ticket",    label: "Season Pass",    value: "VIP tier",       icon: "🎟️" },
      { type: "fan-club",  label: "Fan Club — Gold", value: "3 months free", icon: "👑" },
      { type: "xp-bonus",  label: "XP Drop",         value: "1,000 XP",     icon: "⭐" },
    ],
    status: "upcoming",
    startAt: Date.now() + 1000 * 60 * 60 * 24,
    endAt:   Date.now() + 1000 * 60 * 60 * 48,
    maxEntries: 10000,
    entryCount: 0,
    sponsorName: "FreshThreads NYC",
    roomId: "monday-stage",
    requiresAuth: true,
    requiresTicket: false,
    freeToEnter: true,
  },
];

for (const g of SEED_GIVEAWAYS) {
  GIVEAWAY_STORE.set(g.eventId, g);
  ENTRY_STORE.set(g.eventId, new Set());
}

export function getGiveaway(eventId: string): Giveaway | undefined {
  return GIVEAWAY_STORE.get(eventId) ?? SEED_GIVEAWAYS.find(g => g.id === eventId);
}

export function getActiveGiveaways(): Giveaway[] {
  return SEED_GIVEAWAYS.filter(g => g.status === "active");
}

export function getAllGiveaways(): Giveaway[] {
  return SEED_GIVEAWAYS;
}

export type EnterResult =
  | { success: true; message: string }
  | { success: false; error: string };

export function enterGiveaway(eventId: string, userId: string): EnterResult {
  const giveaway = getGiveaway(eventId);
  if (!giveaway) return { success: false, error: "Giveaway not found." };
  if (giveaway.status !== "active") return { success: false, error: "This giveaway is not currently active." };
  if (giveaway.maxEntries && giveaway.entryCount >= giveaway.maxEntries) {
    return { success: false, error: "This giveaway has reached maximum entries." };
  }

  let entries = ENTRY_STORE.get(eventId);
  if (!entries) {
    entries = new Set();
    ENTRY_STORE.set(eventId, entries);
  }
  if (entries.has(userId)) return { success: false, error: "You have already entered this giveaway." };

  entries.add(userId);
  giveaway.entryCount += 1;
  return { success: true, message: "You're in! Good luck 🎉" };
}

export function hasEntered(eventId: string, userId: string): boolean {
  return ENTRY_STORE.get(eventId)?.has(userId) ?? false;
}

export function getTimeRemaining(endAt: number): string {
  const diff = endAt - Date.now();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  if (h > 0) return `${h}h ${m}m remaining`;
  if (m > 0) return `${m}m ${s}s remaining`;
  return `${s}s remaining`;
}
