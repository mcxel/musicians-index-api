import Link from "next/link";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";
import { battlePredictionEngine } from "@/lib/competition/BattlePredictionEngine";
import { battleQueueEngine } from "@/lib/competition/BattleQueueEngine";
import { battleReplayVaultEngine } from "@/lib/competition/BattleReplayVaultEngine";
import LiveQualityBadge from "@/components/video/LiveQualityBadge";

export default function BattleBillboardLivePage() {
  const cards = battleBillboardLobbyWallEngine.getCards();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#ff2daa" }}>Battle Billboard Live</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
        Accepted and live challenge battles routed to billboard cards.
      </p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {cards.length === 0 ? (
          <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 12, background: "rgba(255,255,255,0.03)" }}>
            No billboard cards yet.
          </div>
        ) : (
          cards.map((card) => {
            const predictionCount = battlePredictionEngine.getPredictionsForBattle(card.battleId).length;
            const queueCount = battleQueueEngine.getQueue(card.battleId).length;
            const replay = battleReplayVaultEngine.getReplay(card.battleId);
            return (
              <div key={card.battleId} style={{ border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: 12, background: "rgba(255,45,170,0.08)", display: "grid", gap: 6 }}>
                <Link href={card.route} style={{ textDecoration: "none", color: "#fff", fontWeight: 700 }}>
                  {card.challengerName} vs {card.targetName} - {card.status.toUpperCase()}
                </Link>
                <LiveQualityBadge streamId={`billboard-${card.battleId}`} context="billboard" compact />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>Predictions: {predictionCount} · Queue: {queueCount}</div>
                {replay?.replayRoute && (
                  <Link href={replay.replayRoute} style={{ fontSize: 12, color: "#00ff88", textDecoration: "none" }}>
                    Open replay vault clip
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
