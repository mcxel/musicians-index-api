import Link from "next/link";
import { decideMCAuthority, listMCAuthorityDecisions, summarizeMCAuthority } from "@/lib/admin/MCAuthorityEngine";
import { ensureBotAchievements, listBotAchievements } from "@/lib/bots/BotAchievementEngine";
import { ensureGovernanceCheckpoints, listGovernanceCheckpoints } from "@/lib/bots/BotCheckpointEngine";
import {
  ensureSampleWorkforceProfiles,
  listBotWorkforceProfiles,
  listDepartmentSummaries,
} from "@/lib/bots/BotDepartmentEngine";
import { ensureBotDirectives, hasUnguidedBots, listBotDirectives } from "@/lib/bots/BotDirectiveEngine";
import { ensureBotGoals, listBotGoals } from "@/lib/bots/BotGoalEngine";
import { ensureBotObjectives, listBotObjectives } from "@/lib/bots/BotObjectiveEngine";
import {
  ensureGovernanceDataset,
  listBotReports,
  summarizeGovernanceReports,
} from "@/lib/bots/BotReportingEngine";
import { ensureBotTasks, listBotTasks } from "@/lib/bots/BotTaskEngine";

function bootstrapGovernance() {
  const profiles = ensureSampleWorkforceProfiles();
  profiles.forEach((profile) => {
    ensureBotDirectives(profile.botId);
    ensureBotObjectives(profile.botId);
    ensureBotGoals(profile.botId);
    const tasks = ensureBotTasks(profile.botId);
    ensureGovernanceCheckpoints(profile.botId);
    ensureBotAchievements(profile.botId);

    if (tasks.length > 0 && listMCAuthorityDecisions().length < 3) {
      decideMCAuthority({ targetId: tasks[0].taskId, targetType: "task", status: "green", reason: "approved workload" });
      if (tasks[1]) decideMCAuthority({ targetId: tasks[1].taskId, targetType: "task", status: "yellow", reason: "needs correction" });
      decideMCAuthority({ targetId: `${profile.botId}-risk`, targetType: "report", status: "red", reason: "blocked escalation drill" });
    }
  });

  ensureGovernanceDataset();
}

