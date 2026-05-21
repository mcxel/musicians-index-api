import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Fan Club Dashboard · The Musician's Index" };

const STATS = [
  { label: "Total Members", value: "2,841", sub: "+48 this week" },
  { label: "Monthly Revenue", value: "$6,210", sub: "after platform fee" },
  { label: "Posts This Month", value: "12", sub: "3 pending draft" },
  { label: "Churn Rate", value: "2.1%", sub: "industry avg 5%" },
];

const MEMBERS = [
  { name: "XR99", tier: "Inner Circle", since: "Jan 2026" },
  { name: "K1 Flair", tier: "Ride or Die", since: "Feb 2026" },
  { name: "SunStreak", tier: "Supporter", since: "Mar 2026" },
];

export default function FanClubDashboardPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/performer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Performer Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>ARTIST DASHBOARD</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>Fan Club</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 32 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.12)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#22c55e", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 12 }}>RECENT MEMBERS</div>
        <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
          {MEMBERS.map((m) => (
            <div key={m.name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
              <span style={{ fontSize: 11, color: "#FF2DAA" }}>{m.tier}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{m.since}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={{ padding: "11px 22px", borderRadius: 8, background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", border: "none" }}>+ New Post</button>
          <Link href="/messages" style={{ padding: "11px 22px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Message All</Link>
        </div>
      </div>
    </main>
  );
}
