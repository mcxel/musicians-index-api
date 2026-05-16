import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chain Command | TMI Admin" };

const COMMANDS = [
  { id: "cmd-1", name: "Activate Season 1 Finale",     status: "QUEUED",  scheduled: "2026-05-01 08:00", category: "EVENT",    color: "#FFD700" },
  { id: "cmd-2", name: "Rotate Homepage Featured Slot", status: "ACTIVE",  scheduled: "Daily 00:00",       category: "CONTENT",  color: "#00FFFF" },
  { id: "cmd-3", name: "Purge Expired Sessions",        status: "ACTIVE",  scheduled: "Hourly",            category: "SYSTEM",   color: "#00FF88" },
  { id: "cmd-4", name: "Issue Weekly Payout Batch",     status: "QUEUED",  scheduled: "2026-04-25 09:00", category: "BILLING",  color: "#FF2DAA" },
  { id: "cmd-5", name: "Archive Issue 1 Articles",      status: "PAUSED",  scheduled: "Manual",            category: "CONTENT",  color: "#AA2DFF" },
  { id: "cmd-6", name: "Reset Bot Activity Counters",   status: "ACTIVE",  scheduled: "Daily 03:00",       category: "BOTS",     color: "#FF9500" },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#00FF88", QUEUED: "#FFD700", PAUSED: "rgba(255,255,255,0.3)",
};

export default function AdminChainCommandPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Chain Command</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Scheduled automation commands — events, content rotation, billing, bots, and system jobs.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Active Jobs",  value: String(COMMANDS.filter(c => c.status === "ACTIVE").length),  color: "#00FF88" },
            { label: "Queued",       value: String(COMMANDS.filter(c => c.status === "QUEUED").length),  color: "#FFD700" },
            { label: "Paused",       value: String(COMMANDS.filter(c => c.status === "PAUSED").length),  color: "#AA2DFF" },
            { label: "Total Jobs",   value: String(COMMANDS.length),                                     color: "#00FFFF" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${stat.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 16 }}>ALL COMMANDS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {COMMANDS.map(cmd => (
            <div key={cmd.id} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${cmd.color}14`, borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: cmd.color, border: `1px solid ${cmd.color}40`, borderRadius: 4, padding: "3px 8px", flexShrink: 0 }}>
                {cmd.category}
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{cmd.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{cmd.scheduled}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: STATUS_COLOR[cmd.status] ?? "#fff", flexShrink: 0 }}>
                {cmd.status}
              </span>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.3)", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>
                  {cmd.status === "PAUSED" ? "RESUME" : "PAUSE"}
                </button>
                <button style={{ fontSize: 8, fontWeight: 700, color: "#00FF88", background: "none", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}>
                  RUN NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
