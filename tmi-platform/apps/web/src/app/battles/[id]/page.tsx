"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PresenceBar from "@/components/live/PresenceBar";
import { usePerformanceQueue } from "@/components/live/PerformanceQueue";
import { battleChallengeEconomyEngine } from "@/lib/competition/BattleChallengeEconomyEngine";
import { battlePredictionEngine } from "@/lib/competition/BattlePredictionEngine";
import { battleQueueEngine } from "@/lib/competition/BattleQueueEngine";
import { battleTeamAssemblyEngine } from "@/lib/competition/BattleTeamAssemblyEngine";
import { battleRewardSettlementEngine } from "@/lib/competition/BattleRewardSettlementEngine";
import { battleReplayVaultEngine } from "@/lib/competition/BattleReplayVaultEngine";
import { dirtyDozensEngine } from "@/lib/competition/DirtyDozensEngine";
import { battleMatchLifecycleEngine } from "@/lib/competition/BattleMatchLifecycleEngine";
import { openVoting, castVote, closeVoting, hasVoted } from "@/lib/competition/BattleVoteClosureEngine";
import { settleWinner } from "@/lib/competition/BattleWinnerEngine";
import { awardTrophy } from "@/lib/trophy/TrophyEngine";
import RoomChatPanel from "@/components/messaging/RoomChatPanel";
import WinnerCeremonyOverlay from "@/components/ceremony/WinnerCeremonyOverlay";
import ProfileStreakRail from "@/components/streaks/ProfileStreakRail";
import LiveQualityBadge from "@/components/video/LiveQualityBadge";

