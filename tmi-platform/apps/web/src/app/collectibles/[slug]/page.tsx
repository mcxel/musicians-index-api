import Link from "next/link";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const RARITY_COLORS: Record<string, string> = {
  Legendary: "#f59e0b",
  Epic:      "#AA2DFF",
  Rare:      "#a78bfa",
  Common:    "#00FFFF",
};

function getRarity(slug: string): string {
  const h = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rarities = ["Legendary", "Epic", "Rare", "Common"];
  return rarities[h % rarities.length]!;
}

export default function CollectiblePage({ params }: Props) {
  const name = titleCase(params.slug);
  const rarity = getRarity(params.slug);
  const color = RARITY_COLORS[rarity] ?? "#00FFFF";

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <Link href="/collectibles" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← All Collectibles</Link>
        <div style={{ marginTop: 20, background: `${color}0a`, border: `1px solid ${color}33`, borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎴</div>
          <div style={{
            fontSize: 9, letterSpacing: 3, color, fontWeight: 800, marginBottom: 8,
            textTransform: "uppercase",
          }}>
            {rarity} Collectible
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>{name}</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px" }}>
            Exclusive TMI digital collectible. Trade, display, or stake for rewards.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/nft-lab" style={{
              padding: "11px 24px", borderRadius: 8, background: color, color: "#05060c",
              fontWeight: 800, fontSize: 12, textDecoration: "none",
            }}>
              View in NFT Lab
            </Link>
            <Link href="/collectibles" style={{
              padding: "11px 24px", borderRadius: 8, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)",
              fontWeight: 700, fontSize: 12, textDecoration: "none",
            }}>
              Browse All
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
