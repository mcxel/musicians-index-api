import Link from "next/link";

export default function BattleChallengeTargetPage({ params }: { params: { targetId: string } }) {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#00ff88" }}>Direct Challenge</h1>
      <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: 700 }}>
        Target profile: {params.targetId}. Gold+ users can pick an opponent directly and open a paid 15-point challenge request.
      </p>
      <div style={{ border: "1px solid rgba(0,255,136,0.3)", borderRadius: 10, background: "rgba(0,255,136,0.08)", padding: 12 }}>
        Direct challenge flow is managed from Home 5 challenge controls and publishes to live billboard + battle wall on acceptance.
      </div>
      <Link href="/home/5" style={{ width: "fit-content", textDecoration: "none", color: "#00ffff", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 6, padding: "8px 12px" }}>
        Back to Home 5
      </Link>
    </main>
  );
}
