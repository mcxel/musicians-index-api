import Link from "next/link";

const SEED_SHOWS = [
  { id: "sh-1", title: "TMI Season 2 Launch", date: "Jun 1, 2026", venue: "Cypher Arena", tier: "Title Sponsor", reach: "200K+", route: "/shows/tmi-season-2" },
  { id: "sh-2", title: "Monthly Battle Finals", date: "May 28, 2026", venue: "The Stage", tier: "Gold Sponsor", reach: "45K", route: "/shows/battle-finals-may" },
  { id: "sh-3", title: "Beat Lab Live Vol. 3", date: "May 30, 2026", venue: "BeatLab Studio", tier: "Silver Sponsor", reach: "22K", route: "/shows/beat-lab-3" },
];

const TIER_COLOR: Record<string, string> = { "Title Sponsor": "#00FFFF", "Gold Sponsor": "#FFD700", "Silver Sponsor": "#C0C0C0" };

export default function SponsorShowsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/hub/sponsor" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Sponsor Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>SPONSORED SHOWS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Show Sponsorships</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>Every TMI event where your brand is featured — live reach, tier, and analytics.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {SEED_SHOWS.map((show) => (
            <div key={show.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: TIER_COLOR[show.tier] ?? "#FFD700", textTransform: "uppercase", background: `${TIER_COLOR[show.tier] ?? "#FFD700"}18`, padding: "3px 8px", borderRadius: 4 }}>{show.tier}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{show.date} · {show.venue}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{show.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Projected reach: {show.reach}</div>
              </div>
              <Link href={show.route} style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", color: "#FFD700", fontWeight: 700, fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>View Show →</Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/shows" style={{ padding: "11px 22px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Browse All Shows →</Link>
          <Link href="/sponsor/analytics" style={{ padding: "11px 22px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>Sponsorship Analytics</Link>
        </div>
      </div>
    </main>
  );
}