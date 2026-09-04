/**
 * CanonicalSceneGraph — ACGBR scene nodes with RESULT branch family.
 */

export type ResultSceneBranch =
  | "WINNER"
  | "TIE"
  | "VOID"
  | "DISCONNECT"
  | "OVERTIME"
  | "REMATCH";

export type CanonicalSceneNodeId =
  | "INTRO"
  | "ARRIVAL"
  | "IDENTITY_LOCK"
  | "OBJECTIVE"
  | "RULES"
  | "JUDGMENT_POLICY"
  | "ATTEMPT_COUNTDOWN"
  | "ATTEMPT_ACTIVE"
  | "ATTEMPT_COMPLETE"
  | "JUDGMENT"
  | "RESULT"
  | "SETTLEMENT_PRESENTATION"
  | "OUTRO"
  | `RESULT.${ResultSceneBranch}`;

export interface CanonicalSceneNode {
  nodeId: CanonicalSceneNodeId;
  label: string;
  /** Nominal duration at FULL pacing; timeline scales by pacing mode. */
  nominalDurationMs: number;
  children?: readonly CanonicalSceneNodeId[];
}

export interface CanonicalSceneGraph {
  graphId: string;
  experienceKind: string;
  root: CanonicalSceneNodeId;
  nodes: Readonly<Record<string, CanonicalSceneNode>>;
  /** RESULT → WINNER|TIE|VOID|DISCONNECT|OVERTIME|REMATCH */
  resultBranches: readonly ResultSceneBranch[];
}

export const CANONICAL_RESULT_BRANCHES: readonly ResultSceneBranch[] = [
  "WINNER",
  "TIE",
  "VOID",
  "DISCONNECT",
  "OVERTIME",
  "REMATCH",
] as const;
