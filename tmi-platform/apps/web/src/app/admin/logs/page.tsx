import Link from "next/link";

const SEED_LOGS = [
  { ts: "2026-05-20 14:32:11", level: "INFO",  actor: "system",           action: "Cron job: bot activity tick — 62 bots active" },
  { ts: "2026-05-20 14:28:04", level: "INFO",  actor: "user:fan_042",     action: "Registered — role: fan" },
  { ts: "2026-05-20 14:25:55", level: "INFO",  actor: "user:artist_bxrn", action: "Tip received — $10 from fan_042" },
  { ts: "2026-05-20 14:20:31", level: "WARN",  actor: "stripe",           action: "Webhook retry — event evt_3Ps9… (attempt 2/3)" },
  { ts: "2026-05-20 14:15:02", level: "INFO",  actor: "user:sponsor_001", action: "Campaign created — Spring Promo 2026" },
  { ts: "2026-05-20 14:10:48", level: "INFO",  actor: "system",           action: "Invite code used — VIP-BXRN-2026 by fan_043" },
  { ts: "2026-05-20 14:05:13", level: "ERROR", actor: "api:register",     action: "Standalone fallback triggered — API_BASE_URL unreachable" },
  { ts: "2026-05-20 13:58:27", level: "INFO",  actor: "user:admin",       action: "Feature flag toggled — magazine_v2: ON" },
  { ts: "2026-05-20 13:45:00", level: "INFO",  actor: "system",           action: "Magazine Issue 2 articles scheduled — 5 articles" },
  { ts: "2026-05-20 13:30:15", level: "INFO",  actor: "user:venue_001",   action: "Show listed — Cypher Night @ Club 88, Jun 6" },
];

const LEVEL_COLORS: Record<string, string> = {
  INFO: "#00FFAA",
  WARN: "#FFD700",
  ERROR: "#FF4444",
};

export default function AdminLogsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
        <h1 className="text-3xl font-bold text-[#ff6b35]">Activity Logs</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Last 10 events · auto-refreshes every 30s in production</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "INFO", "WARN", "ERROR"].map((l) => (
          <span key={l} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: l === "All" ? "#fff" : LEVEL_COLORS[l] ?? "rgba(255,255,255,0.4)", cursor: "pointer" }}>{l}</span>
        ))}
      </div>

      <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, fontFamily: "monospace", overflow: "hidden" }}>
        {SEED_LOGS.map((log, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: i < SEED_LOGS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "flex-start", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", minWidth: 140 }}>{log.ts}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: LEVEL_COLORS[log.level] ?? "#fff", minWidth: 42 }}>{log.level}</span>
            <span style={{ fontSize: 11, color: "#00FFFF", minWidth: 140 }}>{log.actor}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", flex: 1 }}>{log.action}</span>
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
