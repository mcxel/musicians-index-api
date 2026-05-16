import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSongBattle, type SongBattle } from "@/lib/competition/SongBattleEngine";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const battle = getSongBattle(id);
  if (!battle) return { title: "Battle Not Found | TMI" };
  return {
    title: `${battle.title} | Song Arena`,
    description: `Song-for-Song: ${battle.artistA.name} vs ${battle.artistB.name}. Best of ${battle.bestOf}.`,
  };
}

function RoundRow({ battle, roundIndex }: { battle: SongBattle; roundIndex: number }) {
  const round = battle.rounds[roundIndex];
  if (!round) return null;
  const total = round.votes.fire + round.votes.smooth + round.votes.miss;
  const topVote = total === 0 ? null
    : round.votes.fire >= round.votes.smooth && round.votes.fire >= round.votes.miss ? "fire"
    : round.votes.smooth >= round.votes.miss ? "smooth" : "miss";

  const voteColor = topVote === "fire" ? "#FF2DAA" : topVote === "smooth" ? "#00FFFF" : "#FFD700";
  const winnerColor = round.winner === "a" ? "#00FFFF" : "#AA2DFF";
  const winnerName = round.winner === "a" ? battle.artistA.name : round.winner === "b" ? battle.artistB.name : null;

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>ROUND {round.roundNumber}</div>
        {winnerName && (
          <div style={{ fontSize: 8, fontWeight: 800, color: winnerColor, border: `1px solid ${winnerColor}40`, borderRadius: 4, padding: "2px 8px" }}>
            {winnerName} wins
          </div>
        )}
        {!round.winner && roundIndex === battle.currentRound - 1 && (
          <div style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 4, padding: "2px 8px" }}>NOW PLAYING</div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
        <div style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>{battle.artistA.name.toUpperCase()}</div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>{round.songA.title}</div>
          {round.songA.bpm > 0 && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{round.songA.bpm} BPM</div>}
        </div>
        <div style={{ fontSize: 16 }}>⚔️</div>
        <div style={{ background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 8, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>{battle.artistB.name.toUpperCase()}</div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>{round.songB.title}</div>
          {round.songB.bpm > 0 && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{round.songB.bpm} BPM</div>}
        </div>
      </div>
      {total > 0 && (
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {(["fire", "smooth", "miss"] as const).map(v => {
            const count = round.votes[v];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const color = v === "fire" ? "#FF2DAA" : v === "smooth" ? "#00FFFF" : "#FFD700";
            return (
              <div key={v} style={{ flex: 1, background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color, fontWeight: 800 }}>{v.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color }}>{pct}%</div>
              </div>
            );
          })}
          {topVote && (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 4 }}>
              <div style={{ fontSize: 9, color: voteColor, fontWeight: 700 }}>TOP: {topVote.toUpperCase()}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function SongBattleDetailPage({ params }: Props) {
  const { id } = await params;
  const battle = getSongBattle(id);
  if (!battle) return notFound();

  const aWins = battle.rounds.filter(r => r.winner === "a").length;
  const bWins = battle.rounds.filter(r => r.winner === "b").length;
  const isLive = battle.status === "live" || battle.status === "intermission";
  const isEnded = battle.status === "completed";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(0,255,255,0.1)", background: "rgba(0,0,0,0.5)" }}>
        <Link href="/song-battle" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Song Arena</Link>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>SONG-FOR-SONG</span>
        </div>
        {isLive && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2DAA", boxShadow: "0 0 8px #FF2DAA", display: "inline-block" }} />
            <span style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 700 }}>{battle.crowdCount.toLocaleString()} watching</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* Title + status */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.2rem,3.5vw,1.8rem)", fontWeight: 900, marginBottom: 8 }}>{battle.title}</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: isLive ? "#050510" : isEnded ? "rgba(255,255,255,0.4)" : "#00FFFF", background: isLive ? "#00FF88" : isEnded ? "rgba(255,255,255,0.06)" : "rgba(0,255,255,0.12)", padding: "3px 10px", borderRadius: 999 }}>
              {isLive ? "LIVE" : isEnded ? "ENDED" : "UPCOMING"}
            </span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Best of {battle.bestOf}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Round {battle.currentRound} of {battle.rounds.length}</span>
          </div>
        </div>

        {/* Score board */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ padding: "24px 20px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", marginBottom: 2 }}>{battle.artistA.name}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>{battle.artistA.genre}</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#00FFFF" }}>{aWins}</div>
            {aWins > bWins && isEnded && <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, marginTop: 8 }}>WINNER 🏆</div>}
          </div>
          <div style={{ padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>VS</div>
          </div>
          <div style={{ padding: "24px 20px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#AA2DFF", marginBottom: 2 }}>{battle.artistB.name}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>{battle.artistB.genre}</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#AA2DFF" }}>{bWins}</div>
            {bWins > aWins && isEnded && <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, marginTop: 8 }}>WINNER 🏆</div>}
          </div>
        </div>

        {/* Live CTA */}
        {isLive && (
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <Link href="/song-battle/live" style={{ display: "inline-block", padding: "13px 40px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#AA2DFF)", borderRadius: 10, textDecoration: "none" }}>
              JOIN LIVE — VOTE NOW →
            </Link>
          </div>
        )}

        {/* Rounds */}
        {battle.rounds.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>ROUND HISTORY</div>
            {battle.rounds.map((_, i) => (
              <RoundRow key={i} battle={battle} roundIndex={i} />
            ))}
          </div>
        )}

        {battle.rounds.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            Rounds begin when the battle starts.
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/song-battle" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Song Arena</Link>
          <Link href="/leaderboard" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 8, padding: "9px 16px" }}>Leaderboard</Link>
          <Link href="/battles" style={{ fontSize: 10, color: "#FF2DAA", textDecoration: "none", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 8, padding: "9px 16px" }}>All Battles</Link>
        </div>
      </div>
    </main>
  );
}
