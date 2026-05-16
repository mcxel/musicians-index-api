import { awardPoints, awardXP } from '@/lib/profile/ProfileRewardsEngine';
import { ProfileMemoryEngine } from '@/lib/profile/ProfileMemoryEngine';
import {
  closeProfileLoopSession,
  createProfileLoopSession,
  getProfileLoopSession,
} from '@/lib/profile/ProfileSessionStore';
import { getSmartRoom } from '@/lib/rooms/SmartRoomRouter';

type ReturnSummary = {
  roomId: string;
  sessionId: string;
  xpDelta: number;
  pointsDelta: number;
  shardId: string;
  actionStats: {
    enterRoom: number;
    reaction: number;
    emote: number;
    tip: number;
    chat: number;
  };
  idempotent: boolean;
};

const processedReturns = new Map<string, ReturnSummary>();

function calculateRewards(input: {
  durationSeconds: number;
  actionStats: {
    enterRoom: number;
    reaction: number;
    emote: number;
    tip: number;
    chat: number;
  };
  roomHeat: number;
}): { xpDelta: number; pointsDelta: number } {
  const behaviorXP =
    input.actionStats.reaction * 2 +
    input.actionStats.emote * 3 +
    input.actionStats.chat * 1 +
    input.actionStats.tip * 10;
  const behaviorPoints =
    input.actionStats.reaction * 1 +
    input.actionStats.emote * 1 +
    input.actionStats.chat * 1 +
    input.actionStats.tip * 4;
  const durationBonus = Math.min(80, Math.round(input.durationSeconds / 20));
  const heatBonus = Math.min(20, Math.round(input.roomHeat * 0.2));

  const xpDelta = Math.max(
    20,
    Math.round(20 + behaviorXP + durationBonus + heatBonus),
  );
  const pointsDelta = Math.max(5, Math.round(5 + behaviorPoints + Math.min(8, heatBonus / 2)));
  return { xpDelta, pointsDelta };
}

export class ProfileCoreIdentityLoop {
  static async prepareEntry(fanSlug: string, source = 'fan-profile'): Promise<string> {
    const targetRoom = await Promise.resolve(getSmartRoom());
    const session = createProfileLoopSession({
      fanSlug,
      roomId: targetRoom,
      source,
    });
    console.log('fan_loop_entered', {
      fanSlug,
      roomId: targetRoom,
      sessionId: session.sessionId,
      source,
    });
    return `/live/rooms/${targetRoom}?fan=${encodeURIComponent(fanSlug)}&from=${encodeURIComponent(source)}&sessionId=${encodeURIComponent(session.sessionId)}`;
  }

  static async processReturn(input: {
    fanSlug: string;
    roomId: string;
    sessionId: string;
    roomHeat?: number;
  }): Promise<ReturnSummary | null> {
    if (!input.sessionId) return null;
    const cached = processedReturns.get(input.sessionId);
    if (cached) return { ...cached, idempotent: true };

    const session = closeProfileLoopSession(input.sessionId);
    if (!session) return null;

    const durationSeconds = Math.max(1, Math.round((Date.now() - session.createdAt) / 1000));
    const actionStats = {
      enterRoom: session.actionStats.enter_room,
      reaction: session.actionStats.reaction,
      emote: session.actionStats.emote,
      tip: session.actionStats.tip,
      chat: session.actionStats.chat,
    };
    const { xpDelta, pointsDelta } = calculateRewards({
      durationSeconds,
      actionStats,
      roomHeat: input.roomHeat ?? 30,
    });

    awardXP(input.fanSlug, xpDelta, 'Fan Loop Completion XP');
    awardPoints(input.fanSlug, pointsDelta, 'Fan Loop Completion Points');

    const shard = await ProfileMemoryEngine.captureSessionShard(
      input.fanSlug,
      input.sessionId,
      {
        type: 'fan_loop_completion',
        roomId: input.roomId,
        durationSeconds,
        actionCount: session.actionCount,
        actionStats,
        xpDelta,
        pointsDelta,
      },
    );

    const summary: ReturnSummary = {
      roomId: input.roomId,
      sessionId: input.sessionId,
      xpDelta,
      pointsDelta,
      shardId: shard.id,
      actionStats,
      idempotent: false,
    };
    processedReturns.set(input.sessionId, summary);

    console.log('fan_loop_closed', {
      fanSlug: input.fanSlug,
      roomId: input.roomId,
      sessionId: input.sessionId,
      xpDelta,
      pointsDelta,
      shardId: shard.id,
    });
    return summary;
  }

  static getSessionActionCount(sessionId: string): number {
    return getProfileLoopSession(sessionId)?.actionCount ?? 0;
  }
}
