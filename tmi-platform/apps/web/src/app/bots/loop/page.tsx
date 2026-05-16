import Link from "next/link";

const BOT_STEPS = [
  "login",
  "read article",
  "earn points",
  "join room",
  "sit",
  "chat",
  "react",
  "leave",
  "rejoin",
  "report errors",
];

export default function BotLoopPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <Link href="/admin/bots" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Bot Monitor</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 10px" }}>Bot Loop Runtime</h1>
        <p style={{ color: "rgba(255,255,255,0.62)" }}>Operational bot behavior chain for Infinity Loop closure.</p>

        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
          {BOT_STEPS.map((step, idx) => (
            <div key={step} style={{ border: "1px solid rgba(0,255,255,0.22)", borderRadius: 10, padding: "10px 12px", background: "rgba(0,255,255,0.04)" }}>
              <div style={{ fontSize: 10, color: "#00FFFF", marginBottom: 4 }}>Step {idx + 1}</div>
              <div style={{ fontSize: 13, textTransform: "capitalize" }}>{step}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
