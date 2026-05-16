import Link from "next/link";

export default function EmotesPage() {
  const emotes = [
    { id: "fire", label: "Fire", emoji: "🔥", price: 200, rarity: "common" },
    { id: "crown", label: "Crown", emoji: "👑", price: 500, rarity: "rare" },
    { id: "wave", label: "Wave", emoji: "🌊", price: 300, rarity: "uncommon" },
    { id: "mic", label: "Mic Drop", emoji: "🎤", price: 400, rarity: "uncommon" },
    { id: "star", label: "Star", emoji: "⭐", price: 600, rarity: "rare" },
    { id: "zap", label: "Zap", emoji: "⚡", price: 250, rarity: "common" },
  ];

  const rarityColor: Record<string, string> = { common: "#94a3b8", uncommon: "#86efac", rare: "#a5f3fc", legendary: "#ff6b35" };

  return (
    <main data-testid="emotes-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/shops" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Shop</Link>
      <h1 style={{ margin: "10px 0" }}>Emotes</h1>
      <div style={{ maxWidth: 700, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {emotes.map(({ id, label, emoji, price, rarity }) => (
          <div key={id} data-testid={`emote-${id}`} style={{ border: `1px solid ${rarityColor[rarity]}44`, borderRadius: 12, padding: 16, background: "rgba(15,23,42,0.8)", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 36 }}>{emoji}</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
            <span style={{ fontSize: 10, color: rarityColor[rarity], textTransform: "uppercase", letterSpacing: "0.1em" }}>{rarity}</span>
            <button data-testid={`buy-emote-${id}`} type="button" style={{ border: "1px solid rgba(165,243,252,0.3)", borderRadius: 6, background: "rgba(165,243,252,0.08)", color: "#a5f3fc", fontSize: 11, padding: "5px 12px", cursor: "pointer" }}>{price} coins</button>
          </div>
        ))}
      </div>
    </main>
  );
}
