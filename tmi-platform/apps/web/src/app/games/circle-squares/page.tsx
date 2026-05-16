"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { circleAndSquaresEngine } from "@/lib/games/CircleAndSquaresEngine";
import type { GameState, Question } from "@/lib/games/CircleAndSquaresEngine";

const QUESTION_POOL: Omit<Question, "cellIndex">[] = [
  { id: "q1", text: "True or False: TMI has over 300 app routes.", mode: "true-false", options: ["True", "False"], correctIndex: 0 },
  { id: "q2", text: "Which genre hosts the Monday Night Cypher?", mode: "multiple-choice", options: ["EDM", "Hip-Hop", "Afrobeats", "Drill"], correctIndex: 1 },
  { id: "q3", text: "True or False: Crown Points determine qualifier entry.", mode: "true-false", options: ["True", "False"], correctIndex: 0 },
  { id: "q4", text: "What type of show is Dirty Dozens?", mode: "multiple-choice", options: ["Dance battle", "Bar battle", "Trivia", "Singing contest"], correctIndex: 1 },
  { id: "q5", text: "True or False: Venues have seating grids.", mode: "true-false", options: ["True", "False"], correctIndex: 0 },
  { id: "q6", text: "What does the Fan Club unlock for artists?", mode: "multiple-choice", options: ["Free tickets", "Revenue stream", "Admin access", "Bot control"], correctIndex: 1 },
  { id: "q7", text: "True or False: Sponsors can purchase ad slots in the Magazine.", mode: "true-false", options: ["True", "False"], correctIndex: 0 },
  { id: "q8", text: "Name That Tune gives players how many seconds per clip?", mode: "multiple-choice", options: ["5 seconds", "10 seconds", "30 seconds", "60 seconds"], correctIndex: 1 },
  { id: "q9", text: "True or False: Wallet credits can be used to tip performers.", mode: "true-false", options: ["True", "False"], correctIndex: 0 },
];

const CELL_LABELS = ["TL", "TC", "TR", "ML", "MC", "MR", "BL", "BC", "BR"];

