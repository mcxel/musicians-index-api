"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#94A3B8";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry { ts: string; level: LogLevel; source: string; msg: string; }

const LOGS: LogEntry[] = [
  { ts: "12:41:03", level: "INFO",  source: "API/auth",      msg: "POST /api/auth/session → 200 (32ms)"              },
  { ts: "12:40:55", level: "INFO",  source: "Stripe",        msg: "Webhook received: customer.subscription.created"  },
  { ts: "12:40:31", level: "WARN",  source: "Rate Limiter",  msg: "IP 45.33.32.156 hit limit on /api/auth/login"     },
  { ts: "12:39:47", level: "INFO",  source: "Bot/Welcome",   msg: "WelcomeBot greeted user #4821 in world-lobby"     },
  { ts: "12:38:22", level: "INFO",  source: "API/beats",     msg: "GET /api/beats?genre=hip-hop → 200 (18ms)"        },
  { ts: "12:37:59", level: "ERROR", source: "NFT Pipeline",  msg: "Mint failed: contract not deployed on chain 8453" },
  { ts: "12:36:14", level: "INFO",  source: "WebRTC",        msg: "Room world-dance-party: 12 users connected"       },
  { ts: "12:35:08", level: "WARN",  source: "Prisma",        msg: "Query took 890ms: SELECT * FROM Beat WHERE..."    },
  { ts: "12:34:41", level: "INFO",  source: "Magazine",      msg: "Article published: slug=big-kazhdog-exclusive"    },
  { ts: "12:33:19", level: "INFO",  source: "API/stripe",    msg: "Checkout session created: cs_live_..."             },
  { ts: "12:32:04", level: "DEBUG", source: "HUD",           msg: "GamificationHUD XP event: user+50 (article_read)" },
  { ts: "12:31:47", level: "INFO",  source: "Auth",          msg: "User #4820 registered: role=fan tier=free"        },
  { ts: "12:30:22", level: "ERROR", source: "Email",         msg: "Resend API: rate limit hit (100/day), queued"     },
  { ts: "12:29:09", level: "INFO",  source: "Bot/Sentinel",  msg: "Sentinel Home #1: homepage uptime OK (99.98%)"   },
  { ts: "12:28:55", level: "INFO",  source: "API/tips",      msg: "Tip processed: $20 fan→artist (Stripe)"          },
];

const LEVEL_COLOR: Record<LogLevel, string> = { INFO: "#94A3B8", WARN: "#FFD700", ERROR: "#EF4444", DEBUG: "#AA2DFF" };

export default function LogsDashboardPage() {
  const [filter, setFilter] = useState<"all" | LogLevel>("all");
  const [search, setSearch] = useState("");

  const visible = LOGS
    .filter(l => filter === "all" || l.level === filter)
    .filter(l => !search || l.msg.toLowerCase().includes(search.toLowerCase()) || l.source.toLowerCase().includes(search.toLowerCase()));

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
      <div style={{ background: "rgba(0,0,0,0.9)", borderBottom: "1px solid rgba(148,163,184,0.2)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>ADMIN — LOGS</div>
          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "'Inter', sans-serif" }}>📋 System Logs</div>
        </div>
        <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>← Admin</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "INFO", "WARN", "ERROR", "DEBUG"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer", border: "none", background: filter === f ? (LEVEL_COLOR[f as LogLevel] ?? "#fff") : "rgba(255,255,255,0.07)", color: filter === f ? "#000" : "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>
                {f}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>{visible.length} entries</span>
        </div>

        <div style={{ background: "#020208", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
          {visible.map((l, i) => {
            const lc = LEVEL_COLOR[l.level];
            return (
              <div key={i} style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "60px 50px 130px 1fr", gap: 12, alignItems: "center", background: l.level === "ERROR" ? "rgba(239,68,68,0.04)" : "transparent", fontSize: 11 }}>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>{l.ts}</span>
                <span style={{ color: lc, fontWeight: 800 }}>{l.level}</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{l.source}</span>
                <span style={{ color: l.level === "ERROR" ? "#EF4444" : l.level === "WARN" ? "#FFD700" : "#94A3B8" }}>{l.msg}</span>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>No logs match filter</div>
          )}
        </div>
      </div>
    </main>
  );
}
