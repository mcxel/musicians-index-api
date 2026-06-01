"use client";

import { useState, useEffect, useRef } from "react";

type Phase = "setup" | "countdown" | "opening" | "done";

const DURATION_OPTIONS = [
  { label: "10 SEC", seconds: 10 },
  { label: "30 SEC", seconds: 30 },
  { label: "1 MIN",  seconds: 60 },
] as const;

const CURTAIN_OPEN_MS = 1800;

const FOLD_COUNT = 6;

interface Props {
  onPerformanceStart?: () => void;
}

export default function VideoPanelCurtain({ onPerformanceStart }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedSeconds, setSelectedSeconds] = useState<10 | 30 | 60>(10);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown() {
    setRemaining(selectedSeconds);
    setPhase("countdown");
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setPhase("opening");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "opening") return;
    const t = setTimeout(() => {
      setPhase("done");
      onPerformanceStart?.();
    }, CURTAIN_OPEN_MS);
    return () => clearTimeout(t);
  }, [phase, onPerformanceStart]);

  if (phase === "done") return null;

  const isOpening = phase === "opening";
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const countdownColor = remaining <= 5 ? "#FF2DAA" : "#FFD700";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, overflow: "hidden" }}>
      <style>{`
        @keyframes vpcOpenLeft  { to { transform: perspective(900px) rotateY(-55deg) translateX(-100%); } }
        @keyframes vpcOpenRight { to { transform: perspective(900px) rotateY(55deg)  translateX(100%);  } }
        @keyframes vpcGoldPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes vpcNumPop    { 0%{transform:scale(1.4);opacity:0} 25%{transform:scale(1);opacity:1} 80%{opacity:1} 100%{transform:scale(0.92);opacity:0} }
      `}</style>

      {/* ── LEFT CURTAIN PANEL ────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
        background: "linear-gradient(180deg,#1a0005 0%,#2d0009 30%,#1a0005 60%,#0d0003 100%)",
        transformOrigin: "left center",
        animation: isOpening ? `vpcOpenLeft ${CURTAIN_OPEN_MS}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards` : undefined,
        boxShadow: "inset -6px 0 18px rgba(0,0,0,0.5)",
      }}>
        {Array.from({ length: FOLD_COUNT }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${(i + 1) * (100 / (FOLD_COUNT + 1))}%`,
            width: 1.5, background: "rgba(0,0,0,0.3)",
            boxShadow: "1px 0 3px rgba(255,255,255,0.03)",
          }} />
        ))}
        <div style={{
          position: "absolute", top: 0, bottom: 0, right: 0, width: 5,
          background: "linear-gradient(180deg,#FFD700,#b8860b,#FFD700,#b8860b)",
          animation: "vpcGoldPulse 2s ease-in-out infinite",
        }} />
      </div>

      {/* ── RIGHT CURTAIN PANEL ───────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
        background: "linear-gradient(180deg,#1a0005 0%,#2d0009 30%,#1a0005 60%,#0d0003 100%)",
        transformOrigin: "right center",
        animation: isOpening ? `vpcOpenRight ${CURTAIN_OPEN_MS}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards` : undefined,
        boxShadow: "inset 6px 0 18px rgba(0,0,0,0.5)",
      }}>
        {Array.from({ length: FOLD_COUNT }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${(i + 1) * (100 / (FOLD_COUNT + 1))}%`,
            width: 1.5, background: "rgba(0,0,0,0.3)",
            boxShadow: "1px 0 3px rgba(255,255,255,0.03)",
          }} />
        ))}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: 5,
          background: "linear-gradient(180deg,#FFD700,#b8860b,#FFD700,#b8860b)",
          animation: "vpcGoldPulse 2s ease-in-out infinite",
        }} />
      </div>

      {/* ── TOP VALANCE ──────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 32, zIndex: 2,
        background: "linear-gradient(180deg,#0d0003,#1a0005)",
        borderBottom: "2px solid #b8860b",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2,
          background: "linear-gradient(90deg,transparent,#FFD700,transparent)",
        }} />
      </div>

      {/* ── SETUP PHASE: duration picker ─────────────────────── */}
      {phase === "setup" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 14, padding: "0 16px",
        }}>
          {/* TMI brand mark */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, letterSpacing: "0.5em", color: "rgba(255,215,0,0.55)", fontWeight: 800, marginBottom: 4 }}>
              THE MUSICIAN'S INDEX
            </div>
            <div style={{
              fontSize: "clamp(13px,3vw,20px)", fontWeight: 900, letterSpacing: "0.04em",
              background: "linear-gradient(135deg,#FFD700,#FF2DAA)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              YOUR STAGE AWAITS
            </div>
          </div>

          <div style={{ width: 60, height: 1, background: "rgba(255,215,0,0.25)" }} />

          {/* Duration label */}
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.22em", fontWeight: 700 }}>
            SET COUNTDOWN TIMER
          </div>

          {/* Duration buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {DURATION_OPTIONS.map(({ label, seconds }) => (
              <button
                key={seconds}
                onClick={() => setSelectedSeconds(seconds as 10 | 30 | 60)}
                style={{
                  padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: selectedSeconds === seconds ? "#FFD700" : "rgba(255,255,255,0.07)",
                  color: selectedSeconds === seconds ? "#000" : "rgba(255,255,255,0.55)",
                  fontWeight: 900, fontSize: 10, letterSpacing: "0.1em",
                  transition: "all 0.15s",
                  boxShadow: selectedSeconds === seconds ? "0 0 12px rgba(255,215,0,0.4)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={startCountdown}
            style={{
              padding: "10px 26px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "linear-gradient(90deg,#FF2DAA,#AA2DFF)",
              color: "#fff", fontWeight: 900, fontSize: 10, letterSpacing: "0.14em",
              boxShadow: "0 0 18px rgba(255,45,170,0.4)",
            }}
          >
            START COUNTDOWN →
          </button>
        </div>
      )}

      {/* ── COUNTDOWN PHASE ──────────────────────────────────── */}
      {phase === "countdown" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.35)",
        }}>
          <div style={{ fontSize: 7, letterSpacing: "0.4em", color: "rgba(255,215,0,0.55)", fontWeight: 800, marginBottom: 6 }}>
            PERFORMING IN
          </div>
          <div
            key={remaining}
            style={{
              fontSize: "clamp(52px,11vw,90px)", fontWeight: 900,
              color: countdownColor, fontFamily: "'Inter',sans-serif",
              letterSpacing: "-0.04em",
              animation: "vpcNumPop 1s ease-out forwards",
              textShadow: `0 0 36px ${countdownColor}`,
            }}
          >
            {remaining}
          </div>
          {selectedSeconds === 60 && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4, fontFamily: "monospace" }}>
              {mm}:{ss}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
