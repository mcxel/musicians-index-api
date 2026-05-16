export type GovernanceRole = "marcel-root" | "big-ace" | "mc" | "jay-justin" | "sentinel" | "worker-bot";

export type GovernanceActionType =
  | "dispatch.bot.task"
  | "approve.patch"
  | "run.simulation"
  | "financial.transfer"
  | "legal.finalize"
  | "policy.override"
  | "ui.suggestion";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type GovernanceAction = {
  id: string;
  type: GovernanceActionType;
  actor: GovernanceRole;
  target: string;
  risk: RiskLevel;
  policyOverrideRequested?: boolean;
};

export type GovernanceDecision = {
  allowed: boolean;
  reason: string;
  requiredApprovals: GovernanceRole[];
  timestamp: number;
};

export type AuthorityPolicyConfig = {
  allowBigAceRootOverride: boolean;
  highRiskChain: GovernanceRole[];
};

const defaultPolicy: AuthorityPolicyConfig = {
  allowBigAceRootOverride: false,
  highRiskChain: ["marcel-root", "big-ace", "mc"],
};

const authorityAuditLog: Array<GovernanceAction & GovernanceDecision> = [];

export function evaluateGovernanceAction(
  action: GovernanceAction,
  config: AuthorityPolicyConfig = defaultPolicy,
): GovernanceDecision {
  if (action.type === "policy.override" && action.actor === "big-ace" && !config.allowBigAceRootOverride) {
    return {
      allowed: false,
      reason: "Big Ace cannot override Marcel/root final authority unless policy explicitly enables it.",
      requiredApprovals: ["marcel-root"],
      timestamp: Date.now(),
    };
  }

  if (action.actor === "jay-justin" && action.type !== "ui.suggestion") {
    return {
      allowed: false,
      reason: "Jay/Justin are suggestion-only unless scoped permissions are granted.",
      requiredApprovals: ["marcel-root", "mc"],
      timestamp: Date.now(),
    };
  }

  if (action.type === "financial.transfer" || action.type === "legal.finalize") {
    return {
      allowed: action.actor === "marcel-root",
      reason: action.actor === "marcel-root"
        ? "Authorized by Marcel/root final authority."
        : "Financial/legal final decisions require Marcel/root approval.",
      requiredApprovals: ["marcel-root", "mc"],
      timestamp: Date.now(),
    };
  }

  if (action.risk === "high" || action.risk === "critical") {
    return {
      allowed: action.actor === "marcel-root" || action.actor === "big-ace" || action.actor === "mc",
      reason: "High risk action must route through Marcel/root + Big Ace + MC approval chain.",
      requiredApprovals: config.highRiskChain,
      timestamp: Date.now(),
    };
  }

  return {
    allowed: true,
    reason: "Action allowed under current governance policy.",
    requiredApprovals: action.actor === "worker-bot" ? ["big-ace", "mc"] : ["big-ace"],
    timestamp: Date.now(),
  };
}

export function dispatchBotTask(taskId: string, actor: GovernanceRole) {
  const action: GovernanceAction = {
    id: `dispatch-${taskId}-${Date.now()}`,
    type: "dispatch.bot.task",
    actor,
    target: taskId,
    risk: "medium",
  };

  const decision = evaluateGovernanceAction(action);
  authorityAuditLog.unshift({ ...action, ...decision });
  if (authorityAuditLog.length > 300) {
    authorityAuditLog.length = 300;
  }

  return {
    action,
    decision,
  };
}

export function getAuthorityAuditLog() {
  return [...authorityAuditLog];
}

export function getAuthorityPolicyConfig() {
  return { ...defaultPolicy };
}
