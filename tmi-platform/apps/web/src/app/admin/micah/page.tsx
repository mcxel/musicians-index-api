"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

type DevTaskStatus = "pending" | "in-progress" | "done" | "blocked";

interface DevTask {
  id: string;
  title: string;
  file?: string;
  status: DevTaskStatus;
  priority: "urgent" | "high" | "normal";
}

interface SharedTask {
  id: string;
  title: string;
  done: boolean;
}

const SEED_DEV_TASKS: DevTask[] = [
  { id: "d1", title: "Fix auth selector #auth-email in auth/page.tsx",    file: "app/auth/page.tsx",              status: "done",        priority: "urgent" },
  { id: "d2", title: "Run Playwright full 43-test suite",                  status: "in-progress", priority: "high"   },
  { id: "d3", title: "Push Home 3 lobby wall fix to GitHub",               file: "app/home/3/page.tsx",            status: "in-progress", priority: "high"   },
  { id: "d4", title: "Update ChevronNavigation hidden paths",               file: "components/nav/ChevronNav.tsx",  status: "pending",     priority: "normal" },
  { id: "d5", title: "Wire BroadcastLobbyWall feedType props",             file: "components/media/BroadcastLobbyWall.tsx", status: "pending", priority: "normal" },
  { id: "d6", title: "Check Vercel env vars (DAILY_API_KEY)",              status: "pending",     priority: "high"   },
];

const SEED_SHARED_TASKS: SharedTask[] = [
  { id: "s1", title: "Verify Home 1 orbital wheel renders",           done: true  },
  { id: "s2", title: "Test 3 video monitors independent timers",       done: true  },
  { id: "s3", title: "Confirm season pass animation on all instruments", done: false },
  { id: "s4", title: "Deploy to production after green tests",         done: false },
];

const TASK_STATUS_COLORS: Record<DevTaskStatus, string> = {
  pending:     "#444",
  "in-progress": "#FFD700",
  done:        "#00FF88",
  blocked:     "#FF2DAA",
};

const PRIORITY_COLOR = { urgent: "#FF2DAA", high: "#FFD700", normal: "rgba(255,255,255,0.4)" };

const DEV_ACTIVITY_BARS = [30, 45, 38, 55, 42, 48, 62, 55, 70, 58, 65, 80];

