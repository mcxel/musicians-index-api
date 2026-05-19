'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  hasDecline,
  isConsensusApproved,
  type ConsensusRequest,
  type FamilyGroup,
  type TrustLink,
  type VoteStatus,
} from '@/types/security';

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

interface UseFamilyConsensusReturn {
  activeRequest: ConsensusRequest | null;
  trustLinks: TrustLink[];
  allowConnection: boolean;
  approvedVotes: number;
  hasDeclinedVote: boolean;
  createRequest: (targetAdultId: string, targetAdultName: string, targetYouthId: string) => void;
  approveRequest: (requestId: string, custodianId: string) => void;
  declineRequest: (requestId: string, custodianId: string) => void;
  resetRequest: () => void;
}

export function useFamilyConsensus(familyGroup: FamilyGroup): UseFamilyConsensusReturn {
  const [activeRequest, setActiveRequest] = useState<ConsensusRequest | null>(null);
  const [trustLinks, setTrustLinks] = useState<TrustLink[]>([]);

  const custodians = useMemo(
    () => familyGroup.members.filter((m) => m.isVerifiedCustodian),
    [familyGroup.members],
  );
  const custodianIds = useMemo(() => custodians.map((c) => c.id), [custodians]);

  const approvedVotes = useMemo(() => {
    if (!activeRequest) return 0;
    return Object.values(activeRequest.votes).filter((v) => v === 'APPROVED').length;
  }, [activeRequest]);

  const hasDeclinedVote = useMemo(
    () => (activeRequest ? hasDecline(activeRequest) : false),
    [activeRequest],
  );

  const allowConnection = useMemo(
    () => Boolean(activeRequest && activeRequest.status === 'FULLY_APPROVED' && !hasDeclinedVote),
    [activeRequest, hasDeclinedVote],
  );

  const createRequest = useCallback(
    (targetAdultId: string, targetAdultName: string, targetYouthId: string) => {
      const votes: Record<string, VoteStatus> = {};
      for (const id of custodianIds) votes[id] = 'PENDING';

      const req: ConsensusRequest = {
        requestId: makeId(),
        targetAdultId,
        targetAdultName,
        targetYouthId,
        votes,
        status: 'PENDING',
        threshold: familyGroup.approvalThreshold,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      setActiveRequest(req);
    },
    [custodianIds, familyGroup.approvalThreshold],
  );

  const approveRequest = useCallback(
    (requestId: string, custodianId: string) => {
      setActiveRequest((prev) => {
        if (!prev || prev.requestId !== requestId || prev.status !== 'PENDING') return prev;
        const votes = { ...prev.votes, [custodianId]: 'APPROVED' as VoteStatus };
        const approved = isConsensusApproved({ ...prev, votes }, custodianIds);
        const next: ConsensusRequest = {
          ...prev,
          votes,
          status: approved ? 'FULLY_APPROVED' : 'PENDING',
        };

        if (next.status === 'FULLY_APPROVED') {
          setTrustLinks((current) => {
            const exists = current.some(
              (l) => l.adultId === next.targetAdultId && l.youthId === next.targetYouthId,
            );
            if (exists) return current;
            return [
              ...current,
              {
                id: makeId(),
                adultId: next.targetAdultId,
                youthId: next.targetYouthId,
                approvedBy: custodianIds.filter((id) => next.votes[id] === 'APPROVED'),
                status: 'APPROVED',
                createdAt: Date.now(),
              },
            ];
          });
        }

        return next;
      });
    },
    [custodianIds],
  );

  const declineRequest = useCallback((requestId: string, custodianId: string) => {
    setActiveRequest((prev) => {
      if (!prev || prev.requestId !== requestId || prev.status !== 'PENDING') return prev;
      const votes = { ...prev.votes, [custodianId]: 'DECLINED' as VoteStatus };
      return { ...prev, votes, status: 'REJECTED_WIPED' };
    });
  }, []);

  const resetRequest = useCallback(() => setActiveRequest(null), []);

  return {
    activeRequest,
    trustLinks,
    allowConnection,
    approvedVotes,
    hasDeclinedVote,
    createRequest,
    approveRequest,
    declineRequest,
    resetRequest,
  };
}
