import type { Metadata } from "next";
import Link from "next/link";
import { listSongBattles } from "@/lib/competition/SongBattleEngine";

export const metadata: Metadata = {
  title: "Song-for-Song Arena | TMI",
  description: "Two artists go head-to-head, song by song. Crowd votes Fire, Smooth, or Miss after each. Best of 5 wins.",
};

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  live:        { label: "LIVE", color: "#050510", bg: "#00FF88" },
  intermission:{ label: "INTERMISSION", color: "#050510", bg: "#FFD700" },
  queued:      { label: "UPCOMING", color: "#00FFFF", bg: "rgba(0,255,255,0.12)" },
  completed:   { label: "ENDED", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.06)" },
};

export default function SongBattlePage() {
  const battles = listSongBattles();
  const live = battles.filter(b => b.status === "live" || b.status === "intermission");
  const upcoming = battles.filter(b => b.status === "queued");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(0,255,255,0.1)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>TMI ARENA</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>Song-for-Song</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Two artists compete song by song. The crowd votes Fire, Smooth, or Miss after each round. First to win 3 of 5 songs takes the match.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/song-battle/live" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#AA2DFF)", borderRadius: 10, textDecoration: "none" }}>
            JOIN LIVE ARENA →
          </Link>
          <Link href="/battles" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 10, textDecoration: "none" }}>
            ALL BATTLES
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "44px 24px 0" }}>
        {live.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
              LIVE NOW
            </div>
            {live.map(battle => {
              const badge = STATUS_BADGE[battle.status];
              const aWins = battle.rounds.filter(r => r.winner === "a").length;
              const bWins = battle.rounds.filter(r => r.winner === "b").length;
              return (
                <Link key={battle.battleId} href={battle.route} style={{ display: "block", textDecoration: "none", color: "inherit", marginBottom: 12 }}>
                  <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 16, padding: "24px 28px" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: badge.color, background: badge.bg, padding: "3px 10px", borderRadius: 999 }}>{badge.label}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{battle.crowdCount.toLocaleString()} watching</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>Round {battle.currentRound} / {battle.bestOf}</span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>{battle.title}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
                      <div style={{ background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#00FFFF" }}>{battle.artistA.name}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{battle.artistA.genre}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#00FFFF", marginTop: 6 }}>{aWins}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>VS</div>
                      <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#AA2DFF" }}>{battle.artistB.name}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{battle.artistB.genre}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#AA2DFF", marginTop: 6 }}>{bWins}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FF88", padding: "9px 28px", borderRadius: 8 }}>VOTE NOW →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>UPCOMING</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {upcoming.map(battle => (
                <div key={battle.battleId} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "2px 8px", display: "inline-block", marginBottom: 12 }}>UPCOMING</div>
                  <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{battle.title}</h3>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                    Starts in {Math.round((battle.startedAtMs - Date.now()) / 60000)} min
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "44px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 20 }}>HOW IT WORKS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {[
            { step: "1", label: "Artist A plays a song", color: "#00FFFF" },
            { step: "2", label: "Artist B responds with a song", color: "#AA2DFF" },
            { step: "3", label: "Crowd votes: Fire, Smooth, or Miss", color: "#FF2DAA" },
            { step: "4", label: "Highest crowd approval wins the round", color: "#FFD700" },
            { step: "5", label: "First to 3 rounds wins the match", color: "#00FF88" },
          ].map(({ step, label, color }) => (
            <div key={step} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20`, borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color, marginBottom: 8 }}>{step}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
