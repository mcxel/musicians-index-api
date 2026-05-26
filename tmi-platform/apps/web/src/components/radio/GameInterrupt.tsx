"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GameQuestion, GameResult } from "@/lib/radio/GameEngine";

interface GameInterruptProps {
  question: GameQuestion | null;
  onAnswer: (choiceIdx: number) => GameResult;
  onExpire: () => void;
}

const ANSWER_LABELS = ["A", "B", "C", "D"];
const TIMEOUT_MS = 30_000;

export default function GameInterrupt({ question, onAnswer, onExpire }: GameInterruptProps) {
  const [result, setResult] = useState<GameResult | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_MS);

  // Reset when question changes
  useEffect(() => {
    setResult(null);
    setSelectedIdx(null);
    setTimeLeft(TIMEOUT_MS);
  }, [question?.id]);

  // Countdown timer
  useEffect(() => {
    if (!question || result) return;
    const tick = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 100) {
          clearInterval(tick);
          onExpire();
          return 0;
        }
        return t - 100;
      });
    }, 100);
    return () => clearInterval(tick);
  }, [question?.id, result, onExpire]);

  // Auto-close 2.2s after answer
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onExpire, 2200);
    return () => clearTimeout(t);
  }, [result, onExpire]);

  function handleChoice(idx: number) {
    if (selectedIdx !== null || !question) return;
    setSelectedIdx(idx);
    const res = onAnswer(idx);
    setResult(res);
  }

  return (
    <AnimatePresence>
      {question && (
        <motion.div
          key={question.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9200,
            background: "rgba(5,5,16,0.88)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              background: "rgba(5,5,16,0.99)",
              border: "1px solid rgba(255,45,170,0.35)",
              boxShadow: "0 0 40px rgba(255,45,170,0.15), 0 24px 60px rgba(0,0,0,0.8)",
              padding: "28px 32px",
              maxWidth: 480,
              width: "100%",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            {/* DJ chip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>🎙️</span>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA" }}>
                DJ NOVA — QUICK QUESTION
              </span>
            </div>

            {/* Countdown bar */}
            <div style={{ background: "rgba(255,255,255,0.08)", height: 2, marginBottom: 20 }}>
              <div style={{
                height: "100%",
                width: `${(timeLeft / TIMEOUT_MS) * 100}%`,
                background: timeLeft < 10_000 ? "#FF2020" : "#FF2DAA",
                transition: "width 0.1s linear, background 0.3s ease",
              }} />
            </div>

            {/* Question */}
            <div style={{
              fontFamily: "'Bebas Neue','Impact',sans-serif",
              fontSize: "clamp(22px,4vw,32px)",
              color: "#fff",
              letterSpacing: "0.04em",
              lineHeight: 1.1,
              marginBottom: 24,
            }}>
              {question.prompt}
            </div>

            {/* Choices */}
            {!result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {question.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontFamily: "'Inter',sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF2DAA";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,45,170,0.08)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                  >
                    <span style={{
                      width: 24, height: 24,
                      background: "rgba(255,45,170,0.15)",
                      border: "1px solid rgba(255,45,170,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 900, color: "#FF2DAA", flexShrink: 0,
                    }}>
                      {ANSWER_LABELS[i]}
                    </span>
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {/* Result reveal */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: "center", padding: "16px 0" }}
              >
                <div style={{
                  fontFamily: "'Bebas Neue','Impact',sans-serif",
                  fontSize: 48,
                  color: result.correct ? "#00C896" : "#FF4040",
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {result.correct ? "✅ CORRECT" : "❌ WRONG"}
                </div>
                {result.xpAwarded > 0 && (
                  <div style={{
                    fontSize: 16, fontWeight: 800,
                    color: "#FFD700",
                    letterSpacing: "0.1em",
                  }}>
                    +{result.xpAwarded} XP
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
