/**
 * TicketRefundEngine
 * Refund policy enforcement, eligibility checks, and refund processing.
 */

export type RefundStatus = "pending" | "approved" | "denied" | "processed" | "cancelled";
export type RefundReason = "event-cancelled" | "event-rescheduled" | "illness" | "travel-conflict" | "duplicate-purchase" | "technical-error" | "other";
export type RefundMethod = "original-payment" | "tmicoin-credit" | "store-credit";

export interface RefundPolicy {
  /** Days before event that full refund is allowed */
  fullRefundDaysOut: number;
  /** Days before event that partial refund is allowed */
  partialRefundDaysOut: number;
  /** Partial refund percentage (0–100) */
  partialRefundPercent: number;
  /** Whether NFT tickets are refundable */
  nftTicketsRefundable: boolean;
  /** Auto-approve refunds under this amount (cents) */
  autoApproveUnderCents: number;
  /** TMICoin credit bonus percentage when taking store credit */
  storeCreditBonusPercent: number;
}

export interface RefundRequest {
  id: string;
  ticketId: string;
  userId: string;
  orderId: string;
  reason: RefundReason;
  reasonDetail?: string;
  amountPaidCents: number;
  refundAmountCents: number;
  refundMethod: RefundMethod;
  status: RefundStatus;
  requestedAt: number;
  processedAt?: number;
  reviewedBy?: string;
  deniedReason?: string;
  eventStartsAt: number;
}

export interface RefundEligibility {
  eligible: boolean;
  refundPercent: number;
  refundAmountCents: number;
  method: RefundMethod;
  reason: string;
}

const DEFAULT_POLICY: RefundPolicy = {
  fullRefundDaysOut: 7,
  partialRefundDaysOut: 2,
  partialRefundPercent: 50,
  nftTicketsRefundable: false,
  autoApproveUnderCents: 2500,
  storeCreditBonusPercent: 10,
};

export class TicketRefundEngine {
  private static _instance: TicketRefundEngine | null = null;

  private _requests: Map<string, RefundRequest> = new Map();
  private _policy: RefundPolicy = { ...DEFAULT_POLICY };
  private _listeners: Set<(request: RefundRequest) => void> = new Set();

  static getInstance(): TicketRefundEngine {
    if (!TicketRefundEngine._instance) {
      TicketRefundEngine._instance = new TicketRefundEngine();
    }
    return TicketRefundEngine._instance;
  }

  setPolicy(policy: Partial<RefundPolicy>): void {
    this._policy = { ...this._policy, ...policy };
  }

  // ── Eligibility ────────────────────────────────────────────────────────────

  checkEligibility(
    amountPaidCents: number,
    eventStartsAt: number,
    isNFT: boolean,
    reason: RefundReason,
    preferredMethod: RefundMethod = "original-payment",
  ): RefundEligibility {
    if (isNFT && !this._policy.nftTicketsRefundable) {
      return { eligible: false, refundPercent: 0, refundAmountCents: 0, method: preferredMethod, reason: "NFT tickets are non-refundable" };
    }

    if (reason === "event-cancelled") {
      return {
        eligible: true,
        refundPercent: 100,
        refundAmountCents: amountPaidCents,
        method: preferredMethod,
        reason: "event cancelled — full refund",
      };
    }

    const daysOut = (eventStartsAt - Date.now()) / 86_400_000;

    if (daysOut >= this._policy.fullRefundDaysOut) {
      return {
        eligible: true,
        refundPercent: 100,
        refundAmountCents: amountPaidCents,
        method: preferredMethod,
        reason: `${Math.floor(daysOut)} days out — full refund`,
      };
    }

    if (daysOut >= this._policy.partialRefundDaysOut) {
      const amt = Math.round(amountPaidCents * this._policy.partialRefundPercent / 100);
      return {
        eligible: true,
        refundPercent: this._policy.partialRefundPercent,
        refundAmountCents: amt,
        method: preferredMethod,
        reason: `${Math.floor(daysOut)} days out — ${this._policy.partialRefundPercent}% refund`,
      };
    }

    if (preferredMethod === "tmicoin-credit" || preferredMethod === "store-credit") {
      const bonus = Math.round(amountPaidCents * this._policy.storeCreditBonusPercent / 100);
      return {
        eligible: true,
        refundPercent: 100,
        refundAmountCents: amountPaidCents + bonus,
        method: preferredMethod,
        reason: `late request — store credit with ${this._policy.storeCreditBonusPercent}% bonus`,
      };
    }

    return { eligible: false, refundPercent: 0, refundAmountCents: 0, method: preferredMethod, reason: "outside refund window" };
  }

  // ── Request lifecycle ──────────────────────────────────────────────────────

  submitRequest(
    ticketId: string,
    userId: string,
    orderId: string,
    amountPaidCents: number,
    eventStartsAt: number,
    reason: RefundReason,
    preferredMethod: RefundMethod = "original-payment",
    reasonDetail?: string,
    isNFT = false,
  ): { request: RefundRequest | null; eligibility: RefundEligibility } {
    const eligibility = this.checkEligibility(amountPaidCents, eventStartsAt, isNFT, reason, preferredMethod);
    if (!eligibility.eligible) return { request: null, eligibility };

    const autoApprove = eligibility.refundAmountCents <= this._policy.autoApproveUnderCents || reason === "event-cancelled";

    const request: RefundRequest = {
      id: Math.random().toString(36).slice(2),
      ticketId,
      userId,
      orderId,
      reason,
      reasonDetail,
      amountPaidCents,
      refundAmountCents: eligibility.refundAmountCents,
      refundMethod: preferredMethod,
      status: autoApprove ? "approved" : "pending",
      requestedAt: Date.now(),
      eventStartsAt,
    };

    if (autoApprove) {
      request.processedAt = Date.now();
      request.status = "processed";
    }

    this._requests.set(request.id, request);
    this._emit(request);
    return { request, eligibility };
  }

  approveRequest(requestId: string, reviewedBy: string): RefundRequest | null {
    const req = this._requests.get(requestId);
    if (!req || req.status !== "pending") return null;
    req.status = "processed";
    req.processedAt = Date.now();
    req.reviewedBy = reviewedBy;
    this._emit(req);
    return req;
  }

  denyRequest(requestId: string, reviewedBy: string, deniedReason: string): RefundRequest | null {
    const req = this._requests.get(requestId);
    if (!req || req.status !== "pending") return null;
    req.status = "denied";
    req.processedAt = Date.now();
    req.reviewedBy = reviewedBy;
    req.deniedReason = deniedReason;
    this._emit(req);
    return req;
  }

  getRequest(id: string): RefundRequest | null {
    return this._requests.get(id) ?? null;
  }

  getPendingRequests(): RefundRequest[] {
    return [...this._requests.values()].filter((r) => r.status === "pending");
  }

  getRequestsByUser(userId: string): RefundRequest[] {
    return [...this._requests.values()].filter((r) => r.userId === userId);
  }

  getTotalRefundedCents(sinceMs?: number): number {
    return [...this._requests.values()]
      .filter((r) => r.status === "processed" && (!sinceMs || r.processedAt! >= sinceMs))
      .reduce((sum, r) => sum + r.refundAmountCents, 0);
  }

  onRefund(cb: (request: RefundRequest) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(request: RefundRequest): void {
    for (const cb of this._listeners) cb(request);
  }
}

export const ticketRefundEngine = TicketRefundEngine.getInstance();
