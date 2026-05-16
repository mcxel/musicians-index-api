"use client";

import { useState } from "react";
import Link from "next/link";
import { getLiveSongBattles, recordSongVote, type SongVote } from "@/lib/competition/SongBattleEngine";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";

export default function SongBattleLivePage() {
  registerRoute("/song-battle/live", "open", {
    returnRoute: "/song-battle",
    fallbackRoute: "/song-battle",
    nextAction: "vote",
  });
  registerReturnPath({ fromRoute: "/song-battle/live", toRoute: "/song-battle", label: "Back to Song Battle" });
  resolveSlug("event", "song-battle-live");
  SocketRecoveryEngine.register("guest-user", "sock_song_battle", "song-battle-live");

  const battles = getLiveSongBattles();
  const battle = battles[0] ?? null;
  const currentRound = battle?.rounds.find(r => !r.winner) ?? battle?.rounds[battle.currentRound - 1] ?? null;

  const [voted, setVoted] = useState<SongVote | null>(null);
  const [localVotes, setLocalVotes] = useState({ fire: 0, smooth: 0, miss: 0 });

  function castVote(v: SongVote) {
    if (voted || !battle || !currentRound) return;
    setVoted(v);
    setLocalVotes(prev => ({ ...prev, [v]: prev[v] + 1 }));
    recordSongVote(battle.battleId, currentRound.roundId, v);
  }

  if (!battle) return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎵</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>No live song battles right now.</div>
        <Link href="/song-battle" style={{ fontSize: 10, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: "10px 24px", textDecoration: "none" }}>
          SEE SCHEDULE →
        </Link>
      </div>
    </main>
  );

  const aWins = battle.rounds.filter(r => r.winner === "a").length;
  const bWins = battle.rounds.filter(r => r.winner === "b").length;
  const totalVotes = (currentRound?.votes.fire ?? 0) + (currentRound?.votes.smooth ?? 0) + (currentRound?.votes.miss ?? 0) + localVotes.fire + localVotes.smooth + localVotes.miss;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 100 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(0,255,255,0.1)", background: "rgba(0,0,0,0.6)" }}>
        <Link href="/song-battle" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Song Arena</Link>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>SONG-FOR-SONG — LIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2DAA", boxShadow: "0 0 8px #FF2DAA", display: "inline-block" }} />
          <span style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 700 }}>{battle.crowdCount.toLocaleString()} watching</span>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "16px 20px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", marginBottom: 4 }}>{battle.artistA.name}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#00FFFF" }}>{aWins}</div>
        </div>
        <div style={{ padding: "16px 20px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>ROUND {battle.currentRound} · BEST OF {battle.bestOf}</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>VS</div>
        </div>
        <div style={{ padding: "16px 20px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#AA2DFF", marginBottom: 4 }}>{battle.artistB.name}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#AA2DFF" }}>{bWins}</div>
        </div>
      </div>

      {/* Now playing */}
      {currentRound && (
        <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>NOW PLAYING</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 32 }}>
            <div style={{ background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>{battle.artistA.name.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{currentRound.songA.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{currentRound.songA.bpm > 0 ? `${currentRound.songA.bpm} BPM` : "Loading…"}</div>
            </div>
            <div style={{ fontSize: 22 }}>⚔️</div>
            <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, marginBottom: 6 }}>{battle.artistB.name.toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{currentRound.songB.title}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{currentRound.songB.bpm > 0 ? `${currentRound.songB.bpm} BPM` : "Loading…"}</div>
            </div>
          </div>

          {/* Vote totals */}
          {totalVotes > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {(["fire", "smooth", "miss"] as SongVote[]).map(v => {
                const baseCount = currentRound.votes[v];
                const myCount = localVotes[v];
                const total = baseCount + myCount;
                const pct = totalVotes > 0 ? Math.round((total / totalVotes) * 100) : 0;
                const color = v === "fire" ? "#FF2DAA" : v === "smooth" ? "#00FFFF" : "#FFD700";
                return (
                  <div key={v} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color, fontWeight: 800, letterSpacing: "0.1em" }}>{v.toUpperCase()}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color, marginTop: 4 }}>{pct}%</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{total.toLocaleString()} votes</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vote bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(5,5,16,0.95)", borderTop: "1px solid rgba(0,255,255,0.2)", padding: "12px 20px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", zIndex: 100 }}>
        {voted ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: "#00FF88", padding: "12px 0" }}>
            ✓ Vote cast: {voted.toUpperCase()} — waiting for next round
          </div>
        ) : (
          <>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", alignSelf: "center", letterSpacing: "0.1em" }}>YOUR VOTE:</div>
            {(["fire", "smooth", "miss"] as SongVote[]).map(v => {
              const color = v === "fire" ? "#FF2DAA" : v === "smooth" ? "#00FFFF" : "#FFD700";
              const emoji = v === "fire" ? "🔥" : v === "smooth" ? "✨" : "💨";
              return (
                <button key={v} onClick={() => castVote(v)} style={{ padding: "10px 24px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: color, borderRadius: 20, border: "none", cursor: "pointer" }}>
                  {emoji} {v.toUpperCase()}
                </button>
              );
            })}
          </>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: "20px auto 140px", padding: "0 20px", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <SocketStatusBadge userId="guest-user" />
          <ReconnectButton userId="guest-user" />
          <ReturnPathButton />
        </div>
        <RouteRecoveryCard route="/song-battle/live" />
        <SlugFallbackPanel entity="event" slug="song-battle-live" />
      </div>
    </main>
  );
}
