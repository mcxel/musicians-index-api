import Link from "next/link";

export default function PropsPage() {
  const props = [
    { id: "mic-stand", label: "Mic Stand", price: 400, type: "stage" },
    { id: "guitar", label: "Electric Guitar", price: 1000, type: "instrument" },
    { id: "confetti", label: "Confetti Cannon", price: 600, type: "effect" },
    { id: "spotlight", label: "Spotlight FX", price: 800, type: "effect" },
  ];

  return (
    <main data-testid="props-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/shops" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Shop</Link>
      <h1 style={{ margin: "10px 0" }}>Props</h1>
      <div style={{ maxWidth: 700, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {props.map(({ id, label, price, type }) => (
          <div key={id} data-testid={`prop-${id}`} style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, padding: 16, background: "rgba(15,23,42,0.8)" }}>
            <h3 style={{ marginTop: 0, fontSize: 14 }}>{label}</h3>
            <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{type}</span>
            <div style={{ marginTop: 12 }}>
              <button data-testid={`buy-prop-${id}`} type="button" style={{ border: "1px solid rgba(165,243,252,0.3)", borderRadius: 6, background: "rgba(165,243,252,0.08)", color: "#a5f3fc", fontSize: 11, padding: "5px 12px", cursor: "pointer" }}>{price} coins</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
