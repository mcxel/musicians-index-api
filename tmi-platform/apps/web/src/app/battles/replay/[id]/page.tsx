import Link from "next/link";
import { battleReplayVaultEngine } from "@/lib/competition/BattleReplayVaultEngine";

export default function BattleReplayPage({ params }: { params: { id: string } }) {
  const replay = battleReplayVaultEngine.getReplay(params.id);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px" }}>
      <Link href={`/battles/${params.id}`} style={{ fontSize: 10, color: "rgba(255,255,255,0.72)", textDecoration: "none" }}>
        {"<-"} Back to battle room
      </Link>
      <h1 style={{ margin: "10px 0 0", fontSize: "clamp(1.35rem, 4vw, 2.2rem)", color: "#00ffff" }}>
        Replay Vault
      </h1>
      {!replay ? (
        <section style={{ marginTop: 16, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: 14, background: "rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)" }}>
            Replay not found yet. Settle this battle first to mint a replay record.
          </div>
        </section>
      ) : (
        <section style={{ marginTop: 16, border: "1px solid rgba(0,255,255,0.24)", borderRadius: 10, padding: 14, background: "rgba(0,255,255,0.06)", display: "grid", gap: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "#00ffff", fontWeight: 800 }}>
            ARCHIVED BATTLE
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Replay ID: {replay.replayId}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Battle ID: {replay.battleId}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Winner: {replay.winnerId}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Loser: {replay.loserId}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Score split: {replay.winnerScore.toFixed(1)} - {replay.loserScore.toFixed(1)}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Total votes: {replay.totalVotes}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Chat messages: {replay.chatMessages}</div>
        </section>
      )}
    </main>
  );
}
