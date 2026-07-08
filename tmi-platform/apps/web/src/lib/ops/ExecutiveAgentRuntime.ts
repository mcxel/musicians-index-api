import { getFleetSummary } from "@/lib/qa/QACertificationFleet";
import { getBigAceOperationsSnapshot } from "@/lib/ops/BigAceOperationsCenter";
import { getMCOperationsSnapshot } from "@/lib/ops/MCOperationsConsole";

export type AgentId = "big-ace" | "mc-michael-charlie";
export type AgentActionClass = "informational" | "operational" | "approval-required";

export type AgentObjective = {
  id: string;
  label: string;
  status: "on-track" | "at-risk" | "blocked";
  progressPct: number;
};

export type AgentGoal = {
  id: string;
  label: string;
  target: string;
  current: string;
  status: "good" | "warning" | "critical";
};

export type AgentCheckpoint = {
  id: string;
  cadence: "hourly" | "daily" | "weekly" | "monthly" | "quarterly";
  label: string;
  status: "pass" | "watch" | "fail";
};

export type AgentAchievement = {
  id: string;
  label: string;
  at: string;
};

export type AgentAction = {
  id: string;
  class: AgentActionClass;
  title: string;
  status: "completed" | "running" | "queued";
  at: string;
};

export type ExecutiveAgentSnapshot = {
  id: AgentId;
  name: string;
  lane: "executive" | "operations";
  workspace: string;
  status: "awake" | "degraded";
  healthScore: number;
  confidenceScore: number;
  currentObjective: string;
  currentTask: string;
  currentRecommendation: string;
  activeAlerts: number;
  pendingApprovals: number;
  objectives: AgentObjective[];
  goals: AgentGoal[];
  checkpoints: AgentCheckpoint[];
  achievements: AgentAchievement[];
  recentActions: AgentAction[];
  reachableWorkspaces: string[];
  assistanceScopes: string[];
  governancePolicy: {
    informational: string[];
    operational: string[];
    approvalRequired: string[];
  };
};

export type ExecutiveAgentRuntimeSnapshot = {
  generatedAt: string;
  agents: {
    bigAce: ExecutiveAgentSnapshot;
    mc: ExecutiveAgentSnapshot;
  };
};

function toStatus(progressPct: number): "on-track" | "at-risk" | "blocked" {
  if (progressPct >= 99) return "on-track";
  if (progressPct >= 95) return "at-risk";
  return "blocked";
}

function toGoalStatus(score: number): "good" | "warning" | "critical" {
  if (score >= 99) return "good";
  if (score >= 95) return "warning";
  return "critical";
}

