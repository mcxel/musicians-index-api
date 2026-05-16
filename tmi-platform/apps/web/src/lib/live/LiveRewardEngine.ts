/**
 * LiveRewardEngine
 * Attendance, participation, voting, and room milestone rewards for live sessions.
 * Bridges to FanRewardActivationEngine for point grants.
 */

import {
  activateEventAttendanceReward,
  activateVoteReward,
  type FanRewardActivation,
} from "@/lib/fans/FanRewardActivationEngine";

export type LiveRewardType =
  | "attendance"         // entered and stayed in a live room
  | "live-participation" // reacted/hyped/clout during session
  | "live-vote"          // cast a vote in a contest or battle
  | "tip-sender"         // sent a tip (engagement signal)
  | "room-milestone"     // room hit a crowd/reaction milestone
  | "battle-witness"     // watched a full battle round
  | "cypher-support";    // supported a cypher performer

export type LiveRewardRecord = {
  rewardRecordId: string;
  fanId: string;
  roomId: string;
  rewardType: LiveRewardType;
  pointsGranted: number;
  ledgerRef?: string;     // ties back to FanRewardActivation.rewardActivationId
  grantedAtMs: number;
  metadata?: Record<string, string | number | boolean>;
};

export type RoomMilestone = {
  milestoneId: string;
  roomId: string;
  milestoneType: "crowd-100" | "crowd-500" | "crowd-1000" | "reactions-50" | "tips-10" | "tips-100";
  triggeredAtMs: number;
  rewardedFanIds: string[];
};

// Base point values — distinct from ledger currency, these are XP-style points
const POINT_VALUES: Record<LiveRewardType, number> = {
  "attendance": 40,
  "live-participation": 25,
  "live-vote": 30,
  "tip-sender": 20,
  "room-milestone": 75,
  "battle-witness": 45,
  "cypher-support": 35,
};

// --- in-memory stores ---
const rewardRecords: LiveRewardRecord[] = [];
const milestones: RoomMilestone[] = [];
// Tracks which fans have received which reward types in a room (idempotency)
const grantedSet: Set<string> = new Set(); // `${fanId}:${roomId}:${rewardType}`
let rewardCounter = 0;
let milestoneCounter = 0;

function alreadyGranted(fanId: string, roomId: string, rewardType: LiveRewardType): boolean {
  return grantedSet.has(`${fanId}:${roomId}:${rewardType}`);
}

function markGranted(fanId: string, roomId: string, rewardType: LiveRewardType): void {
  grantedSet.add(`${fanId}:${roomId}:${rewardType}`);
}

function issueReward(
  fanId: string,
  roomId: string,
  rewardType: LiveRewardType,
  ledgerRef?: string,
  metadata?: Record<string, string | number | boolean>,
): LiveRewardRecord | null {
  if (alreadyGranted(fanId, roomId, rewardType)) return null;

  const record: LiveRewardRecord = {
    rewardRecordId: `live-reward-${++rewardCounter}`,
    fanId,
    roomId,
    rewardType,
    pointsGranted: POINT_VALUES[rewardType],
    ledgerRef,
    grantedAtMs: Date.now(),
    metadata,
  };

  rewardRecords.unshift(record);
  markGranted(fanId, roomId, rewardType);
  return record;
}

// --- Public Write API ---

export function grantAttendanceReward(
  fanId: string,
  roomId: string,
  eventId: string,
): LiveRewardRecord | null {
  const activation: FanRewardActivation = activateEventAttendanceReward(fanId, eventId);
  return issueReward(fanId, roomId, "attendance", activation.rewardActivationId, {
    eventId,
  });
}

export function grantParticipationReward(
  fanId: string,
  roomId: string,
): LiveRewardRecord | null {
  return issueReward(fanId, roomId, "live-participation");
}

export function grantVotingReward(
  fanId: string,
  roomId: string,
  voteId: string,
): LiveRewardRecord | null {
  const activation: FanRewardActivation = activateVoteReward(fanId, voteId);
  return issueReward(fanId, roomId, "live-vote", activation.rewardActivationId, {
    voteId,
  });
}

export function grantTipSenderReward(
  fanId: string,
  roomId: string,
): LiveRewardRecord | null {
  return issueReward(fanId, roomId, "tip-sender");
}

export function grantBattleWitnessReward(
  fanId: string,
  roomId: string,
): LiveRewardRecord | null {
  return issueReward(fanId, roomId, "battle-witness");
}

export function grantCypherSupportReward(
  fanId: string,
  roomId: string,
): LiveRewardRecord | null {
  return issueReward(fanId, roomId, "cypher-support");
}

export function checkRoomMilestones(
  roomId: string,
  currentCount: number,
  tipCount: number,
  reactionCount: number,
  fanIdsToReward: string[],
): RoomMilestone[] {
  const triggered: RoomMilestone[] = [];
  const existingTypes = new Set(
    milestones.filter((m) => m.roomId === roomId).map((m) => m.milestoneType),
  );

  const checks: Array<[RoomMilestone["milestoneType"], boolean]> = [
    ["crowd-100", currentCount >= 100],
    ["crowd-500", currentCount >= 500],
    ["crowd-1000", currentCount >= 1000],
    ["reactions-50", reactionCount >= 50],
    ["tips-10", tipCount >= 10],
    ["tips-100", tipCount >= 100],
  ];

  for (const [milestoneType, met] of checks) {
    if (met && !existingTypes.has(milestoneType)) {
      const milestone: RoomMilestone = {
        milestoneId: `milestone-${++milestoneCounter}`,
        roomId,
        milestoneType,
        triggeredAtMs: Date.now(),
        rewardedFanIds: [...fanIdsToReward],
      };
      milestones.push(milestone);
      triggered.push(milestone);

      // Grant milestone reward to all present fans
      for (const fanId of fanIdsToReward) {
        issueReward(fanId, roomId, "room-milestone", undefined, { milestoneType });
      }
    }
  }

  return triggered;
}

// --- Read API ---

export function getLiveRewardsForFan(fanId: string, roomId: string): LiveRewardRecord[] {
  return rewardRecords.filter((r) => r.fanId === fanId && r.roomId === roomId);
}

export function getLiveRewardsForRoom(roomId: string, limit = 100): LiveRewardRecord[] {
  return rewardRecords
    .filter((r) => r.roomId === roomId)
    .slice(0, Math.max(1, limit));
}

export function getRoomMilestones(roomId: string): RoomMilestone[] {
  return milestones.filter((m) => m.roomId === roomId);
}

export function getFanLivePoints(fanId: string): number {
  return rewardRecords
    .filter((r) => r.fanId === fanId)
    .reduce((sum, r) => sum + r.pointsGranted, 0);
}

export function getLiveRewardLeaderboard(
  roomId: string,
  limit = 20,
): Array<{ fanId: string; totalPoints: number }> {
  const pointMap = new Map<string, number>();
  for (const r of rewardRecords.filter((rec) => rec.roomId === roomId)) {
    pointMap.set(r.fanId, (pointMap.get(r.fanId) ?? 0) + r.pointsGranted);
  }
  return [...pointMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, limit))
    .map(([fanId, totalPoints]) => ({ fanId, totalPoints }));
}
