"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ShowRoomEnvironmentShell } from "@/components/environments/ShowRoomEnvironmentShell";
import { ShowRuntimeHUD } from "@/components/shows/ShowRuntimeHUD";
import { NameThatTuneEngine, type TuneChallenge } from "@/lib/shows/NameThatTuneEngine";
import type { ShowState } from "@/lib/shows/ShowRuntimeEngine";

const SAMPLE_CHALLENGES: TuneChallenge[] = [
  { id: 'ch1', title: 'Thriller', artist: 'Michael Jackson', genre: 'Pop', difficulty: 'easy', pointValue: 50, hintUnlocked: false, correctAnswer: 'Thriller' },
  { id: 'ch2', title: 'Lose Yourself', artist: 'Eminem', genre: 'Hip-Hop', difficulty: 'medium', pointValue: 80, hintUnlocked: false, correctAnswer: 'Lose Yourself' },
  { id: 'ch3', title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', difficulty: 'easy', pointValue: 60, hintUnlocked: false, correctAnswer: 'Bohemian Rhapsody' },
  { id: 'ch4', title: 'Alright', artist: 'Kendrick Lamar', genre: 'Hip-Hop', difficulty: 'hard', pointValue: 120, hintUnlocked: false, correctAnswer: 'Alright' },
  { id: 'ch5', title: 'Crazy in Love', artist: 'Beyoncé', genre: 'R&B', difficulty: 'medium', pointValue: 80, hintUnlocked: false, correctAnswer: 'Crazy in Love' },
];

const SAMPLE_CONTESTANTS = [
  { id: 'p1', name: 'Aaliyah M.' },
  { id: 'p2', name: 'Kevin R.' },
  { id: 'p3', name: 'Sofia L.' },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#00FF88',
  medium: '#FFD700',
  hard: '#FF4444',
};

export default function NameThatTunePage() {
  const engine = useMemo(() => {
    const e = new NameThatTuneEngine();
    e.loadChallenges(SAMPLE_CHALLENGES);
    SAMPLE_CONTESTANTS.forEach((c) => e.addContestant(c.id, c.name));
    return e;
  }, []);

  const [showState, setShowState] = useState<ShowState>(() => engine.getState());
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [selectedContestant, setSelectedContestant] = useState(SAMPLE_CONTESTANTS[0].id);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [hintUsed, setHintUsed] = useState(false);

  const refresh = useCallback(() => {
    setShowState(engine.getState());
    setHintUsed(engine.getCurrentChallenge()?.hintUnlocked ?? false);
  }, [engine]);

  const handleStart = useCallback(() => {
    engine.startShow();
    setStarted(true);
    refresh();
  }, [engine, refresh]);

  const handleUnlockHint = useCallback(() => {
    engine.unlockHint();
    setHintUsed(true);
    refresh();
  }, [engine, refresh]);

  const handleSubmit = useCallback(() => {
    if (!answer.trim()) return;
    const correct = engine.submitAnswer(selectedContestant, answer);
    setFeedback({
      correct,
      message: correct ? `Correct! Points awarded.` : `Wrong — the answer was "${engine.getCurrentChallenge()?.correctAnswer}"`,
    });
    setAnswer('');
    if (correct) {
      engine.advanceChallenge();
    }
    refresh();
  }, [engine, answer, selectedContestant, refresh]);

  const handleAdvance = useCallback(() => {
    engine.advanceChallenge();
    setFeedback(null);
    refresh();
  }, [engine, refresh]);

  const currentChallenge = engine.getCurrentChallenge();
  const leaderboard = engine.getLeaderboard();
  const hintText = currentChallenge
    ? `Artist: ${currentChallenge.artist} | Genre: ${currentChallenge.genre}`
    : '';

  return (
    <ShowRoomEnvironmentShell
      roomId="name-that-tune"
      lightingMode="performance"
      occupancyPct={0.65}
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
            <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>THE MUSICIAN'S INDEX</div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>NAME THAT TUNE</div>
          </div>
          {!started && (
            <button
              type="button"
              onClick={handleStart}
              style={{
                marginLeft: "auto",
                padding: "10px 22px",
                background: "rgba(0,255,255,0.12)",
                border: "1px solid #00FFFF",
                borderRadius: 8,
                color: "#00FFFF",
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          {/* Left: Challenge area */}
          <div>
            {/* Feedback banner */}
            {feedback && (
              <div style={{
                padding: "12px 16px",
                marginBottom: 14,
                background: feedback.correct ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)",
                border: `1px solid ${feedback.correct ? "#00FF8866" : "#FF444466"}`,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: feedback.correct ? "#00FF88" : "#FF4444",
              }}>
                {feedback.message}
              </div>
            )}

            {/* Current challenge card */}
            {currentChallenge && started ? (
              <div style={{
                background: "rgba(0,255,255,0.05)",
                border: "1px solid rgba(0,255,255,0.2)",
                borderRadius: 14,
                padding: "22px 24px",
                marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: DIFFICULTY_COLOR[currentChallenge.difficulty] ?? '#fff',
                    border: `1px solid ${DIFFICULTY_COLOR[currentChallenge.difficulty] ?? '#fff'}44`,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}>
                    {currentChallenge.difficulty.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
                    {currentChallenge.genre}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 900, color: "#FFD700" }}>
                    {currentChallenge.pointValue} pts
                  </span>
                </div>

                {/* Music note visual */}
                <div style={{ textAlign: "center", padding: "28px 0", marginBottom: 16 }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎵</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>
                    {hintUsed ? hintText : "IDENTIFY THIS SONG"}
                  </div>
                  {!hintUsed && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                      Hint available (costs half points)
                    </div>
                  )}
                </div>

                {/* Hint button */}
                {!hintUsed && (
                  <button
                    type="button"
                    onClick={handleUnlockHint}
                    style={{
                      marginBottom: 14,
                      width: "100%",
                      padding: "8px 0",
                      background: "rgba(255,215,0,0.06)",
                      border: "1px solid rgba(255,215,0,0.25)",
                      borderRadius: 7,
                      color: "#FFD700",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                    }}
                  >
                    UNLOCK HINT (−50% pts)
                  </button>
                )}

                {/* Contestant selector */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
                    ANSWERING AS
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {SAMPLE_CONTESTANTS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedContestant(c.id)}
                        style={{
                          padding: "5px 12px",
                          background: selectedContestant === c.id ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${selectedContestant === c.id ? "#00FFFF" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: 6,
                          color: selectedContestant === c.id ? "#00FFFF" : "rgba(255,255,255,0.5)",
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Answer input */}
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Enter song title..."
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    style={{
                      padding: "10px 18px",
                      background: "rgba(0,255,255,0.15)",
                      border: "1px solid #00FFFF",
                      borderRadius: 8,
                      color: "#00FFFF",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                    }}
                  >
                    SUBMIT
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdvance}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "7px 0",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 7,
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    cursor: "pointer",
                  }}
                >
                  SKIP CHALLENGE
                </button>
              </div>
            ) : started ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#FFD700", fontSize: 16, fontWeight: 800 }}>
                ALL CHALLENGES COMPLETE!
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                Press START SHOW to begin
              </div>
            )}
          </div>

          {/* Right: Leaderboard + HUD */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Leaderboard */}
            <div style={{ background: "rgba(3,2,11,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>LEADERBOARD</div>
              {leaderboard.map((entry, i) => {
                const contestantName = SAMPLE_CONTESTANTS.find((c) => c.id === entry.contestantId)?.name ?? entry.contestantId;
                return (
                  <div key={entry.contestantId} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    marginBottom: 4,
                    background: i === 0 ? "rgba(255,215,0,0.07)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${i === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: i === 0 ? "#FFD700" : "rgba(255,255,255,0.4)", fontWeight: 700 }}>#{i + 1}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{contestantName}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 900, color: i === 0 ? "#FFD700" : "#00FFFF" }}>
                      {entry.score}
                    </span>
                  </div>
                );
              })}
            </div>

            <ShowRuntimeHUD
              showId="name-that-tune"
              phase={showState.phase}
              contestants={showState.contestants}
              round={showState.round}
              maxRounds={showState.maxRounds}
              crowdYay={showState.crowdYayCount}
              crowdBoo={showState.crowdBooCount}
              crowdVoteOpen={false}
              winner={showState.winner}
              onCrowdVote={() => undefined}
            />
          </div>
        </div>
      </div>
    </ShowRoomEnvironmentShell>
  );
}
