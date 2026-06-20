"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import { dirtyDozensBattleEngine } from "@/lib/shows/DirtyDozensBattleEngine";
import type { DirtyDozensState } from "@/lib/shows/DirtyDozensBattleEngine";
import { getHostForShow } from "@/packages/magazine-engine/hostRegistry";
import type { HostEmotionalState } from "@/lib/hosts/HostEmotionReactionEngine";
import { getActiveAvatarRenderer } from "@/lib/avatars/AvatarRendererRegistry";

// Dirty Dozens Runtime Resolution (2026-06-20, Rule 21): this route used to
// run entirely on hardcoded local state (fake CONTESTANTS/scores, a
// crowdMeter that never moved, VOTE buttons with no onClick at all) while
// /games/dirty-dozens had the real battle engine but no room/audience
// integration. Per Rule 21's inherit-best-of-breed doctrine: this route
// keeps its real audience/room shell (ArenaEventShell + PageShell/HUDFrame),
// now driven by the same dirtyDozensBattleEngine singleton the other route
// uses — both pages reflect the same real show state. /games/dirty-dozens
// is left running as-is (not deleted) until this route is verified.

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

// Crowd Hype Bot / Triage Bot are explicitly bots — emoji icons, no portrait
// needed. The head judge is a real platform host, not a placeholder — pulled
// from the canonical hostRegistry below, which previously said "Julius" here
// even though the registry's own showHostMap assigns Dirty Dozens to Gregory
// Marcel (Julius is the giveaway-drop mascot host, a different show).
const BOT_PANEL = [
  { name: "Crowd Hype Bot", role: "CROWD METER", icon: "🔊", color: "#FF2DAA" },
  { name: "Triage Bot", role: "VIOLATION CHECK", icon: "🛡️", color: "#AA2DFF" },
];

const DEMO_SHOW_ID = "dd-live-001";
const DEMO_NAMES = ["Wavetek", "Krypt", "Lyric Stone", "Zuri Bloom", "Crown X", "Nova", "Ace Rhyme", "Defiant", "Cipher", "Blaze", "Lux", "Riddim"];

