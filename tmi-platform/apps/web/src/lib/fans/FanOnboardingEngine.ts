/**
 * FanOnboardingEngine
 * Fan signup and first-action onboarding milestones.
 */

import { getFanLead, updateFanLeadState } from "./FanLeadEngine";

export type FanOnboardingRecord = {
  fanId: string;
  leadId: string;
  displayName: string;
  signupStartedAtMs?: number;
  profileStartedAtMs?: number;
  firstFollowAtMs?: number;
  firstArticleReadAtMs?: number;
  firstVoteAtMs?: number;
  firstTicketPurchaseAtMs?: number;
  completedAtMs?: number;
  createdAtMs: number;
  updatedAtMs: number;
};

const records = new Map<string, FanOnboardingRecord>();

function getRecordOrThrow(fanId: string): FanOnboardingRecord {
  const record = records.get(fanId);
  if (!record) throw new Error(`Fan onboarding record ${fanId} not found`);
  return record;
}

function touch(record: FanOnboardingRecord): FanOnboardingRecord {
  const completed =
    !!record.signupStartedAtMs &&
    !!record.profileStartedAtMs &&
    !!record.firstFollowAtMs &&
    !!record.firstArticleReadAtMs &&
    !!record.firstVoteAtMs &&
    !!record.firstTicketPurchaseAtMs;

  const updated: FanOnboardingRecord = {
    ...record,
    completedAtMs: completed ? record.completedAtMs ?? Date.now() : undefined,
    updatedAtMs: Date.now(),
  };

  records.set(updated.fanId, updated);
  return updated;
}

export function startFanSignup(input: {
  fanId: string;
  leadId: string;
  displayName: string;
}): FanOnboardingRecord {
  const lead = getFanLead(input.leadId);
  if (!lead) throw new Error(`Fan lead ${input.leadId} not found`);

  const now = Date.now();
  const created: FanOnboardingRecord = {
    fanId: input.fanId,
    leadId: input.leadId,
    displayName: input.displayName,
    signupStartedAtMs: now,
    createdAtMs: now,
    updatedAtMs: now,
  };

  records.set(created.fanId, created);
  updateFanLeadState(input.leadId, "signup-started");
  return created;
}

export function startFanProfile(fanId: string): FanOnboardingRecord {
  const record = getRecordOrThrow(fanId);
  return touch({
    ...record,
    profileStartedAtMs: record.profileStartedAtMs ?? Date.now(),
  });
}

export function completeFirstFollow(fanId: string): FanOnboardingRecord {
  const record = getRecordOrThrow(fanId);
  return touch({
    ...record,
    firstFollowAtMs: record.firstFollowAtMs ?? Date.now(),
  });
}

export function completeFirstArticleRead(fanId: string): FanOnboardingRecord {
  const record = getRecordOrThrow(fanId);
  return touch({
    ...record,
    firstArticleReadAtMs: record.firstArticleReadAtMs ?? Date.now(),
  });
}

export function completeFirstVote(fanId: string): FanOnboardingRecord {
  const record = getRecordOrThrow(fanId);
  return touch({
    ...record,
    firstVoteAtMs: record.firstVoteAtMs ?? Date.now(),
  });
}

export function completeFirstTicketPurchase(fanId: string): FanOnboardingRecord {
  const record = getRecordOrThrow(fanId);
  const updated = touch({
    ...record,
    firstTicketPurchaseAtMs: record.firstTicketPurchaseAtMs ?? Date.now(),
  });

  updateFanLeadState(updated.leadId, "onboarded");
  if (updated.completedAtMs) {
    updateFanLeadState(updated.leadId, "activated");
  }

  return updated;
}

export function getFanOnboardingRecord(fanId: string): FanOnboardingRecord | null {
  return records.get(fanId) ?? null;
}

export function listFanOnboardingRecords(): FanOnboardingRecord[] {
  return [...records.values()].sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}
