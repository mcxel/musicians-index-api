import Link from "next/link";

export default function ClothingPage() {
  const items = [
    { id: "hoodie-tmi", label: "TMI Hoodie", price: 1200, rarity: "uncommon" },
    { id: "snapback", label: "TMI Snapback", price: 800, rarity: "common" },
    { id: "jacket-crown", label: "Crown Jacket", price: 2400, rarity: "rare" },
    { id: "tee-afrobeats", label: "Afrobeats Tee", price: 600, rarity: "common" },
  ];

  return (
    <main data-testid="clothing-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/shops" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Shop</Link>
      <h1 style={{ margin: "10px 0" }}>Clothing</h1>
      <div style={{ maxWidth: 700, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map(({ id, label, price, rarity }) => (
          <div key={id} data-testid={`clothing-${id}`} style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, padding: 16, background: "rgba(15,23,42,0.8)" }}>
            <h3 style={{ marginTop: 0, fontSize: 14, color: "#e2e8f0" }}>{label}</h3>
            <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>{rarity}</span>
            <div style={{ marginTop: 12 }}>
              <button data-testid={`buy-clothing-${id}`} type="button" style={{ border: "1px solid rgba(165,243,252,0.3)", borderRadius: 6, background: "rgba(165,243,252,0.08)", color: "#a5f3fc", fontSize: 11, padding: "5px 12px", cursor: "pointer" }}>{price} coins</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