export default function AdminBotGovernanceSummaryCard() {
  bootstrapGovernance();

  const profiles = listBotWorkforceProfiles();
  const reportsSummary = summarizeGovernanceReports();
  const mcSummary = summarizeMCAuthority();
  const reportRows = listBotReports().slice(0, 5);

  const metricRows = [
    { label: "Workers", value: reportsSummary.totalBots, color: "#00FFFF" },
    { label: "Failing", value: reportsSummary.failing, color: "#FF2DAA" },
    { label: "Completed", value: reportsSummary.completed, color: "#00FF88" },
    { label: "Missed Goals", value: reportsSummary.missedGoals, color: "#FFD700" },
    { label: "Reassignment", value: reportsSummary.needsReassignment, color: "#FF9500" },
    { label: "MC Green", value: mcSummary.green, color: "#22c55e" },
    { label: "MC Yellow", value: mcSummary.yellow, color: "#f59e0b" },
    { label: "MC Red", value: mcSummary.red, color: "#ef4444" },
  ];

  const botIds = profiles.map((profile) => profile.botId);
  const governanceChecks = {
    directives: listBotDirectives().length,
    objectives: listBotObjectives().length,
    goals: listBotGoals().length,
    tasks: listBotTasks().length,
    checkpoints: listGovernanceCheckpoints().length,
    achievements: listBotAchievements().length,
    reports: listBotReports().length,
    unguided: hasUnguidedBots(botIds),
  };

  const departmentSummaries = listDepartmentSummaries({
    failingBots: listBotReports()
      .filter((report) => report.failedWork > 0 || report.blockedWork > 0)
      .map((report) => report.botId),
    completedBots: listBotReports().filter((report) => report.performanceScore >= 85).map((report) => report.botId),
    missedGoalBots: listBotReports().filter((report) => report.missedGoals > 0).map((report) => report.botId),
    reassignmentBots: listBotReports()
      .filter((report) => report.performanceScore < 60 || report.riskLevel === "high")
      .map((report) => report.botId),
  }).slice(0, 6);

  return (
    <div
      style={{
        border: "1px solid rgba(0,255,255,0.28)",
        borderRadius: 14,
        padding: 16,
        background: "linear-gradient(135deg, rgba(0,255,255,0.07), rgba(255,45,170,0.09))",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#00FFFF", textTransform: "uppercase", fontWeight: 800 }}>
            Bot Workforce Governance Layer
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
            Bot to Supervisor to Department Lead to MC to Big Ace chain accountability.
          </div>
        </div>
        <div style={{ fontSize: 11, color: governanceChecks.unguided ? "#ef4444" : "#22c55e", fontWeight: 700 }}>
          {governanceChecks.unguided ? "Unguided bots detected" : "No unguided bots"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8 }}>
        {metricRows.map((metric) => (
          <div key={metric.label} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 9, background: "rgba(0,0,0,0.22)" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.44)" }}>{metric.label}</div>
            <div style={{ marginTop: 4, color: metric.color, fontSize: 18, fontWeight: 800 }}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(0,0,0,0.22)" }}>
          <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 700, marginBottom: 6 }}>Governance Coverage</div>
          <div style={{ display: "grid", gap: 3, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            <span>Directives: {governanceChecks.directives}</span>
            <span>Objectives: {governanceChecks.objectives}</span>
            <span>Goals: {governanceChecks.goals}</span>
            <span>Tasks: {governanceChecks.tasks}</span>
            <span>Checkpoints: {governanceChecks.checkpoints}</span>
            <span>Achievements: {governanceChecks.achievements}</span>
            <span>Reports: {governanceChecks.reports}</span>
          </div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(0,0,0,0.22)" }}>
          <div style={{ fontSize: 10, color: "#FF2DAA", fontWeight: 700, marginBottom: 6 }}>Live Chain Reports</div>
          <div style={{ display: "grid", gap: 5, fontSize: 11 }}>
            {reportRows.map((report) => (
              <div key={report.reportId} style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "rgba(255,255,255,0.72)" }}>
                <span>{report.botId}</span>
                <span style={{ color: report.mcStatus === "green" ? "#22c55e" : report.mcStatus === "yellow" ? "#f59e0b" : "#ef4444" }}>
                  {report.mcStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, background: "rgba(0,0,0,0.22)" }}>
        <div style={{ fontSize: 10, color: "#AA2DFF", fontWeight: 700, marginBottom: 6 }}>Department Status</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 6, fontSize: 10 }}>
          {departmentSummaries.map((summary) => (
            <div key={summary.department} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, padding: 8 }}>
              <div style={{ color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{summary.department}</div>
              <div style={{ color: "#9ca3af", marginTop: 3 }}>work {summary.totalBots}</div>
              <div style={{ color: "#ef4444" }}>fail {summary.failingBots}</div>
              <div style={{ color: "#22c55e" }}>done {summary.completedBots}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {[
          ["Governance", "/admin/bots/governance"],
          ["Directives", "/admin/bots/directives"],
          ["Goals", "/admin/bots/goals"],
          ["Tasks", "/admin/bots/tasks"],
          ["Checkpoints", "/admin/bots/checkpoints"],
          ["Achievements", "/admin/bots/achievements"],
          ["Reports", "/admin/bots/reports"],
          ["MC Authority", "/admin/mc/authority"],
        ].map(([label, href]) => (
          <Link
            key={href as string}
            href={href as string}
            style={{
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.24)",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#fff",
              background: "rgba(255,255,255,0.04)",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {label as string}
          </Link>
        ))}
      </div>
    </div>
  );
}