function CellView({ owner, label, isWin, isActive }: { owner: "X" | "O" | null; label: string; isWin: boolean; isActive: boolean }) {
  const bg = isWin ? "rgba(255,215,0,0.15)" : isActive ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)";
  const border = isWin ? "2px solid #FFD700" : isActive ? "1px solid rgba(0,255,255,0.4)" : "1px solid rgba(170,45,255,0.2)";
  return (
    <div style={{ borderRadius: 10, border, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", aspectRatio: "1", padding: 4 }}>
      {owner === "X" ? (
        <span style={{ fontSize: 28, fontWeight: 900, color: "#00FFFF" }}>×</span>
      ) : owner === "O" ? (
        <span style={{ fontSize: 24, fontWeight: 900, color: "#FF2DAA" }}>○</span>
      ) : (
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{label}</span>
      )}
    </div>
  );
}

let _qIdx = 0;
function nextQuestion(cellIndex: number): Question {
  const q = QUESTION_POOL[_qIdx % QUESTION_POOL.length];
  _qIdx++;
  return { ...q, cellIndex };
}

export default function CircleSquaresPage() {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  const [gs, setGs] = useState<GameState>(() => circleAndSquaresEngine.getState());
  const [feedback, setFeedback] = useState<string>("");
  const [crowdHint, setCrowdHint] = useState<number | null>(null);

  useEffect(() => {
    return circleAndSquaresEngine.onChange((s) => setGs({ ...s }));
  }, []);

  function startGame() {
    circleAndSquaresEngine.registerPlayers(
      { id: "px", name: "Player X" },
      { id: "po", name: "Player O" },
    );
    setFeedback("");
    setCrowdHint(null);
    if (circleAndSquaresEngine.getState().phase === "question") {
      const freeCell = circleAndSquaresEngine.getState().board.findIndex((c) => c === null);
      if (freeCell >= 0) circleAndSquaresEngine.askQuestion(nextQuestion(freeCell));
    }
  }

  function answer(idx: number) {
    const result = circleAndSquaresEngine.submitAnswer(gs.currentPlayer, idx);
    setFeedback(result === "correct" ? "✓ Correct!" : "✗ Wrong — turn passes");
    setCrowdHint(null);
    setTimeout(() => {
      setFeedback("");
      const s = circleAndSquaresEngine.getState();
      if (s.phase === "question") {
        const freeCell = s.board.findIndex((c) => c === null);
        if (freeCell >= 0) circleAndSquaresEngine.askQuestion(nextQuestion(freeCell));
      }
    }, 1500);
  }

  function useCrowdAssist() {
    const hint = circleAndSquaresEngine.useCrowdAssist();
    setCrowdHint(hint);
  }

  const q = gs.currentQuestion;
  const currentMark = gs.currentPlayer;
  const currentName = currentMark === "X" ? (gs.playerX?.name ?? "Player X") : (gs.playerO?.name ?? "Player O");
  const currentColor = currentMark === "X" ? "#00FFFF" : "#FF2DAA";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/games" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.2em" }}>← GAMES</Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800 }}>TMI GAMES</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: 2 }}>CIRCLE & SQUARES</h1>
        </div>
        {gs.phase !== "lobby" && (
          <div style={{ display: "flex", gap: 14, fontSize: 11, alignItems: "center" }}>
            <span style={{ color: "#00FFFF", fontWeight: 800 }}>X: {gs.playerX?.wins ?? 0}W</span>
            <span style={{ color: "#FF2DAA", fontWeight: 800 }}>O: {gs.playerO?.wins ?? 0}W</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>

        {/* Game board + question */}
        <div>
          {gs.phase === "lobby" && (
            <div style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⭕</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.8, marginBottom: 28 }}>
                X/O grid game. Answer questions to claim squares. 3-in-a-row wins. Crowd Assist available once per game.
              </p>
              <button onClick={startGame} style={{ padding: "13px 32px", background: "#AA2DFF", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}>
                START GAME →
              </button>
            </div>
          )}

          {gs.phase !== "lobby" && (
            <>
              {/* Board */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
                {gs.board.map((owner, i) => (
                  <CellView key={i} owner={owner} label={CELL_LABELS[i]}
                    isWin={gs.winLine?.includes(i) ?? false}
                    isActive={q?.cellIndex === i} />
                ))}
              </div>

              {/* Question card */}
              {q && gs.phase === "answer" && (
                <div style={{ border: "1px solid rgba(170,45,255,0.3)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: "rgba(170,45,255,0.08)", borderBottom: "1px solid rgba(170,45,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: currentColor, letterSpacing: "0.15em" }}>
                      {currentName}'s turn ({currentMark})
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                      {q.mode === "true-false" ? "TRUE / FALSE" : "PICK ONE"}
                    </span>
                  </div>
                  <div style={{ padding: "18px 14px" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6, marginBottom: 14, color: "#fff" }}>{q.text}</p>
                    <div style={{ display: "grid", gridTemplateColumns: q.mode === "true-false" ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
                      {q.options.map((opt, i) => {
                        const isHint = crowdHint === i;
                        return (
                          <button key={i} onClick={() => answer(i)}
                            style={{ padding: "12px 10px", background: isHint ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)", border: isHint ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: isHint ? "#FFD700" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {isHint ? "★ " : ""}{opt}
                          </button>
                        );
                      })}
                    </div>
                    {feedback && (
                      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: feedback.startsWith("✓") ? "#00FF88" : "#FF2DAA" }}>{feedback}</div>
                    )}
                    {!gs.crowdAssistUsed && !crowdHint && (
                      <button onClick={useCrowdAssist} style={{ marginTop: 14, fontSize: 9, fontWeight: 700, color: "#FFD700", background: "transparent", border: "1px solid #FFD70040", borderRadius: 5, padding: "5px 12px", cursor: "pointer", letterSpacing: "0.1em" }}>
                        USE CROWD ASSIST
                      </button>
                    )}
                    {gs.crowdAssistUsed && !crowdHint && (
                      <div style={{ marginTop: 10, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Crowd assist used this game</div>
                    )}
                  </div>
                </div>
              )}

              {gs.phase === "question" && !q && (
                <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Loading next question…</div>
              )}

              {gs.phase === "ended" && (
                <div style={{ textAlign: "center", padding: "28px 20px", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 12, background: "rgba(255,215,0,0.04)" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{gs.winner === "draw" ? "🤝" : "🏆"}</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>GAME OVER</div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>
                    {gs.winner === "draw" ? "DRAW" : gs.winner === "X" ? `${gs.playerX?.name ?? "X"} wins!` : `${gs.playerO?.name ?? "O"} wins!`}
                  </div>
                  <button onClick={startGame} style={{ padding: "11px 28px", background: "#AA2DFF", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
                    PLAY AGAIN
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar info */}
        <div>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>HOW TO PLAY</div>
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { mark: "×", color: "#00FFFF", text: "Player X answers first" },
                { mark: "○", color: "#FF2DAA", text: "Player O on wrong answer" },
                { mark: "★", color: "#FFD700", text: "Crowd Assist reveals answer" },
                { mark: "3", color: "#AA2DFF", text: "3-in-a-row wins" },
              ].map(({ mark, color, text }) => (
                <div key={mark} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}15`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color, flexShrink: 0 }}>{mark}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "14px", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 10, background: "rgba(170,45,255,0.05)" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#AA2DFF", fontWeight: 800, marginBottom: 6 }}>SPONSOR SLOTS</div>
            {["TL", "TR", "BL", "BR", "MC", "sidebar"].map((slot) => (
              <div key={slot} style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{slot}: available</div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
