/**
 * BookingContractEngine
 * Digital agreements between artists and venues. Offer → Counter → Sign → Execute.
 */
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

export type ContractStatus = "draft" | "sent" | "countered" | "signed" | "cancelled" | "expired" | "executed";

export interface ContractTerms {
  performanceDate: string;      // ISO date
  setLengthMinutes: number;
  guaranteeUsd: number;
  revenueSplitPercent: number;  // artist's share of door
  merchandisingRights: boolean;
  soundcheckIncluded: boolean;
  hotelIncluded: boolean;
  travelReimbursementUsd: number;
  advancePaymentPercent: number;
  cancellationPolicyDays: number;
  setList?: string[];
  riderRequirements?: string[];
  additionalNotes?: string;
}

export interface Contract {
  id: string;
  venueId: string;
  artistId: string;
  terms: ContractTerms;
  status: ContractStatus;
  initiatedBy: "venue" | "artist";
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  venueSigned: boolean;
  artistSigned: boolean;
  signedAt?: number;
  counterHistory: ContractTerms[];
  executedAt?: number;
  revisionCount: number;
}

export interface ContractResult {
  success: boolean;
  contract?: Contract;
  error?: string;
}

const MAX_REVISIONS = 5;
const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export class BookingContractEngine {
  private static _instance: BookingContractEngine | null = null;

  private _contracts: Map<string, Contract> = new Map();
  private _listeners: Set<(contract: Contract) => void> = new Set();

  static getInstance(): BookingContractEngine {
    if (!BookingContractEngine._instance) {
      BookingContractEngine._instance = new BookingContractEngine();
    }
    return BookingContractEngine._instance;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  createContract(
    venueId: string,
    artistId: string,
    terms: ContractTerms,
    initiatedBy: "venue" | "artist" = "venue",
  ): Contract {
    const now = Date.now();
    const contract: Contract = {
      id: Math.random().toString(36).slice(2, 14),
      venueId,
      artistId,
      terms,
      status: "draft",
      initiatedBy,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + DEFAULT_EXPIRY_MS,
      venueSigned: false,
      artistSigned: false,
      counterHistory: [],
      revisionCount: 0,
    };
    this._contracts.set(contract.id, contract);
    this._emit(contract);
    return contract;
  }

  // ── Offer flow ─────────────────────────────────────────────────────────────

  sendOffer(contractId: string): ContractResult {
    const c = this._contracts.get(contractId);
    if (!c) return { success: false, error: "contract not found" };
    if (c.status !== "draft") return { success: false, error: "only draft contracts can be sent" };
    c.status = "sent";
    c.updatedAt = Date.now();
    this._emit(c);
    return { success: true, contract: c };
  }

  counterOffer(contractId: string, newTerms: ContractTerms, counteringParty: "venue" | "artist"): ContractResult {
    const c = this._contracts.get(contractId);
    if (!c) return { success: false, error: "contract not found" };
    if (!["sent", "countered"].includes(c.status)) return { success: false, error: "contract is not in a counterable state" };
    if (c.revisionCount >= MAX_REVISIONS) return { success: false, error: "maximum revisions reached" };

    c.counterHistory.push({ ...c.terms });
    c.terms = newTerms;
    c.status = "countered";
    c.revisionCount++;
    c.updatedAt = Date.now();
    c.venueSigned = false;
    c.artistSigned = false;
    void counteringParty;
    this._emit(c);
    return { success: true, contract: c };
  }

  // ── Signing ────────────────────────────────────────────────────────────────

  sign(contractId: string, party: "venue" | "artist"): ContractResult {
    const c = this._contracts.get(contractId);
    if (!c) return { success: false, error: "contract not found" };
    if (!["sent", "countered"].includes(c.status)) return { success: false, error: "contract cannot be signed in current state" };
    if (Date.now() > c.expiresAt) {
      c.status = "expired";
      this._emit(c);
      return { success: false, error: "contract has expired" };
    }

    if (party === "venue") c.venueSigned = true;
    if (party === "artist") c.artistSigned = true;

    if (c.venueSigned && c.artistSigned) {
      c.status = "signed";
      c.signedAt = Date.now();
    }

    c.updatedAt = Date.now();
    this._emit(c);
    return { success: true, contract: c };
  }

  execute(contractId: string): ContractResult {
    const c = this._contracts.get(contractId);
    if (!c) return { success: false, error: "contract not found" };
    if (c.status !== "signed") return { success: false, error: "contract must be signed before execution" };
    c.status = "executed";
    c.executedAt = Date.now();
    c.updatedAt = Date.now();
    this._emit(c);
    Analytics.revenue({ userId: c.artistId, amount: c.terms.guaranteeUsd, currency: 'usd', product: 'booking-guarantee', activePersona: 'artist' });
    Analytics.groupAction({ userId: c.artistId, groupId: c.venueId, action: 'booking-executed', activePersona: 'artist' });
    return { success: true, contract: c };
  }

  cancel(contractId: string): ContractResult {
    const c = this._contracts.get(contractId);
    if (!c) return { success: false, error: "contract not found" };
    if (["executed", "cancelled"].includes(c.status)) return { success: false, error: "cannot cancel contract in current state" };
    c.status = "cancelled";
    c.updatedAt = Date.now();
    this._emit(c);
    return { success: true, contract: c };
  }

  // ── Lookup ────────────────────────────────────────────────────────────────

  getContract(id: string): Contract | null {
    return this._contracts.get(id) ?? null;
  }

  getContractsByVenue(venueId: string): Contract[] {
    return [...this._contracts.values()].filter((c) => c.venueId === venueId);
  }

  getContractsByArtist(artistId: string): Contract[] {
    return [...this._contracts.values()].filter((c) => c.artistId === artistId);
  }

  getPendingContracts(): Contract[] {
    return [...this._contracts.values()].filter((c) => ["sent", "countered"].includes(c.status));
  }

  // ── Value helpers ──────────────────────────────────────────────────────────

  calculateTotalValue(terms: ContractTerms, estimatedAttendance: number, ticketPriceUsd: number): number {
    const doorRevenue = estimatedAttendance * ticketPriceUsd * (terms.revenueSplitPercent / 100);
    return terms.guaranteeUsd + doorRevenue + terms.travelReimbursementUsd;
  }

  // ── Subscription ──────────────────────────────────────────────────────────

  onContractChange(cb: (contract: Contract) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(contract: Contract): void {
    for (const cb of this._listeners) cb(contract);
  }
}

export const bookingContractEngine = BookingContractEngine.getInstance();
