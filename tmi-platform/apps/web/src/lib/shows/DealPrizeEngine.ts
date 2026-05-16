/**
 * DealPrizeEngine
 * Prize offer and deal decision logic for deal/prize show segments.
 */

export type PrizeType =
  | "cash"
  | "tmicoin"
  | "beats"
  | "merch"
  | "ticket"
  | "experience"
  | "recording-session"
  | "feature-slot"
  | "mentorship"
  | "mystery";

export type DealDecision = "take" | "decline" | "counter" | "expired" | "pending";

export type OfferTier = "bronze" | "silver" | "gold" | "platinum" | "mystery";

export interface Prize {
  id: string;
  type: PrizeType;
  label: string;
  cashValue: number;
  tmicoinValue: number;
  tier: OfferTier;
  description: string;
  imageUrl?: string;
  expiresAt?: number;
}

export interface DealOffer {
  id: string;
  showId: string;
  contestantId: string;
  roundNumber: number;
  prizes: Prize[];
  totalCashValue: number;
  totalTmiCoinValue: number;
  offeredAt: number;
  expiresAt: number;
  decision: DealDecision;
  decidedAt?: number;
  counterOffer?: Prize[];
}

export interface PrizeBank {
  prizes: Prize[];
  totalCashValue: number;
  openedBoxes: string[]; // prize IDs revealed
  remainingBoxes: string[]; // prize IDs unrevealed
}

const PRIZE_TEMPLATES: Prize[] = [
  { id: "cash-100",     type: "cash",              label: "$100 Cash",            cashValue: 100,    tmicoinValue: 1000,  tier: "bronze",   description: "One hundred dollars cash" },
  { id: "cash-500",     type: "cash",              label: "$500 Cash",            cashValue: 500,    tmicoinValue: 5000,  tier: "silver",   description: "Five hundred dollars cash" },
  { id: "cash-1000",    type: "cash",              label: "$1,000 Cash",          cashValue: 1000,   tmicoinValue: 10000, tier: "gold",     description: "One thousand dollars cash" },
  { id: "cash-5000",    type: "cash",              label: "$5,000 Cash",          cashValue: 5000,   tmicoinValue: 50000, tier: "platinum", description: "Five thousand dollars cash" },
  { id: "tmi-500",      type: "tmicoin",           label: "500 TMICoins",         cashValue: 50,     tmicoinValue: 500,   tier: "bronze",   description: "500 TMICoin credits" },
  { id: "tmi-2000",     type: "tmicoin",           label: "2,000 TMICoins",       cashValue: 200,    tmicoinValue: 2000,  tier: "silver",   description: "2,000 TMICoin credits" },
  { id: "beats-pack",   type: "beats",             label: "Beat Pack (10 beats)", cashValue: 300,    tmicoinValue: 3000,  tier: "silver",   description: "10 exclusive beat licenses" },
  { id: "recording",    type: "recording-session", label: "Studio Session",       cashValue: 800,    tmicoinValue: 8000,  tier: "gold",     description: "4-hour professional recording session" },
  { id: "feature",      type: "feature-slot",      label: "Magazine Feature",     cashValue: 500,    tmicoinValue: 5000,  tier: "gold",     description: "Full-page TMI Magazine feature" },
  { id: "mentorship",   type: "mentorship",        label: "Artist Mentorship",    cashValue: 1200,   tmicoinValue: 12000, tier: "platinum", description: "3-month 1:1 artist mentorship" },
  { id: "vip-ticket",   type: "ticket",            label: "VIP Show Ticket",      cashValue: 150,    tmicoinValue: 1500,  tier: "silver",   description: "VIP ticket to any TMI show" },
  { id: "mystery",      type: "mystery",           label: "Mystery Box",          cashValue: 0,      tmicoinValue: 0,     tier: "mystery",  description: "Could be anything..." },
];

export class DealPrizeEngine {
  private static _instance: DealPrizeEngine | null = null;

  private _offers: Map<string, DealOffer> = new Map();
  private _banks: Map<string, PrizeBank> = new Map();
  private _listeners: Set<(offer: DealOffer) => void> = new Set();

  static getInstance(): DealPrizeEngine {
    if (!DealPrizeEngine._instance) {
      DealPrizeEngine._instance = new DealPrizeEngine();
    }
    return DealPrizeEngine._instance;
  }

