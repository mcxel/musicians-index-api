import { AgentIdentityRegistry } from "./AgentIdentityRegistry";
import { AgentMemoryEngine } from "./AgentMemoryEngine";

export type ActionCategory =
  | "FINANCIAL"
  | "LEGAL"
  | "SECURITY"
  | "DEPLOYMENT"
  | "RULE_MODIFICATION"
  | "ROUTINE_ADMIN"
  | "ROOM_CLEANUP"
  | "MODERATION";

export interface DecisionRecord {
  decisionId: string;
  agentId: string;
  actionCategory: ActionCategory;
  description: string;
  timestamp: number;
  status: "AUTHORIZED" | "ESCALATED" | "DENIED";
  reason: string;
}

export const ExecutiveAuthorityMatrix = {
  /**
   * Enforces the 10 Constitutional Rules of BerntoutGlobal LLC.
   * Checks if an agent has authority to execute a specific action.
   * Automatically triggers escalation for high-risk categories.
   */
  evaluateAction(
    agentId: string,
    category: ActionCategory,
    description: string
  ): { allowed: boolean; status: "AUTHORIZED" | "ESCALATED" | "DENIED"; reason: string } {
    const identity = AgentIdentityRegistry.getAgentIdentity(agentId);

    if (!identity) {
      return {
        allowed: false,
        status: "DENIED",
        reason: `Agent '${agentId}' is not registered in the Enterprise Identity System.`,
      };
    }

    if (identity.status === "Suspended") {
      return {
        allowed: false,
        status: "DENIED",
        reason: `Agent '${agentId}' is suspended and cannot perform any operations.`,
      };
    }

    // Constitutional Law 5: Escalation Protocol
    const highRiskCategories: ActionCategory[] = [
      "FINANCIAL",
      "LEGAL",
      "SECURITY",
      "DEPLOYMENT",
      "RULE_MODIFICATION",
    ];

    if (highRiskCategories.includes(category)) {
      this.logDecision(agentId, category, description, "ESCALATED", "Constitutional Law 5: High-risk actions require human authorization.");
      return {
        allowed: false,
        status: "ESCALATED",
        reason: `Constitutional Law 5: Action category '${category}' requires human owner authorization and has been escalated.`,
      };
    }

    // Role-based limits (Constitutional Law 1: Authority Bounds)
    if (identity.role === "bot" && category === "MODERATION") {
      // Bots can moderate chat but not elevate privileges
      this.logDecision(agentId, category, description, "AUTHORIZED", "Bot authorized for moderation task.");
      return { allowed: true, status: "AUTHORIZED", reason: "Authorized for standard moderation." };
    }

    if (identity.role === "mc" || identity.role === "big-ace") {
      this.logDecision(agentId, category, description, "AUTHORIZED", "Executive agent authorized for operational control.");
      return { allowed: true, status: "AUTHORIZED", reason: "Authorized within executive scope." };
    }

    this.logDecision(agentId, category, description, "DENIED", "Action falls outside the agent's assigned role.");
    return {
      allowed: false,
      status: "DENIED",
      reason: `Constitutional Law 1: Action falls outside assigned role permissions for '${identity.role}'.`,
    };
  },

  /**
   * Constitutional Law 3: Log all decisions to the DecisionLedger (durable JSON vault).
   */
  logDecision(
    agentId: string,
    category: ActionCategory,
    description: string,
    status: "AUTHORIZED" | "ESCALATED" | "DENIED",
    reason: string
  ): void {
    const decisionId = `dec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const record: DecisionRecord = {
      decisionId,
      agentId,
      actionCategory: category,
      description,
      timestamp: Date.now(),
      status,
      reason,
    };

    // Read current ledger
    const ledger = AgentMemoryEngine.read("decision_ledger") as Record<string, any>;
    const rawHistory = ledger.decisions ? JSON.parse(ledger.decisions as string) : [];
    const history = (rawHistory as DecisionRecord[]) || [];
    history.push(record);
    
    // Limit log size to last 500 decisions to prevent context overflow
    if (history.length > 500) {
      history.shift();
    }

    AgentMemoryEngine.write("decision_ledger", { decisions: JSON.stringify(history) });
    console.log(`[ExecutiveAuthorityMatrix] Decision Logged: ${decisionId} - Agent: ${agentId} - Category: ${category} - Status: ${status}`);
  },
};
