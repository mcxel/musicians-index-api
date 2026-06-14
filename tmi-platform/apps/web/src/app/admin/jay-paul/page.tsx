"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type BeatCategory = "battles" | "ciphers" | "games" | "shows" | "arenas" | "intros" | "lobby";
type BeatStatus = "submitted" | "approved" | "active" | "pulled";
type TaskStatus = "needed" | "in-progress" | "submitted" | "done";

interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  category: BeatCategory;
  status: BeatStatus;
  earned: number;
  placements: number;
  submittedAt: string;
}

interface ProductionTask {
  id: string;
  section: string;
  description: string;
  category: BeatCategory;
  priority: "urgent" | "high" | "normal";
  status: TaskStatus;
  dueNote?: string;
  linkedBeatId?: string;
}

const SEED_BEATS: Beat[] = [
  { id: "b1", title: "Neon Pressure",  bpm: 140, key: "Dm", category: "battles", status: "active",    earned: 420, placements: 7, submittedAt: "Jun 1"  },
  { id: "b2", title: "Crown Circuit",  bpm: 96,  key: "Gm", category: "ciphers", status: "active",    earned: 310, placements: 5, submittedAt: "May 28" },
  { id: "b3", title: "Space Bounce",   bpm: 120, key: "C",  category: "games",   status: "approved",  earned: 0,   placements: 0, submittedAt: "Jun 5"  },
  { id: "b4", title: "Grand Stage",    bpm: 88,  key: "Am", category: "shows",   status: "submitted", earned: 0,   placements: 0, submittedAt: "Jun 7"  },
  { id: "b5", title: "Street Code",    bpm: 132, key: "Fm", category: "battles", status: "pulled",    earned: 180, placements: 3, submittedAt: "May 10" },
];

const SEED_TASKS: ProductionTask[] = [
  { id: "t1",  section: "Hip-Hop Arena",        description: "Main theme for the Hip-Hop genre arena lobby",            category: "arenas",  priority: "urgent",  status: "needed",   dueNote: "Needed for soft launch" },
  { id: "t2",  section: "R&B Arena",            description: "Smooth intro theme for R&B genre arena",                  category: "arenas",  priority: "urgent",  status: "needed",   dueNote: "Needed for soft launch" },
  { id: "t3",  section: "Cypher Circle",        description: "High-energy cypher countdown beat",                       category: "ciphers", priority: "urgent",  status: "needed",   dueNote: "Needed for soft launch" },
  { id: "t4",  section: "Battle Arena Intro",   description: "1v1 battle stage entrance beat (8 bars, 140 BPM+)",       category: "battles", priority: "high",    status: "needed"  },
  { id: "t5",  section: "Challenge Stage",      description: "Challenge room waiting music (loopable, 2 min)",          category: "battles", priority: "high",    status: "needed"  },
  { id: "t6",  section: "Game Lobby",           description: "Background music for trivia/prediction games",            category: "games",   priority: "high",    status: "needed"  },
  { id: "t7",  section: "Sponsor Intro",        description: "10-second sponsor intro sting (branded, cinematic)",      category: "intros",  priority: "high",    status: "needed"  },
  { id: "t8",  section: "Season 1 Championship","description": "Championship theme — epic, full 60 seconds",            category: "shows",   priority: "normal",  status: "needed"  },
  { id: "t9",  section: "Billboard Lobby Wall", description: "Ambient loop for the live lobby wall screens",            category: "lobby",   priority: "normal",  status: "needed"  },
  { id: "t10", section: "EDM Arena",            description: "Drop-heavy theme for the EDM genre arena",                category: "arenas",  priority: "normal",  status: "needed"  },
  { id: "t11", section: "Gospel Arena",         description: "Inspirational, choir-driven gospel arena intro",          category: "arenas",  priority: "normal",  status: "needed"  },
  { id: "t12", section: "Open Mic Stage",       description: "Chill open-mic intro (acoustic/lo-fi feel)",             category: "intros",  priority: "normal",  status: "needed"  },
];

