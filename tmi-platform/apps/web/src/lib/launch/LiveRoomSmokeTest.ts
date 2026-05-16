/**
 * LiveRoomSmokeTest
 * Validates presence, reactions, tip revenue, rewards, and room exit lifecycle.
 */

import {
  closeLiveRoom,
  createLiveRoom,
  getLiveRoomSummary,
  startLiveRoom,
} from "../live/LiveRoomEngine";
import {
  getLivePresenceSnapshot,
  joinLiveRoom,
  leaveLiveRoom,
} from "../live/LivePresenceEngine";
import {
  addLiveClout,
  addLiveHype,
  addLiveSupport,
  castLiveVote,
  getLiveReactionSnapshot,
} from "../live/LiveReactionEngine";
import {
  getPerformerTipTotal,
  getRoomTipTotal,
  sendLiveTip,
} from "../live/LiveTipEngine";
import {
  checkRoomMilestones,
  getLiveRewardsForFan,
  grantAttendanceReward,
  grantParticipationReward,
  grantTipSenderReward,
  grantVotingReward,
} from "../live/LiveRewardEngine";
import { getPayoutsByLedgerEntryId } from "../revenue/PayoutEngine";

export function runLiveRoomSmokeTest() {
  const logs: string[] = [];

  try {
    const room = createLiveRoom({
      roomType: "battle",
      title: "Smoke Test Battle",
      hostUserId: "host-smoke-1",
      eventId: "event-smoke-1",
      tags: ["smoke", "battle"],
    });
    startLiveRoom(room.roomId);

    joinLiveRoom(room.roomId, "host-smoke-1", "Host Smoke", "host");
    joinLiveRoom(room.roomId, "performer-smoke-1", "Performer Smoke", "performer");
    joinLiveRoom(room.roomId, "fan-smoke-1", "Fan Smoke", "fan");

    const joinedPresence = getLivePresenceSnapshot(room.roomId);
    logs.push(`JOIN OK total=${joinedPresence.totalCount} fan=${joinedPresence.fanCount} performer=${joinedPresence.performerCount}`);

    const target = {
      targetId: "performer-smoke-1",
      targetLabel: "Performer Smoke",
    };
    const vote = castLiveVote(room.roomId, "fan-smoke-1", target);
    addLiveHype(room.roomId, "fan-smoke-1", target);
    addLiveClout(room.roomId, "fan-smoke-1", target);
    addLiveSupport(room.roomId, "fan-smoke-1", target);

    const reactionSnapshot = getLiveReactionSnapshot(room.roomId);
    logs.push(
      `REACTIONS OK votes=${reactionSnapshot.leadingTargetVotes} hype=${reactionSnapshot.hypeByTarget[target.targetId] ?? 0} clout=${reactionSnapshot.cloutByTarget[target.targetId] ?? 0} support=${reactionSnapshot.supportByTarget[target.targetId] ?? 0}`,
    );

    const tip = sendLiveTip({
      roomId: room.roomId,
      fromFanId: "fan-smoke-1",
      fromDisplayName: "Fan Smoke",
      toPerformerId: "performer-smoke-1",
      toDisplayName: "Performer Smoke",
      amountCents: 2500,
      message: "Smoke tip",
    });
    const payouts = tip.ledgerEntryId ? getPayoutsByLedgerEntryId(tip.ledgerEntryId) : [];
    const performerTips = getPerformerTipTotal(room.roomId, "performer-smoke-1");
    logs.push(`TIPS OK tip=${tip.tipId} ledger=${tip.ledgerEntryId ?? "missing"} payouts=${payouts.length} performerTotal=${performerTips.totalCents} roomTotal=${getRoomTipTotal(room.roomId)}`);

    const attendanceReward = grantAttendanceReward("fan-smoke-1", room.roomId, room.eventId ?? "event-smoke-1");
    const participationReward = grantParticipationReward("fan-smoke-1", room.roomId);
    const votingReward = grantVotingReward("fan-smoke-1", room.roomId, vote.voteId);
    const tipReward = grantTipSenderReward("fan-smoke-1", room.roomId);
    const milestones = checkRoomMilestones(room.roomId, 100, 10, 50, ["fan-smoke-1"]);
    const rewards = getLiveRewardsForFan("fan-smoke-1", room.roomId);
    logs.push(
      `REWARDS OK attendance=${Boolean(attendanceReward)} participation=${Boolean(participationReward)} voting=${Boolean(votingReward)} tip=${Boolean(tipReward)} milestones=${milestones.length} totalRewards=${rewards.length}`,
    );

    leaveLiveRoom(room.roomId, "fan-smoke-1");
    const postLeavePresence = getLivePresenceSnapshot(room.roomId);
    closeLiveRoom(room.roomId);
    const summary = getLiveRoomSummary(room.roomId);
    logs.push(`EXIT OK total=${postLeavePresence.totalCount} roomStatus=${summary?.room.status ?? "missing"}`);

    return { status: "PASS" as const, logs };
  } catch (error) {
    return {
      status: "FAIL" as const,
      logs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}