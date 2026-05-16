/**
 * TicketTransferEngine
 * Peer-to-peer ticket transfers with fraud prevention and teen restrictions.
 */

export type TransferStatus = "pending" | "accepted" | "declined" | "cancelled" | "expired" | "blocked";

export interface TicketTransfer {
  id: string;
  ticketId: string;
  fromUserId: string;
  toUserId: string;
  toEmail?: string;
  status: TransferStatus;
  initiatedAt: number;
  expiresAt: number;
  completedAt?: number;
  transferToken: string;
  reason?: string;
  isGift: boolean;
  requiresAcceptance: boolean;
}

export interface TransferPolicy {
  allowTransfer: boolean;
  maxTransfersPerTicket: number;
  maxTransfersPerDay: number;
  minHoursBeforeEvent: number;
  blockMinorToAdult: boolean;
  blockAdultToMinor: boolean;
  requireIdVerification: boolean;
}

export interface TransferResult {
  success: boolean;
  transfer?: TicketTransfer;
  error?: string;
}

const DEFAULT_POLICY: TransferPolicy = {
  allowTransfer: true,
  maxTransfersPerTicket: 3,
  maxTransfersPerDay: 5,
  minHoursBeforeEvent: 2,
  blockMinorToAdult: false,
  blockAdultToMinor: true,
  requireIdVerification: false,
};

function makeToken(): string {
  const arr = new Uint8Array(16);
  if (typeof crypto !== "undefined") crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export class TicketTransferEngine {
  private static _instance: TicketTransferEngine | null = null;

  private _transfers: Map<string, TicketTransfer> = new Map();
  private _ticketTransferCount: Map<string, number> = new Map();
  private _userDailyCount: Map<string, number> = new Map();
  private _policy: TransferPolicy = { ...DEFAULT_POLICY };
  private _listeners: Set<(transfer: TicketTransfer) => void> = new Set();

  static getInstance(): TicketTransferEngine {
    if (!TicketTransferEngine._instance) {
      TicketTransferEngine._instance = new TicketTransferEngine();
    }
    return TicketTransferEngine._instance;
  }

  setPolicy(policy: Partial<TransferPolicy>): void {
    this._policy = { ...this._policy, ...policy };
  }

  initiateTransfer(
    ticketId: string,
    fromUserId: string,
    toUserId: string,
    options: {
      toEmail?: string;
      isGift?: boolean;
      requiresAcceptance?: boolean;
      fromIsMinor?: boolean;
      toIsMinor?: boolean;
      eventStartsAt?: number;
    } = {},
  ): TransferResult {
    if (!this._policy.allowTransfer) {
      return { success: false, error: "transfers are disabled for this event" };
    }

    const ticketCount = this._ticketTransferCount.get(ticketId) ?? 0;
    if (ticketCount >= this._policy.maxTransfersPerTicket) {
      return { success: false, error: "this ticket has reached its transfer limit" };
    }

    const dailyCount = this._userDailyCount.get(fromUserId) ?? 0;
    if (dailyCount >= this._policy.maxTransfersPerDay) {
      return { success: false, error: "daily transfer limit reached" };
    }

    if (this._policy.blockAdultToMinor && !options.fromIsMinor && options.toIsMinor) {
      return { success: false, error: "cannot transfer tickets to minor accounts" };
    }

    if (this._policy.blockMinorToAdult && options.fromIsMinor && !options.toIsMinor) {
      return { success: false, error: "minor accounts cannot transfer tickets to adults" };
    }

    if (options.eventStartsAt) {
      const hoursUntil = (options.eventStartsAt - Date.now()) / 3_600_000;
      if (hoursUntil < this._policy.minHoursBeforeEvent) {
        return { success: false, error: `transfers close ${this._policy.minHoursBeforeEvent}h before the event` };
      }
    }

    const transfer: TicketTransfer = {
      id: Math.random().toString(36).slice(2),
      ticketId,
      fromUserId,
      toUserId,
      toEmail: options.toEmail,
      status: options.requiresAcceptance ? "pending" : "accepted",
      initiatedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      transferToken: makeToken(),
      isGift: options.isGift ?? false,
      requiresAcceptance: options.requiresAcceptance ?? true,
    };

    this._transfers.set(transfer.id, transfer);
    this._ticketTransferCount.set(ticketId, ticketCount + 1);
    this._userDailyCount.set(fromUserId, dailyCount + 1);

    if (!transfer.requiresAcceptance) {
      transfer.completedAt = Date.now();
    } else {
      setTimeout(() => {
        const t = this._transfers.get(transfer.id);
        if (t && t.status === "pending") {
          t.status = "expired";
          this._emit(t);
        }
      }, 24 * 60 * 60 * 1000);
    }

    this._emit(transfer);
    return { success: true, transfer };
  }

  acceptTransfer(transferId: string, token: string): TransferResult {
    const transfer = this._transfers.get(transferId);
    if (!transfer) return { success: false, error: "transfer not found" };
    if (transfer.status !== "pending") return { success: false, error: `transfer is ${transfer.status}` };
    if (transfer.transferToken !== token) return { success: false, error: "invalid transfer token" };
    if (Date.now() > transfer.expiresAt) {
      transfer.status = "expired";
      return { success: false, error: "transfer has expired" };
    }
    transfer.status = "accepted";
    transfer.completedAt = Date.now();
    this._emit(transfer);
    return { success: true, transfer };
  }

  declineTransfer(transferId: string, toUserId: string): TransferResult {
    const transfer = this._transfers.get(transferId);
    if (!transfer || transfer.toUserId !== toUserId) return { success: false, error: "transfer not found" };
    if (transfer.status !== "pending") return { success: false, error: "transfer is not pending" };
    transfer.status = "declined";
    transfer.completedAt = Date.now();
    this._emit(transfer);
    return { success: true, transfer };
  }

  cancelTransfer(transferId: string, fromUserId: string): TransferResult {
    const transfer = this._transfers.get(transferId);
    if (!transfer || transfer.fromUserId !== fromUserId) return { success: false, error: "transfer not found" };
    if (transfer.status !== "pending") return { success: false, error: "can only cancel pending transfers" };
    transfer.status = "cancelled";
    this._emit(transfer);
    return { success: true, transfer };
  }

  getTransfer(id: string): TicketTransfer | null {
    return this._transfers.get(id) ?? null;
  }

  getTransfersForTicket(ticketId: string): TicketTransfer[] {
    return [...this._transfers.values()].filter((t) => t.ticketId === ticketId);
  }

  getPendingForUser(userId: string): TicketTransfer[] {
    return [...this._transfers.values()].filter((t) => t.toUserId === userId && t.status === "pending");
  }

  onTransfer(cb: (transfer: TicketTransfer) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(transfer: TicketTransfer): void {
    for (const cb of this._listeners) cb(transfer);
  }
}

export const ticketTransferEngine = TicketTransferEngine.getInstance();