const CAT_COLOR: Record<BeatCategory, string> = {
  battles: "#FF2DAA", ciphers: "#AA2DFF", games: "#00FFFF",
  shows: "#FFD700", arenas: "#FF6B35", intros: "#00FF88", lobby: "#4488FF",
};

const STATUS_COLOR: Record<BeatStatus, string> = {
  submitted: "#94a3b8", approved: "#22c55e", active: "#00FFFF", pulled: "#ef4444",
};

const PRIORITY_COLOR: Record<ProductionTask["priority"], string> = {
  urgent: "#ef4444", high: "#f59e0b", normal: "#64748b",
};

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  "needed": "NEEDED", "in-progress": "IN PROGRESS", "submitted": "SUBMITTED", "done": "DONE",
};

const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  "needed": "#ef4444", "in-progress": "#f59e0b", "submitted": "#94a3b8", "done": "#22c55e",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6, padding: "7px 9px",
  color: "#f1f5f9", fontSize: 11, outline: "none", fontFamily: "inherit",
};

export default function JayPaulBeatPortal() {
  const [beats, setBeats] = useState<Beat[]>(SEED_BEATS);
  const [tasks, setTasks] = useState<ProductionTask[]>(SEED_TASKS);
  const [form, setForm] = useState({ title: "", bpm: "", key: "", category: "battles" as BeatCategory, url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [payoutAmt, setPayoutAmt] = useState("");
  const [payoutSent, setPayoutSent] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<"all" | TaskStatus>("all");

  const totalEarned     = beats.reduce((s, b) => s + b.earned, 0);
  const pendingPayout   = 310;
  const paidOut         = 600;
  const totalPlacements = beats.reduce((s, b) => s + b.placements, 0);

  const urgentCount  = tasks.filter(t => t.priority === "urgent" && t.status !== "done").length;
  const neededCount  = tasks.filter(t => t.status === "needed").length;
  const doneCount    = tasks.filter(t => t.status === "done").length;
  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter(t => t.status === taskFilter);

  function submitBeat(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    setTimeout(() => {
      const newBeat: Beat = {
        id: `b${Date.now()}`,
        title: form.title,
        bpm: parseInt(form.bpm) || 120,
        key: form.key || "C",
        category: form.category,
        status: "submitted",
        earned: 0,
        placements: 0,
        submittedAt: "Just now",
      };
      setBeats((prev) => [newBeat, ...prev]);
      // Auto-mark any matching task as submitted
      setTasks(prev => prev.map(t =>
        t.category === form.category && (t.status === "needed" || t.status === "in-progress")
          ? { ...t, status: "submitted", linkedBeatId: newBeat.id }
          : t
      ));
      setForm({ title: "", bpm: "", key: "", category: "battles", url: "" });
      setSubmitting(false);
      setSubmitted(true);
      setActiveTaskId(null);
      setTimeout(() => setSubmitted(false), 3000);
    }, 700);
  }

  function requestPayout(e: React.FormEvent) {
    e.preventDefault();
    setPayoutSent(true);
  }

  function cycleTaskStatus(taskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const next: TaskStatus = t.status === "needed" ? "in-progress"
        : t.status === "in-progress" ? "submitted"
        : t.status === "submitted" ? "done"
        : "needed";
      return { ...t, status: next };
    }));
  }

  function startFromTask(task: ProductionTask) {
    setForm(f => ({ ...f, category: task.category, title: "" }));
    setActiveTaskId(task.id);
    setTasks(prev => prev.map(t =>
      t.id === task.id && t.status === "needed" ? { ...t, status: "in-progress" } : t
    ));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AdminShell
      hubId="jay-paul"
      hubTitle="Jay Paul Sanchez"
      hubSubtitle="Beat Producer Portal · Platform Production Ops"
      backHref="/admin"
    >
      {/* ── Earnings summary strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total Earned",     value: `$${totalEarned.toLocaleString()}`,   color: "#FFD700" },
          { label: "Pending Payout",   value: `$${pendingPayout.toLocaleString()}`, color: "#f59e0b", note: "Awaiting Big Ace" },
          { label: "Paid Out",         value: `$${paidOut.toLocaleString()}`,       color: "#22c55e" },
          { label: "Active Beats",     value: String(beats.filter(b => b.status === "active").length), color: "#00FFFF" },
          { label: "Total Placements", value: String(totalPlacements),              color: "#FF2DAA" },
          { label: "Tasks Remaining",  value: String(neededCount),                  color: urgentCount > 0 ? "#ef4444" : "#f59e0b", note: urgentCount > 0 ? `${urgentCount} URGENT` : undefined },
          { label: "Tasks Done",       value: `${doneCount}/${tasks.length}`,       color: "#22c55e" },
        ].map((m) => (
          <div key={m.label} style={{ border: `1px solid ${m.color}33`, borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 9, color: m.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</p>
            {"note" in m && m.note && <p style={{ margin: "1px 0 0", fontSize: 8, color: m.color, opacity: 0.75 }}>{m.note}</p>}
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px minmax(0,1fr)", gap: 12, alignItems: "start", marginBottom: 16 }}>
        {/* ── LEFT — submit form + payout ── */}
        <div style={{ display: "grid", gap: 10 }}>

          {/* Active task indicator */}
          {activeTaskId && (() => {
            const t = tasks.find(x => x.id === activeTaskId);
            return t ? (
              <div style={{ border: "1px solid #f59e0b55", borderRadius: 10, background: "rgba(30,20,0,0.8)", padding: "10px 12px" }}>
                <p style={{ margin: "0 0 3px", fontSize: 8, color: "#f59e0b", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Working on task</p>
                <p style={{ margin: 0, fontSize: 11, color: "#f1f5f9", fontWeight: 700 }}>{t.section}</p>
                <p style={{ margin: "3px 0 0", fontSize: 9, color: "#94a3b8" }}>{t.description}</p>
                <button onClick={() => setActiveTaskId(null)} style={{ marginTop: 7, fontSize: 8, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  Clear task context
                </button>
              </div>
            ) : null;
          })()}

          {/* Beat submission form */}
          <section style={{ border: "1px solid rgba(255,45,170,0.3)", borderRadius: 12, background: "rgba(20,5,15,0.75)", padding: 14 }}>
            <p style={{ margin: "0 0 12px", color: "#FF2DAA", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Submit a Beat
            </p>
            <form onSubmit={submitBeat} style={{ display: "grid", gap: 9 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Beat Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Neon Fire" required style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>BPM</label>
                  <input type="number" value={form.bpm} onChange={e => setForm(f => ({...f, bpm: e.target.value}))} placeholder="120" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Key</label>
                  <input value={form.key} onChange={e => setForm(f => ({...f, key: e.target.value}))} placeholder="Dm" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Placement Section *</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as BeatCategory}))} style={inputStyle}>
                  <option value="battles">Battles</option>
                  <option value="ciphers">Ciphers</option>
                  <option value="arenas">Arena Themes</option>
                  <option value="intros">Intros / Stings</option>
                  <option value="lobby">Lobby Ambient</option>
                  <option value="games">Games</option>
                  <option value="shows">Shows</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Audio URL (SoundCloud / Drive / Vault)</label>
                <input type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="https://..." style={inputStyle} />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  borderRadius: 7,
                  border: "1px solid rgba(255,45,170,0.5)",
                  background: "rgba(120,10,60,0.6)",
                  color: submitted ? "#86efac" : "#FF2DAA",
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "9px 12px", cursor: submitting ? "wait" : "pointer", transition: "color 0.2s",
                }}
              >
                {submitting ? "Submitting..." : submitted ? "✓ Beat Submitted to Vault!" : "Submit Beat → Vault"}
              </button>
            </form>
          </section>

          {/* Payout request */}
          <section style={{ border: "1px solid rgba(255,215,0,0.25)", borderRadius: 12, background: "rgba(20,15,5,0.75)", padding: 14 }}>
            <p style={{ margin: "0 0 4px", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Request Payout
            </p>
            <p style={{ margin: "0 0 10px", fontSize: 9, color: "#64748b", lineHeight: 1.6 }}>
              Platform law: all payouts require Big Ace approval before processing.
            </p>
            {payoutSent ? (
              <div style={{ border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, background: "rgba(5,46,22,0.3)", padding: 10 }}>
                <p style={{ margin: 0, color: "#86efac", fontSize: 10, fontWeight: 700 }}>✓ Payout request sent to Big Ace for approval</p>
              </div>
            ) : (
              <form onSubmit={requestPayout} style={{ display: "grid", gap: 8 }}>
                <input
                  type="number"
                  value={payoutAmt}
                  onChange={e => setPayoutAmt(e.target.value)}
                  placeholder="Amount to request ($)"
                  min="1"
                  required
                  style={inputStyle}
                />
                <button
                  type="submit"
                  style={{ borderRadius: 7, border: "1px solid rgba(255,215,0,0.4)", background: "rgba(80,50,0,0.55)", color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 12px", cursor: "pointer" }}
                >
                  Request → Big Ace Approval
                </button>
              </form>
            )}
          </section>
        </div>

        {/* ── RIGHT — beat catalog ── */}
        <section style={{ border: "1px solid rgba(170,45,255,0.25)", borderRadius: 12, background: "rgba(10,5,20,0.75)", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(170,45,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: "#c4b5fd", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" }}>Beat Catalog / Vault</strong>
            <span style={{ color: "#64748b", fontSize: 9 }}>{beats.length} beats · {beats.filter(b => b.status === "active").length} active</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Title", "Section", "BPM / Key", "Status", "Plays", "Earned"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {beats.map((beat, i) => (
                  <tr key={beat.id} style={{ borderBottom: i < beats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "9px 12px" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#f1f5f9", fontWeight: 600 }}>{beat.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 9, color: "#64748b" }}>{beat.submittedAt}</p>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: CAT_COLOR[beat.category], border: `1px solid ${CAT_COLOR[beat.category]}44`, borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>
                        {beat.category}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>{beat.bpm} BPM · {beat.key}</p>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: STATUS_COLOR[beat.status], letterSpacing: "0.06em" }}>
                        {beat.status}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                      {beat.placements}
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, color: beat.earned > 0 ? "#22c55e" : "#475569" }}>
                      {beat.earned > 0 ? `$${beat.earned.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Earnings by category */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {(Object.keys(CAT_COLOR) as BeatCategory[]).map(cat => {
              const earned = beats.filter(b => b.category === cat).reduce((s, b) => s + b.earned, 0);
              const count  = beats.filter(b => b.category === cat).length;
              if (!count) return null;
              return (
                <div key={cat} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: CAT_COLOR[cat], display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{cat}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: earned > 0 ? "#22c55e" : "#475569" }}>
                    {earned > 0 ? `$${earned}` : "$0"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════
          PRODUCTION TASK BOARD — Platform Beat Needs
      ══════════════════════════════════════════════════ */}
      <section style={{ border: "1px solid rgba(255,107,53,0.35)", borderRadius: 14, background: "rgba(15,8,3,0.85)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,107,53,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#FF6B35", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              🎛 Platform Production Board
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#64748b" }}>
              Every section below needs a beat. Check it off when submitted. Tap a task to jump to the submit form.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["all", "needed", "in-progress", "submitted", "done"] as const).map(f => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                style={{
                  fontSize: 8, fontWeight: 800, padding: "3px 10px", borderRadius: 20, cursor: "pointer",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  border: taskFilter === f ? "1px solid #FF6B35" : "1px solid rgba(255,255,255,0.1)",
                  background: taskFilter === f ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.03)",
                  color: taskFilter === f ? "#FF6B35" : "#64748b",
                }}
              >
                {f === "all" ? `All (${tasks.length})` : `${TASK_STATUS_LABEL[f as TaskStatus]} (${tasks.filter(t => t.status === f).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((doneCount / tasks.length) * 100)}%`, background: "linear-gradient(90deg, #FF6B35, #FFD700)", borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
          <span style={{ fontSize: 9, color: "#FF6B35", fontWeight: 800, whiteSpace: "nowrap" }}>
            {Math.round((doneCount / tasks.length) * 100)}% Complete · {doneCount}/{tasks.length} tasks done
          </span>
        </div>

        {/* Task rows */}
        <div>
          {filteredTasks.map((task, i) => (
            <div
              key={task.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 12,
                alignItems: "center",
                padding: "11px 16px",
                borderBottom: i < filteredTasks.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: activeTaskId === task.id ? "rgba(255,107,53,0.07)" : "transparent",
                transition: "background 0.2s",
              }}
            >
              {/* Checkbox / cycle */}
              <button
                onClick={() => cycleTaskStatus(task.id)}
                title="Click to advance status"
                style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                  border: `1.5px solid ${TASK_STATUS_COLOR[task.status]}`,
                  background: task.status === "done" ? TASK_STATUS_COLOR[task.status] : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                }}
              >
                {task.status === "done" ? "✓" : task.status === "submitted" ? "↑" : task.status === "in-progress" ? "●" : ""}
              </button>

              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: task.status === "done" ? "#475569" : "#f1f5f9", textDecoration: task.status === "done" ? "line-through" : "none" }}>
                    {task.section}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: PRIORITY_COLOR[task.priority], border: `1px solid ${PRIORITY_COLOR[task.priority]}44`, borderRadius: 3, padding: "1px 5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {task.priority}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: CAT_COLOR[task.category], border: `1px solid ${CAT_COLOR[task.category]}33`, borderRadius: 3, padding: "1px 5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {task.category}
                  </span>
                  {task.dueNote && (
                    <span style={{ fontSize: 8, color: "#ef4444", fontWeight: 700 }}>⚡ {task.dueNote}</span>
                  )}
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: "#64748b" }}>{task.description}</p>
                {task.linkedBeatId && (
                  <p style={{ margin: "2px 0 0", fontSize: 8, color: "#22c55e" }}>
                    ✓ Linked to beat: {beats.find(b => b.id === task.linkedBeatId)?.title ?? task.linkedBeatId}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <span style={{ fontSize: 8, fontWeight: 800, color: TASK_STATUS_COLOR[task.status], border: `1px solid ${TASK_STATUS_COLOR[task.status]}44`, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {TASK_STATUS_LABEL[task.status]}
              </span>

              {/* Start / Done action */}
              {task.status !== "done" ? (
                <button
                  onClick={() => startFromTask(task)}
                  style={{
                    fontSize: 8, fontWeight: 800, padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                    border: "1px solid rgba(255,45,170,0.4)", background: activeTaskId === task.id ? "rgba(255,45,170,0.2)" : "rgba(255,45,170,0.08)",
                    color: "#FF2DAA", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap",
                  }}
                >
                  {activeTaskId === task.id ? "In Form ↑" : "Start →"}
                </button>
              ) : (
                <button
                  onClick={() => cycleTaskStatus(task.id)}
                  style={{ fontSize: 8, fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: "1px solid rgba(100,116,139,0.3)", background: "transparent", color: "#475569", whiteSpace: "nowrap" }}
                >
                  Undo
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 9, color: "#475569" }}>
          Tap the checkbox to advance status · Tap <strong style={{ color: "#FF2DAA" }}>Start →</strong> to load the section into the submit form · Submitting a beat auto-marks matching tasks as submitted.
        </div>
      </section>
    </AdminShell>
  );
}
