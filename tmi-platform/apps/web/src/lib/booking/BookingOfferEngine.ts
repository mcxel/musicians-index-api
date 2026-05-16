/**
 * BookingOfferEngine
 * Venue-to-artist booking offers: browse, send, accept/decline, countering.
 */

export type OfferStatus = "pending" | "viewed" | "accepted" | "declined" | "countered" | "expired" | "withdrawn";

export interface BookingOffer {
  id: string;
  venueId: string;
  venueName: string;
  artistId: string;
  artistName: string;
  proposedDate: string;
  setLengthMinutes: number;
  guaranteeUsd: number;
  revenueSplitPercent: number;
  coverCharge: number;
  expectedAttendance: number;
  perks: string[];
  message?: string;
  status: OfferStatus;
  sentAt: number;
  viewedAt?: number;
  respondedAt?: number;
  expiresAt: number;
  counterGuaranteeUsd?: number;
  counterMessage?: string;
  contractId?: string;
}

export interface OfferSummary {
  totalSent: number;
  totalAccepted: number;
  totalDeclined: number;
  totalExpired: number;
  acceptanceRate: number;
  avgGuaranteeUsd: number;
}

export class BookingOfferEngine {
  private static _instance: BookingOfferEngine | null = null;

  private _offers: Map<string, BookingOffer> = new Map();
  private _listeners: Set<(offer: BookingOffer) => void> = new Set();

  static getInstance(): BookingOfferEngine {
    if (!BookingOfferEngine._instance) {
      BookingOfferEngine._instance = new BookingOfferEngine();
    }
    return BookingOfferEngine._instance;
  }

  sendOffer(
    venueId: string,
    venueName: string,
    artistId: string,
    artistName: string,
    terms: {
      proposedDate: string;
      setLengthMinutes: number;
      guaranteeUsd: number;
      revenueSplitPercent?: number;
      coverCharge?: number;
      expectedAttendance?: number;
      perks?: string[];
      message?: string;
      ttlHours?: number;
    },
  ): BookingOffer {
    const now = Date.now();
    const offer: BookingOffer = {
      id: Math.random().toString(36).slice(2),
      venueId,
      venueName,
      artistId,
      artistName,
      proposedDate: terms.proposedDate,
      setLengthMinutes: terms.setLengthMinutes,
      guaranteeUsd: terms.guaranteeUsd,
      revenueSplitPercent: terms.revenueSplitPercent ?? 0,
      coverCharge: terms.coverCharge ?? 0,
      expectedAttendance: terms.expectedAttendance ?? 0,
      perks: terms.perks ?? [],
      message: terms.message,
      status: "pending",
      sentAt: now,
      expiresAt: now + (terms.ttlHours ?? 72) * 3_600_000,
    };
    this._offers.set(offer.id, offer);

    setTimeout(() => {
      const o = this._offers.get(offer.id);
      if (o && o.status === "pending") {
        o.status = "expired";
        this._emit(o);
      }
    }, (terms.ttlHours ?? 72) * 3_600_000);

    this._emit(offer);
    return offer;
  }

  markViewed(offerId: string): void {
    const o = this._offers.get(offerId);
    if (o && o.status === "pending") {
      o.status = "viewed";
      o.viewedAt = Date.now();
      this._emit(o);
    }
  }

  acceptOffer(offerId: string): { success: boolean; offer?: BookingOffer; error?: string } {
    const o = this._offers.get(offerId);
    if (!o) return { success: false, error: "offer not found" };
    if (!["pending", "viewed"].includes(o.status)) return { success: false, error: `offer is ${o.status}` };
    if (Date.now() > o.expiresAt) {
      o.status = "expired";
      return { success: false, error: "offer has expired" };
    }
    o.status = "accepted";
    o.respondedAt = Date.now();
    this._emit(o);
    return { success: true, offer: o };
  }

  declineOffer(offerId: string, reason?: string): { success: boolean; offer?: BookingOffer; error?: string } {
    const o = this._offers.get(offerId);
    if (!o) return { success: false, error: "offer not found" };
    if (!["pending", "viewed"].includes(o.status)) return { success: false, error: `offer is ${o.status}` };
    o.status = "declined";
    o.respondedAt = Date.now();
    o.message = reason ?? o.message;
    this._emit(o);
    return { success: true, offer: o };
  }

  counterOffer(offerId: string, counterGuaranteeUsd: number, counterMessage?: string): { success: boolean; offer?: BookingOffer; error?: string } {
    const o = this._offers.get(offerId);
    if (!o) return { success: false, error: "offer not found" };
    if (!["pending", "viewed"].includes(o.status)) return { success: false, error: `offer is ${o.status}` };
    o.status = "countered";
    o.respondedAt = Date.now();
    o.counterGuaranteeUsd = counterGuaranteeUsd;
    o.counterMessage = counterMessage;
    this._emit(o);
    return { success: true, offer: o };
  }

  withdrawOffer(offerId: string, venueId: string): { success: boolean; error?: string } {
    const o = this._offers.get(offerId);
    if (!o || o.venueId !== venueId) return { success: false, error: "offer not found" };
    if (["accepted", "declined", "expired"].includes(o.status)) return { success: false, error: "cannot withdraw completed offer" };
    o.status = "withdrawn";
    this._emit(o);
    return { success: true };
  }

  linkContract(offerId: string, contractId: string): void {
    const o = this._offers.get(offerId);
    if (o) { o.contractId = contractId; this._emit(o); }
  }

  getOffer(id: string): BookingOffer | null {
    return this._offers.get(id) ?? null;
  }

  getOffersForArtist(artistId: string): BookingOffer[] {
    return [...this._offers.values()].filter((o) => o.artistId === artistId);
  }

  getOffersForVenue(venueId: string): BookingOffer[] {
    return [...this._offers.values()].filter((o) => o.venueId === venueId);
  }

  getPendingOffersForArtist(artistId: string): BookingOffer[] {
    return this.getOffersForArtist(artistId).filter((o) => ["pending", "viewed"].includes(o.status));
  }

  getSummaryForVenue(venueId: string): OfferSummary {
    const all = this.getOffersForVenue(venueId);
    const accepted = all.filter((o) => o.status === "accepted").length;
    const declined = all.filter((o) => o.status === "declined").length;
    const expired = all.filter((o) => o.status === "expired").length;
    const avgGuarantee = all.length > 0
      ? all.reduce((s, o) => s + o.guaranteeUsd, 0) / all.length : 0;
    return {
      totalSent: all.length,
      totalAccepted: accepted,
      totalDeclined: declined,
      totalExpired: expired,
      acceptanceRate: all.length > 0 ? Math.round((accepted / all.length) * 100) : 0,
      avgGuaranteeUsd: Math.round(avgGuarantee),
    };
  }

  onOffer(cb: (offer: BookingOffer) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(offer: BookingOffer): void {
    for (const cb of this._listeners) cb(offer);
  }
}

export const bookingOfferEngine = BookingOfferEngine.getInstance();
