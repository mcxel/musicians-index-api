import { transferOwnership, verifyOwnership } from "@/lib/ticketing/TicketOwnershipEngine";

export type TransferStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";

export interface TicketTransferRequest {
  requestId: string;
  ticketId: string;
  fromUserId: string;
  toUserId: string;
  price?: number;
  message?: string;
  status: TransferStatus;
  createdAt: string;
  expiresAt: string;
  resolvedAt?: string;
}

const requests = new Map<string, TicketTransferRequest>();
const userOutgoing = new Map<string, string[]>();
const userIncoming = new Map<string, string[]>();

function gen(): string {
  return `txr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createTransferRequest(
  ticketId: string,
  fromUserId: string,
  toUserId: string,
  opts: { price?: number; message?: string; expiresInMs?: number } = {},
): { ok: boolean; request?: TicketTransferRequest; reason?: string } {
  if (!verifyOwnership(ticketId, fromUserId)) return { ok: false, reason: "not-owner" };
  const existing = [...requests.values()].find(
    (r) => r.ticketId === ticketId && r.status === "pending",
  );
  if (existing) return { ok: false, reason: "transfer-pending" };

  const request: TicketTransferRequest = {
    requestId: gen(),
    ticketId,
    fromUserId,
    toUserId,
    price: opts.price,
    message: opts.message,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (opts.expiresInMs ?? 24 * 60 * 60 * 1000)).toISOString(),
  };

  requests.set(request.requestId, request);
  const out = userOutgoing.get(fromUserId) ?? [];
  out.unshift(request.requestId);
  userOutgoing.set(fromUserId, out);
  const inc = userIncoming.get(toUserId) ?? [];
  inc.unshift(request.requestId);
  userIncoming.set(toUserId, inc);

  return { ok: true, request };
}

export function acceptTransfer(requestId: string): { ok: boolean; reason?: string } {
  const request = requests.get(requestId);
  if (!request || request.status !== "pending") return { ok: false, reason: "not-pending" };
  if (new Date().toISOString() > request.expiresAt) {
    requests.set(requestId, { ...request, status: "expired", resolvedAt: new Date().toISOString() });
    return { ok: false, reason: "expired" };
  }
  const result = transferOwnership(request.ticketId, request.toUserId);
  if (!result) return { ok: false, reason: "transfer-failed" };
  requests.set(requestId, { ...request, status: "accepted", resolvedAt: new Date().toISOString() });
  return { ok: true };
}

export function rejectTransfer(requestId: string): boolean {
  const request = requests.get(requestId);
  if (!request || request.status !== "pending") return false;
  requests.set(requestId, { ...request, status: "rejected", resolvedAt: new Date().toISOString() });
  return true;
}

export function cancelTransfer(requestId: string, userId: string): boolean {
  const request = requests.get(requestId);
  if (!request || request.fromUserId !== userId || request.status !== "pending") return false;
  requests.set(requestId, { ...request, status: "cancelled", resolvedAt: new Date().toISOString() });
  return true;
}

export function getIncomingRequests(userId: string): TicketTransferRequest[] {
  return (userIncoming.get(userId) ?? []).map((id) => requests.get(id)!).filter(Boolean).filter((r) => r.status === "pending");
}

export function getOutgoingRequests(userId: string): TicketTransferRequest[] {
  return (userOutgoing.get(userId) ?? []).map((id) => requests.get(id)!).filter(Boolean).filter((r) => r.status === "pending");
}
