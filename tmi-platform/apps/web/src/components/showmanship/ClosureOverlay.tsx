"use client";

import { useEffect, useState } from "react";
import { getClosureEngine, type ClosureSequenceState, type ClosurePhase } from "@/lib/showmanship/ClosureSequenceEngine";

let cssInjected = false;
const CSS = `
@keyframes closureLockIn {
  0%   { opacity: 0; letter-spacing: 0.6em; }
  40%  { opacity: 1; letter-spacing: 0.25em; }
  100% { opacity: 1; letter-spacing: 0.25em; }
}
@keyframes closureFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes closureRewardSlide {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes closureForeshadow {
  0%   { opacity: 0; transform: translateX(-8px); }
  30%  { opacity: 1; transform: translateX(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes closureVignetteFade {
  from { opacity: 0.45; }
  to   { opacity: 0; }
}
`;

const PHASE_VISIBLE: ClosurePhase[] = ["lock", "reward", "fade", "foreshadow"];

export default function ClosureOverlay() {
  const [state, setState] = useState<ClosureSequenceState | null>(null);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    const engine = getClosureEngine();
    const unsub = engine.onStateChange(s => setState(s.phase === "idle" ? null : s));
    return unsub;
  }, []);

  if (!state || !PHASE_VISIBLE.includes(state.phase)) return null;

  return (
    <>
      {/* Vignette — tightens during lock, fades during fade phase */}
      <div
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 9600, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
          animation: state.phase === "fade" ? "closureVignetteFade 3.5s ease-out forwards" : undefined,
          opacity: state.phase === "lock" || state.phase === "reward" ? 0.45 : undefined,
          transition: "opacity 1.2s ease",
        }}
      />

      {/* LOCK phase — center lock message */}
      {state.phase === "lock" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9700,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: "clamp(18px, 3.5vw, 32px)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            animation: "closureLockIn 1.8s ease-out forwards",
            textShadow: "0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.2)",
          }}>
            {state.lockMessage}
          </div>
        </div>
      )}

      {/* REWARD phase — top-of-screen contributor callouts */}
      {state.phase === "reward" && state.rewardLines.length > 0 && (
        <div style={{
          position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
          zIndex: 9700, display: "flex", flexDirection: "column", gap: 8,
          alignItems: "center", pointerEvents: "none",
        }}>
          {state.rewardLines.slice(0, 3).map((r, i) => (
            <div
              key={r.userId}
              style={{
                background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,215,0,0.3)", borderRadius: 24,
                padding: "8px 20px", fontSize: 12, fontWeight: 900,
                color: "#ffd700", letterSpacing: "0.08em",
                animation: `closureRewardSlide 0.5s ${i * 0.15}s ease-out both`,
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span>{r.label}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                +{r.xp} XP
              </span>
            </div>
          ))}
        </div>
      )}

      {/* FORESHADOW phase — single low-opacity line, bottom-center */}
      {state.phase === "foreshadow" && (
        <div style={{
          position: "fixed", bottom: "12%", left: "50%", transform: "translateX(-50%)",
          zIndex: 9700, pointerEvents: "none", textAlign: "center",
        }}>
          <div style={{
            fontSize: "clamp(11px, 1.8vw, 15px)",
            fontWeight: 800, color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.18em", textTransform: "lowercase",
            animation: `closureForeshadow ${4}s ease-out forwards`,
          }}>
            {state.foreshadowLine}
          </div>
        </div>
      )}
    </>
  );
}
