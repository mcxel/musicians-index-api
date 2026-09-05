/**
 * ChallengeSceneGraph — canonical Challenge scene graph with RESULT branches.
 */

import {
  CANONICAL_RESULT_BRANCHES,
  type CanonicalSceneGraph,
  type CanonicalSceneNode,
  type ResultSceneBranch,
} from "../contracts/CanonicalSceneGraph";

const nodes: Record<string, CanonicalSceneNode> = {
  INTRO: {
    nodeId: "INTRO",
    label: "Challenge Intro Package",
    nominalDurationMs: 5000,
    children: ["ARRIVAL"],
  },
  ARRIVAL: {
    nodeId: "ARRIVAL",
    label: "Participant Arrival",
    nominalDurationMs: 4000,
    children: ["IDENTITY_LOCK"],
  },
  IDENTITY_LOCK: {
    nodeId: "IDENTITY_LOCK",
    label: "Identity Lock",
    nominalDurationMs: 2500,
    children: ["OBJECTIVE"],
  },
  OBJECTIVE: {
    nodeId: "OBJECTIVE",
    label: "Objective Contract Assembly",
    nominalDurationMs: 6000,
    children: ["RULES"],
  },
  RULES: {
    nodeId: "RULES",
    label: "Rules Lock",
    nominalDurationMs: 3000,
    children: ["JUDGMENT_POLICY"],
  },
  JUDGMENT_POLICY: {
    nodeId: "JUDGMENT_POLICY",
    label: "Judgment Policy Lock",
    nominalDurationMs: 2500,
    children: ["ATTEMPT_COUNTDOWN"],
  },
  ATTEMPT_COUNTDOWN: {
    nodeId: "ATTEMPT_COUNTDOWN",
    label: "Attempt Countdown",
    nominalDurationMs: 3000,
    children: ["ATTEMPT_ACTIVE"],
  },
  ATTEMPT_ACTIVE: {
    nodeId: "ATTEMPT_ACTIVE",
    label: "Attempt Active",
    nominalDurationMs: 60000,
    children: ["ATTEMPT_COMPLETE"],
  },
  ATTEMPT_COMPLETE: {
    nodeId: "ATTEMPT_COMPLETE",
    label: "Attempt Complete",
    nominalDurationMs: 2000,
    children: ["ATTEMPT_COUNTDOWN", "JUDGMENT"],
  },
  JUDGMENT: {
    nodeId: "JUDGMENT",
    label: "Judgment Open",
    nominalDurationMs: 15000,
    children: ["RESULT"],
  },
  RESULT: {
    nodeId: "RESULT",
    label: "Result Hub",
    nominalDurationMs: 1000,
    children: [
      "RESULT.WINNER",
      "RESULT.TIE",
      "RESULT.VOID",
      "RESULT.DISCONNECT",
      "RESULT.OVERTIME",
      "RESULT.REMATCH",
    ],
  },
  "RESULT.WINNER": {
    nodeId: "RESULT.WINNER",
    label: "Winner Presentation",
    nominalDurationMs: 8000,
    children: ["SETTLEMENT_PRESENTATION"],
  },
  "RESULT.TIE": {
    nodeId: "RESULT.TIE",
    label: "Tie Presentation",
    nominalDurationMs: 6000,
    children: ["SETTLEMENT_PRESENTATION"],
  },
  "RESULT.VOID": {
    nodeId: "RESULT.VOID",
    label: "Void Presentation",
    nominalDurationMs: 5000,
    children: ["OUTRO"],
  },
  "RESULT.DISCONNECT": {
    nodeId: "RESULT.DISCONNECT",
    label: "Disconnect Presentation",
    nominalDurationMs: 5000,
    children: ["OUTRO"],
  },
  "RESULT.OVERTIME": {
    nodeId: "RESULT.OVERTIME",
    label: "Overtime Presentation",
    nominalDurationMs: 7000,
    children: ["ATTEMPT_COUNTDOWN", "JUDGMENT"],
  },
  "RESULT.REMATCH": {
    nodeId: "RESULT.REMATCH",
    label: "Rematch Presentation",
    nominalDurationMs: 5000,
    children: ["ARRIVAL"],
  },
  SETTLEMENT_PRESENTATION: {
    nodeId: "SETTLEMENT_PRESENTATION",
    label: "Settlement Status (separate from result)",
    nominalDurationMs: 4000,
    children: ["OUTRO"],
  },
  OUTRO: {
    nodeId: "OUTRO",
    label: "Challenge Complete Outro",
    nominalDurationMs: 3000,
  },
};

export const ChallengeSceneGraph: CanonicalSceneGraph = Object.freeze({
  graphId: "challenge.scene.v1",
  experienceKind: "CHALLENGE",
  root: "INTRO",
  nodes: Object.freeze(nodes),
  resultBranches: CANONICAL_RESULT_BRANCHES,
});

export function resolveChallengeResultBranch(
  outcome: string | null | undefined
): ResultSceneBranch {
  switch (outcome) {
    case "WIN":
    case "LOSS":
      return "WINNER";
    case "TIE":
      return "TIE";
    case "VOID":
    case "DISQUALIFIED":
      return "VOID";
    case "DISCONNECT":
      return "DISCONNECT";
    case "OVERTIME":
      return "OVERTIME";
    case "REMATCH":
      return "REMATCH";
    default:
      return "VOID";
  }
}

export function getChallengeSceneNode(nodeId: string): CanonicalSceneNode | null {
  return ChallengeSceneGraph.nodes[nodeId] ?? null;
}
