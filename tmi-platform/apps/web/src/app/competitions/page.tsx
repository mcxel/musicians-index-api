import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Competitions · The Musician's Index" };

const COMPS = [
  { id: "cypher-spring-26", title: "Cypher Spring Classic 2026", status: "open", prizePool: "$2,500", entries: 48, deadline: "Jun 15, 2026", genre: "Hip-Hop" },
  { id: "beatlab-showdown", title: "Beatlab Showdown Vol.3", status: "open", prizePool: "$1,000", entries: 33, deadline: "Jun 30, 2026", genre: "Production" },
  { id: "r-and-b-royale", title: "R&B Royale", status: "judging", prizePool: "$750", entries: 22, deadline: "May 31, 2026", genre: "R&B" },
  { id: "drill-circuit-2", title: "Drill Circuit #2", status: "ended", prizePool: "$500", entries: 64, deadline: "Apr 30, 2026", genre: "Drill" },
];

const STATUS_COLORS: Record<string, string> = { open: "#22c55e", judging: "#FFD700", ended: "rgba(255,255,255,0.25)" };

export default function CompetitionsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>TMI</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,42px)", fontWeight: 900, margin: "0 0 8px" }}>Competitions</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>Enter battles, earn prizes, and prove your place on the Musician&apos;s Index.</p>
        <div style={{ display: "grid", gap: 14 }}>
          {COMPS.map((c) => (
            <Link key={c.id} href={`/competitions/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px 26px", display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", color: STATUS_COLORS[c.status], textTransform: "uppercase" }}>{c.status}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{c.genre}</span>
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>{c.title}</h2>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.entries} entries · Deadline: {c.deadline}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#FFD700" }}>{c.prizePool}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>prize pool</div>
                  {c.status === "open" && <div style={{ marginTop: 8, padding: "6px 14px", background: "#FFD700", color: "#05060c", borderRadius: 7, fontSize: 11, fontWeight: 800 }}>Enter Now</div>}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 16 }}>
          <Link href="/battles" style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, textDecoration: "none" }}>Casual Battles →</Link>
          <Link href="/leaderboards" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Leaderboards</Link>
        </div>
      </div>
    </main>
  );
}
