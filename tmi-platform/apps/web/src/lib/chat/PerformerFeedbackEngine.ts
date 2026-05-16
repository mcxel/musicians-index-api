import type { RoomChatMessage, RoomRuntimeState } from "./RoomChatEngine";

export type PerformerSignal = {
  id: string;
  type: "support" | "hype" | "boo" | "host-cue" | "judge-note" | "sponsor-callout";
  text: string;
  score: number;
  timestampMs: number;
};

export type PerformerFeedbackSnapshot = {
  state: RoomRuntimeState;
  signals: PerformerSignal[];
  supportScore: number;
  pressureScore: number;
  momentum: "rising" | "steady" | "dropping";
};

function toSignal(msg: RoomChatMessage): PerformerSignal {
  const lower = msg.text.toLowerCase();
  const boo = lower.includes("boo") || msg.reaction === "boo";
  const hype = lower.includes("hype") || lower.includes("fire") || msg.reaction === "fire" || msg.reaction === "hype";
  const support = lower.includes("love") || lower.includes("go ") || lower.includes("yay") || msg.reaction === "yay";

  let type: PerformerSignal["type"] = "support";
  let score = 1;

  if (msg.role === "host") {
    type = "host-cue";
    score = 2;
  } else if (msg.role === "judge") {
    type = "judge-note";
    score = 2;
  } else if (msg.role === "sponsor") {
    type = "sponsor-callout";
    score = 1;
  } else if (boo) {
    type = "boo";
    score = -2;
  } else if (hype) {
    type = "hype";
    score = 3;
  } else if (support) {
    type = "support";
    score = 2;
  }

  return {
    id: `sig-${msg.id}`,
    type,
    text: msg.text,
    score,
    timestampMs: msg.timestampMs,
  };
}

export function buildPerformerFeedback(
  messages: RoomChatMessage[],
  state: RoomRuntimeState,
  limit = 24,
): PerformerFeedbackSnapshot {
  const recent = messages.slice(Math.max(0, messages.length - limit));
  const signals = recent.map(toSignal);

  const supportScore = signals
    .filter((s) => s.score > 0)
    .reduce((sum, s) => sum + s.score, 0);

  const pressureScore = Math.abs(
    signals
      .filter((s) => s.score < 0)
      .reduce((sum, s) => sum + s.score, 0),
  );

  const net = supportScore - pressureScore;
  const momentum: PerformerFeedbackSnapshot["momentum"] =
    net > 8 ? "rising" : net < -3 ? "dropping" : "steady";

  return {
    state,
    signals,
    supportScore,
    pressureScore,
    momentum,
  };
}