  // ── Prize bank ─────────────────────────────────────────────────────────────

  initBank(showId: string, count = 12): PrizeBank {
    const shuffled = [...PRIZE_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, count);
    const bank: PrizeBank = {
      prizes: shuffled,
      totalCashValue: shuffled.reduce((s, p) => s + p.cashValue, 0),
      openedBoxes: [],
      remainingBoxes: shuffled.map((p) => p.id),
    };
    this._banks.set(showId, bank);
    return bank;
  }

  openBox(showId: string, prizeId: string): Prize | null {
    const bank = this._banks.get(showId);
    if (!bank) return null;
    const idx = bank.remainingBoxes.indexOf(prizeId);
    if (idx === -1) return null;
    bank.remainingBoxes.splice(idx, 1);
    bank.openedBoxes.push(prizeId);
    return bank.prizes.find((p) => p.id === prizeId) ?? null;
  }

  getBank(showId: string): PrizeBank | null {
    return this._banks.get(showId) ?? null;
  }

  // ── Offers ─────────────────────────────────────────────────────────────────

  makeOffer(
    showId: string,
    contestantId: string,
    roundNumber: number,
    prizes: Prize[],
    ttlMs = 60_000,
  ): DealOffer {
    const now = Date.now();
    const offer: DealOffer = {
      id: Math.random().toString(36).slice(2),
      showId,
      contestantId,
      roundNumber,
      prizes,
      totalCashValue: prizes.reduce((s, p) => s + p.cashValue, 0),
      totalTmiCoinValue: prizes.reduce((s, p) => s + p.tmicoinValue, 0),
      offeredAt: now,
      expiresAt: now + ttlMs,
      decision: "pending",
    };
    this._offers.set(offer.id, offer);

    // Auto-expire
    setTimeout(() => {
      const o = this._offers.get(offer.id);
      if (o && o.decision === "pending") {
        o.decision = "expired";
        for (const cb of this._listeners) cb(o);
      }
    }, ttlMs);

    for (const cb of this._listeners) cb(offer);
    return offer;
  }

  makeAutoOffer(showId: string, contestantId: string, roundNumber: number): DealOffer {
    const bank = this._banks.get(showId);
    const availablePrizes = bank
      ? bank.prizes.filter((p) => bank.openedBoxes.includes(p.id))
      : PRIZE_TEMPLATES.slice(0, 3);

    const offerPool = availablePrizes.length > 0 ? availablePrizes : PRIZE_TEMPLATES.slice(0, 2);
    const selected = offerPool.slice(0, Math.min(3, offerPool.length));
    return this.makeOffer(showId, contestantId, roundNumber, selected);
  }

  decide(offerId: string, decision: "take" | "decline" | "counter", counterPrizes?: Prize[]): DealOffer | null {
    const offer = this._offers.get(offerId);
    if (!offer || offer.decision !== "pending") return null;
    offer.decision = decision;
    offer.decidedAt = Date.now();
    if (decision === "counter" && counterPrizes) offer.counterOffer = counterPrizes;
    for (const cb of this._listeners) cb(offer);
    return offer;
  }

  getOffer(offerId: string): DealOffer | null {
    return this._offers.get(offerId) ?? null;
  }

  getOffersByShow(showId: string): DealOffer[] {
    return [...this._offers.values()].filter((o) => o.showId === showId);
  }

  getPrizeTemplates(): Prize[] {
    return [...PRIZE_TEMPLATES];
  }

  // ── Value calculator ───────────────────────────────────────────────────────

  calculateOfferValue(prizes: Prize[]): { cash: number; tmicoins: number; tier: OfferTier } {
    const cash = prizes.reduce((s, p) => s + p.cashValue, 0);
    const tmicoins = prizes.reduce((s, p) => s + p.tmicoinValue, 0);
    const tier: OfferTier =
      cash >= 3000 ? "platinum"
      : cash >= 1000 ? "gold"
      : cash >= 300 ? "silver"
      : "bronze";
    return { cash, tmicoins, tier };
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onOffer(cb: (offer: DealOffer) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }
}

export const dealPrizeEngine = DealPrizeEngine.getInstance();
