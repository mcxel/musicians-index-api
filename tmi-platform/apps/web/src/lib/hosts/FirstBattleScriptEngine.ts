export type BattleScriptPhase =
  | "open-room"
  | "force-first-action"
  | "trigger-energy"
  | "create-competition"
  | "tip-trigger";

export type BattleScriptEmergency = "dead-chat" | "no-performers" | "no-votes" | "no-movement";

export interface BattleScriptStep {
  id: BattleScriptPhase;
  startMinute: number;
  endMinute: number;
  lines: readonly string[];
}

export const FIRST_BATTLE_SCRIPT_STEPS: readonly BattleScriptStep[] = [
  {
    id: "open-room",
    startMinute: 0,
    endMinute: 2,
    lines: [
      "Room is open. This is live right now. First matchup gets the spotlight. Who's stepping in?",
      "If you're watching, don't just watch - vote decides who stays.",
    ],
  },
  {
    id: "force-first-action",
    startMinute: 2,
    endMinute: 5,
    lines: [
      "I'm calling it - first two names I see go head-to-head.",
      "Chat decides. Vote starts now.",
    ],
  },
  {
    id: "trigger-energy",
    startMinute: 5,
    endMinute: 8,
    lines: [
      "Votes are live. Crown can flip any second.",
      "If you're in here and not voting, you're missing the whole point.",
    ],
  },
  {
    id: "create-competition",
    startMinute: 8,
    endMinute: 12,
    lines: [
      "Current leader is up - but not safe.",
      "Next challenger can take it right now. Who's next?",
    ],
  },
  {
    id: "tip-trigger",
    startMinute: 12,
    endMinute: 15,
    lines: [
      "Support your pick - tips push visibility and keep them on top.",
      "If you're backing someone, show it.",
    ],
  },
] as const;

export const FIRST_BATTLE_SCRIPT_EMERGENCY: Record<BattleScriptEmergency, string> = {
  "dead-chat": "Chat froze - who's actually in here?",
  "no-performers": "Nobody stepping up? I'll pick the next two.",
  "no-votes": "Votes are low - this round doesn't count unless you vote.",
  "no-movement": "You're watching something live and doing nothing. Fix that.",
};

export function getBattleScriptStepAtMinute(minute: number): BattleScriptStep {
  const safeMinute = Number.isFinite(minute) ? Math.max(0, minute) : 0;
  const match = FIRST_BATTLE_SCRIPT_STEPS.find(
    (step) => safeMinute >= step.startMinute && safeMinute < step.endMinute,
  );
  return match ?? FIRST_BATTLE_SCRIPT_STEPS[FIRST_BATTLE_SCRIPT_STEPS.length - 1]!;
}

export function getBattleScriptLinesAtMinute(minute: number): readonly string[] {
  return getBattleScriptStepAtMinute(minute).lines;
}