const BATTLE_DATA: Record<string, {
  title: string; type: string; prize: string; status: string;
  color: string; artist1: string; artist2: string; icon1: string; icon2: string;
}> = {
  b1: { title: "Wavetek vs Krypt",        type: "1v1 RAP",    prize: "$500", status: "LIVE",     color: "#FF2DAA", artist1: "Wavetek",      artist2: "Krypt",        icon1: "🎤", icon2: "🔒" },
  b2: { title: "Bar God vs Verse Knight", type: "FREESTYLE",  prize: "$250", status: "UPCOMING", color: "#FFD700", artist1: "Bar God",      artist2: "Verse Knight", icon1: "👑", icon2: "⚔️" },
  b3: { title: "Overdrive vs FlowMaster", type: "MINI-BATTLE",prize: "$100", status: "UPCOMING", color: "#00FFFF", artist1: "Overdrive",    artist2: "FlowMaster",   icon1: "🔥", icon2: "🌊" },
  b4: { title: "MC Phantom vs Cold Spark",type: "1v1 RAP",    prize: "$500", status: "ENDED",    color: "#AA2DFF", artist1: "MC Phantom",   artist2: "Cold Spark",   icon1: "👻", icon2: "❄️" },
  b5: { title: "Zero Degrees vs Ace Villain",type:"FREESTYLE",prize: "$250", status: "ENDED",    color: "#00FF88", artist1: "Zero Degrees", artist2: "Ace Villain",  icon1: "0️⃣", icon2: "🦹" },
};

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const battle = BATTLE_DATA[params.id] ?? {
    title: `Battle ${params.id}`, type: "BATTLE", prize: "TBD", status: "UPCOMING",
    color: "#00FFFF", artist1: "Artist A", artist2: "Artist B", icon1: "🎤", icon2: "🎤",
  };

  // Subscribe to server queue state — replaces client-side timer authority
  const queueState = usePerformanceQueue(`battle-${params.id}`);

  const [votes, setVotes] = useState({ a: 0, b: 0 });
  const [voted, setVoted] = useState<"a" | "b" | null>(null);
  const [reaction, setReaction] = useState("");
  const [predictionChoice, setPredictionChoice] = useState<"a" | "b">("a");
  const [predictionStake, setPredictionStake] = useState(15);
  const [battleNotice, setBattleNotice] = useState("");
  const [dirtyRoundId, setDirtyRoundId] = useState<string | null>(null);
  const [showCeremony, setShowCeremony] = useState(false);

  const fanUserId = `fan-${params.id}`;
  const challengerUserId = `challenger-${params.id}`;
  const artistAId = `${params.id}-artist-a`;
  const artistBId = `${params.id}-artist-b`;

  useEffect(() => {
    battleChallengeEconomyEngine.seedUser(fanUserId, 250);
    battleChallengeEconomyEngine.seedUser(challengerUserId, 120);

    const existingMatch = battleMatchLifecycleEngine.getMatch(params.id);
    if (!existingMatch) {
      battleMatchLifecycleEngine.createMatch(params.id, "solo-vs-solo", "Solo Battle");
      battleMatchLifecycleEngine.setStatus(params.id, "live");
      battlePredictionEngine.startPredictionWindow(params.id, Date.now());
      openVoting(params.id);
    }
  }, [challengerUserId, fanUserId, params.id]);

  const fanBalance = battleChallengeEconomyEngine.getBalance(fanUserId);
  const predictionOpen = battlePredictionEngine.isPredictionOpen(params.id);
  const battlePredictions = battlePredictionEngine.getPredictionsForBattle(params.id);
  const queueEntries = battleQueueEngine.getQueue(params.id);
  const replayRecord = battleReplayVaultEngine.getReplay(params.id);
  const dirtyRound = dirtyRoundId ? dirtyDozensEngine.getRound(dirtyRoundId) : null;

  const requiredTeamSlots = battleTeamAssemblyEngine.getRequiredSlots("duo-vs-duo");
  const duoValidation = useMemo(() => {
    return battleTeamAssemblyEngine.validateMatchup(
      "duo-vs-duo",
      {
        teamId: "team-a",
        teamName: `${battle.artist1} Duo`,
        members: [
          { userId: `${artistAId}-1`, displayName: battle.artist1, roleSlot: "vocal" },
          { userId: `${artistAId}-2`, displayName: `${battle.artist1} Producer`, roleSlot: "producer" },
        ],
      },
      {
        teamId: "team-b",
        teamName: `${battle.artist2} Duo`,
        members: [
          { userId: `${artistBId}-1`, displayName: battle.artist2, roleSlot: "vocal" },
          { userId: `${artistBId}-2`, displayName: `${battle.artist2} Producer`, roleSlot: "producer" },
        ],
      },
    );
  }, [artistAId, artistBId, battle.artist1, battle.artist2]);

  async function vote(side: "a" | "b") {
    if (voted) return;
    if (hasVoted(params.id, fanUserId)) return;
    castVote(params.id, fanUserId, side === "a" ? "artist-a" : "artist-b");
    // Optimistic local update
    setVoted(side);
    setVotes(prev => ({ ...prev, [side]: prev[side] + 1 }));
    // Persist vote to server queue — ROOM_STATE_CHANGED source of truth
    await fetch(`/api/rooms/battle-${params.id}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ side, battleId: params.id }),
    }).catch(() => {});
  }

  // Reaction is toggled — no client timer; cleared by selecting another or re-clicking
  function toggleReaction(emoji: string) {
    setReaction(prev => prev === emoji ? "" : emoji);
  }

  function placePrediction() {
    const predictedWinnerId = predictionChoice === "a" ? artistAId : artistBId;
    const result = battlePredictionEngine.submitPrediction({
      battleId: params.id,
      fanUserId,
      predictedWinnerId,
      stakePoints: predictionStake,
      underdog: predictionChoice === "b",
    });
    if (!result.ok) {
      setBattleNotice(`Prediction blocked: ${result.reason ?? "unknown"}`);
      return;
    }
    setBattleNotice(`Prediction placed: ${predictionStake} pts on ${predictionChoice === "a" ? battle.artist1 : battle.artist2}.`);
  }

  function queueChallenge() {
    const result = battleQueueEngine.enqueueMidBattleChallenge({
      battleId: params.id,
      challenger: {
        userId: challengerUserId,
        displayName: "Queue Challenger",
        tier: "gold",
        role: "artist",
        ageVerified: true,
      },
      challengerWins: 9,
      challengerStreak: 3,
    });
    if (!result.ok) {
      setBattleNotice(`Queue blocked: ${result.reason ?? "unknown"}`);
      return;
    }
    setBattleNotice("Queue joined: 15 points charged and challenger added to next-up ladder.");
  }

  function startDirtyDozensRound() {
    const round = dirtyDozensEngine.startRound(params.id, battle.artist1, battle.artist2);
    setDirtyRoundId(round.roundId);
    setBattleNotice("Dirty Dozens round started with timer, turn order, and foul controls.");
  }

  function settleBattleNow() {
    const winnerSide = pctA >= pctB ? "a" : "b";
    const winnerId = winnerSide === "a" ? artistAId : artistBId;
    const loserId = winnerSide === "a" ? artistBId : artistAId;
    const settlement = battleRewardSettlementEngine.settleBattle(params.id, winnerId, loserId, {
      audienceVotesWinner: winnerSide === "a" ? votes.a : votes.b,
      audienceVotesLoser: winnerSide === "a" ? votes.b : votes.a,
      engagementWinner: 80,
      engagementLoser: 70,
      performanceWinner: 88,
      performanceLoser: 80,
      safetyWinner: 95,
      safetyLoser: 92,
      upsetWin: winnerSide === "b",
      streakBonusPoints: 20,
      chatMessages: 140,
    });

    if (settlement.status === "failed") {
      setBattleNotice("Settlement failed: battle was not tracked in lifecycle engine.");
      return;
    }

    closeVoting(params.id);
    settleWinner(params.id, winnerId, loserId, "vote");
    awardTrophy("battle-win", winnerId, "tmi-platform", { battleId: params.id });

    setBattleNotice(
      `Settled: winner ${settlement.winnerAwardedPoints} pts, loser ${settlement.loserAwardedPoints} pts, score ${settlement.winnerCompositeScore.toFixed(1)}-${settlement.loserCompositeScore.toFixed(1)}.`,
    );
  }

  const totalVotes = votes.a + votes.b;
  const pctA = totalVotes ? Math.round((votes.a / totalVotes) * 100) : 50;
  const pctB = 100 - pctA;
  const REACTIONS = ["🔥", "💯", "⚔️", "👑", "😤", "🎤"];

  const liveViewers = queueState.memberCount > 0 ? queueState.memberCount : null;

  return (
    <main data-testid="battle-page" style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/battles" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← BATTLES
        </Link>
      </div>

      <header style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: battle.color, marginBottom: 8 }}>
              {battle.type} · Prize: {battle.prize}
            </div>
            <h1 style={{ fontSize: "clamp(1.2rem,3vw,2rem)", fontWeight: 900 }}>{battle.title}</h1>
            <div style={{ marginTop: 8 }}>
              <LiveQualityBadge streamId={`battle-${params.id}`} context="battle" />
            </div>
          </div>
          {battle.status === "LIVE" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
              <span style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>
                LIVE{liveViewers ? ` · ${liveViewers} watching` : ""}
              </span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <PresenceBar roomId={`battle-${params.id}`} />
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
        {/* Artist cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 32 }}>
          <div style={{ background: voted === "a" ? `${battle.color}15` : "rgba(255,255,255,0.02)", border: `1px solid ${voted === "a" ? battle.color + "40" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{battle.icon1}</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>{battle.artist1}</h2>
            {battle.status === "LIVE" && (
              <button data-testid="vote-contestant-0" onClick={() => void vote("a")} disabled={!!voted} style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: voted === "a" ? "#050510" : battle.color, background: voted === "a" ? battle.color : "transparent", border: `1px solid ${battle.color}60`, borderRadius: 8, cursor: voted ? "not-allowed" : "pointer", width: "100%" }}>
                {voted === "a" ? "VOTED ✓" : "VOTE"}
              </button>
            )}
            {totalVotes > 0 && <div style={{ marginTop: 12, fontSize: 20, fontWeight: 900, color: battle.color }}>{pctA}%</div>}
          </div>

          <div style={{ textAlign: "center", fontSize: 24, fontWeight: 900, color: "rgba(255,255,255,0.15)" }}>VS</div>

          <div style={{ background: voted === "b" ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${voted === "b" ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{battle.icon2}</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>{battle.artist2}</h2>
            {battle.status === "LIVE" && (
              <button data-testid="vote-contestant-1" onClick={() => void vote("b")} disabled={!!voted} style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: voted === "b" ? "#050510" : "#FFD700", background: voted === "b" ? "#FFD700" : "transparent", border: "1px solid rgba(255,215,0,0.5)", borderRadius: 8, cursor: voted ? "not-allowed" : "pointer", width: "100%" }}>
                {voted === "b" ? "VOTED ✓" : "VOTE"}
              </button>
            )}
            {totalVotes > 0 && <div style={{ marginTop: 12, fontSize: 20, fontWeight: 900, color: "#FFD700" }}>{pctB}%</div>}
          </div>
        </div>

        {/* Vote bar */}
        {totalVotes > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,215,0,0.2)", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${pctA}%`, background: battle.color, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              <span>{battle.artist1}: {votes.a}</span><span>{totalVotes} total votes</span><span>{battle.artist2}: {votes.b}</span>
            </div>
          </div>
        )}

        {/* Reactions — toggle-based, no client timers */}
        {battle.status === "LIVE" && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 12 }}>REACTIONS</div>
            <div style={{ display: "flex", gap: 8 }}>
              {REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => toggleReaction(emoji)} style={{ padding: "8px 14px", fontSize: 20, background: reaction === emoji ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${reaction === emoji ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer", transform: reaction === emoji ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s, background 0.15s" }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav links for data-testid compatibility */}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Link data-testid="battle-to-prizes" href="/prizes" style={{ fontSize: 10, color: "#00FF88", textDecoration: "none", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 6, padding: "6px 14px" }}>Prizes</Link>
          <Link data-testid="battle-to-leaderboard" href="/leaderboard" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, padding: "6px 14px" }}>Leaderboard</Link>
        </div>

        <section style={{ marginTop: 24, border: "1px solid rgba(0,255,255,0.25)", borderRadius: 12, padding: "14px 16px", background: "rgba(0,255,255,0.06)", display: "grid", gap: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#00ffff", fontWeight: 800 }}>SPECTATOR PREDICTIONS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            Fan wallet: {fanBalance.availableEarnedPoints} pts · Prediction window: {predictionOpen ? "OPEN" : "CLOSED"} (closes at minute 5)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setPredictionChoice("a")} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,45,170,0.3)", background: predictionChoice === "a" ? "rgba(255,45,170,0.25)" : "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", fontSize: 10 }}>{battle.artist1}</button>
            <button onClick={() => setPredictionChoice("b")} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.3)", background: predictionChoice === "b" ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", fontSize: 10 }}>{battle.artist2}</button>
            <input type="number" min={1} value={predictionStake} onChange={(e) => setPredictionStake(Math.max(1, Number(e.target.value) || 1))} style={{ width: 92, background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 6, padding: "6px 8px", fontSize: 10 }} />
            <button onClick={placePrediction} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(0,255,136,0.4)", background: "rgba(0,255,136,0.22)", color: "#fff", cursor: "pointer", fontSize: 10 }}>Bet Points</button>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Prediction pool: {battlePredictions.length} bets</div>
        </section>

        <section style={{ marginTop: 14, border: "1px solid rgba(255,215,0,0.25)", borderRadius: 12, padding: "14px 16px", background: "rgba(255,215,0,0.06)", display: "grid", gap: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#ffd700", fontWeight: 800 }}>MID-BATTLE CHALLENGER QUEUE</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Queue unlock at minute 8 · Entry cost 15 points · Gold+ priority</div>
          <button onClick={queueChallenge} style={{ width: "fit-content", padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.2)", color: "#fff", cursor: "pointer", fontSize: 10 }}>Challenge Leader - 15 pts</button>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Next-up challengers: {queueEntries.length}</div>
        </section>

        <section style={{ marginTop: 14, border: "1px solid rgba(170,45,255,0.3)", borderRadius: 12, padding: "14px 16px", background: "rgba(170,45,255,0.08)", display: "grid", gap: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#aa2dff", fontWeight: 800 }}>TEAM STRUCTURE + DIRTY DOZENS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Duo role slots required: {requiredTeamSlots.join(", ")} · Validation: {duoValidation.ok ? "PASS" : "FAIL"}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={startDirtyDozensRound} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(170,45,255,0.4)", background: "rgba(170,45,255,0.22)", color: "#fff", cursor: "pointer", fontSize: 10 }}>Start Dirty Dozens Round</button>
            {dirtyRoundId && <button onClick={() => dirtyDozensEngine.advanceTurn(dirtyRoundId)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontSize: 10 }}>Advance Turn</button>}
            {dirtyRoundId && <button onClick={() => dirtyDozensEngine.submitLineForModeration(dirtyRoundId, "a", "clean line") } style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,255,255,0.18)", color: "#fff", cursor: "pointer", fontSize: 10 }}>Test Moderation</button>}
          </div>
          {dirtyRound && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.78)" }}>
              Dirty Dozens: turn {dirtyRound.activeTurn.toUpperCase()} · score {dirtyRound.audienceScoreA}-{dirtyRound.audienceScoreB} · fouls {dirtyRound.foulCountA}/{dirtyRound.foulCountB} · escalation {dirtyRound.escalationLevel}
            </div>
          )}
        </section>

        <section style={{ marginTop: 14, border: "1px solid rgba(0,255,136,0.28)", borderRadius: 12, padding: "14px 16px", background: "rgba(0,255,136,0.07)", display: "grid", gap: 10 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#00ff88", fontWeight: 800 }}>SETTLEMENT + REPLAY</div>
          <button onClick={settleBattleNow} style={{ width: "fit-content", padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(0,255,136,0.35)", background: "rgba(0,255,136,0.22)", color: "#fff", cursor: "pointer", fontSize: 10 }}>Settle Battle Now</button>
          {replayRecord && (
            <Link href={replayRecord.replayRoute} style={{ fontSize: 10, color: "#00ffff", textDecoration: "none" }}>
              Replay ready: {replayRecord.replayId} ({replayRecord.totalVotes} votes)
            </Link>
          )}
          {battleNotice && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{battleNotice}</div>}
        </section>

        {battle.status === "ENDED" && (
          <div style={{ marginTop: 24, background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 700, marginBottom: 8 }}>BATTLE ENDED</div>
            <button
              onClick={() => setShowCeremony(true)}
              style={{ display: "inline-block", marginTop: 8, padding: "8px 20px", fontSize: 9, fontWeight: 800, color: "#050510", background: "#FFD700", border: "none", borderRadius: 7, cursor: "pointer", letterSpacing: "0.1em" }}
            >👑 CEREMONY</button>
            <Link href="/leaderboard" style={{ display: "inline-block", marginTop: 8, marginLeft: 8, padding: "8px 20px", fontSize: 9, fontWeight: 800, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 7, textDecoration: "none" }}>VIEW LEADERBOARD</Link>
            <Link href={`/battles/replay/${params.id}`} style={{ display: "inline-block", marginTop: 8, marginLeft: 8, padding: "8px 20px", fontSize: 9, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 7, textDecoration: "none" }}>WATCH REPLAY</Link>
          </div>
        )}

        {/* Winner Ceremony Overlay */}
        {showCeremony && (
          <WinnerCeremonyOverlay
            battleId={params.id}
            context="battle"
            winner={{ userId: `${params.id}-artist-a`, displayName: battle.artist1, avatarUrl: "", score: votes.a, voteCount: votes.a }}
            loser={{ userId: `${params.id}-artist-b`, displayName: battle.artist2, avatarUrl: "", score: votes.b, voteCount: votes.b }}
            totalVotes={votes.a + votes.b}
            isUpset={votes.b > votes.a * 1.4}
            rewardPoints={35}
            replayRoute={`/battles/replay/${params.id}`}
            onDismiss={() => setShowCeremony(false)}
          />
        )}

        {/* Artist streak rails */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ProfileStreakRail userId={battle.artist1.toLowerCase().replace(/\s+/g, '-')} displayName={battle.artist1} mode="compact" accentColor={battle.color} />
          <ProfileStreakRail userId={battle.artist2.toLowerCase().replace(/\s+/g, '-')} displayName={battle.artist2} mode="compact" accentColor="#00FFFF" />
        </div>

        {/* Live room chat */}
        <div style={{ marginTop: 16 }}>
          <RoomChatPanel
            roomId={`battle-${params.id}`}
            userId="demo-viewer-001"
            userName="Viewer"
            userRole="fan"
            height={320}
          />
        </div>
      </div>
    </main>
  );
}
