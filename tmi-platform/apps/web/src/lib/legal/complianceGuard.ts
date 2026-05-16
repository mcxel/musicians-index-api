import type { GovernanceRole } from "@/lib/bots/bigAceAuthorityEngine";

export type ComplianceAction = {
  id: string;
  actor: GovernanceRole;
  category: "financial" | "legal" | "moderation" | "privacy" | "build";
  description: string;
  finalDecisionRequested?: boolean;
};

export type ComplianceResult = {
  allowed: boolean;
  note: string;
  requiresApprovals: GovernanceRole[];
  timestamp: number;
};

const complianceAuditLog: Array<ComplianceAction & ComplianceResult> = [];

export function evaluateCompliance(action: ComplianceAction): ComplianceResult {
  if ((action.category === "financial" || action.category === "legal") && action.finalDecisionRequested && action.actor !== "marcel-root") {
    return {
      allowed: false,
      note: "Financial/legal final decisions are blocked without Marcel/root approval.",
      requiresApprovals: ["marcel-root", "mc"],
      timestamp: Date.now(),
    };
  }

  if (action.category === "privacy" && /private|dm|friends-only|locked/i.test(action.description)) {
    return {
      allowed: false,
      note: "Private content exposure is blocked unless explicit permission and audit approval exist.",
      requiresApprovals: ["marcel-root", "mc", "big-ace"],
      timestamp: Date.now(),
    };
  }

  return {
    allowed: true,
    note: "Action is within compliance guardrails.",
    requiresApprovals: ["big-ace", "mc"],
    timestamp: Date.now(),
  };
}

export function logComplianceAction(action: ComplianceAction) {
  const result = evaluateCompliance(action);
  complianceAuditLog.unshift({ ...action, ...result });
  if (complianceAuditLog.length > 400) {
    complianceAuditLog.length = 400;
  }
  return result;
}

export function getComplianceAuditLog() {
  return [...complianceAuditLog];
}
