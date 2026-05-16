import { setAudiencePresenceState, type TmiAudiencePresenceState } from "@/lib/audience/tmiAudienceSeatPresenceEngine";

export type TmiAudienceReaction =
  | "heart"
  | "fire"
  | "cheer"
  | "clap"
  | "vote"
  | "tip"
  | "chat"
  | "trivia-answer"
  | "spin"
  | "cypher-join";

export type TmiAudienceReactionEvent = {
  roomId: string;
  fanId: string;
  reaction: TmiAudienceReaction;
  payload?: Record<string, string | number | boolean>;
  emittedAt: number;
};

const REACTIONS: TmiAudienceReactionEvent[] = [];

function reactionToPresenceState(reaction: TmiAudienceReaction): TmiAudiencePresenceState {
  switch (reaction) {
    case "cheer":
      return "cheering";
    case "clap":
      return "clapping";
    case "vote":
      return "voting";
    case "tip":
      return "tipping";
    case "chat":
      return "chatting";
    case "trivia-answer":
      return "answering-trivia";
    case "spin":
      return "spinning-reward-wheel";
    case "cypher-join":
      return "joining-cypher";
    default:
      return "watching-performer";
  }
}

export function emitAudienceReaction(event: Omit<TmiAudienceReactionEvent, "emittedAt">): TmiAudienceReactionEvent {
  const normalized: TmiAudienceReactionEvent = {
    ...event,
    emittedAt: Date.now(),
  };

  setAudiencePresenceState(event.roomId, event.fanId, reactionToPresenceState(event.reaction));
  REACTIONS.push(normalized);
  return normalized;
}

export function listAudienceReactions(roomId: string): TmiAudienceReactionEvent[] {
  return REACTIONS.filter((entry) => entry.roomId === roomId);
}
