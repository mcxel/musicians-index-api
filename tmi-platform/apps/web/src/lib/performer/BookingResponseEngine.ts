/**
 * BookingResponseEngine
 * Manages incoming booking requests and battle invites for the performer.
 * Tracks request state, generates accept/decline/counter-offer responses.
 */

export type RequestType = "booking" | "battle_invite" | "collab" | "feature" | "meet_greet";
export type RequestStatus = "pending" | "accepted" | "declined" | "countered" | "expired" | "cancelled";

export interface BookingRequest {
  id: string;
  type: RequestType;
  fromUserId: string;
  fromDisplayName: string;
  venueName: string | null;
  proposedDateMs: number | null;
  proposedFeesCents: number | null;
  message: string;
  status: RequestStatus;
  receivedAt: number;
  respondedAt: number | null;
  counterOffer: CounterOffer | null;
  expiresAt: number | null;
}

export interface CounterOffer {
  proposedDateMs: number | null;
  proposedFeesCents: number | null;
  message: string;
}

export interface BookingResponseState {
  performerId: string;
  requests: BookingRequest[];
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  totalOfferedCents: number;
  totalAcceptedCents: number;
}

const MAX_REQUESTS = 200;
const DEFAULT_EXPIRY_MS = 72 * 60 * 60 * 1000;  // 72 hours

const bookingStates = new Map<string, BookingResponseState>();
type BookingListener = (state: BookingResponseState) => void;
const bookingListeners = new Map<string, Set<BookingListener>>();

function computeSummary(requests: BookingRequest[]): Pick<BookingResponseState, "pendingCount" | "acceptedCount" | "declinedCount" | "totalOfferedCents" | "totalAcceptedCents"> {
  return {
    pendingCount: requests.filter(r => r.status === "pending").length,
    acceptedCount: requests.filter(r => r.status === "accepted").length,
    declinedCount: requests.filter(r => r.status === "declined").length,
    totalOfferedCents: requests.reduce((sum, r) => sum + (r.proposedFeesCents ?? 0), 0),
    totalAcceptedCents: requests.filter(r => r.status === "accepted").reduce((sum, r) => sum + (r.proposedFeesCents ?? 0), 0),
  };
}

function notify(performerId: string, state: BookingResponseState): void {
  bookingListeners.get(performerId)?.forEach(l => l(state));
}

export function initBookingEngine(performerId: string): BookingResponseState {
  const state: BookingResponseState = {
    performerId, requests: [],
    pendingCount: 0, acceptedCount: 0, declinedCount: 0,
    totalOfferedCents: 0, totalAcceptedCents: 0,
  };
  bookingStates.set(performerId, state);
  return state;
}

export function ingestRequest(
  performerId: string,
  req: Omit<BookingRequest, "id" | "status" | "receivedAt" | "respondedAt" | "counterOffer" | "expiresAt">
): BookingResponseState {
  const current = bookingStates.get(performerId) ?? initBookingEngine(performerId);
  const request: BookingRequest = {
    ...req,
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "pending",
    receivedAt: Date.now(),
    respondedAt: null,
    counterOffer: null,
    expiresAt: Date.now() + DEFAULT_EXPIRY_MS,
  };
  const requests = [request, ...current.requests].slice(0, MAX_REQUESTS);
  const updated = { ...current, requests, ...computeSummary(requests) };
  bookingStates.set(performerId, updated);
  notify(performerId, updated);
  return updated;
}

function respondToRequest(performerId: string, requestId: string, status: RequestStatus, counterOffer?: CounterOffer): BookingResponseState {
  const current = bookingStates.get(performerId) ?? initBookingEngine(performerId);
  const requests = current.requests.map(r =>
    r.id === requestId ? { ...r, status, respondedAt: Date.now(), counterOffer: counterOffer ?? null } : r
  );
  const updated = { ...current, requests, ...computeSummary(requests) };
  bookingStates.set(performerId, updated);
  notify(performerId, updated);
  return updated;
}

export function acceptRequest(performerId: string, requestId: string): BookingResponseState {
  return respondToRequest(performerId, requestId, "accepted");
}

export function declineRequest(performerId: string, requestId: string): BookingResponseState {
  return respondToRequest(performerId, requestId, "declined");
}

export function counterRequest(performerId: string, requestId: string, offer: CounterOffer): BookingResponseState {
  return respondToRequest(performerId, requestId, "countered", offer);
}

export function expireStaleRequests(performerId: string): BookingResponseState {
  const current = bookingStates.get(performerId) ?? initBookingEngine(performerId);
  const now = Date.now();
  const requests = current.requests.map(r =>
    r.status === "pending" && r.expiresAt !== null && r.expiresAt < now ? { ...r, status: "expired" as RequestStatus } : r
  );
  const updated = { ...current, requests, ...computeSummary(requests) };
  bookingStates.set(performerId, updated);
  notify(performerId, updated);
  return updated;
}

export function getBookingState(performerId: string): BookingResponseState | null {
  return bookingStates.get(performerId) ?? null;
}

export function getPendingRequests(performerId: string): BookingRequest[] {
  return (bookingStates.get(performerId)?.requests ?? []).filter(r => r.status === "pending");
}

export function subscribeToBookings(performerId: string, listener: BookingListener): () => void {
  if (!bookingListeners.has(performerId)) bookingListeners.set(performerId, new Set());
  bookingListeners.get(performerId)!.add(listener);
  const current = bookingStates.get(performerId);
  if (current) listener(current);
  return () => bookingListeners.get(performerId)?.delete(listener);
}