export default function MicahAdminPage() {
  const [devTasks, setDevTasks] = useState<DevTask[]>(SEED_DEV_TASKS);
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>(SEED_SHARED_TASKS);
  const [songNote, setSongNote] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submittedSong, setSubmittedSong] = useState(false);
  const [submittedSuggestion, setSubmittedSuggestion] = useState(false);
  const [mode, setMode] = useState<"dev" | "music">("dev");

  function cycleTask(id: string) {
    const order: DevTaskStatus[] = ["pending", "in-progress", "done", "blocked"];
    setDevTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % order.length]! } : t
    ));
  }

  function toggleShared(id: string) {
    setSharedTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const doneCount = devTasks.filter(t => t.status === "done").length;

  return (
    <AdminShell
      hubId="micah"
      hubTitle="Micah — Dev Assistant Hub"
      hubSubtitle="Dev Assistant · USAstreamteam · Song Submissions"
      backHref="/admin"
    >
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Mode:</span>
        {(["dev","music"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: "3px 12px", fontSize: 10, fontWeight: 700, background: mode === m ? "rgba(0,255,136,0.2)" : "transparent", border: `1px solid ${mode === m ? "#00FF88" : "rgba(255,255,255,0.15)"}`, color: mode === m ? "#00FF88" : "rgba(255,255,255,0.4)", borderRadius: 5, cursor: "pointer" }}>
            {m === "dev" ? "DEV" : "MUSIC"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", borderRadius: 4, fontWeight: 700 }}>SUBMIT SONGS</span>
          <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(0,180,255,0.1)", border: "1px solid rgba(0,180,255,0.3)", color: "#00E5FF", borderRadius: 4, fontWeight: 700 }}>SUGGEST</span>
          <span style={{ fontSize: 9, padding: "2px 8px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", borderRadius: 4, fontWeight: 700 }}>DEV TASKS</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {[
          { lbl: "💻 Open VS Code task",  href: "vscode://file/",      color: "#00FF88" },
          { lbl: "⬆ Submit song",         href: "/beat-vault",          color: "#FFD700" },
          { lbl: "🔀 Push to GitHub",      href: "https://github.com",  color: "#00E5FF" },
          { lbl: "▶ Run build",            href: "/admin/conductor",     color: "#00FF88" },
          { lbl: "💡 Submit suggestion",   href: "#suggestion",         color: "rgba(255,255,255,0.6)" },
          { lbl: "💬 Message Marcel",      href: "/messages/new?to=marcel", color: "rgba(255,255,255,0.6)" },
          { lbl: "🎵 Playlist",            href: "/admin/micah/playlist", color: "rgba(255,255,255,0.6)" },
        ].map(({ lbl, href, color }) => (
          <Link key={lbl} href={href} style={{ fontSize: 9, padding: "4px 10px", background: "transparent", border: `1px solid ${color}44`, color, borderRadius: 4, textDecoration: "none", fontWeight: 700, letterSpacing: "0.05em" }}>
            {lbl}
          </Link>
        ))}
      </div>

      {/* 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr 1fr", gap: 8, marginBottom: 8 }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Coding task queue */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>
              Coding Task Queue <span style={{ color: "#FFD700" }}>({doneCount}/{devTasks.length})</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              {devTasks.map(t => (
                <div key={t.id} onClick={() => cycleTask(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.05)", cursor: "pointer" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: TASK_STATUS_COLORS[t.status], flexShrink: 0, display: "inline-block" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: t.status === "done" ? "rgba(255,255,255,0.3)" : "#fff", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</div>
                    {t.file && <div style={{ fontSize: 7, color: "rgba(0,255,136,0.5)" }}>{t.file}</div>}
                  </div>
                  <span style={{ fontSize: 7, color: PRIORITY_COLOR[t.priority], flexShrink: 0 }}>{t.priority}</span>
                </div>
              ))}
            </div>
            <a href="vscode://file/" style={{ display: "block", width: "100%", textAlign: "center", padding: "5px 0", fontSize: 9, fontWeight: 700, background: "rgba(0,255,136,.12)", border: "1px solid rgba(0,255,136,.3)", color: "#00FF88", borderRadius: 4, textDecoration: "none" }}>💻 Open VS Code — start next task</a>
          </div>

          {/* Song submission */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>Song Submission</div>
            <Link href="/radio" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "rgba(0,255,136,.06)", border: "1px solid rgba(0,255,136,.2)", borderRadius: 4, marginBottom: 5, textDecoration: "none", color: "#00FF88", fontSize: 10 }}>
              📻 Submit to Stream &amp; Win Radio
            </Link>
            <Link href="/battles" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "transparent", border: "1px solid rgba(255,255,255,.1)", borderRadius: 4, marginBottom: 8, textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: 10 }}>
              💡 Submit suggestion
            </Link>
            <textarea
              value={songNote}
              onChange={e => setSongNote(e.target.value)}
              placeholder="Notes or suggestions..."
              style={{ width: "100%", height: 50, fontSize: 10, background: "rgba(12,20,50,.9)", border: "1px solid rgba(0,255,136,.2)", color: "rgba(255,255,255,.8)", borderRadius: 4, padding: "6px 8px", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <button onClick={() => { setSubmittedSong(true); setSongNote(""); setTimeout(() => setSubmittedSong(false), 3000); }} style={{ width: "100%", marginTop: 5, padding: "5px 0", fontSize: 10, fontWeight: 700, background: submittedSong ? "rgba(0,255,136,.2)" : "rgba(0,180,255,.1)", border: `1px solid ${submittedSong ? "#00FF88" : "rgba(0,180,255,.3)"}`, color: submittedSong ? "#00FF88" : "#00E5FF", borderRadius: 4, cursor: "pointer" }}>
              {submittedSong ? "✓ Submitted!" : "⬆ Submit"}
            </button>
          </div>

          {/* Playlist */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>Playlist</div>
            {["Neon Pulse Beat","Sunday Wave","Midnight Cypher","Gold Rush Remix"].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 9 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", width: 14 }}>{i + 1}.</span>
                <span style={{ flex: 1, color: i === 0 ? "#FFD700" : "rgba(255,255,255,.7)" }}>{t}</span>
                {i === 0 && <span style={{ fontSize: 7, color: "#00FF88" }}>▶ PLAYING</span>}
              </div>
            ))}
          </div>
        </div>

        {/* CENTRE: Dev monitors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              Dev Monitors
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 5px #00FF88", display: "inline-block", animation: "pulse 1.2s ease-in-out infinite" }} />
            </div>

            {/* Main monitor */}
            <div style={{ position: "relative", background: "rgba(0,12,8,.9)", border: "1.5px solid rgba(0,255,136,.3)", borderRadius: 6, overflow: "hidden", aspectRatio: "16/7", marginBottom: 6 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, color: "rgba(0,255,136,0.2)" }}>💻</span>
              </div>
              <div style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,110,86,.8)", color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}>DEV CONSOLE</div>
              <div style={{ position: "absolute", bottom: 4, left: 6, fontSize: 8, color: "rgba(255,255,255,.55)", background: "rgba(0,0,0,.4)", padding: "1px 5px", borderRadius: 2 }}>Build status — pnpm build</div>
            </div>

            {/* 4 small monitors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 6 }}>
              {[
                { label: "GitHub — latest push",      icon: "🔀", badge: "GIT",   color: "rgba(0,110,86,.8)"    },
                { label: "Playwright — test results",  icon: "✅", badge: "TESTS", color: "rgba(0,140,180,.7)"   },
                { label: "Platform performance",       icon: "📊", badge: "PERF",  color: "rgba(186,117,23,.8)"  },
                { label: "Marcel — task thread",       icon: "💬", badge: "MSG",   color: "rgba(83,74,183,.8)"   },
              ].map(({ label, icon, badge, color }) => (
                <div key={badge} style={{ position: "relative", background: "rgba(0,12,8,.9)", border: "1px solid rgba(0,255,136,.15)", borderRadius: 5, overflow: "hidden", aspectRatio: "16/9" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "rgba(255,255,255,0.15)" }}>{icon}</div>
                  <div style={{ position: "absolute", top: 3, right: 3, background: color, color: "#fff", fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 2 }}>{badge}</div>
                  <div style={{ position: "absolute", bottom: 3, left: 4, fontSize: 7, color: "rgba(255,255,255,.5)", background: "rgba(0,0,0,.4)", padding: "1px 4px", borderRadius: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 5 }}>
              <Link href="/messages/new?to=marcel" style={{ flex: 1, textAlign: "center", padding: "4px 0", fontSize: 9, fontWeight: 700, background: "transparent", border: "1px solid rgba(0,255,136,.3)", color: "#00FF88", borderRadius: 4, textDecoration: "none" }}>📹 Call Marcel</Link>
              <a href="https://github.com" style={{ flex: 1, textAlign: "center", padding: "4px 0", fontSize: 9, fontWeight: 700, background: "transparent", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.6)", borderRadius: 4, textDecoration: "none" }}>Push to GitHub</a>
              <Link href="/admin/conductor" style={{ flex: 1, textAlign: "center", padding: "4px 0", fontSize: 9, fontWeight: 700, background: "transparent", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.6)", borderRadius: 4, textDecoration: "none" }}>Run build</Link>
            </div>
          </div>

          {/* Build & deploy status */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>Build &amp; Deploy Status</div>
            {[
              ["Last build",      "PASS — Exit 0",     "#00FF88"],
              ["Playwright",      "26/43 passed",      "#FFD700"],
              ["TypeScript",      "0 errors",          "#00FF88"],
              ["Deploy status",   "Vercel — Live",     "#00FF88"],
            ].map(([lbl, val, color]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 10 }}>
                <span style={{ color: "rgba(255,255,255,.5)" }}>{lbl}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Shared tasks with Marcel */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>"Push buttons with Marcel" shared tasks</div>
            {sharedTasks.map(t => (
              <div key={t.id} onClick={() => toggleShared(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.05)", cursor: "pointer", fontSize: 9 }}>
                <span style={{ width: 12, height: 12, border: "1px solid rgba(0,255,136,.4)", borderRadius: 2, background: t.done ? "#00FF88" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 8, color: "#050510" }}>{t.done ? "✓" : ""}</span>
                <span style={{ color: t.done ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.8)", textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>Messages</div>
            {[
              ["Marcel",  "Check the Vercel logs after next deploy"],
              ["Big Ace", "Song #7 approved for radio — submit now"],
              ["Justin",  "Home 3 still showing blank on mobile"],
            ].map(([from, msg]) => (
              <div key={from} style={{ padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 9 }}>
                <span style={{ color: "#00FF88", fontWeight: 700 }}>{from}:</span>
                <span style={{ color: "rgba(255,255,255,.55)", marginLeft: 4 }}>{msg}</span>
              </div>
            ))}
            <Link href="/messages" style={{ display: "block", textAlign: "center", marginTop: 6, padding: "4px 0", fontSize: 9, fontWeight: 700, background: "transparent", border: "1px solid rgba(0,255,136,.25)", color: "#00FF88", borderRadius: 4, textDecoration: "none" }}>💬 Open messages</Link>
          </div>

          {/* Stats */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>Stats — Dev contributions</div>
            {/* Mini bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40, marginBottom: 6 }}>
              {DEV_ACTIVITY_BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", background: h > 60 ? "#00FF88" : "#00E5FF", height: `${h}%` }} />
              ))}
            </div>
            {[
              ["Tasks completed", "34",  "#00FF88"],
              ["PRs merged",      "12",  "#00E5FF"],
              ["Songs submitted", "7",   "#FFD700"],
            ].map(([lbl, val, color]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 10 }}>
                <span style={{ color: "rgba(255,255,255,.5)" }}>{lbl}</span>
                <span style={{ color, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Suggestion form */}
          <div style={{ background: "rgba(8,14,38,.95)", border: "1px solid rgba(0,255,136,.3)", borderRadius: 6, padding: 10 }} id="suggestion">
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: "rgba(0,255,136,.8)", textTransform: "uppercase", marginBottom: 6 }}>Submit Suggestion</div>
            <textarea
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder="Enter your suggestion or observation..."
              style={{ width: "100%", height: 60, fontSize: 10, background: "rgba(12,20,50,.9)", border: "1px solid rgba(0,255,136,.2)", color: "rgba(255,255,255,.8)", borderRadius: 4, padding: "6px 8px", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 5 }}
            />
            <select style={{ width: "100%", marginBottom: 5, fontSize: 10, background: "rgba(12,20,50,.9)", border: "1px solid rgba(0,255,136,.2)", color: "rgba(255,255,255,.7)", borderRadius: 4, padding: "4px 6px", outline: "none" }}>
              <option>Category: Platform</option>
              <option>Category: Revenue</option>
              <option>Category: Design</option>
              <option>Category: Bug report</option>
              <option>Category: New feature</option>
            </select>
            <button onClick={() => { setSubmittedSuggestion(true); setSuggestion(""); setTimeout(() => setSubmittedSuggestion(false), 3000); }} style={{ width: "100%", padding: "5px 0", fontSize: 10, fontWeight: 700, background: submittedSuggestion ? "rgba(0,255,136,.2)" : "rgba(0,180,255,.1)", border: `1px solid ${submittedSuggestion ? "#00FF88" : "rgba(0,180,255,.3)"}`, color: submittedSuggestion ? "#00FF88" : "#00E5FF", borderRadius: 4, cursor: "pointer" }}>
              {submittedSuggestion ? "✓ Submitted!" : "⬆ Submit suggestion"}
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
