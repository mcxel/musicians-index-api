/**
 * TimedDropEngine
 * Flash drops, limited releases, countdowns, and scarcity mechanics for the TMI store.
 */

export type DropType = "beat" | "merch" | "nft" | "emote" | "prop" | "skin" | "badge" | "avatar-item";
export type DropStatus = "scheduled" | "live" | "sold-out" | "ended" | "cancelled";

export interface TimedDrop {
  id: string;
  name: string;
  description: string;
  dropType: DropType;
  itemId: string;
  priceCents: number;
  tmicoinPrice?: number;
  totalUnits: number;
  unitsSold: number;
  unitsRemaining: number;
  status: DropStatus;
  scheduledAt: number;
  goesLiveAt: number;
  endsAt: number;
  coverImageUrl?: string;
  artistId?: string;
  showId?: string;
  isExclusive: boolean;
  isPurchaseLimitPerUser: number;
  purchaseLog: Map<string, number>; // userId → count
}

export interface DropPurchase {
  dropId: string;
  userId: string;
  quantity: number;
  totalCents: number;
  purchasedAt: number;
  orderId: string;
}

export interface DropCountdown {
  dropId: string;
  name: string;
  status: DropStatus;
  secondsUntilLive: number;
  secondsUntilEnd: number;
  percentSold: number;
  unitsRemaining: number;
}

export class TimedDropEngine {
  private static _instance: TimedDropEngine | null = null;

  private _drops: Map<string, TimedDrop> = new Map();
  private _purchases: TimedDrop["purchaseLog"] extends Map<string, number> ? Map<string, DropPurchase[]> : never
    = new Map() as Map<string, DropPurchase[]>;
  private _timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private _listeners: Set<(drop: TimedDrop) => void> = new Set();

  static getInstance(): TimedDropEngine {
    if (!TimedDropEngine._instance) {
      TimedDropEngine._instance = new TimedDropEngine();
    }
    return TimedDropEngine._instance;
  }

  // ── Drop creation ──────────────────────────────────────────────────────────

  scheduleDrop(drop: Omit<TimedDrop, "id" | "unitsSold" | "unitsRemaining" | "status" | "purchaseLog">): TimedDrop {
    const now = Date.now();
    const full: TimedDrop = {
      ...drop,
      id: Math.random().toString(36).slice(2),
      unitsSold: 0,
      unitsRemaining: drop.totalUnits,
      status: drop.goesLiveAt <= now ? "live" : "scheduled",
      purchaseLog: new Map(),
    };
    this._drops.set(full.id, full);
    this._purchases.set(full.id, []);

    if (full.status === "scheduled" && full.goesLiveAt > now) {
      const t = setTimeout(() => this._goLive(full.id), full.goesLiveAt - now);
      this._timers.set(full.id + "_start", t);
    }

    const endDelay = full.endsAt - now;
    if (endDelay > 0) {
      const t = setTimeout(() => this._endDrop(full.id), endDelay);
      this._timers.set(full.id + "_end", t);
    }

    this._emit(full);
    return full;
  }

  // ── Purchase ───────────────────────────────────────────────────────────────

  purchase(
    dropId: string,
    userId: string,
    quantity = 1,
  ): { success: boolean; purchase?: DropPurchase; error?: string } {
    const drop = this._drops.get(dropId);
    if (!drop) return { success: false, error: "drop not found" };
    if (drop.status !== "live") return { success: false, error: `drop is ${drop.status}` };
    if (drop.unitsRemaining < quantity) return { success: false, error: "not enough units remaining" };

    const userCount = drop.purchaseLog.get(userId) ?? 0;
    if (userCount + quantity > drop.isPurchaseLimitPerUser) {
      return { success: false, error: `purchase limit is ${drop.isPurchaseLimitPerUser} per user` };
    }

    drop.unitsSold += quantity;
    drop.unitsRemaining -= quantity;
    drop.purchaseLog.set(userId, userCount + quantity);

    if (drop.unitsRemaining <= 0) {
      drop.status = "sold-out";
    }

    const purchase: DropPurchase = {
      dropId,
      userId,
      quantity,
      totalCents: drop.priceCents * quantity,
      purchasedAt: Date.now(),
      orderId: Math.random().toString(36).slice(2),
    };

    const existing = this._purchases.get(dropId) ?? [];
    existing.push(purchase);
    this._purchases.set(dropId, existing);

    this._emit(drop);
    return { success: true, purchase };
  }

  // ── Countdown ──────────────────────────────────────────────────────────────

  getCountdown(dropId: string): DropCountdown | null {
    const drop = this._drops.get(dropId);
    if (!drop) return null;
    const now = Date.now();
    return {
      dropId,
      name: drop.name,
      status: drop.status,
      secondsUntilLive: Math.max(0, Math.floor((drop.goesLiveAt - now) / 1000)),
      secondsUntilEnd: Math.max(0, Math.floor((drop.endsAt - now) / 1000)),
      percentSold: drop.totalUnits > 0 ? Math.round((drop.unitsSold / drop.totalUnits) * 100) : 0,
      unitsRemaining: drop.unitsRemaining,
    };
  }

  getLiveDrops(): TimedDrop[] {
    return [...this._drops.values()].filter((d) => d.status === "live");
  }

  getUpcomingDrops(): TimedDrop[] {
    return [...this._drops.values()]
      .filter((d) => d.status === "scheduled")
      .sort((a, b) => a.goesLiveAt - b.goesLiveAt);
  }

  getDrop(id: string): TimedDrop | null {
    return this._drops.get(id) ?? null;
  }

  getPurchasesForDrop(dropId: string): DropPurchase[] {
    return this._purchases.get(dropId) ?? [];
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private _goLive(dropId: string): void {
    const drop = this._drops.get(dropId);
    if (drop && drop.status === "scheduled") {
      drop.status = "live";
      this._emit(drop);
    }
  }

  private _endDrop(dropId: string): void {
    const drop = this._drops.get(dropId);
    if (drop && drop.status === "live") {
      drop.status = "ended";
      this._emit(drop);
    }
  }

  cancelDrop(dropId: string): void {
    const drop = this._drops.get(dropId);
    if (drop && ["scheduled", "live"].includes(drop.status)) {
      drop.status = "cancelled";
      const st = this._timers.get(dropId + "_start");
      const et = this._timers.get(dropId + "_end");
      if (st) clearTimeout(st);
      if (et) clearTimeout(et);
      this._emit(drop);
    }
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onDropChange(cb: (drop: TimedDrop) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(drop: TimedDrop): void {
    for (const cb of this._listeners) cb(drop);
  }
}

export const timedDropEngine = TimedDropEngine.getInstance();
