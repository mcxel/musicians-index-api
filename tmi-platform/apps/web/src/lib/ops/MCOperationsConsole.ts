import { getFleetSummary } from "@/lib/qa/QACertificationFleet";
import { listMCAuthorityDecisions } from "@/lib/admin/MCAuthorityEngine";

export type MCQueueItem = {
  id: string;
  lane: "operations" | "moderation" | "support" | "broadcast" | "incident";
  priority: "critical" | "high" | "medium";
  title: string;
  owner: string;
  dueInMinutes: number;
};

export type MCOperationsSnapshot = {
  generatedAt: string;
  queue: MCQueueItem[];
  escalations: number;
  moderatorAssignments: number;
  supportBacklog: number;
  staffWorkloadPct: number;
  slaAtRisk: number;
  incidentsOpen: number;
  broadcast: {
    liveHealthScore: number;
    reconnectRisk: "low" | "medium" | "high";
    nextWindow: string;
  };
  certification: {
    dailyStatus: "GREEN" | "YELLOW" | "RED";
    pass: number;
    fail: number;
    pending: number;
  };
};

function toDailyStatus(fail: number, pending: number): "GREEN" | "YELLOW" | "RED" {
  if (fail > 0) return "RED";
  if (pending > 0) return "YELLOW";
  return "GREEN";
}

export function getMCOperationsSnapshot(): MCOperationsSnapshot {
  const fleet = getFleetSummary();
  const mcDecisions = listMCAuthorityDecisions();
  const liveScore = fleet.categories.find((c) => c.key === "liveStreaming")?.score ?? 0;
  const supportScore = fleet.categories.find((c) => c.key === "messaging")?.score ?? 0;
  const securityScore = fleet.categories.find((c) => c.key === "security")?.score ?? 0;
  const reconnectRisk: "low" | "medium" | "high" = liveScore >= 99 ? "low" : liveScore >= 95 ? "medium" : "high";

  const queue: MCQueueItem[] = [
    {
      id: "mc-ops-cert-health",
      lane: "operations",
      priority: fleet.fail > 0 ? "critical" : fleet.pending > 0 ? "high" : "medium",
      title: fleet.fail > 0 ? "Recover failing certification categories" : "Clear pending certification checks",
      owner: "MC Operations",
      dueInMinutes: fleet.fail > 0 ? 15 : 60,
    },
    {
      id: "mc-support-sla",
      lane: "support",
      priority: supportScore >= 99 ? "medium" : supportScore >= 95 ? "high" : "critical",
      title: "Keep customer support SLA above threshold",
      owner: "Support AI",
      dueInMinutes: 30,
    },
    {
      id: "mc-broadcast-health",
      lane: "broadcast",
      priority: reconnectRisk === "high" ? "critical" : reconnectRisk === "medium" ? "high" : "medium",
      title: "Validate broadcast reconnect and stream continuity",
      owner: "Infrastructure AI",
      dueInMinutes: 20,
    },
    {
      id: "mc-security-guard",
      lane: "incident",
      priority: securityScore >= 99 ? "medium" : "critical",
      title: "Review security and moderation guardrails",
      owner: "Security AI",
      dueInMinutes: 25,
    },
  ];

  const now = new Date();
  const nextWindow = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    generatedAt: now.toISOString(),
    queue,
    escalations: fleet.releaseGate.requiredFailuresOrSkips.length,
    moderatorAssignments: Math.max(1, Math.ceil((fleet.fail + fleet.pending) / 2)),
    supportBacklog: Math.max(0, Math.round((100 - supportScore) * 0.8)),
    staffWorkloadPct: Math.min(100, Math.round(55 + (fleet.fail * 8 + fleet.pending * 3))),
    slaAtRisk: fleet.fail > 0 ? fleet.fail : Math.min(3, fleet.pending),
    incidentsOpen: fleet.fail + Math.max(0, fleet.failures),
    broadcast: {
      liveHealthScore: liveScore,
      reconnectRisk,
      nextWindow: nextWindow.toISOString(),
    },
    certification: {
      dailyStatus: toDailyStatus(fleet.fail, fleet.pending),
      pass: fleet.pass,
      fail: fleet.fail,
      pending: fleet.pending,
    },
  };
}
