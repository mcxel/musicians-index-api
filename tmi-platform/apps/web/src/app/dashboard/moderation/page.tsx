"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#EF4444";

const STATS = [
  { label: "Open Reports",     value: "4",    color: "#EF4444" },
  { label: "Resolved Today",   value: "11",   color: "#34D399" },
  { label: "Auto-Flagged",     value: "2",    color: "#FFD700" },
  { label: "Banned (30d)",     value: "3",    color: "#FF2DAA" },
];

type Severity = "high" | "medium" | "low";
interface Report { id: string; type: string; content: string; reporter: string; target: string; time: string; severity: Severity; status: "open" | "resolved"; }

const REPORTS: Report[] = [
  { id: "r1", type: "SPAM",      content: "Repeated promo links in live chat",      reporter: "SkyFan94",    target: "@promobot42",  time: "1h ago",  severity: "high",   status: "open"     },
  { id: "r2", type: "ABUSE",     content: "Offensive language in battle chat",      reporter: "MusicLvr22",  target: "@angrydude",   time: "2h ago",  severity: "medium", status: "open"     },
  { id: "r3", type: "CONTENT",   content: "Copyright claim on uploaded beat",       reporter: "BeatHead33",  target: "@wavetek",     time: "4h ago",  severity: "low",    status: "open"     },
  { id: "r4", type: "IMPERSONATION", content: "Profile claiming to be real artist", reporter: "Admin Bot",  target: "@fakedrakee",  time: "6h ago",  severity: "high",   status: "open"     },
  { id: "r5", type: "SPAM",      content: "Mass DM campaign from new account",      reporter: "System",      target: "@spammer99",   time: "1d ago",  severity: "medium", status: "resolved"  },
  { id: "r6", type: "ABUSE",     content: "Harassment in messages",                 reporter: "FreqFan",     target: "@harasser1",   time: "1d ago",  severity: "high",   status: "resolved"  },
];

const SEV_COLOR: Record<Severity, string> = { high: "#EF4444", medium: "#FFD700", low: "#34D399" };

export default function ModerationDashboardPage() {
  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function resolve(id: string) {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
    showToast("Report resolved ✓");
  }

  function banUser(target: string) {
    setReports(prev => prev.map(r => r.target === target ? { ...r, status: "resolved" } : r));
    showToast(`${target} banned from platform`);
  }

  const visible = filter === "all" ? reports : reports.filter(r => r.status === filter);
  const openCount = reports.filter(r => r.status === "open").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(239,68,68,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — MODERATION</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🛡️ Moderation Queue {openCount > 0 && <span style={{ fontSize: 11, background: ACCENT, color: "#fff", borderRadius: 10, padding: "1px 7px", marginLeft: 6 }}>{openCount}</span>}</div>
        </div>
        <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {toast && <div style={{ marginBottom: 14, padding: "10px 16px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 8, fontSize: 12, color: "#34D399" }}>{toast}</div>}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["all", "open", "resolved"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", border: "none", background: filter === f ? ACCENT : "rgba(255,255,255,0.07)", color: filter === f ? "#fff" : "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              {f} {f === "open" ? `(${openCount})` : ""}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map(r => {
            const sc = SEV_COLOR[r.severity];
            return (
              <div key={r.id} style={{ background: r.status === "open" ? "rgba(239,68,68,0.03)" : "rgba(255,255,255,0.01)", border: `1px solid ${r.status === "open" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 6, background: `${sc}15`, color: sc, letterSpacing: "0.08em" }}>{r.severity.toUpperCase()}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#888", letterSpacing: "0.08em" }}>{r.type}</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{r.time}</span>
                      {r.status === "resolved" && <span style={{ fontSize: 9, color: "#34D399", fontWeight: 700 }}>✓ RESOLVED</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.content}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      Reported by <strong style={{ color: "rgba(255,255,255,0.7)" }}>{r.reporter}</strong> · Target: <strong style={{ color: "#FF2DAA" }}>{r.target}</strong>
                    </div>
                  </div>
                  {r.status === "open" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => resolve(r.id)} style={{ padding: "7px 14px", fontSize: 10, fontWeight: 800, background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", borderRadius: 7, cursor: "pointer" }}>RESOLVE</button>
                      <button onClick={() => banUser(r.target)} style={{ padding: "7px 14px", fontSize: 10, fontWeight: 800, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: ACCENT, borderRadius: 7, cursor: "pointer" }}>BAN</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No {filter} reports</div>
          )}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Link href="/admin/users" style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: ACCENT, fontWeight: 800, fontSize: 11, textDecoration: "none" }}>User Management</Link>
          <Link href="/admin/bots" style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 11, textDecoration: "none" }}>Bot Controls</Link>
        </div>
      </div>
    </main>
  );
}
