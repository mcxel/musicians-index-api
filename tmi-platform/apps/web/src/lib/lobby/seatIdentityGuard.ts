export type SeatIdentityChain = {
  faceScanId: string;
  avatarId: string;
  ticketId: string;
  seatId: string;
  ownerUserId: string;
  claimedAt: number;
  expiresAt: number;
};

export type SeatIdentityInput = {
  faceScanId?: string;
  avatarId?: string;
  ticketId?: string;
  seatId: string;
  ownerUserId: string;
  nowMs?: number;
  ttlMs?: number;
};

export type SeatIdentityValidation =
  | { ok: true; binding: SeatIdentityChain }
  | { ok: false; reason: string };

const DEFAULT_TTL_MS = 1000 * 60 * 10;

export function validateSeatOwner(input: SeatIdentityInput): SeatIdentityValidation {
  if (!input.faceScanId) return { ok: false, reason: "Missing Face Scan ID" };
  if (!input.avatarId) return { ok: false, reason: "Missing Avatar ID" };
  if (!input.ticketId) return { ok: false, reason: "Missing Ticket ID" };
  if (!input.seatId) return { ok: false, reason: "Missing Seat ID" };

  const nowMs = input.nowMs ?? Date.now();
  const ttlMs = input.ttlMs ?? DEFAULT_TTL_MS;

  return {
    ok: true,
    binding: {
      faceScanId: input.faceScanId,
      avatarId: input.avatarId,
      ticketId: input.ticketId,
      seatId: input.seatId,
      ownerUserId: input.ownerUserId,
      claimedAt: nowMs,
      expiresAt: nowMs + ttlMs,
    },
  };
}

export function releaseExpiredSeat(
  bindings: SeatIdentityChain[],
  nowMs = Date.now(),
): { activeBindings: SeatIdentityChain[]; releasedSeatIds: string[] } {
  const activeBindings: SeatIdentityChain[] = [];
  const releasedSeatIds: string[] = [];

  for (const binding of bindings) {
    if (binding.expiresAt <= nowMs) {
      releasedSeatIds.push(binding.seatId);
      continue;
    }
    activeBindings.push(binding);
  }

  return { activeBindings, releasedSeatIds };
}