function buildBigAceSnapshot(nowIso: string): ExecutiveAgentSnapshot {
  const fleet = getFleetSummary();
  const ops = getBigAceOperationsSnapshot();
  const payments = fleet.categories.find((c) => c.key === "payments")?.score ?? 0;
  const discovery = fleet.categories.find((c) => c.key === "discovery")?.score ?? 0;
  const commerce = fleet.categories.find((c) => c.key === "commerce")?.score ?? 0;
  const security = fleet.categories.find((c) => c.key === "security")?.score ?? 0;
  const live = fleet.categories.find((c) => c.key === "liveStreaming")?.score ?? 0;
  const riskScore = Math.max(0, 100 - (fleet.fail * 12 + fleet.pending * 3));

  const activeAlerts = ops.companies.reduce((sum, c) => sum + c.activeIssues.length, 0);
  const pendingApprovals = fleet.releaseGate.requiredFailuresOrSkips.length;
  const topIssue = ops.companies.flatMap((c) => c.activeIssues).at(0)?.message ?? "No active executive blockers";

  return {
    id: "big-ace",
    name: "Big Ace",
    lane: "executive",
    workspace: "/admin/big-ace/operations-center",
    status: "awake",
    healthScore: Number(fleet.platformHealthScore.toFixed(1)),
    confidenceScore: Number((Math.max(80, fleet.platformHealthScore - fleet.pending * 0.5)).toFixed(1)),
    currentObjective: "Maintain platform health above 99% while growing revenue and reducing risk",
    currentTask: topIssue,
    currentRecommendation: commerce < 99 ? "Investigate ad fill, conversion path, and payment failures before next deploy." : "Continue growth optimization and keep strict evidence mode active.",
    activeAlerts,
    pendingApprovals,
    objectives: [
      { id: "ba-health", label: "Maintain platform health above 99%", progressPct: fleet.platformHealthScore, status: toStatus(fleet.platformHealthScore) },
      { id: "ba-revenue", label: "Grow revenue with stable commerce paths", progressPct: commerce, status: toStatus(commerce) },
      { id: "ba-risk", label: "Reduce operational risk across all companies", progressPct: riskScore, status: toStatus(riskScore) },
      { id: "ba-discovery", label: "Improve discovery quality and retention", progressPct: discovery, status: toStatus(discovery) },
      { id: "ba-cert", label: "Maintain certification readiness", progressPct: fleet.releaseGate.strictEvidencePass ? 100 : 85, status: fleet.releaseGate.strictEvidencePass ? "on-track" : "at-risk" },
    ],
    goals: [
      { id: "ba-goal-revenue", label: "Revenue health", target: "99+", current: commerce.toFixed(1), status: toGoalStatus(commerce) },
      { id: "ba-goal-security", label: "Security health", target: "99+", current: security.toFixed(1), status: toGoalStatus(security) },
      { id: "ba-goal-infra", label: "Infrastructure health", target: "99+", current: live.toFixed(1), status: toGoalStatus(live) },
      { id: "ba-goal-cx", label: "Customer satisfaction proxy", target: "99+", current: discovery.toFixed(1), status: toGoalStatus(discovery) },
      { id: "ba-goal-financial", label: "Financial score", target: "100", current: payments.toFixed(1), status: toGoalStatus(payments) },
      { id: "ba-goal-risk", label: "Risk score", target: "95+", current: riskScore.toFixed(1), status: toGoalStatus(riskScore) },
    ],
    checkpoints: [
      { id: "ba-hourly", cadence: "hourly", label: "Executive health and incident scan", status: activeAlerts > 0 ? "watch" : "pass" },
      { id: "ba-daily", cadence: "daily", label: "Revenue and certification readiness review", status: fleet.releaseGate.strictEvidencePass ? "pass" : "watch" },
      { id: "ba-weekly", cadence: "weekly", label: "Growth + retention strategy report", status: discovery >= 95 ? "pass" : "watch" },
      { id: "ba-monthly", cadence: "monthly", label: "Cross-company financial health board", status: payments >= 99 ? "pass" : "fail" },
      { id: "ba-quarterly", cadence: "quarterly", label: "Executive portfolio and risk planning", status: riskScore >= 95 ? "pass" : "watch" },
    ],
    achievements: [
      { id: "ba-ach-ops-center", label: "Multi-company operations center activated", at: nowIso },
      { id: "ba-ach-deploy-gate", label: "Strict deploy gate service operational", at: nowIso },
    ],
    recentActions: [
      { id: "ba-act-1", class: "informational", title: "Published executive health summary to Observatory", status: "completed", at: nowIso },
      { id: "ba-act-2", class: "operational", title: "Queued MC escalations for failing categories", status: "running", at: nowIso },
      { id: "ba-act-3", class: "approval-required", title: "Production deploy approval remains gated", status: "queued", at: nowIso },
    ],
    reachableWorkspaces: [
      "/admin/observatory",
      "/admin/big-ace",
      "/admin/big-ace/operations-center",
      "/admin/mc-michael-charlie",
      "/admin/mc-michael-charlie/operations-console",
      "/admin/revenue",
      "/admin/live",
      "/admin/visual-command",
      "/admin/certification",
    ],
    assistanceScopes: [
      "operators",
      "moderators",
      "support",
      "performers",
      "venues",
      "advertisers",
      "sponsors",
      "developers",
      "admins",
    ],
    governancePolicy: {
      informational: [
        "summaries",
        "trend detection",
        "risk recommendations",
      ],
      operational: [
        "telemetry refresh",
        "job retries",
        "queue reprioritization",
      ],
      approvalRequired: [
        "payout changes",
        "permission changes",
        "production deployment",
        "data deletion",
      ],
    },
  };
}

