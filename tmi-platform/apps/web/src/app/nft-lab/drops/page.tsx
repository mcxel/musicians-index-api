import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NFT Drops | TMI Lab",
  description: "Limited NFT drops from TMI artists. Time-limited collectibles.",
};

const DROPS = [
  { id: "drop-001", title: "Crown Season 2 Badge", artist: "TMI Platform", price: "$12.00", edition: "500 of 500", status: "LIVE", endsIn: "2d 14h", color: "#FFD700", icon: "👑" },
  { id: "drop-002", title: "Wavetek Battle Proof #4", artist: "Wavetek", price: "$8.00", edition: "89 of 250", status: "LIVE", endsIn: "5h 20m", color: "#FF2DAA", icon: "⚔️" },
  { id: "drop-003", title: "Monday Cypher Champion", artist: "TMI Contest", price: "$25.00", edition: "1 of 1", status: "SOLD OUT", endsIn: "—", color: "rgba(255,255,255,0.3)", icon: "🏆" },
  { id: "drop-004", title: "Neon Vibe Fan Pack Vol.1", artist: "Neon Vibe", price: "$5.00", edition: "0 of 1000", status: "UPCOMING", endsIn: "Starts in 3d", color: "#AA2DFF", icon: "🎧" },
];

export default function NftDropsPage() {
  const live = DROPS.filter(d => d.status === "LIVE");
  const upcoming = DROPS.filter(d => d.status === "UPCOMING");
  const ended = DROPS.filter(d => d.status === "SOLD OUT");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>DIGITAL DROPS</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, marginBottom: 6 }}>NFT Drops</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Time-limited NFT releases from TMI artists and platform events. First come, first served.</p>

        {live.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88", display: "inline-block" }} />
              LIVE DROPS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {live.map(d => (
                <div key={d.id} style={{ background: "rgba(0,255,136,0.04)", border: `1px solid ${d.color}30`, borderRadius: 14, padding: "20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{d.icon}</div>
                  <div style={{ fontSize: 8, color: d.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>BY {d.artist.toUpperCase()}</div>
                  <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{d.title}</h2>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.edition}</div>
                    <div style={{ fontSize: 10, color: "#00FF88" }}>Ends {d.endsIn}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{d.price}</div>
                    <Link href="/subscriptions" style={{ padding: "8px 18px", fontSize: 9, fontWeight: 800, color: "#050510", background: "#00FF88", borderRadius: 7, textDecoration: "none" }}>MINT NOW</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>UPCOMING</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {upcoming.map(d => (
                <div key={d.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${d.color}20`, borderRadius: 14, padding: "20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{d.icon}</div>
                  <div style={{ fontSize: 8, color: d.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>BY {d.artist.toUpperCase()}</div>
                  <h2 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{d.title}</h2>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{d.endsIn}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ended.length > 0 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 14 }}>SOLD OUT</div>
            {ended.map(d => (
              <div key={d.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: 0.55 }}>
                <span style={{ fontSize: 24 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{d.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>By {d.artist}</div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>SOLD OUT</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/nft-lab/create" style={{ fontSize: 10, color: "#FF2DAA", textDecoration: "none", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, padding: "9px 16px" }}>Create NFT</Link>
          <Link href="/nft-lab/mint" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Direct Mint</Link>
        </div>
      </div>
    </main>
  );
}
