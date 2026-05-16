// Bridge layer: derives complete performer session analytics from two sources:
//   ProfileSessionStore — real-time fan behavior (reactions, emotes, chat, tips)
//   PerformerAnalyticsEngine — room occupancy and session lifecycle
//
// async signature signals future DB promotion; currently in-memory.
import { getProfileLoopSession } from '@/lib/profile/ProfileSessionStore';
import {
  endPerformerSession,
  getSessionDelta,
  clearSessionDelta,
  getFanSessionIds,
} from '@/lib/performer/PerformerAnalyticsEngine';

export interface PerformerBridgeDelta {
  sessionId: string;
  performerSlug: string;
  roomId: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  fansSeated: number;
  reactions: number;
  emotes: number;
  chat: number;
  tips: number;
  tipAmountCents: number;
  heatScore: number;
}

/**
 * Closes the performer session, derives full analytics from both stores,
 * clears the engine record, and returns the delta.
 *
 * One-shot — returns null if session was already cleared or never started.
 */
export async function closeAndDeriveSession(
  performerSessionId: string,
): Promise<PerformerBridgeDelta | null> {
  endPerformerSession(performerSessionId);

  const base = getSessionDelta(performerSessionId);
  if (!base) return null;

  const fanSids = getFanSessionIds(performerSessionId);

  let reactions = 0;
  let emotes = 0;
  let chat = 0;
  let tips = 0;

  for (const fanSid of fanSids) {
    const session = getProfileLoopSession(fanSid);
    if (!session) continue;
    reactions += session.actionStats.reaction;
    emotes    += session.actionStats.emote;
    chat      += session.actionStats.chat;
    tips      += session.actionStats.tip;
  }

  // Heat formula: engagement intensity, not raw attendance
  const heatScore = reactions * 2 + emotes * 3 + chat * 1 + tips * 10;
  const tipAmountCents = tips * 100; // V1 default unit; replace with actual amounts once tip flow is wired

  clearSessionDelta(performerSessionId);

  return {
    sessionId: base.sessionId,
    performerSlug: base.performerSlug,
    roomId: base.roomId,
    startMs: base.startMs,
    endMs: base.endMs,
    durationMs: base.durationMs,
    fansSeated: base.fansSeated,
    reactions,
    emotes,
    chat,
    tips,
    tipAmountCents,
    heatScore,
  };
}
