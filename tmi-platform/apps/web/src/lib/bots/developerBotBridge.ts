/**
 * developerBotBridge.ts
 *
 * Bridge between the dev-audit-bot and the developer/audit workflow.
 * Provides audit report generation, codebase health checks,
 * and escalation paths for developer issues.
 */

import { botReportToAdmin, getBotOperationsLog } from "./permanentBotOperationsEngine";
import { getOpenTickets, getMaintenanceTickets } from "./permanentBotOperationsEngine";

const DEV_AUDIT_BOT_ID = "dev-audit-bot-001";

export type DevAuditReport = {
  id: string;
  generatedAt: number;
  generatedBy: string;
  openTickets: number;
  criticalTickets: number;
  highTickets: number;
  totalActionsLogged: number;
  brokenRoutes: string[];
  brokenFeeds: string[];
  recommendations: string[];
  escalations: string[];
  healthScore: number; // 0–100
};

const auditReports: DevAuditReport[] = [];
let reportCounter = 1;

function generateReportId(): string {
  return `AUDIT-${Date.now()}-${String(reportCounter++).padStart(3, "0")}`;
}

/**
 * Generate a full dev audit report.
 */
export function generateDevAuditReport(): DevAuditReport {
  const openTickets = getOpenTickets();
  const allTickets = getMaintenanceTickets();
  const log = getBotOperationsLog();

  const criticalTickets = openTickets.filter((t) => t.severity === "critical");
  const highTickets = openTickets.filter((t) => t.severity === "high");
  const brokenRoutes = allTickets
    .filter((t) => t.type === "broken-route" && t.status !== "resolved")
    .map((t) => t.description);
  const brokenFeeds = allTickets
    .filter((t) => t.type === "broken-feed" && t.status !== "resolved")
    .map((t) => t.description);

  const recommendations: string[] = [];
  const escalations: string[] = [];

  if (criticalTickets.length > 0) {
    escalations.push(`${criticalTickets.length} CRITICAL ticket(s) require immediate attention`);
  }
  if (highTickets.length > 0) {
    recommendations.push(`${highTickets.length} HIGH severity ticket(s) need review`);
  }
  if (brokenRoutes.length > 0) {
    recommendations.push(`Fix ${brokenRoutes.length} broken route(s): ${brokenRoutes.slice(0, 3).join(", ")}`);
  }
  if (brokenFeeds.length > 0) {
    recommendations.push(`Restore ${brokenFeeds.length} broken feed(s)`);
  }
  if (openTickets.length === 0) {
    recommendations.push("All maintenance tickets resolved — system healthy");
  }

  // Health score: start at 100, deduct per issue
  let healthScore = 100;
  healthScore -= criticalTickets.length * 20;
  healthScore -= highTickets.length * 10;
  healthScore -= brokenRoutes.length * 5;
  healthScore -= brokenFeeds.length * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const report: DevAuditReport = {
    id: generateReportId(),
    generatedAt: Date.now(),
    generatedBy: DEV_AUDIT_BOT_ID,
    openTickets: openTickets.length,
    criticalTickets: criticalTickets.length,
    highTickets: highTickets.length,
    totalActionsLogged: log.length,
    brokenRoutes,
    brokenFeeds,
    recommendations,
    escalations,
    healthScore,
  };

  auditReports.push(report);

  // Report to admin chain
  botReportToAdmin(
    DEV_AUDIT_BOT_ID,
    `Dev Audit Report ${report.id}: Health=${healthScore}/100, OpenTickets=${openTickets.length}, Critical=${criticalTickets.length}`,
    ["admin", "big-ace", "mc"]
  );

  return report;
}

/**
 * Support a developer workflow step.
 * Logs the action and tags it as dev support.
 */
export function supportDeveloperStep(
  devId: string,
  action: string,
  context: string
): void {
  botReportToAdmin(
    DEV_AUDIT_BOT_ID,
    `DEV SUPPORT: ${devId} | ${action} | ${context}`,
    ["admin", "big-ace"]
  );
}

/**
 * Escalate a specific issue directly from dev-audit-bot to the governance chain.
 */
export function escalateFromBot(
  issue: string,
  severity: "medium" | "high" | "critical",
  escalateTo: string[] = ["big-ace", "mc", "marcel-root"]
): void {
  botReportToAdmin(
    DEV_AUDIT_BOT_ID,
    `[ESCALATION][${severity.toUpperCase()}] ${issue}`,
    escalateTo
  );
}

export function getAuditReports(): DevAuditReport[] {
  return [...auditReports];
}

export function getLatestAuditReport(): DevAuditReport | undefined {
  return auditReports[auditReports.length - 1];
}
