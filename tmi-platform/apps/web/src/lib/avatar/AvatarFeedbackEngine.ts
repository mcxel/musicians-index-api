/**
 * AvatarFeedbackEngine
 * Routes user and system feedback into the avatar learning pipeline.
 * Acts as the clean entry point — all feedback passes through safety checks here.
 */

import { recordInteraction, type LearnSignal } from "@/lib/avatar/AvatarLearningEngine";
import { recordMemoryEntry } from "@/lib/avatar/AvatarInteractionMemoryEngine";
import { awardSkillXP, type AvatarSkill } from "@/lib/avatar/AvatarSkillGrowthEngine";

export type FeedbackSource = "user" | "system" | "host" | "crowd" | "battle_result" | "reward_system";

export interface AvatarFeedbackEvent {
  avatarId: string;
  source: FeedbackSource;
  signal: LearnSignal;
  context: string;
  skillAffected: AvatarSkill | null;
  xpAmount: number;
  timestamp: number;
  safetyChecked: boolean;
}

const MAX_XP_PER_FEEDBACK = 15;
const feedbackLog: AvatarFeedbackEvent[] = [];
const MAX_LOG = 500;

function isSafeFeedback(source: FeedbackSource, xp: number): boolean {
  if (xp > MAX_XP_PER_FEEDBACK) return false;
  if (xp < 0) return false;
  return true;
}

export function submitFeedback(input: {
  avatarId: string;
  source: FeedbackSource;
  signal: LearnSignal;
  context: string;
  skillAffected?: AvatarSkill;
  xpAmount?: number;
}): AvatarFeedbackEvent {
  const xp = Math.min(MAX_XP_PER_FEEDBACK, Math.max(0, input.xpAmount ?? 5));
  const safe = isSafeFeedback(input.source, xp);

  const event: AvatarFeedbackEvent = {
    avatarId: input.avatarId,
    source: input.source,
    signal: input.signal,
    context: input.context,
    skillAffected: input.skillAffected ?? null,
    xpAmount: xp,
    timestamp: Date.now(),
    safetyChecked: safe,
  };

  if (safe) {
    const interactionType = input.source === "user" || input.source === "host"
      ? "user_feedback"
      : input.source === "reward_system"
        ? "reward_event"
        : input.source === "crowd"
          ? "crowd_reaction"
          : input.source === "battle_result"
            ? "battle_participated"
            : "fan_response";

    recordInteraction(input.avatarId, interactionType, input.context, input.signal);
    recordMemoryEntry(input.avatarId, interactionType, input.context, input.signal);

    if (input.skillAffected && input.signal !== "negative") {
      awardSkillXP(input.avatarId, input.skillAffected, xp, `feedback from ${input.source}: ${input.context}`);
    }
  }

  feedbackLog.unshift(event);
  if (feedbackLog.length > MAX_LOG) feedbackLog.pop();

  return event;
}

export function getRecentFeedback(count = 50): AvatarFeedbackEvent[] {
  return feedbackLog.slice(0, count);
}

export function getFeedbackForAvatar(avatarId: string, count = 30): AvatarFeedbackEvent[] {
  return feedbackLog.filter(e => e.avatarId === avatarId).slice(0, count);
}

export function getBlockedFeedback(): AvatarFeedbackEvent[] {
  return feedbackLog.filter(e => !e.safetyChecked);
}
