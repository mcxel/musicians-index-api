import Link from "next/link";

export default function ShopsPage() {
  const categories = [
    { id: "emotes", label: "Emotes", href: "/emotes", icon: "😄" },
    { id: "clothing", label: "Clothing", href: "/clothing", icon: "👕" },
    { id: "props", label: "Props", href: "/props", icon: "🎸" },
    { id: "backgrounds", label: "Backgrounds", href: "/avatar/shop", icon: "🌄" },
    { id: "badges", label: "Badges", href: "/avatar/shop", icon: "🏅" },
    { id: "skins", label: "Skins", href: "/avatar/customize", icon: "🎨" },
  ];

  return (
    <main data-testid="shops-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/home/5" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Back to Marketplace</Link>
      <h1 style={{ margin: "10px 0" }}>TMI Shop</h1>
      <div style={{ maxWidth: 800, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {categories.map(({ id, label, href, icon }) => (
          <Link key={id} data-testid={`shop-cat-${id}`} href={href} style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, background: "rgba(15,23,42,0.8)", padding: 20, textDecoration: "none", color: "#e2e8f0", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <Link data-testid="shop-to-giveaway" href="/giveaway" style={chip}>Sponsor Giveaway →</Link>
        <Link data-testid="shop-to-subscriptions" href="/subscriptions" style={chip}>Subscriptions →</Link>
      </div>
    </main>
  );
}

const chip: React.CSSProperties = { color: "#a5f3fc", textDecoration: "none", fontSize: 12, border: "1px solid rgba(165,243,252,0.3)", borderRadius: 8, padding: "8px 12px" };