function buildMCSnapshot(nowIso: string): ExecutiveAgentSnapshot {
  const fleet = getFleetSummary();
  const mc = getMCOperationsSnapshot();
  const support = fleet.categories.find((c) => c.key === "messaging")?.score ?? 0;
  const live = fleet.categories.find((c) => c.key === "liveStreaming")?.score ?? 0;
  const cert = fleet.releaseGate.strictEvidencePass ? 100 : 85;
  const workloadBalance = Math.max(0, 100 - Math.max(0, mc.staffWorkloadPct - 70));

  return {
    id: "mc-michael-charlie",
    name: "Michael Charlie",
    lane: "operations",
    workspace: "/admin/mc-michael-charlie/operations-console",
    status: "awake",
    healthScore: Number(((live + support + cert) / 3).toFixed(1)),
    confidenceScore: Number((Math.max(78, 100 - mc.slaAtRisk * 5)).toFixed(1)),
    currentObjective: "Keep operations flowing and prevent bottlenecks across queues, incidents, and live events",
    currentTask: mc.queue[0]?.title ?? "Monitor operational queue",
    currentRecommendation: mc.broadcast.reconnectRisk === "high" ? "Reallocate moderators and prioritize broadcast stability tasks immediately." : "Maintain SLA compliance and clear pending certifications in queue order.",
    activeAlerts: mc.incidentsOpen,
    pendingApprovals: mc.escalations,
    objectives: [
      { id: "mc-ops", label: "Keep operations flowing", progressPct: workloadBalance, status: toStatus(workloadBalance) },
      { id: "mc-incidents", label: "Resolve incidents quickly", progressPct: Math.max(0, 100 - mc.incidentsOpen * 7), status: toStatus(Math.max(0, 100 - mc.incidentsOpen * 7)) },
      { id: "mc-broadcast", label: "Maintain broadcast health", progressPct: mc.broadcast.liveHealthScore, status: toStatus(mc.broadcast.liveHealthScore) },
      { id: "mc-cert", label: "Keep QA Fleet green", progressPct: cert, status: toStatus(cert) },
      { id: "mc-support", label: "Support and moderator coordination", progressPct: support, status: toStatus(support) },
    ],
    goals: [
      { id: "mc-goal-sla", label: "SLA compliance", target: "95+", current: String(100 - mc.slaAtRisk * 5), status: toGoalStatus(100 - mc.slaAtRisk * 5) },
      { id: "mc-goal-queue", label: "Queue control", target: "Backlog < 15", current: String(mc.supportBacklog), status: mc.supportBacklog <= 15 ? "good" : mc.supportBacklog <= 25 ? "warning" : "critical" },
      { id: "mc-goal-uptime", label: "Broadcast uptime", target: "99+", current: mc.broadcast.liveHealthScore.toFixed(1), status: toGoalStatus(mc.broadcast.liveHealthScore) },
      { id: "mc-goal-mod", label: "Moderator response", target: "Rapid", current: `${mc.moderatorAssignments} assigned`, status: mc.moderatorAssignments >= 1 ? "good" : "warning" },
      { id: "mc-goal-cert", label: "Certification completion", target: "No fails/pending", current: `${mc.certification.pass}/${mc.certification.fail}/${mc.certification.pending}`, status: mc.certification.fail > 0 ? "critical" : mc.certification.pending > 0 ? "warning" : "good" },
    ],
    checkpoints: [
      { id: "mc-hourly", cadence: "hourly", label: "Queue triage and escalation sweep", status: mc.queue.some((q) => q.priority === "critical") ? "watch" : "pass" },
      { id: "mc-daily", cadence: "daily", label: "SLA, incidents, and moderation review", status: mc.slaAtRisk > 0 ? "watch" : "pass" },
      { id: "mc-weekly", cadence: "weekly", label: "Broadcast and event operations audit", status: mc.broadcast.reconnectRisk === "high" ? "fail" : "pass" },
      { id: "mc-monthly", cadence: "monthly", label: "Operations productivity checkpoint", status: mc.staffWorkloadPct > 90 ? "watch" : "pass" },
      { id: "mc-quarterly", cadence: "quarterly", label: "COO optimization roadmap", status: mc.certification.fail > 0 ? "watch" : "pass" },
    ],
    achievements: [
      { id: "mc-ach-console", label: "MC operations console activated", at: nowIso },
      { id: "mc-ach-queue", label: "Cross-lane operations queue online", at: nowIso },
    ],
    recentActions: [
      { id: "mc-act-1", class: "informational", title: "Published queue and SLA state to Observatory", status: "completed", at: nowIso },
      { id: "mc-act-2", class: "operational", title: "Assigned support and moderation workload", status: "running", at: nowIso },
      { id: "mc-act-3", class: "approval-required", title: "Escalated high-impact changes for human approval", status: "queued", at: nowIso },
    ],
    reachableWorkspaces: [
      "/admin/observatory",
      "/admin/mc-michael-charlie",
      "/admin/mc-michael-charlie/operations-console",
      "/admin/big-ace",
      "/admin/big-ace/operations-center",
      "/admin/live",
      "/admin/revenue",
      "/admin/rooms",
      "/admin/certification",
    ],
    assistanceScopes: [
      "operators",
      "moderators",
      "support",
      "performers",
      "venues",
      "advertisers",
      "sponsors",
      "developers",
      "admins",
    ],
    governancePolicy: {
      informational: [
        "status summaries",
        "incident detection",
        "queue recommendations",
      ],
      operational: [
        "ticket assignment",
        "retry failed jobs",
        "queue reprioritization",
      ],
      approvalRequired: [
        "payout approvals",
        "permission changes",
        "production deploy",
        "user removals",
      ],
    },
  };
}

export function getExecutiveAgentRuntimeSnapshot(): ExecutiveAgentRuntimeSnapshot {
  const nowIso = new Date().toISOString();
  return {
    generatedAt: nowIso,
    agents: {
      bigAce: buildBigAceSnapshot(nowIso),
      mc: buildMCSnapshot(nowIso),
    },
  };
}
