import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports | TMI Admin" };

const REPORTS = [
  { id: "r1", title: "Weekly Revenue Summary",     type: "REVENUE",    date: "2026-04-21", status: "READY",   color: "#FFD700" },
  { id: "r2", title: "User Growth — April 2026",   type: "USERS",      date: "2026-04-20", status: "READY",   color: "#00FFFF" },
  { id: "r3", title: "Battle & Cypher Engagement", type: "ENGAGEMENT", date: "2026-04-19", status: "READY",   color: "#FF2DAA" },
  { id: "r4", title: "Content Performance Q1",     type: "CONTENT",    date: "2026-04-15", status: "READY",   color: "#00FF88" },
  { id: "r5", title: "Monthly Revenue May 2026",   type: "REVENUE",    date: "2026-05-01", status: "PENDING", color: "#AA2DFF" },
  { id: "r6", title: "Bot Activity Summary",       type: "BOTS",       date: "2026-04-22", status: "PENDING", color: "#FF9500" },
];

export default function AdminReportsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ADMIN
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Reports</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Platform-wide reports for revenue, users, engagement, content, and bots.</p>

        {/* Quick links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          {[
            { label: "Revenue", href: "/admin/revenue", color: "#FFD700" },
            { label: "Users", href: "/admin/users", color: "#00FFFF" },
            { label: "Moderation", href: "/admin/moderation", color: "#FF2DAA" },
            { label: "Live Monitor", href: "/admin/live", color: "#00FF88" },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{ padding: "7px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: link.color, border: `1px solid ${link.color}30`, borderRadius: 20, textDecoration: "none" }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Report list */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>ALL REPORTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REPORTS.map(report => (
            <div key={report.id} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${report.color}14`, borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: report.color, border: `1px solid ${report.color}40`, borderRadius: 4, padding: "3px 8px", flexShrink: 0 }}>
                {report.type}
              </span>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{report.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{report.date}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: report.status === "READY" ? "#00FF88" : "#FFD700", flexShrink: 0 }}>
                {report.status}
              </span>
              {report.status === "READY" && (
                <button style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                  DOWNLOAD
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
