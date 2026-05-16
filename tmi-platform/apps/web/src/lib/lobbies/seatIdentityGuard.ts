import { listTicketsByOwner } from "@/lib/tickets/ticketCore";

// ── In-memory identity stores ────────────────────────────────────────────────
// faceScanStore: userId → faceScanId
const faceScanStore = new Map<string, string>();

// avatarStore: userId → { avatarId, faceScanId }
const avatarStore = new Map<string, { avatarId: string; faceScanId: string | null }>();

// seatClaimLog: seatKey (`${roomId}:${seatId}`) → userId
const seatClaimLog = new Map<string, string>();

// ── Registration helpers (called after scan/avatar build completes) ───────────
export function registerFaceScan(userId: string, faceScanId: string): void {
  faceScanStore.set(userId, faceScanId);
}

export function registerAvatar(userId: string, avatarId: string, faceScanId: string | null = null): void {
  avatarStore.set(userId, { avatarId, faceScanId });
}

// ── Result type ───────────────────────────────────────────────────────────────
export type IdentityGuardResult = {
  valid: boolean;
  reason: string;
  chain: {
    faceScan: boolean;
    avatar: boolean;
    ticket: boolean;
    seat: boolean;
  };
};

// ── V2.4 Guard Functions ──────────────────────────────────────────────────────

/**
 * Validate that the given faceScanId is registered to this userId.
 * Allows null faceScanId when face-linked identity is not required.
 */
export function validateFaceOwnership(
  userId: string,
  faceScanId: string | null,
  required = false,
): boolean {
  if (!faceScanId) return !required;
  const registered = faceScanStore.get(userId);
  return registered === faceScanId;
}

/**
 * Validate that the avatarId is registered to this userId.
 * If faceScanId is provided, also confirms the avatar was built from that scan.
 */
export function validateAvatarOwnership(
  userId: string,
  avatarId: string,
  faceScanId: string | null = null,
): boolean {
  const record = avatarStore.get(userId);
  if (!record) return false;
  if (record.avatarId !== avatarId) return false;
  if (faceScanId && record.faceScanId && record.faceScanId !== faceScanId) return false;
  return true;
}

/**
 * Validate that the ticketId is owned by the userId and not redeemed.
 */
export function validateTicketOwnership(userId: string, ticketId: string): boolean {
  const tickets = listTicketsByOwner(userId);
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  if (ticket.redeemed) return false;
  return true;
}

/**
 * Full chain validation: FaceScan → Avatar → Ticket → Seat.
 *
 * faceScanId and avatarId are optional — if not provided, those layers
 * are treated as passed (platform allows entry without scan for general seats).
 * ticketId is required for VIP/BACKSTAGE seats.
 */
export function validateSeatClaim(
  userId: string,
  seatId: string,
  roomId: string,
  options: {
    faceScanId?: string | null;
    avatarId?: string | null;
    ticketId?: string | null;
    requireFaceScan?: boolean;
    requireTicket?: boolean;
  } = {},
): IdentityGuardResult {
  const { faceScanId = null, avatarId = null, ticketId = null, requireFaceScan = false, requireTicket = false } = options;

  const seatKey = `${roomId}:${seatId}`;

  // Check if seat is already claimed by another user
  const existingClaim = seatClaimLog.get(seatKey);
  if (existingClaim && existingClaim !== userId) {
    return {
      valid: false,
      reason: `Seat ${seatId} is already claimed by another user`,
      chain: { faceScan: false, avatar: false, ticket: false, seat: false },
    };
  }

  // Layer 1: Face scan
  const facePassed = validateFaceOwnership(userId, faceScanId, requireFaceScan);
  if (!facePassed) {
    return {
      valid: false,
      reason: "Face scan ID does not match registered scan for this user",
      chain: { faceScan: false, avatar: false, ticket: false, seat: false },
    };
  }

  // Layer 2: Avatar
  const avatarPassed = avatarId ? validateAvatarOwnership(userId, avatarId, faceScanId) : true;
  if (!avatarPassed) {
    return {
      valid: false,
      reason: "Avatar ID does not match registered avatar for this user",
      chain: { faceScan: facePassed, avatar: false, ticket: false, seat: false },
    };
  }

  // Layer 3: Ticket
  const ticketPassed = ticketId
    ? validateTicketOwnership(userId, ticketId)
    : !requireTicket;
  if (!ticketPassed) {
    return {
      valid: false,
      reason: ticketId
        ? `Ticket ${ticketId} is not owned by this user or has been redeemed`
        : "A valid ticket is required to claim this seat",
      chain: { faceScan: facePassed, avatar: avatarPassed, ticket: false, seat: false },
    };
  }

  // Layer 4: Seat — register the claim
  seatClaimLog.set(seatKey, userId);

  return {
    valid: true,
    reason: "Identity chain validated — seat claim granted",
    chain: { faceScan: facePassed, avatar: avatarPassed, ticket: ticketPassed, seat: true },
  };
}

/** Release a seat claim (on leave/disconnect). */
export function releaseSeatClaim(userId: string, seatId: string, roomId: string): boolean {
  const seatKey = `${roomId}:${seatId}`;
  const current = seatClaimLog.get(seatKey);
  if (current !== userId) return false;
  seatClaimLog.delete(seatKey);
  return true;
}

/** Get the current occupant of a seat. */
export function getSeatClaimant(seatId: string, roomId: string): string | null {
  return seatClaimLog.get(`${roomId}:${seatId}`) ?? null;
}

/** Get all active seat claims for a room. */
export function getRoomSeatClaims(roomId: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, userId] of seatClaimLog.entries()) {
    if (key.startsWith(`${roomId}:`)) {
      const seatId = key.slice(roomId.length + 1);
      result[seatId] = userId;
    }
  }
  return result;
}
