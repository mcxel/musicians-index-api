export interface Prize {
  id: string;
  name: string;
  description: string;
  sponsorId: string;
  totalStock: number;
  claimed: number;
  remaining: number;
}

const store: Map<string, Prize> = new Map();

export const PrizeInventoryEngine = {
  addPrize(prize: Omit<Prize, "claimed" | "remaining">): Prize {
    const entry: Prize = { ...prize, claimed: 0, remaining: prize.totalStock };
    store.set(prize.id, entry);
    return entry;
  },

  claimPrize(prizeId: string, _winnerId: string): { ok: boolean; prize?: Prize; error?: string } {
    const prize = store.get(prizeId);
    if (!prize) return { ok: false, error: "prize_not_found" };
    if (prize.remaining <= 0) return { ok: false, error: "out_of_stock" };
    prize.claimed += 1;
    prize.remaining -= 1;
    return { ok: true, prize };
  },

  getPrize(id: string): Prize | undefined {
    return store.get(id);
  },

  getAvailablePrizes(sponsorId: string): Prize[] {
    return Array.from(store.values()).filter(p => p.sponsorId === sponsorId && p.remaining > 0);
  },
};
