/**
 * SponsorGiveawayEngine
 * Live giveaway pipeline — entry collection, winner selection, sponsor attribution.
 */

export type GiveawayStatus = "draft" | "open" | "closed" | "winner_selected" | "completed" | "cancelled";

export type GiveawayPrize = {
  id: string;
  label: string;
  description: string;
  value: number;
  type: "cash" | "merch" | "nft" | "store_credit" | "experience";
};

export type GiveawayEntry = {
  entryId: string;
  userId: string;
  displayName: string;
  enteredAtMs: number;
  ticketCount: number;
};

export type Giveaway = {
  giveawayId: string;
  sponsorId: string;
  sponsorName: string;
  title: string;
  description: string;
  prizes: GiveawayPrize[];
  entries: GiveawayEntry[];
  status: GiveawayStatus;
  openAtMs: number | null;
  closeAtMs: number | null;
  maxEntries: number;
  winnerIds: string[];
  createdAtMs: number;
};

let _giveawaySeq = 0;

export class SponsorGiveawayEngine {
  private readonly giveaways: Map<string, Giveaway> = new Map();
  private readonly userEntries: Map<string, Set<string>> = new Map();

  createGiveaway(params: {
    sponsorId: string;
    sponsorName: string;
    title: string;
    description: string;
    prizes: GiveawayPrize[];
    maxEntries?: number;
  }): Giveaway {
    const giveawayId = `giveaway-${Date.now()}-${++_giveawaySeq}`;
    const giveaway: Giveaway = {
      giveawayId,
      sponsorId: params.sponsorId,
      sponsorName: params.sponsorName,
      title: params.title,
      description: params.description,
      prizes: params.prizes,
      entries: [],
      status: "draft",
      openAtMs: null,
      closeAtMs: null,
      maxEntries: params.maxEntries ?? 10000,
      winnerIds: [],
      createdAtMs: Date.now(),
    };
    this.giveaways.set(giveawayId, giveaway);
    return giveaway;
  }

  open(giveawayId: string): void {
    const g = this.giveaways.get(giveawayId);
    if (!g || g.status !== "draft") return;
    g.status = "open";
    g.openAtMs = Date.now();
  }

  close(giveawayId: string): void {
    const g = this.giveaways.get(giveawayId);
    if (!g || g.status !== "open") return;
    g.status = "closed";
    g.closeAtMs = Date.now();
  }

  enter(giveawayId: string, userId: string, displayName: string, ticketCount: number = 1): boolean {
    const g = this.giveaways.get(giveawayId);
    if (!g || g.status !== "open") return false;
    if (g.entries.length >= g.maxEntries) return false;

    // Allow multiple tickets but track entries per user
    const userSet = this.userEntries.get(userId) ?? new Set<string>();
    const alreadyEntered = userSet.has(giveawayId);
    if (alreadyEntered) {
      // Allow adding more tickets
      const existing = g.entries.find((e) => e.userId === userId);
      if (existing) existing.ticketCount += ticketCount;
    } else {
      g.entries.push({
        entryId: `entry-${userId}-${giveawayId}`,
        userId,
        displayName,
        enteredAtMs: Date.now(),
        ticketCount,
      });
      userSet.add(giveawayId);
      this.userEntries.set(userId, userSet);
    }

    return true;
  }

  pickWinners(giveawayId: string, count: number = 1): string[] {
    const g = this.giveaways.get(giveawayId);
    if (!g || (g.status !== "open" && g.status !== "closed")) return [];

    // Weighted random — more tickets = better odds
    const pool: string[] = [];
    for (const entry of g.entries) {
      for (let i = 0; i < entry.ticketCount; i++) {
        pool.push(entry.userId);
      }
    }

    if (pool.length === 0) return [];

    const winners: string[] = [];
    const remaining = [...pool];
    const picked = new Set<string>();

    while (winners.length < count && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      const userId = remaining[idx];
      if (!picked.has(userId)) {
        winners.push(userId);
        picked.add(userId);
      }
      remaining.splice(idx, 1);
    }

    g.winnerIds = winners;
    g.status = "winner_selected";
    return winners;
  }

  complete(giveawayId: string): void {
    const g = this.giveaways.get(giveawayId);
    if (g) g.status = "completed";
  }

  getGiveaway(giveawayId: string): Giveaway | null {
    return this.giveaways.get(giveawayId) ?? null;
  }

  getActiveGiveaways(): Giveaway[] {
    return [...this.giveaways.values()].filter((g) => g.status === "open");
  }

  hasEntered(giveawayId: string, userId: string): boolean {
    return this.userEntries.get(userId)?.has(giveawayId) ?? false;
  }
}

export const sponsorGiveawayEngine = new SponsorGiveawayEngine();
