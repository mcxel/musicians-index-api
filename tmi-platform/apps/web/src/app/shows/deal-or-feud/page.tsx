"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ShowRoomEnvironmentShell } from "@/components/environments/ShowRoomEnvironmentShell";
import { ShowRuntimeHUD } from "@/components/shows/ShowRuntimeHUD";
import { CrowdVoteBar } from "@/components/shows/CrowdVoteBar";
import { DealOrFeudEngine, type FeudBoard } from "@/lib/shows/DealOrFeudEngine";
import type { ShowState } from "@/lib/shows/ShowRuntimeEngine";

const SAMPLE_BOARD: FeudBoard = {
  category: 'Name something people do at a concert',
  answers: [
    { text: 'Sing along', points: 42, revealed: false },
    { text: 'Dance', points: 35, revealed: false },
    { text: 'Hold up phones', points: 28, revealed: false },
    { text: 'Buy merch', points: 20, revealed: false },
    { text: 'Crowd surf', points: 15, revealed: false },
    { text: 'Scream', points: 10, revealed: false },
  ],
  totalPoints: 150,
};

const SAMPLE_CONTESTANTS = [
  { id: 'c1', name: 'Marcus B.' },
  { id: 'c2', name: 'Priya K.' },
  { id: 'c3', name: 'DeShawn T.' },
];

export default function DealOrFeudPage() {
  const engine = useMemo(() => {
    const e = new DealOrFeudEngine();
    e.loadBoard(SAMPLE_BOARD);
    SAMPLE_CONTESTANTS.forEach((c) => e.addContestant(c.id, c.name));
    return e;
  }, []);

  const [showState, setShowState] = useState<ShowState>(() => engine.getState());
  const [board, setBoard] = useState<FeudBoard>(() => engine.getActiveBoard() ?? SAMPLE_BOARD);
  const [started, setStarted] = useState(false);
  const [dealResult, setDealResult] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setShowState(engine.getState());
    setBoard(engine.getActiveBoard() ?? SAMPLE_BOARD);
  }, [engine]);

  const handleStart = useCallback(() => {
    engine.startShow();
    setStarted(true);
    refresh();
  }, [engine, refresh]);

  const handleReveal = useCallback((index: number) => {
    engine.revealAnswer(index);
    refresh();
  }, [engine, refresh]);

  const handleDeal = useCallback(() => {
    const result = engine.triggerDeal();
    if (result) {
      setDealResult(`DEAL! Winner: ${result.winnerName} with ${result.score} pts`);
    } else {
      setDealResult('Not enough points to deal yet!');
    }
    refresh();
  }, [engine, refresh]);

  const handleCrowdVote = useCallback((type: 'yay' | 'boo') => {
    engine.recordCrowdVote(type);
    refresh();
  }, [engine, refresh]);

  const activePts = engine.getActiveBoardPoints();
  const dealThreshold = engine.getDealThreshold();
  const dealPct = Math.min(100, Math.round((activePts / dealThreshold) * 100));

  return (
    <ShowRoomEnvironmentShell
      roomId="deal-or-feud"
      lightingMode="performance"
      occupancyPct={0.78}
      showSeating
      showHosts
      showSponsors
    >
      <div style={{ padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Link href="/shows" style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.15em", textDecoration: "none" }}>
            ← SHOWS
          </Link>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800 }}>THE MUSICIAN'S INDEX</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>DEAL OR FEUD 1000</div>
          </div>
          {!started && (
            <button
              type="button"
              onClick={handleStart}
              style={{
                marginLeft: "auto",
                padding: "10px 22px",
                background: "rgba(255,215,0,0.15)",
                border: "1px solid #FFD700",
                borderRadius: 8,
                color: "#FFD700",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.15em",
                cursor: "pointer",
              }}
            >
              START SHOW
            </button>
          )}
        </div>

        {/* Deal result */}
        {dealResult && (
          <div style={{
            padding: "14px 18px",
            marginBottom: 18,
            background: "rgba(255,215,0,0.1)",
            border: "1px solid #FFD700",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            color: "#FFD700",
            letterSpacing: "0.1em",
          }}>
            {dealResult}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Left: Feud board */}
          <div>
            {/* Deal progress bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>DEAL PROGRESS</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: dealPct >= 100 ? "#00FF88" : "#FFD700" }}>
                  {activePts} / {dealThreshold} pts ({dealPct}%)
                </span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${dealPct}%`,
                  background: dealPct >= 100 ? "#00FF88" : "linear-gradient(90deg, #FFD700, #FF9900)",
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* Board category */}
            <div style={{
              background: "rgba(255,215,0,0.07)",
              border: "1px solid rgba(255,215,0,0.25)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>CATEGORY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#FFD700" }}>{board.category}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                {board.totalPoints} total points
              </div>
            </div>

            {/* Answer tiles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {board.answers.map((answer, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: answer.revealed ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${answer.revealed ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: answer.revealed ? "#00FFFF" : "rgba(255,255,255,0.25)",
                      minWidth: 20,
                    }}>
                      #{i + 1}
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: answer.revealed ? 700 : 400,
                      color: answer.revealed ? "#fff" : "rgba(255,255,255,0.3)",
                      letterSpacing: answer.revealed ? "normal" : "0.5em",
                    }}>
                      {answer.revealed ? answer.text : "? ? ? ? ? ?"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {answer.revealed ? (
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#00FFFF" }}>
                        +{answer.points}
                      </span>
                    ) : (
                      started && (
                        <button
                          type="button"
                          onClick={() => handleReveal(i)}
                          style={{
                            padding: "5px 12px",
                            background: "rgba(255,215,0,0.12)",
                            border: "1px solid rgba(255,215,0,0.4)",
                            borderRadius: 6,
                            color: "#FFD700",
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: "0.15em",
                            cursor: "pointer",
                          }}
                        >
                          REVEAL
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Deal button */}
            {started && (
              <button
                type="button"
                onClick={handleDeal}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "14px 0",
                  background: dealPct >= 100 ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${dealPct >= 100 ? "#00FF88" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: 10,
                  color: dealPct >= 100 ? "#00FF88" : "rgba(255,255,255,0.3)",
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  cursor: dealPct >= 100 ? "pointer" : "not-allowed",
                }}
              >
                {dealPct >= 100 ? "TAKE THE DEAL" : `DEAL LOCKED — ${dealPct}%`}
              </button>
            )}
          </div>

          {/* Right: HUD + crowd vote */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ShowRuntimeHUD
              showId="deal-or-feud"
              phase={showState.phase}
              contestants={showState.contestants}
              round={showState.round}
              maxRounds={showState.maxRounds}
              crowdYay={showState.crowdYayCount}
              crowdBoo={showState.crowdBooCount}
              crowdVoteOpen={showState.crowdVoteOpen}
              winner={showState.winner}
              onCrowdVote={handleCrowdVote}
            />

            {started && (
              <div style={{ background: "rgba(3,2,11,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                  LIVE CROWD VOTE
                </div>
                <CrowdVoteBar
                  yayCount={showState.crowdYayCount}
                  booCount={showState.crowdBooCount}
                  open={true}
                  onVote={handleCrowdVote}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ShowRoomEnvironmentShell>
  );
}
