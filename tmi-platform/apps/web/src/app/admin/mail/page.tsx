"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DispatchStats {
  total: number;
  sent: number;
  suppressed: number;
  failed: number;
}

interface OptInCounts {
  system: number;
  engagement: number;
  growth: number;
  revenue: number;
}

interface ScheduledJob {
  id: string;
  label: string;
  cronLabel: string;
  lastRunAt: number | null;
  nextRunAt: number;
  enabled: boolean;
}

interface TicketStats {
  open: number;
  pending_approval: number;
  approved: number;
  resolved: number;
  rejected: number;
}

interface DispatchLogEntry {
  event: string;
  userId: string;
  sent: boolean;
  reason?: string;
  messageId?: string;
  firedAt: number;
}

interface MailStats {
  sent: number;
  dispatch: DispatchStats;
  optIns: OptInCounts;
  recentLog: DispatchLogEntry[];
  scheduledJobs: ScheduledJob[];
  supportTickets: TicketStats;
}

const CYAN = "#00e5ff";
const GOLD = "#ffd700";
const FUCHSIA = "#ff00ff";
const RED = "#ff4444";
const MUTED = "#888";
const CARD = "background:#12121a;border:1px solid #222;border-radius:10px;padding:20px;";

export default function AdminMailPage() {
  const router = useRouter();
  const [stats, setStats] = useState<MailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastHtml, setBroadcastHtml] = useState("");
  const [broadcastCategory, setBroadcastCategory] = useState<"growth" | "engagement" | "revenue" | "system">("growth");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "log" | "support" | "broadcast" | "scheduler">("overview");

  const SECRET = typeof window !== "undefined" ? localStorage.getItem("adminSecret") ?? "" : "";

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mail/stats", {
        headers: { Authorization: `Bearer ${SECRET}` },
      });
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  async function sendBroadcast() {
    if (!broadcastSubject || !broadcastHtml) return;
    setBroadcasting(true);
    setBroadcastMsg("");
    try {
      const res = await fetch("/api/admin/mail/send-broadcast", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: broadcastSubject,
          html: broadcastHtml,
          category: broadcastCategory,
        }),
      });
      const data = await res.json();
      setBroadcastMsg(`Sent to ${data.sent} users, skipped ${data.skipped}.`);
      loadStats();
    } finally {
      setBroadcasting(false);
    }
  }

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "log", label: "Dispatch Log" },
    { id: "support", label: "Support Tickets" },
    { id: "broadcast", label: "Broadcast" },
    { id: "scheduler", label: "Scheduler" },
  ];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", padding: "32px 24px", color: "#e0e0e0", fontFamily: "monospace" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: CYAN, letterSpacing: "0.08em" }}>
              MAIL COMMAND CENTER
            </h1>
            <p style={{ margin: "4px 0 0", color: MUTED, fontSize: 13 }}>
              TMI Mail Engine — Dispatch, Broadcast & Support
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={loadStats}
              style={{ background: "#1a1a2e", color: CYAN, border: `1px solid ${CYAN}`, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            >
              REFRESH
            </button>
            <button
              onClick={() => router.push("/admin")}
              style={{ background: "#1a1a2e", color: MUTED, border: "1px solid #333", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}
            >
              ← ADMIN
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #222", paddingBottom: 0 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? "#1a1a2e" : "transparent",
                color: activeTab === t.id ? CYAN : MUTED,
                border: "none",
                borderBottom: activeTab === t.id ? `2px solid ${CYAN}` : "2px solid transparent",
                padding: "10px 18px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: MUTED }}>Loading...</p>}

        {/* Overview Tab */}
        {!loading && stats && activeTab === "overview" && (
          <div>
            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Sent", value: stats.sent, color: CYAN },
                { label: "Dispatched", value: stats.dispatch.sent, color: GOLD },
                { label: "Suppressed", value: stats.dispatch.suppressed, color: MUTED },
                { label: "Failed", value: stats.dispatch.failed, color: RED },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ ...Object.fromEntries(CARD.split(";").filter(Boolean).map(s => s.split(":").map(x => x.trim()) as [string, string])), textAlign: "center" as const }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: "0.1em" }}>{label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Opt-In Counts */}
            <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", color: GOLD, fontSize: 13, letterSpacing: "0.1em" }}>OPT-IN COUNTS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {(Object.entries(stats.optIns) as [string, number][]).map(([cat, count]) => (
                  <div key={cat} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: CYAN }}>{count}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{cat.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Ticket Summary */}
            <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", color: FUCHSIA, fontSize: 13, letterSpacing: "0.1em" }}>SUPPORT TICKETS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {(Object.entries(stats.supportTickets) as [string, number][]).map(([status, count]) => (
                  <div key={status} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: status === "open" ? RED : status === "resolved" ? CYAN : MUTED }}>{count}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{status.replace("_", " ").toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Log Tab */}
        {!loading && stats && activeTab === "log" && (
          <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", color: CYAN, fontSize: 13, letterSpacing: "0.1em" }}>RECENT DISPATCH LOG</h3>
            {stats.recentLog.length === 0 ? (
              <p style={{ color: MUTED, fontSize: 13 }}>No dispatches yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ color: MUTED, borderBottom: "1px solid #333" }}>
                    {["Event", "User", "Status", "Reason", "Time"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", letterSpacing: "0.08em", fontWeight: 700 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...stats.recentLog].reverse().map((entry, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "8px 12px", color: CYAN }}>{entry.event}</td>
                      <td style={{ padding: "8px 12px", color: "#e0e0e0" }}>{entry.userId}</td>
                      <td style={{ padding: "8px 12px", color: entry.sent ? GOLD : RED }}>
                        {entry.sent ? "SENT" : "SKIPPED"}
                      </td>
                      <td style={{ padding: "8px 12px", color: MUTED, fontSize: 11 }}>{entry.reason ?? "—"}</td>
                      <td style={{ padding: "8px 12px", color: MUTED }}>
                        {new Date(entry.firedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Support Tab */}
        {!loading && stats && activeTab === "support" && (
          <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", color: FUCHSIA, fontSize: 13, letterSpacing: "0.1em" }}>SUPPORT QUEUE</h3>
            <p style={{ color: MUTED, fontSize: 13 }}>
              Open tickets: <strong style={{ color: RED }}>{stats.supportTickets.open}</strong> —
              Manage via <a href="/admin/inbox" style={{ color: CYAN }}>Admin Inbox</a>.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16 }}>
              {(Object.entries(stats.supportTickets) as [string, number][]).map(([status, count]) => (
                <div key={status} style={{ textAlign: "center", padding: 16, background: "#0a0a0f", borderRadius: 8, border: "1px solid #222" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: status === "open" ? RED : status === "resolved" ? CYAN : GOLD }}>{count}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{status.replace("_", " ").toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === "broadcast" && (
          <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", color: GOLD, fontSize: 13, letterSpacing: "0.1em" }}>SEND BROADCAST</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: MUTED, fontSize: 11, marginBottom: 6, letterSpacing: "0.08em" }}>CATEGORY</label>
              <select
                value={broadcastCategory}
                onChange={e => setBroadcastCategory(e.target.value as typeof broadcastCategory)}
                style={{ background: "#0a0a0f", color: "#e0e0e0", border: "1px solid #333", borderRadius: 6, padding: "10px 14px", width: "100%", fontSize: 13 }}
              >
                <option value="growth">Growth</option>
                <option value="engagement">Engagement</option>
                <option value="revenue">Revenue</option>
                <option value="system">System</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: MUTED, fontSize: 11, marginBottom: 6, letterSpacing: "0.08em" }}>SUBJECT</label>
              <input
                value={broadcastSubject}
                onChange={e => setBroadcastSubject(e.target.value)}
                placeholder="Email subject line"
                style={{ background: "#0a0a0f", color: "#e0e0e0", border: "1px solid #333", borderRadius: 6, padding: "10px 14px", width: "100%", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: MUTED, fontSize: 11, marginBottom: 6, letterSpacing: "0.08em" }}>HTML BODY</label>
              <textarea
                value={broadcastHtml}
                onChange={e => setBroadcastHtml(e.target.value)}
                placeholder="<p>Your message here...</p>"
                rows={10}
                style={{ background: "#0a0a0f", color: "#e0e0e0", border: "1px solid #333", borderRadius: 6, padding: "10px 14px", width: "100%", fontSize: 12, boxSizing: "border-box", resize: "vertical", fontFamily: "monospace" }}
              />
            </div>

            <button
              onClick={sendBroadcast}
              disabled={broadcasting || !broadcastSubject || !broadcastHtml}
              style={{
                background: broadcasting ? "#333" : GOLD,
                color: "#000",
                border: "none",
                borderRadius: 6,
                padding: "12px 28px",
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: "0.1em",
                cursor: broadcasting ? "not-allowed" : "pointer",
                opacity: !broadcastSubject || !broadcastHtml ? 0.5 : 1,
              }}
            >
              {broadcasting ? "SENDING..." : "SEND BROADCAST"}
            </button>

            {broadcastMsg && (
              <p style={{ color: CYAN, marginTop: 12, fontSize: 13 }}>{broadcastMsg}</p>
            )}
          </div>
        )}

        {/* Scheduler Tab */}
        {!loading && stats && activeTab === "scheduler" && (
          <div style={{ background: "#12121a", border: "1px solid #222", borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", color: CYAN, fontSize: 13, letterSpacing: "0.1em" }}>SCHEDULED MAIL JOBS</h3>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {stats.scheduledJobs.map(job => (
                <div key={job.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#0a0a0f", borderRadius: 8, border: "1px solid #222" }}>
                  <div>
                    <div style={{ color: "#e0e0e0", fontWeight: 700, fontSize: 13 }}>{job.label}</div>
                    <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>{job.cronLabel}</div>
                    {job.lastRunAt && (
                      <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>
                        Last run: {new Date(job.lastRunAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: new Date(job.nextRunAt).getTime() < Date.now() ? RED : CYAN, fontSize: 11 }}>
                      Next: {new Date(job.nextRunAt).toLocaleString()}
                    </span>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 700,
                      background: job.enabled ? "#0a2a0a" : "#2a0a0a",
                      color: job.enabled ? "#00ff88" : RED,
                      border: `1px solid ${job.enabled ? "#00ff88" : RED}`,
                    }}>
                      {job.enabled ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
