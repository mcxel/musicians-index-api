import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin: Beats | TMI" };

const BEATS = [
  { id: "b1", title: "Midnight Bars", producer: "Wavetek", genre: "Hip-Hop", status: "LIVE", sales: 5, revenue: 245, flags: 0 },
  { id: "b2", title: "Battle Code", producer: "Verse Knight", genre: "Battle Rap", status: "LIVE", sales: 7, revenue: 343, flags: 0 },
  { id: "b3", title: "Frequency", producer: "Cold Spark", genre: "Instrumental", status: "REVIEW", sales: 0, revenue: 0, flags: 0 },
  { id: "b4", title: "Stolen Vibe", producer: "Unknown_88", genre: "R&B", status: "FLAGGED", sales: 0, revenue: 0, flags: 2 },
];
const STATUS_COLOR: Record<string, string> = { LIVE: "#00FF88", REVIEW: "#FFD700", FLAGGED: "#FF2DAA", REMOVED: "#AA2DFF" };

export default function AdminBeatsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
            <h1 style={{ fontSize: 24, fontWeight: 900 }}>Beat Management</h1>
          </div>
          <Link href="/beats/submit" style={{ padding: "9px 18px", fontSize: 9, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none" }}>+ SUBMIT BEAT</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "TOTAL BEATS", v: BEATS.length, c: "#FFD700" }, { l: "LIVE", v: BEATS.filter(b => b.status === "LIVE").length, c: "#00FF88" }, { l: "IN REVIEW", v: BEATS.filter(b => b.status === "REVIEW").length, c: "#FFD700" }, { l: "FLAGGED", v: BEATS.filter(b => b.status === "FLAGGED").length, c: "#FF2DAA" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{["TITLE", "PRODUCER", "GENRE", "STATUS", "SALES", "REVENUE", "FLAGS", "ACTIONS"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>)}</tr></thead>
          <tbody>
            {BEATS.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{b.title}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{b.producer}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)" }}>{b.genre}</td>
                <td style={{ padding: "14px 12px" }}><span style={{ fontSize: 8, fontWeight: 800, color: STATUS_COLOR[b.status] ?? "#fff", border: `1px solid ${STATUS_COLOR[b.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{b.status}</span></td>
                <td style={{ padding: "14px 12px" }}>{b.sales}</td>
                <td style={{ padding: "14px 12px", color: "#00FF88" }}>${b.revenue}</td>
                <td style={{ padding: "14px 12px", color: b.flags > 0 ? "#FF2DAA" : "rgba(255,255,255,0.3)" }}>{b.flags}</td>
                <td style={{ padding: "14px 12px" }}><div style={{ display: "flex", gap: 6 }}>{["APPROVE", "REMOVE"].map(a => <button key={a} style={{ padding: "4px 10px", fontSize: 8, fontWeight: 800, color: a === "APPROVE" ? "#00FF88" : "#FF2DAA", border: `1px solid ${a === "APPROVE" ? "rgba(0,255,136,0.3)" : "rgba(255,45,170,0.3)"}`, borderRadius: 4, background: "transparent", cursor: "pointer" }}>{a}</button>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
