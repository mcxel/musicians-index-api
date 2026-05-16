"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { dirtyDozensBattleEngine } from "@/lib/shows/DirtyDozensBattleEngine";
import type { DirtyDozensState, Battler } from "@/lib/shows/DirtyDozensBattleEngine";

const PHASE_LABELS: Record<string, string> = {
  lobby: "LOBBY",
  matchup: "LIVE BATTLE",
  voting: "CROWD VOTE",
  result: "RESULT",
  semifinals: "SEMI-FINALS",
  finals: "FINALS",
  champion: "CHAMPION",
  ended: "SHOW ENDED",
};

const PHASE_COLOR: Record<string, string> = {
  lobby: "#00FFFF",
  matchup: "#FF2DAA",
  voting: "#FFD700",
  result: "#AA2DFF",
  semifinals: "#FF6B35",
  finals: "#FF2DAA",
  champion: "#FFD700",
  ended: "rgba(255,255,255,0.3)",
};

function BattlerRow({ b, isA, isB }: { b: Battler; isA?: boolean; isB?: boolean }) {
  const accent = isA ? "#00FFFF" : isB ? "#FF2DAA" : "rgba(255,255,255,0.3)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: `1px solid ${accent}30`, background: `${accent}08` }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${accent}20`, border: `1px solid ${accent}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: accent }}>
        {b.seed}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{b.displayName}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          {b.wins}W · {b.losses}L · {b.totalCrowdVotes} votes
        </div>
      </div>
      {b.isEliminated && (
        <span style={{ fontSize: 8, fontWeight: 800, color: "#FF2D2D", border: "1px solid #FF2D2D40", borderRadius: 3, padding: "2px 6px" }}>OUT</span>
      )}
    </div>
  );
}

