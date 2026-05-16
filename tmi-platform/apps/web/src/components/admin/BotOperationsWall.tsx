"use client";

/**
 * BotOperationsWall.tsx
 *
 * Admin panel displaying all permanent bot operations.
 * Controls: pause/resume, summon, send-to-room, ticket review,
 * repair history, escalation to governance chain.
 *
 * data-testid="bot-operations-wall"
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  getBotOperationsLog,
  getMaintenanceTickets,
  setBotStatus,
  summonHelperBot,
  sendBotToRoom,
  approveTicketRepair,
  resolveTicket,
  escalateTicket,
  type BotOperationLogEntry,
  type MaintenanceTicket,
} from "@/lib/bots/permanentBotOperationsEngine";
import { generateDevAuditReport, type DevAuditReport } from "@/lib/bots/developerBotBridge";
import { PERMANENT_BOT_REGISTRY, type BotDutyEntry } from "@/lib/bots/botDutyRegistry";

type AdminRole = "admin" | "big-ace" | "mc" | "marcel-root";

type BotOperationsWallProps = {
  adminRole?: AdminRole;
};

export default function BotOperationsWall({ adminRole = "admin" }: BotOperationsWallProps) {
  const [bots, setBots] = useState<BotDutyEntry[]>([...PERMANENT_BOT_REGISTRY]);
  const [logs, setLogs] = useState<BotOperationLogEntry[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [latestReport, setLatestReport] = useState<DevAuditReport | null>(null);
  const [activeTab, setActiveTab] = useState<"bots" | "tickets" | "logs" | "report">("bots");
  const [summonRoom, setSummonRoom] = useState("");
  const [sendRoom, setSendRoom] = useState("");
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setBots([...PERMANENT_BOT_REGISTRY]);
    setLogs(getBotOperationsLog().slice(-50).reverse());
    setTickets(getMaintenanceTickets());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  function showMsg(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  }

  function handlePause(botId: string) {
    const r = setBotStatus(botId, "paused", adminRole);
    showMsg(r.message);
    refresh();
  }

  function handleResume(botId: string) {
    const r = setBotStatus(botId, "active", adminRole);
    showMsg(r.message);
    refresh();
  }

  function handleSuspend(botId: string) {
    if (adminRole !== "big-ace" && adminRole !== "marcel-root" && adminRole !== "mc") {
      showMsg("Suspension requires Big Ace, MC, or Marcel authority");
      return;
    }
    const r = setBotStatus(botId, "suspended", adminRole);
    showMsg(r.message);
    refresh();
  }

  function handleSummon() {
    if (!summonRoom.trim()) return;
    const bot = summonHelperBot(summonRoom.trim(), adminRole);
    showMsg(bot ? `Helper bot summoned to ${summonRoom}` : "No available helper bot");
    setSummonRoom("");
    refresh();
  }

  function handleSendToRoom() {
    if (!selectedBotId || !sendRoom.trim()) return;
    const result = sendBotToRoom(selectedBotId, sendRoom.trim(), false);
    showMsg(result.success ? `Bot sent to ${sendRoom}` : result.reason ?? "Failed");
    setSendRoom("");
    refresh();
  }

  function handleApproveTicket(ticketId: string) {
    approveTicketRepair(ticketId, adminRole);
    showMsg(`Ticket ${ticketId} approved`);
    refresh();
  }

  function handleResolveTicket(ticketId: string) {
    resolveTicket(ticketId);
    showMsg(`Ticket ${ticketId} resolved`);
    refresh();
  }

  function handleEscalateTicket(ticketId: string) {
    if (adminRole !== "big-ace" && adminRole !== "marcel-root" && adminRole !== "mc") {
      showMsg("Escalation requires Big Ace, MC, or Marcel authority");
      return;
    }
    escalateTicket(ticketId, ["marcel-root", "big-ace", "mc"]);
    showMsg(`Ticket ${ticketId} escalated to governance chain`);
    refresh();
  }

  function handleRunAudit() {
    const report = generateDevAuditReport();
    setLatestReport(report);
    setActiveTab("report");
    showMsg(`Audit report generated: Health ${report.healthScore}/100`);
    refresh();
  }

  const statusColor: Record<string, string> = {
    active: "#22c55e",
    "on-duty": "#06b6d4",
    idle: "#94a3b8",
    paused: "#f59e0b",
    suspended: "#ef4444",
  };

  const severityColor: Record<string, string> = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };

  return (
    <section
      data-testid="bot-operations-wall"
      style={{
        background: "#0f172a",
        color: "#e2e8f0",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "monospace",
      }}
    >
      <header style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", margin: 0 }}>
          BOT OPERATIONS WALL
        </h1>
        <span
          data-testid="bot-ops-admin-role"
          style={{ background: "#1e293b", padding: "4px 12px", borderRadius: 8, fontSize: 13, color: "#94a3b8" }}
        >
          Role: {adminRole}
        </span>
        <button
          data-testid="bot-ops-run-audit"
          onClick={handleRunAudit}
          style={{
            marginLeft: "auto",
            background: "#0ea5e9",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Run Audit
        </button>
      </header>

      {statusMsg && (
        <div
          data-testid="bot-ops-status-msg"
          style={{
            background: "#1e293b",
            border: "1px solid #38bdf8",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
            color: "#38bdf8",
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Summon + Send Controls */}
      <div
        data-testid="bot-ops-controls"
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
          background: "#1e293b",
          padding: 16,
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            data-testid="bot-ops-summon-input"
            value={summonRoom}
            onChange={(e) => setSummonRoom(e.target.value)}
            placeholder="Room ID to summon helper..."
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 6,
              color: "#e2e8f0",
              padding: "6px 12px",
              width: 220,
            }}
          />
          <button
            data-testid="bot-ops-summon-btn"
            onClick={handleSummon}
            style={{
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Summon Helper Bot
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            data-testid="bot-ops-send-select"
            value={selectedBotId ?? ""}
            onChange={(e) => setSelectedBotId(e.target.value || null)}
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 6,
              color: "#e2e8f0",
              padding: "6px 12px",
            }}
          >
            <option value="">Select bot...</option>
            {bots.map((b) => (
              <option key={b.botId} value={b.botId}>
                {b.displayName}
              </option>
            ))}
          </select>
          <input
            data-testid="bot-ops-send-room-input"
            value={sendRoom}
            onChange={(e) => setSendRoom(e.target.value)}
            placeholder="Target room ID..."
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 6,
              color: "#e2e8f0",
              padding: "6px 12px",
              width: 180,
            }}
          />
          <button
            data-testid="bot-ops-send-btn"
            onClick={handleSendToRoom}
            style={{
              background: "#0284c7",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "6px 16px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Send to Room
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav
        data-testid="bot-ops-tabs"
        style={{ display: "flex", gap: 4, marginBottom: 20 }}
      >
        {(["bots", "tickets", "logs", "report"] as const).map((tab) => (
          <button
            key={tab}
            data-testid={`bot-ops-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "#0ea5e9" : "#1e293b",
              color: activeTab === tab ? "#fff" : "#94a3b8",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {tab}
            {tab === "tickets" && tickets.filter((t) => t.status === "open" || t.status === "escalated").length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: 11,
                }}
              >
                {tickets.filter((t) => t.status === "open" || t.status === "escalated").length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── BOTS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "bots" && (
        <div data-testid="bot-ops-bots-tab">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
            {bots.map((bot) => (
              <div
                key={bot.botId}
                data-testid={`bot-card-${bot.botId}`}
                style={{
                  background: "#1e293b",
                  borderRadius: 10,
                  padding: 16,
                  border: `1px solid ${statusColor[bot.status] ?? "#334155"}22`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      background: statusColor[bot.status] ?? "#334155",
                      borderRadius: 999,
                      width: 10,
                      height: 10,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{bot.displayName}</span>
                  <span
                    data-testid={`bot-label-${bot.botId}`}
                    style={{
                      marginLeft: "auto",
                      background: "#0f172a",
                      color: "#38bdf8",
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    {bot.botLabel}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  <span>Class: {bot.botClass}</span>
                  {" · "}
                  <span style={{ color: statusColor[bot.status] ?? "#94a3b8" }}>
                    {bot.status.toUpperCase()}
                  </span>
                  {bot.currentRoom && (
                    <>
                      {" · "}
                      <span>Room: {bot.currentRoom}</span>
                    </>
                  )}
                </div>

                <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>
                  {bot.currentTask && <span>Task: {bot.currentTask}</span>}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {bot.status !== "paused" ? (
                    <button
                      data-testid={`bot-pause-${bot.botId}`}
                      onClick={() => handlePause(bot.botId)}
                      style={{
                        background: "#78350f",
                        color: "#fcd34d",
                        border: "none",
                        borderRadius: 5,
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      data-testid={`bot-resume-${bot.botId}`}
                      onClick={() => handleResume(bot.botId)}
                      style={{
                        background: "#14532d",
                        color: "#86efac",
                        border: "none",
                        borderRadius: 5,
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Resume
                    </button>
                  )}
                  {(adminRole === "big-ace" || adminRole === "mc" || adminRole === "marcel-root") && (
                    <button
                      data-testid={`bot-suspend-${bot.botId}`}
                      onClick={() => handleSuspend(bot.botId)}
                      style={{
                        background: "#7f1d1d",
                        color: "#fca5a5",
                        border: "none",
                        borderRadius: 5,
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TICKETS TAB ──────────────────────────────────────────────────── */}
      {activeTab === "tickets" && (
        <div data-testid="bot-ops-tickets-tab">
          {tickets.length === 0 ? (
            <p style={{ color: "#64748b" }}>No maintenance tickets.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  data-testid={`ticket-card-${ticket.id}`}
                  style={{
                    background: "#1e293b",
                    borderRadius: 8,
                    padding: 14,
                    border: `1px solid ${severityColor[ticket.severity] ?? "#334155"}44`,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{ticket.id}</span>
                    <span
                      style={{
                        color: severityColor[ticket.severity],
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {ticket.severity}
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12 }}>{ticket.type}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        color: ticket.status === "resolved" ? "#22c55e" : ticket.status === "escalated" ? "#ef4444" : "#f59e0b",
                      }}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 10px" }}>{ticket.description}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {ticket.status !== "approved" && ticket.status !== "resolved" && (
                      <button
                        data-testid={`ticket-approve-${ticket.id}`}
                        onClick={() => handleApproveTicket(ticket.id)}
                        style={{
                          background: "#14532d",
                          color: "#86efac",
                          border: "none",
                          borderRadius: 5,
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Approve Repair
                      </button>
                    )}
                    {ticket.status !== "resolved" && (
                      <button
                        data-testid={`ticket-resolve-${ticket.id}`}
                        onClick={() => handleResolveTicket(ticket.id)}
                        style={{
                          background: "#1e3a5f",
                          color: "#93c5fd",
                          border: "none",
                          borderRadius: 5,
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Mark Resolved
                      </button>
                    )}
                    {(adminRole === "big-ace" || adminRole === "mc" || adminRole === "marcel-root") && (
                      <button
                        data-testid={`ticket-escalate-${ticket.id}`}
                        onClick={() => handleEscalateTicket(ticket.id)}
                        style={{
                          background: "#450a0a",
                          color: "#fca5a5",
                          border: "none",
                          borderRadius: 5,
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LOGS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div data-testid="bot-ops-logs-tab">
          {logs.length === 0 ? (
            <p style={{ color: "#64748b" }}>No actions logged yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  data-testid={`log-entry-${log.id}`}
                  style={{
                    background: "#1e293b",
                    borderRadius: 6,
                    padding: "8px 14px",
                    fontSize: 12,
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: "#64748b", flexShrink: 0 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ color: "#38bdf8", flexShrink: 0 }}>{log.botLabel}</span>
                  <span style={{ color: "#7c3aed", flexShrink: 0 }}>{log.action}</span>
                  <span style={{ color: log.blocked ? "#ef4444" : "#94a3b8" }}>
                    {log.blocked ? "⛔ BLOCKED — " : ""}{log.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REPORT TAB ───────────────────────────────────────────────────── */}
      {activeTab === "report" && (
        <div data-testid="bot-ops-report-tab">
          {!latestReport ? (
            <p style={{ color: "#64748b" }}>Click "Run Audit" to generate a report.</p>
          ) : (
            <div
              data-testid="bot-ops-audit-report"
              style={{ background: "#1e293b", borderRadius: 10, padding: 20 }}
            >
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: latestReport.healthScore >= 80 ? "#22c55e" : latestReport.healthScore >= 50 ? "#f59e0b" : "#ef4444" }}>
                    {latestReport.healthScore}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Health Score</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>
                    Open Tickets: <strong style={{ color: "#f1f5f9" }}>{latestReport.openTickets}</strong>
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>
                    Critical: <strong style={{ color: "#ef4444" }}>{latestReport.criticalTickets}</strong>
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>
                    High: <strong style={{ color: "#f97316" }}>{latestReport.highTickets}</strong>
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>
                    Actions Logged: <strong style={{ color: "#f1f5f9" }}>{latestReport.totalActionsLogged}</strong>
                  </div>
                </div>
              </div>

              {latestReport.escalations.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ color: "#ef4444", fontSize: 13, margin: "0 0 6px" }}>ESCALATIONS</h3>
                  {latestReport.escalations.map((e, i) => (
                    <div key={i} style={{ color: "#fca5a5", fontSize: 13 }}>⚠ {e}</div>
                  ))}
                </div>
              )}

              {latestReport.recommendations.length > 0 && (
                <div>
                  <h3 style={{ color: "#38bdf8", fontSize: 13, margin: "0 0 6px" }}>RECOMMENDATIONS</h3>
                  {latestReport.recommendations.map((r, i) => (
                    <div key={i} style={{ color: "#94a3b8", fontSize: 13 }}>• {r}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
