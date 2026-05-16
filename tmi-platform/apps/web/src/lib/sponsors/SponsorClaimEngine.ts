import { PrizeDrop, getPrizeById } from "@/lib/prizes/PrizeDropEngine";
import { SponsorTier } from "@/lib/sponsors/SponsorRewardPlacementEngine";

export type ClaimStatus = "pending" | "validated" | "delivered" | "rejected" | "expired";

export interface SponsorClaim {
  id: string;
  userId: string;
  prizeId: string;
  contestId: string;
  sponsorId?: string;
  sponsorTier?: SponsorTier;
  status: ClaimStatus;
  claimedAt: Date;
  deliveredAt?: Date;
  prize: PrizeDrop;
  notes?: string;
}

export interface ClaimRequest {
  userId: string;
  prizeId: string;
  contestId: string;
  sponsorId?: string;
}

export interface ClaimResult {
  success: boolean;
  claim?: SponsorClaim;
  error?: string;
}

// In-memory claim store (wire to DB when persistence layer is ready)
const _claims: Map<string, SponsorClaim> = new Map();
let _claimCounter = 1;

function generateClaimId(): string {
  return `claim_${Date.now()}_${_claimCounter++}`;
}

function validateClaim(
  request: ClaimRequest,
  prize: PrizeDrop
): { valid: boolean; error?: string } {
  if (!prize.isActive) {
    return { valid: false, error: "Prize is no longer active" };
  }
  if (prize.contestId && prize.contestId !== request.contestId) {
    return { valid: false, error: "Prize does not belong to this contest" };
  }
  if (prize.sponsorId && request.sponsorId && prize.sponsorId !== request.sponsorId) {
    return { valid: false, error: "Sponsor mismatch" };
  }
  for (const claim of _claims.values()) {
    if (claim.userId === request.userId && claim.prizeId === request.prizeId) {
      return { valid: false, error: "Prize already claimed by this user" };
    }
  }
  return { valid: true };
}

export function submitClaim(request: ClaimRequest): ClaimResult {
  const prize = getPrizeById(request.prizeId);
  if (!prize) {
    return { success: false, error: `Prize not found: ${request.prizeId}` };
  }

  const validation = validateClaim(request, prize);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const claim: SponsorClaim = {
    id: generateClaimId(),
    userId: request.userId,
    prizeId: request.prizeId,
    contestId: request.contestId,
    sponsorId: request.sponsorId ?? prize.sponsorId,
    status: "validated",
    claimedAt: new Date(),
    prize,
  };

  _claims.set(claim.id, claim);
  return { success: true, claim };
}

export function deliverClaim(claimId: string): ClaimResult {
  const claim = _claims.get(claimId);
  if (!claim) {
    return { success: false, error: `Claim not found: ${claimId}` };
  }
  if (claim.status !== "validated") {
    return { success: false, error: `Claim is not in validated state: ${claim.status}` };
  }

  const delivered: SponsorClaim = {
    ...claim,
    status: "delivered",
    deliveredAt: new Date(),
  };
  _claims.set(claimId, delivered);
  return { success: true, claim: delivered };
}

export function rejectClaim(claimId: string, reason: string): ClaimResult {
  const claim = _claims.get(claimId);
  if (!claim) {
    return { success: false, error: `Claim not found: ${claimId}` };
  }

  const rejected: SponsorClaim = { ...claim, status: "rejected", notes: reason };
  _claims.set(claimId, rejected);
  return { success: true, claim: rejected };
}

export function getClaimsByUser(userId: string): SponsorClaim[] {
  return Array.from(_claims.values()).filter((c) => c.userId === userId);
}

export function getClaimsByContest(contestId: string): SponsorClaim[] {
  return Array.from(_claims.values()).filter((c) => c.contestId === contestId);
}

export function getClaimById(claimId: string): SponsorClaim | undefined {
  return _claims.get(claimId);
}

export function getPendingClaims(): SponsorClaim[] {
  return Array.from(_claims.values()).filter(
    (c) => c.status === "pending" || c.status === "validated"
  );
}
