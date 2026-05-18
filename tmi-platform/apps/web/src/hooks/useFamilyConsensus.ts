'use client';

import { useCallback, useState } from 'react';
import type {
  ConsensusRequest,
  FamilyGroup,
  TrustLink,
  VoteValue,
} from '@/types/security';

interface FamilyConsensusState {
  request: ConsensusRequest | null;
  trustLinks: TrustLink[];
}

interface UseFamilyConsensusReturn {
  state: FamilyConsensusState;
  submitRequest: (adultId: string, youthId: string) => void;
  castVote: (custodianId: string, vote: 'APPROVED' | 'DECLINED') => void;
  allowConnection: (adultId: string, youthId: string) => boolean;
  clearRequest: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function useFamilyConsensus(familyGroup: FamilyGroup): UseFamilyConsensusReturn {
  const [state, setState] = useState<FamilyConsensusState>({
    request: null,
    trustLinks: [],
  });

  const submitRequest = useCallback((adultId: string, youthId: string) => {
    const approvals: Record<string, VoteValue> = {};
    for (const id of familyGroup.custodians) {
      approvals[id] = 'PENDING';
    }

    const request: ConsensusRequest = {
      requestId: makeId(),
      targetAdultId: adultId,
      targetYouthId: youthId,
      familyGroupId: familyGroup.id,
      approvals,
      threshold: familyGroup.approvalThreshold,
      status: 'PENDING',
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    setState((prev) => ({ ...prev, request }));
  }, [familyGroup]);

  const castVote = useCallback((custodianId: string, vote: 'APPROVED' | 'DECLINED') => {
    setState((prev) => {
      if (!prev.request || prev.request.status !== 'PENDING') return prev;

      const approvals = { ...prev.request.approvals, [custodianId]: vote };

      // Kill-switch: any single decline immediately destroys the request
      if (vote === 'DECLINED') {
        return {
          ...prev,
          request: { ...prev.request, approvals, status: 'DECLINED' },
        };
      }

      const approvedCount = Object.values(approvals).filter((v) => v === 'APPROVED').length;
      const status: 'PENDING' | 'APPROVED' = approvedCount >= prev.request.threshold
        ? 'APPROVED'
        : 'PENDING';

      if (status === 'APPROVED') {
        const link: TrustLink = {
          id: makeId(),
          adultId: prev.request.targetAdultId,
          youthId: prev.request.targetYouthId,
          approvedBy: Object.keys(approvals).filter((k) => approvals[k] === 'APPROVED'),
          declinedBy: [],
          status: 'APPROVED',
          createdAt: Date.now(),
        };
        return {
          request: { ...prev.request, approvals, status },
          trustLinks: [...prev.trustLinks, link],
        };
      }

      return { ...prev, request: { ...prev.request, approvals, status } };
    });
  }, []);

  const allowConnection = useCallback((adultId: string, youthId: string): boolean => {
    return state.trustLinks.some(
      (link) =>
        link.adultId === adultId &&
        link.youthId === youthId &&
        link.status === 'APPROVED',
    );
  }, [state.trustLinks]);

  const clearRequest = useCallback(() => {
    setState((prev) => ({ ...prev, request: null }));
  }, []);

  return { state, submitRequest, castVote, allowConnection, clearRequest };
}
