import Link from "next/link";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";
import { battlePredictionEngine } from "@/lib/competition/BattlePredictionEngine";
import { battleQueueEngine } from "@/lib/competition/BattleQueueEngine";
import { battleReplayVaultEngine } from "@/lib/competition/BattleReplayVaultEngine";

export default function BattleWallPage() {
  const cards = battleBillboardLobbyWallEngine.getCards();
  const predictionLeaders = battlePredictionEngine.getPredictionLeaderboard(6);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px" }}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#ffd700" }}>Battle Wall</h1>
      <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 700 }}>
        Wall feed for challenge request states: pending challenge, accepted, declined, expired, live, completed.
      </p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {cards.length === 0 ? (
          <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 12, background: "rgba(255,255,255,0.03)" }}>
            No challenge requests yet.
          </div>
        ) : (
          cards.map((card) => {
            const artifacts = battleBillboardLobbyWallEngine.getArtifacts(card.battleId);
            const queueCount = battleQueueEngine.getQueue(card.battleId).length;
            const replay = battleReplayVaultEngine.getReplay(card.battleId);
            return (
              <div key={card.battleId} style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: 12, background: "rgba(255,255,255,0.04)" }}>
                <div style={{ fontWeight: 700 }}>{card.challengerName} vs {card.targetName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>Status: {card.status.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Queue riders: {queueCount}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                  <Link href={card.route} style={{ color: "#00ffff", textDecoration: "none" }}>Live Room</Link>
                  {artifacts?.voteSurface?.route && <Link href={artifacts.voteSurface.route} style={{ color: "#ff2daa", textDecoration: "none" }}>Vote</Link>}
                  <Link href="/leaderboard" style={{ color: "#ffd700", textDecoration: "none" }}>Leaderboard</Link>
                  {(artifacts?.replayAsset?.route || replay?.replayRoute) && (
                    <Link href={replay?.replayRoute ?? artifacts!.replayAsset.route} style={{ color: "#00ff88", textDecoration: "none" }}>
                      Replay
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <section style={{ marginTop: 24, border: "1px solid rgba(0,255,255,0.22)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.05)" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#00ffff", fontWeight: 800, marginBottom: 8 }}>
          Prediction Leaderboard
        </div>
        {predictionLeaders.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>No settled predictions yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {predictionLeaders.map((row) => (
              <div key={row.userId} style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
                {row.userId}: +{row.pointsWon} pts, streak {row.currentStreak}, wins {row.wins}/{row.totalPredictions}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
