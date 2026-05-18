export type AgeTier = 'YOUTH' | 'ADULT';

export type TrustLink = {
  id: string;
  adultId: string;
  youthId: string;
  approvedBy: string[];    // custodian IDs that approved
  declinedBy: string[];    // custodian IDs that declined (any decline destroys the request)
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  createdAt: number;
};

export type FamilyGroup = {
  id: string;
  custodians: string[];       // adult member IDs — at least one required
  youthMembers: string[];     // youth member IDs
  approvalThreshold: number;  // minimum custodian approvals needed (threshold, not 100%)
};

export type VoteValue = 'PENDING' | 'APPROVED' | 'DECLINED';

export type ConsensusRequest = {
  requestId: string;
  targetAdultId: string;
  targetYouthId: string;
  familyGroupId: string;
  approvals: Record<string, VoteValue>; // custodianId → vote
  threshold: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  createdAt: number;
  expiresAt: number;
};
