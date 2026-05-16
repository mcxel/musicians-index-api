import Link from "next/link";

export default function GiveawayPage() {
  return (
    <main data-testid="giveaway-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/home/5" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Back to Marketplace</Link>
      <h1 style={{ margin: "10px 0" }}>Sponsor Giveaway Pipeline</h1>
      <div style={{ maxWidth: 640, display: "grid", gap: 10 }}>
        {/* Active giveaway */}
        <div style={{ border: "1px solid rgba(255,107,53,0.4)", borderRadius: 14, padding: 20, background: "rgba(255,107,53,0.06)" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 8 }}>Active Now · Sponsor: Prime Wave</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Season Pass + $500 Cash</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px" }}>Enter for a chance to win a full TMI Season Pass and a $500 sponsor gift card.</p>
          <button data-testid="enter-giveaway" type="button" style={{ border: "none", borderRadius: 10, background: "#ff6b35", color: "#fff", padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Enter Now</button>
        </div>

        {/* Chain links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Link data-testid="giveaway-to-sponsor" href="/sponsors/prime-wave" style={chainLink}>Sponsor Hub →</Link>
          <Link data-testid="giveaway-to-prizes" href="/prizes" style={chainLink}>Prizes →</Link>
          <Link data-testid="giveaway-to-rewards" href="/rewards" style={chainLink}>Rewards →</Link>
          <Link data-testid="giveaway-to-achievements" href="/achievements" style={chainLink}>Achievements →</Link>
        </div>
      </div>
    </main>
  );
}

const chainLink: React.CSSProperties = {
  border: "1px solid rgba(45,212,191,0.3)",
  borderRadius: 10,
  background: "rgba(13,148,136,0.12)",
  color: "#ccfbf1",
  textDecoration: "none",
  padding: "12px 14px",
  fontSize: 13,
  display: "block",
};
