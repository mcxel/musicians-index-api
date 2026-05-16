import Link from "next/link";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";

export default function BattlesLivePage() {
  const liveCards = battleBillboardLobbyWallEngine.getCards().filter((card) => card.status === "live");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#00ffff" }}>Live Battles</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
        Active 18-minute battle lifecycle rooms published from accepted challenge requests.
      </p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {liveCards.length === 0 ? (
          <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 12, background: "rgba(255,255,255,0.03)" }}>
            No live challenge battles yet.
          </div>
        ) : (
          liveCards.map((card) => (
            <Link key={card.battleId} href={card.route} style={{ textDecoration: "none", color: "#fff", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: 12, background: "rgba(0,255,255,0.08)" }}>
              {card.challengerName} vs {card.targetName} - {card.formatLabel}
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
