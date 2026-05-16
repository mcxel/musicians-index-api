import {
  venueSeatMapEngine,
  SeatTier,
  SeatHoldResult,
} from "@/lib/tickets/VenueSeatMapEngine";

export type AuthorityLevel = "admin" | "operator" | "self";

export type GroupSeatStatus = "pending" | "confirmed" | "partial" | "released";

export interface SeatAssignment {
  id: string;
  userId: string;
  venueId: string;
  seatIds: string[];
  holdId: string;
  isVipLocked: boolean;
  authority: AuthorityLevel;
  groupId?: string;
  confirmedAt?: number;
  releasedAt?: number;
  status: "held" | "confirmed" | "released";
}

export interface GroupSeatRequest {
  venueId: string;
  userId: string;
  groupId: string;
  count: number;
  preferTier?: SeatTier;
  requireAdjacent?: boolean;
  authority?: AuthorityLevel;
}

export interface GroupSeatResult {
  success: boolean;
  groupId: string;
  status: GroupSeatStatus;
  assignments: SeatAssignment[];
  error?: string;
}

export interface AssignResult {
  success: boolean;
  assignment?: SeatAssignment;
  error?: string;
}

export interface TransferResult {
  success: boolean;
  newAssignment?: SeatAssignment;
  error?: string;
}

let _assignCounter = 1;
function generateAssignId(): string {
  return `seat_assign_${Date.now()}_${_assignCounter++}`;
}

const _assignments: Map<string, SeatAssignment> = new Map();
const _vipLocks: Set<string> = new Set(); // seatId → locked for VIP

// ── Core operations ───────────────────────────────────────────────────────────

export function assignSeat(
  venueId: string,
  seatId: string,
  userId: string,
  authority: AuthorityLevel = "self"
): AssignResult {
  if (_vipLocks.has(seatId) && authority === "self") {
    return { success: false, error: "Seat is VIP-locked. Requires operator or admin." };
  }

  const holdResult: SeatHoldResult = venueSeatMapEngine.holdSeats(venueId, [seatId], userId);
  if (!holdResult.success) {
    return { success: false, error: holdResult.reason ?? "Seat unavailable" };
  }

  const assignment: SeatAssignment = {
    id: generateAssignId(),
    userId,
    venueId,
    seatIds: [seatId],
    holdId: holdResult.holdId,
    isVipLocked: false,
    authority,
    status: "held",
  };
  _assignments.set(assignment.id, assignment);
  return { success: true, assignment };
}

export function confirmAssignment(assignmentId: string): AssignResult {
  const assignment = _assignments.get(assignmentId);
  if (!assignment) return { success: false, error: "Assignment not found" };
  if (assignment.status !== "held") return { success: false, error: `Cannot confirm: status is ${assignment.status}` };

  const confirmed = venueSeatMapEngine.confirmSale(assignment.venueId, assignment.holdId, assignment.userId);
  if (!confirmed) return { success: false, error: "Hold expired or invalid" };

  const updated: SeatAssignment = { ...assignment, status: "confirmed", confirmedAt: Date.now() };
  _assignments.set(assignmentId, updated);
  return { success: true, assignment: updated };
}

export function releaseSeat(assignmentId: string): boolean {
  const assignment = _assignments.get(assignmentId);
  if (!assignment || assignment.status === "released") return false;

  venueSeatMapEngine.releaseHold(assignment.venueId, assignment.holdId);

  const updated: SeatAssignment = { ...assignment, status: "released", releasedAt: Date.now() };
  _assignments.set(assignmentId, updated);
  return true;
}

export function transferAssignment(
  assignmentId: string,
  toUserId: string,
  authority: AuthorityLevel = "self"
): TransferResult {
  const assignment = _assignments.get(assignmentId);
  if (!assignment) return { success: false, error: "Assignment not found" };
  if (assignment.status === "released") return { success: false, error: "Cannot transfer released seat" };
  if (assignment.isVipLocked && authority === "self") {
    return { success: false, error: "VIP seat transfer requires operator authority" };
  }

  const newAssignment: SeatAssignment = {
    ...assignment,
    id: generateAssignId(),
    userId: toUserId,
    authority,
    confirmedAt: undefined,
    status: "held",
  };
  _assignments.set(newAssignment.id, newAssignment);

  // Release old assignment record
  _assignments.set(assignmentId, { ...assignment, status: "released", releasedAt: Date.now() });

  return { success: true, newAssignment };
}

// ── Group seating ─────────────────────────────────────────────────────────────

export function assignGroupSeats(req: GroupSeatRequest): GroupSeatResult {
  const available = venueSeatMapEngine.getAvailableSeats(req.venueId, req.preferTier);

  if (available.length < req.count) {
    return {
      success: false,
      groupId: req.groupId,
      status: "partial",
      assignments: [],
      error: `Only ${available.length} seats available, requested ${req.count}`,
    };
  }

  const chosen = available.slice(0, req.count);
  const assignments: SeatAssignment[] = [];

  for (const seat of chosen) {
    const result = assignSeat(req.venueId, seat.id, req.userId, req.authority ?? "self");
    if (result.success && result.assignment) {
      assignments.push({ ...result.assignment, groupId: req.groupId });
      _assignments.set(result.assignment.id, { ...result.assignment, groupId: req.groupId });
    }
  }

  return {
    success: assignments.length === req.count,
    groupId: req.groupId,
    status: assignments.length === req.count ? "pending" : "partial",
    assignments,
  };
}

// ── VIP lock ──────────────────────────────────────────────────────────────────

export function lockVipSeat(venueId: string, seatId: string): void {
  _vipLocks.add(`${venueId}:${seatId}`);
}

export function unlockVipSeat(venueId: string, seatId: string): void {
  _vipLocks.delete(`${venueId}:${seatId}`);
}

export function isVipLocked(venueId: string, seatId: string): boolean {
  return _vipLocks.has(`${venueId}:${seatId}`);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function getAssignment(assignmentId: string): SeatAssignment | undefined {
  return _assignments.get(assignmentId);
}

export function getAssignmentsByUser(userId: string): SeatAssignment[] {
  return Array.from(_assignments.values()).filter((a) => a.userId === userId);
}

export function getAssignmentsByVenue(venueId: string): SeatAssignment[] {
  return Array.from(_assignments.values()).filter((a) => a.venueId === venueId && a.status !== "released");
}

export function getConfirmedCount(venueId: string): number {
  return Array.from(_assignments.values()).filter(
    (a) => a.venueId === venueId && a.status === "confirmed"
  ).length;
}
