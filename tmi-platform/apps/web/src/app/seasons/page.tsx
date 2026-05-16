import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seasons | TMI",
  description: "TMI Season Pass — earn XP, unlock rewards, compete for championship prizes every season.",
};

const TIERS = [
  { key: "FREE",           label: "Free",           price: "Free",    color: "rgba(255,255,255,0.5)", rewards: ["Basic XP tracking", "Community leaderboard access"] },
  { key: "FAN_PASS",       label: "Fan Pass",        price: "$9.99",   color: "#00FFFF",              rewards: ["Crown Wave Emote at 500 XP", "$10 store credit at 1,500 XP", "Exclusive fan badge"] },
  { key: "PERFORMER_PASS", label: "Performer Pass",  price: "$14.99",  color: "#FF2DAA",              rewards: ["Everything in Fan", "Season NFT at 2,000 XP", "Performer showcase slot"] },
  { key: "VIP_PASS",       label: "VIP Pass",        price: "$29.99",  color: "#AA2DFF",              rewards: ["Everything in Performer", "Gold avatar skin at 1,000 XP", "Backstage access at 3,000 XP"] },
  { key: "LEGEND_PASS",    label: "Legend Pass",     price: "$49.99",  color: "#FFD700",              rewards: ["All rewards unlocked", "Legend badge at 5,000 XP", "$25 credit at 7,500 XP", "Top 10 eligibility"] },
];

const SEASONS = [
  {
    id: "season-2",
    label: "Season 2",
    status: "ACTIVE",
    period: "Apr – Jun 2026",
    prizePool: "$8,000",
    participants: 540,
    daysLeft: 52,
    color: "#00FFFF",
  },
  {
    id: "season-1",
    label: "Season 1",
    status: "ENDED",
    period: "Jan – Mar 2026",
    prizePool: "$5,000",
    participants: 312,
    daysLeft: 0,
    color: "rgba(255,255,255,0.3)",
  },
];

export default function SeasonsPage() {
  const active = SEASONS.find(s => s.status === "ACTIVE");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "64px 24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>TMI SEASON PASS</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Seasons</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Compete every season for XP, exclusive rewards, and championship prizes. Earn your pass and unlock more.
        </p>
        {active && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 20, padding: "8px 20px", marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88", display: "inline-block" }} />
            <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 800 }}>{active.label} — {active.daysLeft} days left · {active.prizePool} prize pool</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/subscriptions" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FFD700,#FF9500)", borderRadius: 10, textDecoration: "none" }}>
            GET SEASON PASS →
          </Link>
          <Link href="/leaderboard" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 10, textDecoration: "none" }}>
            LEADERBOARD
          </Link>
        </div>
      </section>

      {/* Season list */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "44px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 20 }}>SEASONS</div>
        <div style={{ display: "grid", gap: 12 }}>
          {SEASONS.map(season => (
            <Link key={season.id} href={`/seasons/${season.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: season.status === "ACTIVE" ? "rgba(0,255,255,0.04)" : "rgba(255,255,255,0.01)", border: `1px solid ${season.color}30`, borderRadius: 14, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: season.status === "ACTIVE" ? "#050510" : season.color, background: season.status === "ACTIVE" ? "#00FF88" : "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 999 }}>
                      {season.status}
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{season.period}</span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{season.label}</h2>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{season.participants.toLocaleString()} participants</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{season.prizePool}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>prize pool</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pass tiers */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "44px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 20 }}>PASS TIERS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {TIERS.map(tier => (
            <div key={tier.key} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${tier.color}30`, borderRadius: 12, padding: "18px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: tier.color, letterSpacing: "0.1em", marginBottom: 4 }}>{tier.label.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>{tier.price}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {tier.rewards.map(r => (
                  <li key={r} style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 5, display: "flex", gap: 6 }}>
                    <span style={{ color: tier.color }}>—</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/subscriptions" style={{ display: "inline-block", padding: "11px 28px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FFD700", borderRadius: 8, textDecoration: "none" }}>
            UPGRADE YOUR PASS →
          </Link>
        </div>
      </section>

      {/* Nav */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/prizes" style={{ fontSize: 10, color: "#00FF88", textDecoration: "none", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: "9px 16px" }}>Prizes</Link>
        <Link href="/leaderboard" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Leaderboard</Link>
        <Link href="/achievements" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Achievements</Link>
      </section>
    </main>
  );
}