function VoteBar({ votesA, votesB, nameA, nameB }: { votesA: number; votesB: number; nameA: string; nameB: string }) {
  const total = votesA + votesB || 1;
  const pctA = Math.round((votesA / total) * 100);
  const pctB = 100 - pctA;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, fontWeight: 800 }}>
        <span style={{ color: "#00FFFF" }}>{nameA} · {pctA}%</span>
        <span style={{ color: "#FF2DAA" }}>{nameB} · {pctB}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pctA}%`, background: "#00FFFF", transition: "width 0.6s ease" }} />
        <div style={{ flex: 1, background: "#FF2DAA", transition: "flex 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
        <span>{votesA} votes</span>
        <span>{votesB} votes</span>
      </div>
    </div>
  );
}

const DEMO_SHOW_ID = "dd-live-001";
const DEMO_NAMES = ["Wavetek", "Krypt", "Lyric Stone", "Zuri Bloom", "Crown X", "Nova", "Ace Rhyme", "Defiant", "Cipher", "Blaze", "Lux", "Riddim"];

export default function DirtyDozensPage() {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  const [state, setState] = useState<DirtyDozensState | null>(null);
  const [voteCast, setVoteCast] = useState(false);
  const voterId = useRef(`viewer-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    const engine = dirtyDozensBattleEngine;
    const unsub = engine.onChange((s) => setState({ ...s }));

    // Start a demo show if none running
    if (!engine.getState()) {
      const newState = engine.startShow(DEMO_SHOW_ID);
      DEMO_NAMES.forEach((name, i) => engine.registerBattler(`battler-${i}`, name));
      setState({ ...newState });
    } else {
      setState(engine.getState());
    }

    return unsub;
  }, []);

  const phase = state?.phase ?? "lobby";
  const phaseColor = PHASE_COLOR[phase] ?? "#fff";
  const matchup = state?.currentMatchup ?? null;
  const battlerA = matchup ? state?.battlers.get(matchup.battlerAId) : null;
  const battlerB = matchup ? state?.battlers.get(matchup.battlerBId) : null;
  const leaderboard = dirtyDozensBattleEngine.getLeaderboard();

  function castVote(pick: "A" | "B") {
    if (voteCast || phase !== "voting") return;
    dirtyDozensBattleEngine.castVote(voterId.current, pick);
    setVoteCast(true);
  }

  function startBattles() {
    dirtyDozensBattleEngine.startBattles();
    setVoteCast(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/games" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← GAMES</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800 }}>TMI GAMES</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: 2 }}>DIRTY DOZENS</h1>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: phaseColor, border: `1px solid ${phaseColor}50`, borderRadius: 4, padding: "3px 10px", letterSpacing: "0.15em" }}>
          {PHASE_LABELS[phase] ?? phase.toUpperCase()}
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

        {/* Main battle area */}
        <div>
          {phase === "lobby" && (
            <div style={{ textAlign: "center", padding: "40px 24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
                {state?.battlers.size ?? 0} / 12 battlers registered. Battle of bars, jabs, and clap-backs. Crowd judges every round.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
                {[...( state?.battlers.values() ?? [])].map((b) => (
                  <span key={b.userId} style={{ fontSize: 10, fontWeight: 700, color: "#FF2DAA", border: "1px solid #FF2DAA30", borderRadius: 20, padding: "4px 10px" }}>
                    {b.displayName}
                  </span>
                ))}
              </div>
              <button
                onClick={startBattles}
                style={{ padding: "12px 32px", background: "#FF2DAA", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}
              >
                START BATTLES →
              </button>
            </div>
          )}

          {(phase === "matchup" || phase === "voting") && battlerA && battlerB && (
            <div style={{ border: "1px solid rgba(255,45,170,0.3)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "rgba(255,45,170,0.06)", padding: "14px 18px", borderBottom: "1px solid rgba(255,45,170,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FF2DAA" }}>CURRENT MATCHUP</span>
                {phase === "voting" && <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.15em" }}>VOTE NOW</span>}
              </div>
              <div style={{ padding: "24px 18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎤</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#00FFFF" }}>{battlerA.displayName}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Seed #{battlerA.seed}</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>VS</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎤</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#FF2DAA" }}>{battlerB.displayName}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Seed #{battlerB.seed}</div>
                  </div>
                </div>

                {matchup && <VoteBar votesA={matchup.crowdVotesA} votesB={matchup.crowdVotesB} nameA={battlerA.displayName} nameB={battlerB.displayName} />}

                {phase === "voting" && !voteCast && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                    <button onClick={() => castVote("A")} style={{ padding: "12px", background: "rgba(0,255,255,0.12)", border: "1px solid #00FFFF60", borderRadius: 8, color: "#00FFFF", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
                      VOTE {battlerA.displayName.toUpperCase()}
                    </button>
                    <button onClick={() => castVote("B")} style={{ padding: "12px", background: "rgba(255,45,170,0.12)", border: "1px solid #FF2DAA60", borderRadius: 8, color: "#FF2DAA", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
                      VOTE {battlerB.displayName.toUpperCase()}
                    </button>
                  </div>
                )}
                {phase === "voting" && voteCast && (
                  <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#FFD700", fontWeight: 800 }}>✓ Vote submitted — waiting for results</div>
                )}
              </div>
            </div>
          )}

          {phase === "result" && (
            <div style={{ textAlign: "center", padding: "32px 24px", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>ROUND WINNER</div>
              {matchup?.winnerId && (
                <div style={{ fontSize: 24, fontWeight: 900, color: "#FFD700" }}>
                  {state?.battlers.get(matchup.winnerId)?.displayName}
                </div>
              )}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Next matchup loading…</div>
            </div>
          )}

          {phase === "champion" && state?.champion && (
            <div style={{ textAlign: "center", padding: "40px 24px", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 12, background: "rgba(255,215,0,0.04)" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>👑</div>
              <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>DIRTY DOZENS CHAMPION</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700" }}>
                {state.battlers.get(state.champion)?.displayName}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
                +120 Crown Points · Battle record: {state.battlers.get(state.champion)?.wins}W / {state.battlers.get(state.champion)?.losses}L
              </div>
            </div>
          )}

          {/* Completed matchups */}
          {(state?.completedMatchups.length ?? 0) > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>COMPLETED ROUNDS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {state?.completedMatchups.slice(-5).map((m, i) => {
                  const wName = state.battlers.get(m.winnerId ?? "")?.displayName ?? "?";
                  const lName = state.battlers.get(m.loserId ?? "")?.displayName ?? "?";
                  return (
                    <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 11, padding: "6px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                      <span style={{ color: "#FFD700", fontWeight: 800 }}>W:</span>
                      <span style={{ fontWeight: 700 }}>{wName}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>def.</span>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{lName}</span>
                      <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{m.crowdVotesA + m.crowdVotesB} votes</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard sidebar */}
        <div>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>LEADERBOARD</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{leaderboard.length} battlers</span>
            </div>
            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {leaderboard.length === 0 && (
                <div style={{ padding: "16px 0", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Lobby filling up…</div>
              )}
              {leaderboard.map((b) => (
                <BattlerRow key={b.userId} b={b}
                  isA={matchup?.battlerAId === b.userId}
                  isB={matchup?.battlerBId === b.userId}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, padding: "12px 14px", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 10, background: "rgba(255,45,170,0.05)" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#FF2DAA", fontWeight: 800, marginBottom: 6 }}>RULES</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              12 battlers · Head-to-head matchups · 3-min performance window · 60s crowd vote · Judge call = 40% weight · Elimination bracket to champion
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
