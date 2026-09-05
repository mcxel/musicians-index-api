/**
 * ParticipationVotingBridge — resolve honest votingOpen from existing engines.
 * Never fabricates an open window (Rule 20).
 */

import { winnerStaysLifecycleEngine } from "@/lib/competition/WinnerStaysLifecycleEngine";
import { getTally } from "@/lib/competition/BattleVoteClosureEngine";
import { getSession as getBattleRotationSession } from "@/lib/battles/BattleRotationEngine";
import { isRubricVoteOpen } from "@/lib/voting/FanRubricVotingEngine";
import { getLiveRoom } from "@/lib/live/LiveRoomEngine";

export type VotingOpenSource =
  | "winner_stays"
  | "battle_rotation"
  | "battle_vote_tally"
  | "rubric_window"
  | "live_room_config"
  | "prop"
  | "closed";

export type VotingOpenResolution = {
  votingOpen: boolean;
  source: VotingOpenSource;
};

/**
 * Aggregate voting-open signals from competition engines already in the repo.
 * Prop override (from ArenaEventShell / battle page) wins when explicitly true.
 */
export function resolveVotingOpen(input: {
  roomId: string;
  battleId?: string;
  eventId?: string;
  /** Explicit shell prop (rubric / gauntlet phase) */
  propVotingOpen?: boolean;
}): VotingOpenResolution {
  if (input.propVotingOpen === true) {
    return { votingOpen: true, source: "prop" };
  }
  if (input.propVotingOpen === false) {
    // Explicit closed from shell — still check live engines in case host opened mid-session
  }

  const battleId = input.battleId ?? input.roomId.replace(/^battle-/, "");
  const eventId = input.eventId ?? input.roomId;

  const ws = winnerStaysLifecycleEngine.getSession(battleId);
  if (ws && (ws.phase === "RESULT_PENDING" || ws.phase === "CHALLENGER_CALL")) {
    return { votingOpen: true, source: "winner_stays" };
  }

  const rotation = getBattleRotationSession(battleId) ?? getBattleRotationSession(input.roomId);
  if (rotation?.phase === "voting") {
    return { votingOpen: true, source: "battle_rotation" };
  }

  const tally = getTally(battleId) ?? getTally(input.roomId);
  if (tally && !tally.isClosed) {
    return { votingOpen: true, source: "battle_vote_tally" };
  }

  if (isRubricVoteOpen(input.roomId, eventId) || isRubricVoteOpen(input.roomId, battleId)) {
    return { votingOpen: true, source: "rubric_window" };
  }

  const live = getLiveRoom(input.roomId);
  // Config alone is not a phase — only count when host toggled votingEnabled AND a tally/window exists.
  // If only config is true without a window, stay closed (honest).
  if (live?.config.votingEnabled && tally && !tally.isClosed) {
    return { votingOpen: true, source: "live_room_config" };
  }

  return { votingOpen: false, source: "closed" };
}
