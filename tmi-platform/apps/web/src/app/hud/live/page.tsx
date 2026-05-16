"use client";

import React, { useEffect, useMemo, useState } from "react";
import { liveHUDStateEngine } from "@/lib/hud/LiveHUDStateEngine";
import { LiveScoreBoard } from "@/components/shows/LiveScoreBoard";
import { LiveVotingHUD } from "@/components/shows/LiveVotingHUD";

const SHOW_ID = "hud-demo-show-1";

export default function LiveHudPage() {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState(() =>
    liveHUDStateEngine.init(SHOW_ID, "TMI Live HUD Wiring Demo"),
  );

  useEffect(() => {
    const unsubscribe = liveHUDStateEngine.onState((newState) => {
      if (newState.showId === SHOW_ID) setState({ ...newState });
    });

    const interval = setInterval(() => setTick((prev) => prev + 1), 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    liveHUDStateEngine.setAudienceCount(SHOW_ID, 120 + (tick % 6) * 19);
    liveHUDStateEngine.setScores(SHOW_ID, [
      { contestantId: "c-1", contestantName: "Nova", score: 92 + (tick % 3), rank: 1 },
      { contestantId: "c-2", contestantName: "Flux", score: 88 + (tick % 2), rank: 2 },
      { contestantId: "c-3", contestantName: "Tide", score: 84 + (tick % 4), rank: 3 },
    ]);

    const open = tick % 2 === 0;
    liveHUDStateEngine.setVoting(SHOW_ID, {
      open,
      prompt: "Who wins this round?",
      choices: [
        { key: "Nova", value: 140 + tick * 3, percentage: 52.4 },
        { key: "Flux", value: 95 + tick * 2, percentage: 35.6 },
        { key: "Tide", value: 32 + tick, percentage: 12.0 },
      ],
    });

    if (tick % 5 === 0 && tick > 0) {
      liveHUDStateEngine.setElimination(SHOW_ID, {
        active: true,
        contestantId: "c-3",
        contestantName: "Tide",
        reason: "lowest_score",
        broadcastLine: "Tide leaves the stage this round.",
      });
      liveHUDStateEngine.setPhase(SHOW_ID, "elimination");
    } else {
      liveHUDStateEngine.clearElimination(SHOW_ID);
      liveHUDStateEngine.setPhase(SHOW_ID, open ? "voting" : "performance");
    }
  }, [tick]);

  const tally = useMemo(() => {
    const totalVotes = state.voting.choices.reduce((sum, item) => sum + item.value, 0);
    const results = state.voting.choices.reduce<Record<string, number>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    const percentages = state.voting.choices.reduce<Record<string, number>>((acc, item) => {
      acc[item.key] = item.percentage;
      return acc;
    }, {});
    const leadingChoice = state.voting.choices.length > 0
      ? [...state.voting.choices].sort((a, b) => b.value - a.value)[0].key
      : null;

    return {
      sessionId: `${SHOW_ID}-vote`,
      prompt: state.voting.prompt,
      results,
      totalVotes,
      leadingChoice,
      percentages,
    };
  }, [state.voting]);

  return (
    <main style={{ minHeight: "100vh", background: "#030712", color: "#e2e8f0", padding: 20 }}>
      <h1 style={{ marginTop: 0, marginBottom: 8 }}>Live HUD Wiring</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>
        Audience: {state.audienceCount} | Phase: {state.phase} | Updated: {new Date(state.updatedAtMs).toLocaleTimeString()}
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        <LiveScoreBoard
          scores={state.scores.map((score) => ({
            contestantId: score.contestantId,
            contestantName: score.contestantName,
            judgeTotal: score.score,
            crowdVoteTotal: score.score,
            hostMarkTotal: score.score,
            bonusTotal: 0,
            penaltyTotal: 0,
            compositeScore: score.score,
            rank: score.rank,
            entries: [],
          }))}
          showTitle={state.showTitle}
          phase={state.phase}
          highlightWinnerId={state.scores[0]?.contestantId}
        />

        <LiveVotingHUD tally={tally} isOpen={state.voting.open} prompt={state.voting.prompt} />
      </div>
    </main>
  );
}
