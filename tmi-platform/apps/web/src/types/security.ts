// ─── Account tiers ────────────────────────────────────────────────────────────

export type AccountTier = 'ADULT' | 'YOUTH_16';

// ─── Family structure ─────────────────────────────────────────────────────────

export interface FamilyMember {
  id: string;
  userName: string;
  tier: AccountTier;
  isVerifiedCustodian: boolean;
}

export interface FamilyGroup {
  id: string;
  familyName: string;
  members: FamilyMember[];
  approvalThreshold: number; // minimum custodians needed (not necessarily all)
}

// ─── Consensus types ──────────────────────────────────────────────────────────

export type VoteStatus = 'PENDING' | 'APPROVED' | 'DECLINED';
export type ConsensusStatus = 'PENDING' | 'FULLY_APPROVED' | 'REJECTED_WIPED';

export interface ConsensusVote {
  custodianId: string;
  status: VoteStatus;
  castAt?: number;
}

export interface ConsensusRequest {
  requestId: string;
  targetAdultId: string;
  targetAdultName: string;
  targetYouthId: string;
  votes: Record<string, VoteStatus>; // custodianId → vote
  status: ConsensusStatus;
  threshold: number;
  createdAt: number;
  expiresAt: number;
}

// ─── Trust link (approved connection record) ──────────────────────────────────

export interface TrustLink {
  id: string;
  adultId: string;
  youthId: string;
  approvedBy: string[];
  status: 'APPROVED';
  createdAt: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if any custodian has voted DECLINED — immediately invalidates the request. */
export function hasDecline(request: ConsensusRequest): boolean {
  return Object.values(request.votes).includes('DECLINED');
}

/**
 * Returns true when:
 *   - no custodian has declined, AND
 *   - approved count meets the request's threshold
 */
export function isConsensusApproved(
  request: ConsensusRequest,
  custodianIds: string[],
): boolean {
  if (hasDecline(request)) return false;
  const approvals = custodianIds.filter((id) => request.votes[id] === 'APPROVED').length;
  return approvals >= request.threshold;
}

/**
 * Returns true when a YOUTH_16 user is allowed to connect to a remote peer:
 *   - Always true if the local user is ADULT
 *   - True if the remote is also YOUTH_16 (peer-to-peer youth allowed)
 *   - True if the remote adult is in the verified family adult list
 *   - False in all other cases (unverified adult attempting to connect to youth)
 */
export function canYouthConnectToPeer(
  userTier: AccountTier,
  remoteTier: AccountTier,
  remotePeerId: string,
  verifiedFamilyAdultIds: string[],
): boolean {
  if (userTier !== 'YOUTH_16') return true;
  if (remoteTier === 'YOUTH_16') return true;
  return verifiedFamilyAdultIds.includes(remotePeerId);
}
