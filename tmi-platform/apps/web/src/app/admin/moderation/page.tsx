import Link from "next/link";

const SEED_FLAGS = [
  { id: "f1", type: "Comment",  reporter: "fan_009",    target: "room:cypher-003",  reason: "Harassment",    severity: "High",   status: "Open" },
  { id: "f2", type: "Profile",  reporter: "fan_021",    target: "artist:fake_buzz", reason: "Impersonation", severity: "High",   status: "Open" },
  { id: "f3", type: "Chat",     reporter: "fan_033",    target: "room:trivia",      reason: "Spam",          severity: "Medium", status: "Reviewing" },
  { id: "f4", type: "Content",  reporter: "system",     target: "clip:cl_044",      reason: "Auto-flagged copyright", severity: "Medium", status: "Open" },
  { id: "f5", type: "Comment",  reporter: "fan_018",    target: "magazine:article-01", reason: "Misinformation", severity: "Low", status: "Resolved" },
  { id: "f6", type: "Profile",  reporter: "artist_vex", target: "fan:055",          reason: "Stolen art",    severity: "High",   status: "Reviewing" },
];

const SEV_COLORS: Record<string, string> = { High: "#FF4444", Medium: "#FFD700", Low: "rgba(255,255,255,0.4)" };
const STATUS_COLORS: Record<string, string> = { Open: "#FF4444", Reviewing: "#FFD700", Resolved: "#00FFAA" };

export default function AdminModerationPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
        <h1 className="text-3xl font-bold text-[#ff6b35]">Moderation Queue</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          {SEED_FLAGS.filter(f => f.status !== "Resolved").length} open · {SEED_FLAGS.filter(f => f.severity === "High" && f.status !== "Resolved").length} high severity
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {SEED_FLAGS.map((f) => (
          <div key={f.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${f.status !== "Resolved" ? "rgba(255,68,68,0.15)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
                <span style={{ color: SEV_COLORS[f.severity] }}>[{f.severity}]</span> {f.type} — {f.reason}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Target: {f.target} · Reported by: {f.reporter}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[f.status] ?? "#fff", padding: "3px 10px", border: `1px solid ${STATUS_COLORS[f.status] ?? "rgba(255,255,255,0.1)"}`, borderRadius: 20 }}>{f.status}</span>
              {f.status !== "Resolved" && (
                <button style={{ fontSize: 11, fontWeight: 700, color: "#00FFAA", background: "rgba(0,255,170,0.1)", border: "1px solid rgba(0,255,170,0.2)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Resolve</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/admin/security" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Security →</Link>
      </div>
    </main>
  );
}
