"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

type AgentCheckpoint = { label: string; passed: boolean };
type AgentData = {
  id: string;
  name: string;
  role: string;
  health: "ONLINE" | "DEGRADED" | "OFFLINE";
  currentGoal: string;
  currentAssignment: string | null;
  checkpoints: AgentCheckpoint[];
  tasks: string[];
  reportsTo: string | null;
};

type ApprovalTask = {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected" | "done";
  createdAt: number;
  resolvedBy?: string;
};

type MCPayload = {
  ok: boolean;
  timestamp: string;
  agents: AgentData[];
  stripe: {
    payoutPaused: boolean;
    incidentCount: number;
    latestSeverity: string | null;
    latestMessage: string | null;
  };
  approvalQueue: {
    pending: number;
    tasks: ApprovalTask[];
  };
};

// ── Health dot ───────────────────────────────────────────────────────────────

function HealthDot({ health }: { health: AgentData["health"] }) {
  const color = health === "ONLINE" ? "#22c55e" : health === "DEGRADED" ? "#f59e0b" : "#ef4444";
  return (
    <motion.div
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ repeat: Infinity, duration: health === "ONLINE" ? 2 : 0.8 }}
      style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }}
    />
  );
}

// ── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: AgentData }) {
  const passedCount = agent.checkpoints.filter((c) => c.passed).length;
  const totalCount = agent.checkpoints.length;
  const isLead = agent.role === "GLOBAL_ASSISTANT";
  const borderColor = isLead ? "#f59e0b" : "#60a5fa";
  const labelColor = isLead ? "#fde68a" : "#93c5fd";

  return (
    <div style={{
      border: `1px solid ${borderColor}44`,
      borderRadius: 12,
      background: isLead ? "rgba(20,15,5,0.8)" : "rgba(5,10,25,0.8)",
      padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <HealthDot health={agent.health} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: labelColor, letterSpacing: "0.05em" }}>
            {agent.name}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {agent.role.replace("_", " ")} · {agent.currentAssignment ?? "unassigned"} · reports to {agent.reportsTo ?? "—"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: agent.health === "ONLINE" ? "#22c55e" : "#ef4444", letterSpacing: "0.1em" }}>
          {agent.health}
        </div>
      </div>

      {/* Goal */}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 10, fontStyle: "italic" }}>
        &ldquo;{agent.currentGoal}&rdquo;
      </div>

      {/* Checkpoints */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
          Checkpoints {passedCount}/{totalCount}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {agent.checkpoints.map((cp) => (
            <div
              key={cp.label}
              style={{
                fontSize: 9, padding: "2px 7px", borderRadius: 10,
                background: cp.passed ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${cp.passed ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`,
                color: cp.passed ? "#86efac" : "rgba(255,255,255,0.3)",
              }}
            >
              {cp.passed ? "✓ " : "○ "}{cp.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>
          Active Tasks
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {agent.tasks.slice(0, 4).map((t) => (
            <div key={t} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", display: "flex", gap: 6 }}>
              <span style={{ color: borderColor }}>›</span> {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Approval task row ─────────────────────────────────────────────────────────

function TaskRow({ task, onApprove, onReject }: {
  task: ApprovalTask;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const isPending = task.status === "pending";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: isPending ? "#e2e8f0" : "rgba(255,255,255,0.35)" }}>
          {task.title}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
          {task.description} · from {task.requestedBy}
        </div>
        {!isPending && (
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
            {task.status.toUpperCase()} by {task.resolvedBy}
          </div>
        )}
      </div>
      {isPending && (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onApprove(task.id)}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)",
              color: "#86efac", cursor: "pointer",
            }}
          >
            APPROVE
          </button>
          <button
            onClick={() => onReject(task.id)}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", cursor: "pointer",
            }}
          >
            REJECT
          </button>
        </div>
      )}
      {!isPending && (
        <div style={{
          fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 8,
          background: task.status === "approved" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
          color: task.status === "approved" ? "#86efac" : "#fca5a5",
          border: `1px solid ${task.status === "approved" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
          letterSpacing: "0.1em",
        }}>
          {task.status.toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  const [data, setData] = useState<MCPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/mission-control")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const act = useCallback(async (action: "approve" | "reject", taskId: string) => {
    setActioning(taskId);
    await fetch("/api/mission-control/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, taskId, actorName: "Marcel" }),
    });
    await load();
    setActioning(null);
  }, [load]);

  const bigAce = data?.agents.find((a) => a.id === "big-ace");
  const michael = data?.agents.find((a) => a.id === "michael-charlie");
  const otherAgents = data?.agents.filter((a) => a.id !== "big-ace" && a.id !== "michael-charlie") ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "#020209", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }}
          />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.08em", color: "#22c55e" }}>
              MISSION CONTROL
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              BernoutGlobal Command Center · {data ? new Date(data.timestamp).toLocaleTimeString() : "—"}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <a href="/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Admin</a>
            <a href="/admin/conductor" style={{ fontSize: 10, color: "#60a5fa", textDecoration: "none" }}>Michael Charlie ›</a>
            <a href="/admin/big-ace" style={{ fontSize: 10, color: "#fde68a", textDecoration: "none" }}>Big Ace ›</a>
          </div>
        </div>

        {loading && (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading Mission Control…</div>
        )}

        {data && (
          <>
            {/* Stripe health bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 16px", borderRadius: 8, marginBottom: 20,
              background: data.stripe.payoutPaused ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.07)",
              border: `1px solid ${data.stripe.payoutPaused ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.2)"}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: data.stripe.payoutPaused ? "#fca5a5" : "#86efac" }}>
                STRIPE {data.stripe.payoutPaused ? "⚠ PAYOUT QUEUE PAUSED" : "✓ LIVE"}
              </div>
              {data.stripe.latestMessage && (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                  {data.stripe.latestMessage}
                </div>
              )}
              <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                {data.stripe.incidentCount} incidents
              </div>
              <a
                href="/admin/diagnostics/payments"
                style={{ fontSize: 9, color: "#60a5fa", textDecoration: "none", letterSpacing: "0.1em" }}
              >
                DIAGNOSTICS ›
              </a>
            </div>

            {/* Agent cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {bigAce && <AgentCard agent={bigAce} />}
              {michael && <AgentCard agent={michael} />}
              {otherAgents.map((a) => <AgentCard key={a.id} agent={a} />)}
            </div>

            {/* Approval queue */}
            <div style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, background: "rgba(10,10,20,0.8)",
              marginBottom: 20,
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Approval Queue
                </div>
                {data.approvalQueue.pending > 0 && (
                  <div style={{
                    fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 10,
                    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
                    color: "#fca5a5", letterSpacing: "0.1em",
                  }}>
                    {data.approvalQueue.pending} PENDING
                  </div>
                )}
              </div>
              {data.approvalQueue.tasks.length === 0 && (
                <div style={{ padding: "16px", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                  No tasks in queue.
                </div>
              )}
              {data.approvalQueue.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={{ ...task, status: actioning === task.id ? task.status : task.status }}
                  onApprove={(id) => act("approve", id)}
                  onReject={(id) => act("reject", id)}
                />
              ))}
            </div>

            {/* Revenue command grid */}
            <div style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, background: "rgba(10,10,20,0.8)", overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                fontSize: 11, fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                Revenue Commands
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
                {[
                  { label: "Stripe Products", href: "/admin/diagnostics/payments", color: "#818cf8" },
                  { label: "Subscriptions", href: "/admin/billing", color: "#34d399" },
                  { label: "Beat Locker", href: "/admin/beat-locker", color: "#f59e0b" },
                  { label: "Bot Economy", href: "/admin/conductor/economy", color: "#f472b6" },
                  { label: "Webhook Health", href: "/admin/diagnostics/payments", color: "#60a5fa" },
                  { label: "Sponsor Slots", href: "/admin/commerce", color: "#a78bfa" },
                ].map((item) => (
                  <a
                    key={item.href + item.label}
                    href={item.href}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "14px 16px",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}>
                      {item.label}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: item.color }}>›</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
