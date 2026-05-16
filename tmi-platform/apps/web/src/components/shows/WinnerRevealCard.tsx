"use client";
import React, { useEffect, useState } from "react";
import type { CeremonyEvent } from "@/lib/shows/WinnerCeremonyEngine";

interface WinnerRevealCardProps {
  winnerName: string;
  showTitle: string;
  score: number;
  prizeCount: number;
  currentCeremonyPhase: CeremonyEvent | null;
  confettiActive: boolean;
}

const CONFETTI_CHARS = ["🎉", "✨", "🏆", "⭐", "🎊", "👑", "💫", "🌟"];

function ConfettiPiece({ idx }: { idx: number }) {
  const char = CONFETTI_CHARS[idx % CONFETTI_CHARS.length];
  const left = ((idx * 137.5) % 100).toFixed(0);
  const delay = (idx * 0.15).toFixed(2);
  const dur = (2 + (idx % 3) * 0.5).toFixed(1);

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: "-20px",
        fontSize: 14 + (idx % 3) * 6,
        animation: `confettiFall ${dur}s ease-in ${delay}s infinite`,
        pointerEvents: "none",
      }}
    >
      {char}
    </div>
  );
}

export function WinnerRevealCard({
  winnerName,
  showTitle,
  score,
  prizeCount,
  currentCeremonyPhase,
  confettiActive,
}: WinnerRevealCardProps) {
  const [beatPulse, setBeatPulse] = useState(false);

  useEffect(() => {
    if (currentCeremonyPhase?.phase === "drumroll") {
      const interval = setInterval(() => setBeatPulse((v) => !v), 200);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [currentCeremonyPhase?.phase]);

  const isReveal = currentCeremonyPhase?.phase === "reveal" || currentCeremonyPhase?.phase === "celebration";

  return (
    <div
      style={{
        position: "relative",
        background: "rgba(2,6,23,0.97)",
        border: "2px solid rgba(255,215,0,0.5)",
        borderRadius: 24,
        padding: "48px 56px",
        textAlign: "center",
        maxWidth: 500,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        overflow: "hidden",
        boxShadow: isReveal
          ? "0 0 80px rgba(255,215,0,0.4), 0 0 160px rgba(255,215,0,0.15)"
          : "0 0 40px rgba(255,215,0,0.1)",
        transition: "box-shadow 0.5s ease",
        transform: beatPulse ? "scale(1.01)" : "scale(1)",
        transition2: "transform 0.1s ease",
      } as React.CSSProperties}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes crownBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Confetti */}
      {confettiActive && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {Array.from({ length: 16 }, (_, i) => <ConfettiPiece key={i} idx={i} />)}
        </div>
      )}

      {/* Crown */}
      <div
        style={{
          fontSize: 64,
          animation: isReveal ? "crownBounce 1s ease infinite" : "none",
          marginBottom: 16,
          lineHeight: 1,
        }}
      >
        👑
      </div>

      {/* Phase announcement */}
      {currentCeremonyPhase && (
        <div
          style={{
            fontSize: 14,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#ffd700",
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          {currentCeremonyPhase.announcementLine}
        </div>
      )}

      {/* Winner name — hidden until reveal */}
      {isReveal ? (
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            backgroundImage: "linear-gradient(90deg, #ffd700, #00ffff, #ffd700)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 2s linear infinite",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          {winnerName}
        </div>
      ) : (
        <div style={{ fontSize: 24, color: "#475569", marginBottom: 16 }}>???</div>
      )}

      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>{showTitle}</div>

      {isReveal && (
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16, fontSize: 13 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#00ffff" }}>{score.toFixed(1)}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Final Score</div>
          </div>
          <div style={{ width: 1, background: "rgba(51,65,85,0.5)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#00ff88" }}>{prizeCount}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Prizes Won</div>
          </div>
        </div>
      )}
    </div>
  );
}
