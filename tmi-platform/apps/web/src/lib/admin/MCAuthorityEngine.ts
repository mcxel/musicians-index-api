export type MCStatus = "green" | "yellow" | "red";

export type MCAuthorityDecision = {
  decisionId: string;
  targetId: string;
  targetType: "task" | "report" | "goal" | "checkpoint";
  status: MCStatus;
  reason: string;
  approvedBy: string;
  createdAt: number;
};

const decisionMap = new Map<string, MCAuthorityDecision>();

export function decideMCAuthority(input: {
  targetId: string;
  targetType: "task" | "report" | "goal" | "checkpoint";
  status: MCStatus;
  reason: string;
  approvedBy?: string;
}): MCAuthorityDecision {
  const decision: MCAuthorityDecision = {
    decisionId: `mc-${input.targetType}-${input.targetId}-${Date.now()}`,
    targetId: input.targetId,
    targetType: input.targetType,
    status: input.status,
    reason: input.reason,
    approvedBy: input.approvedBy ?? "mc-michael-charlie",
    createdAt: Date.now(),
  };
  decisionMap.set(`${input.targetType}:${input.targetId}`, decision);
  return decision;
}

export function getMCAuthorityStatus(targetId: string, targetType: "task" | "report" | "goal" | "checkpoint"): MCStatus {
  return decisionMap.get(`${targetType}:${targetId}`)?.status ?? "yellow";
}

export function listMCAuthorityDecisions() {
  return [...decisionMap.values()];
}

export function summarizeMCAuthority() {
  const decisions = listMCAuthorityDecisions();
  return {
    green: decisions.filter((decision) => decision.status === "green").length,
    yellow: decisions.filter((decision) => decision.status === "yellow").length,
    red: decisions.filter((decision) => decision.status === "red").length,
    total: decisions.length,
  };
}