export default function DirtyDozensRoomPage() {
  const [state, setState] = useState<DirtyDozensState | null>(null);
  const [voteCast, setVoteCast] = useState(false);
  const voterId = useRef(`viewer-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    const engine = dirtyDozensBattleEngine;
    const unsub = engine.onChange((s) => setState({ ...s }));

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
  const isLive = phase === "matchup" || phase === "voting";
  const matchup = state?.currentMatchup ?? null;
  const battlerA = matchup ? state?.battlers.get(matchup.battlerAId) : null;
  const battlerB = matchup ? state?.battlers.get(matchup.battlerBId) : null;
  const leaderboard = dirtyDozensBattleEngine.getLeaderboard();
  const headJudge = getHostForShow("dirty-dozens");
  // Avatar Runtime Contract (2026-06-20) — consumed via the registry, not a
  // direct HostMotionAvatar import, so swapping to a future 3D/point-cloud
  // renderer is a one-line registry change, not a rewrite of this page.
  const AvatarRenderer = getActiveAvatarRenderer();
  const totalVotes = matchup ? matchup.crowdVotesA + matchup.crowdVotesB : 0;
  const crowdMeterPct = totalVotes > 0 && matchup ? Math.round((matchup.crowdVotesA / totalVotes) * 100) : 0;
  // Real derivation from real battle phase — not a fabricated mood, just a
  // direct mapping of the genuine HostEmotionalState enum to show state.
  const hostEmotion: HostEmotionalState =
    phase === "champion" ? "celebrate" :
    phase === "voting" ? "shock" :
    phase === "result" ? "smirk" :
    "neutral";

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
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Top */}
          <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800 }}>
                  BATTLE ROOM{headJudge ? ` — HOSTED BY ${headJudge.name.toUpperCase()}` : ""}
                </div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  DIRTY DOZENS
                </h1>
              </div>
              {isLive && (
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  style={{ background: "#FF2DAA", borderRadius: 20, padding: "4px 14px", fontSize: 9, fontWeight: 900, letterSpacing: 3 }}>
                  LIVE
                </motion.div>
              )}
            </div>

            {/* Real phase indicator — not a clickable round-jump, brackets can't be navigated arbitrarily */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 20, overflowX: "auto" }}>
              {Object.entries(PHASE_LABELS).map(([key, label]) => (
                <span key={key} style={{
                  padding: "6px 14px", borderRadius: 20, flexShrink: 0,
                  background: phase === key ? "rgba(255,215,0,0.2)" : "transparent",
                  border: `1px solid ${phase === key ? "#FFD700" : "rgba(255,255,255,0.1)"}`,
                  color: phase === key ? "#FFD700" : "#666", fontSize: 9, fontWeight: 700, letterSpacing: 2,
                }}>{label}</span>
              ))}
            </div>
          </div>

          <ArenaEventShell roomId="dirty-dozens" eventType="battle" mode="audience" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, padding: "24px 32px" }}>

            {/* Main battle area */}
            <div>
              {phase === "lobby" && (
                <div style={{ textAlign: "center", padding: "40px 24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24 }}>
                    {state?.battlers.size ?? 0} / 12 battlers registered.
                  </p>
                  <button onClick={startBattles} style={{ padding: "12px 32px", background: "#FF2DAA", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}>
                    START BATTLES →
                  </button>
                </div>
              )}

              {(phase === "matchup" || phase === "voting") && battlerA && battlerB && (
                <div style={{
                  background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)",
                  borderRadius: 16, padding: 28, marginBottom: 20,
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>
                    ⚔️ CURRENT BATTLE — {PHASE_LABELS[phase]}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 20, marginBottom: 24 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,45,170,0.2)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>😤</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#FF2DAA" }}>{battlerA.displayName}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Seed #{battlerA.seed}</div>
                      {phase === "voting" && !voteCast && (
                        <motion.button whileTap={{ scale: 0.93 }} onClick={() => castVote("A")} style={{
                          marginTop: 12, padding: "8px 24px", borderRadius: 20,
                          background: "rgba(255,45,170,0.15)", border: "1px solid #FF2DAA",
                          color: "#FF2DAA", fontSize: 10, fontWeight: 700, cursor: "pointer",
                        }}>VOTE A</motion.button>
                      )}
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700", marginBottom: 8 }}>VS</div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(170,45,255,0.2)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>😤</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#AA2DFF" }}>{battlerB.displayName}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Seed #{battlerB.seed}</div>
                      {phase === "voting" && !voteCast && (
                        <motion.button whileTap={{ scale: 0.93 }} onClick={() => castVote("B")} style={{
                          marginTop: 12, padding: "8px 24px", borderRadius: 20,
                          background: "rgba(170,45,255,0.15)", border: "1px solid #AA2DFF",
                          color: "#AA2DFF", fontSize: 10, fontWeight: 700, cursor: "pointer",
                        }}>VOTE B</motion.button>
                      )}
                    </div>
                  </div>

                  {phase === "voting" && voteCast && (
                    <div style={{ textAlign: "center", fontSize: 11, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>✓ Vote submitted — waiting for results</div>
                  )}

                  {/* Real crowd meter — derived from actual cast votes, not a static placeholder */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, letterSpacing: 3, color: "#888" }}>CROWD METER</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#FFD700" }}>
                        {totalVotes > 0 ? `${crowdMeterPct}% / ${100 - crowdMeterPct}%` : "No votes yet"}
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", display: "flex" }}>
                      <motion.div animate={{ width: `${crowdMeterPct}%` }} transition={{ type: "spring", stiffness: 60 }} style={{ background: "#FF2DAA" }} />
                      <div style={{ flex: 1, background: "#AA2DFF" }} />
                    </div>
                  </div>
                </div>
              )}

              {phase === "result" && matchup?.winnerId && (
                <div style={{ textAlign: "center", padding: "32px 24px", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>ROUND WINNER</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#FFD700" }}>{state?.battlers.get(matchup.winnerId)?.displayName}</div>
                </div>
              )}

              {phase === "champion" && state?.champion && (
                <div style={{ textAlign: "center", padding: "40px 24px", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 16, background: "rgba(255,215,0,0.04)", marginBottom: 20 }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>👑</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>DIRTY DOZENS CHAMPION</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700" }}>{state.battlers.get(state.champion)?.displayName}</div>
                </div>
              )}

              {/* Judge Panel — real, clearly labeled platform hosts (Rule 21), not fake audience */}
              <div style={{
                background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>JUDGE PANEL</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {headJudge && (
                    <div key={headJudge.id} style={{
                      flex: 1, padding: "14px", borderRadius: 10,
                      background: "#FFD70008", border: "1px solid #FFD70025", textAlign: "center",
                    }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                        <AvatarRenderer.Component state={{
                          hostId: headJudge.id,
                          displayName: headJudge.name,
                          avatarSrc: headJudge.avatarAsset,
                          emotion: hostEmotion,
                          isSpeaking: phase === "result" && !!matchup?.winnerId,
                          activeLine: phase === "result" && matchup?.winnerId ? state?.battlers.get(matchup.winnerId)?.displayName : undefined,
                        }} />
                      </div>
                      <div style={{ fontSize: 8, letterSpacing: 2, color: "#FFD700", marginTop: 3 }}>HEAD JUDGE</div>
                    </div>
                  )}
                  {BOT_PANEL.map(j => (
                    <div key={j.name} style={{
                      flex: 1, padding: "14px", borderRadius: 10,
                      background: `${j.color}08`, border: `1px solid ${j.color}25`, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{j.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{j.name}</div>
                      <div style={{ fontSize: 8, letterSpacing: 2, color: j.color, marginTop: 3 }}>{j.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard — real, from dirtyDozensBattleEngine.getLeaderboard() */}
            <div>
              <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>🏆 LEADERBOARD</div>
                {leaderboard.length === 0 && (
                  <div style={{ padding: "16px 0", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Lobby filling up…</div>
                )}
                {leaderboard.map((b, i) => (
                  <div key={b.userId} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                    background: i === 0 ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${i === 0 ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.05)"}`,
                  }}>
                    <div style={{ width: 20, fontSize: 14, textAlign: "center" }}>{i === 0 ? "🏆" : `#${i + 1}`}</div>
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{b.displayName}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700" }}>{b.wins}W</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
