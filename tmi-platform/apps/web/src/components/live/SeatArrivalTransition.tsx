"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSeatArrivalTransition, type ArrivalPhase } from "@/hooks/useSeatArrivalTransition";
import { SpotlightEventManager } from "@/lib/engine/SpotlightEventManager";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";
import { computeWarpAdapt } from "@/lib/live/WarpAdaptEngine";

// ── Deterministic star geometry (no Math.random in render) ──────────────────

const STAR_COUNT   = 56;
const STREAK_COUNT = 9;
const ARRIVAL_EMOTES = ["⚡", "🎧", "🔥", "❤️", "✨"];

interface Star   { angle: number; dist: number; size: number; dur: number; delay: number }
interface Streak { angle: number; len: number; opacity: number; dur: number }

function buildStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    const t = i / STAR_COUNT;
    return {
      angle: t * 360,
      dist:  40 + ((i * 17) % 40),
      size:  1 + (i % 3),
      dur:   0.9 + ((i * 13) % 10) / 10,
      delay: ((i * 7) % 20) / 100,
    };
  });
}

function buildStreaks(): Streak[] {
  return Array.from({ length: STREAK_COUNT }, (_, i) => ({
    angle:   (i / STREAK_COUNT) * 360,
    len:     44 + (i * 8) % 36,
    opacity: 0.5 + (i % 3) * 0.15,
    dur:     0.7 + (i % 4) * 0.12,
  }));
}

// ── Magazine fly variants ────────────────────────────────────────────────────

type FlyVariant = "slash" | "flyby" | "orbit" | "drop";
const FLY_VARIANTS: FlyVariant[] = ["slash", "flyby", "orbit", "drop"];

const MAG_ANIM: Record<FlyVariant, string> = {
  slash: "magFlySlash",
  flyby: "magFlyFlyby",
  orbit: "magFlyOrbit",
  drop:  "magFlyDrop",
};

function MagazineFly({ variant }: { variant: FlyVariant }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        top: "45%",
        fontSize: "clamp(14px, 3.2vw, 36px)",
        fontWeight: 900,
        letterSpacing: "0.22em",
        color: "#FFD700",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        textShadow: "0 0 18px rgba(255,215,0,0.95), 0 0 50px rgba(255,0,140,0.5), 0 0 80px rgba(0,255,255,0.2)",
        animation: `${MAG_ANIM[variant]} 0.95s ease-out forwards`,
        willChange: "transform, opacity",
        zIndex: 2,
      }}
    >
      THE MUSICIAN INDEX
    </div>
  );
}

// ── All keyframes ────────────────────────────────────────────────────────────

const CSS = `
@keyframes starDrive {
  0%   { opacity: 0;   transform: translate(-50%, -50%) scale(0.05) translateZ(0); }
  8%   { opacity: 1; }
  90%  { opacity: 0.8; }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(1) translateZ(0); }
}
@keyframes streakDrive {
  0%   { opacity: 0;   transform: rotate(var(--sa)) scaleX(0) translateZ(0); }
  15%  { opacity: var(--so); }
  85%  { opacity: var(--so); }
  100% { opacity: 0;   transform: rotate(var(--sa)) scaleX(1) translateZ(0); }
}
@keyframes seatGlow {
  0%   { transform: scale(0.6) translateZ(0); opacity: 0; }
  40%  { opacity: 1; }
  100% { transform: scale(1.35) translateZ(0); opacity: 0; }
}
@keyframes arrivalText {
  0%   { opacity: 0; transform: translateY(6px) translateZ(0); }
  20%  { opacity: 1; transform: translateY(0) translateZ(0); }
  70%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes emoteFloat {
  0%   { opacity: 0; transform: translateY(0) scale(0.8) translateZ(0); }
  15%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-60px) scale(1.1) translateZ(0); }
}
@keyframes reducedPulse {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes arrivalFlash {
  0%   { opacity: 0; }
  35%  { opacity: 0.22; }
  100% { opacity: 0; }
}

/* ── Magazine fly variants ── */
@keyframes magFlySlash {
  0%   { transform: translate(calc(-50% - 90vw), calc(-50% - 90vh)) rotate(-25deg); opacity: 0; }
  18%  { opacity: 1; }
  78%  { opacity: 1; }
  100% { transform: translate(calc(-50% + 90vw), calc(-50% + 90vh)) rotate(-10deg); opacity: 0; }
}
@keyframes magFlyFlyby {
  0%   { transform: translate(-50%, -50%) scale(0.06); opacity: 0; }
  12%  { opacity: 1; }
  55%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
}
@keyframes magFlyOrbit {
  0%   { transform: translate(calc(-50% - 65vw), calc(-50% + 45vh)) rotate(-22deg); opacity: 0; }
  22%  { opacity: 1; }
  75%  { opacity: 1; }
  100% { transform: translate(calc(-50% + 65vw), calc(-50% - 45vh)) rotate(12deg); opacity: 0; }
}
@keyframes magFlyDrop {
  0%   { transform: translate(-50%, calc(-50% - 90vh)) rotate(0deg) scale(1.15); opacity: 0; }
  18%  { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
  68%  { opacity: 1; transform: translate(-50%, -50%) rotate(4deg) scale(1.04); }
  100% { transform: translate(-50%, calc(-50% + 90vh)) rotate(0deg) scale(0.88); opacity: 0; }
}
`;

// ── Reduced-motion fallback ──────────────────────────────────────────────────

function ReducedFallback({ phase }: { phase: ArrivalPhase }) {
  const done = phase === "seated";
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "#050510",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        border: "2px solid #00FFFF",
        boxShadow: "0 0 24px #00FFFF, 0 0 48px rgba(0,255,255,0.3)",
        animation: "reducedPulse 1.2s ease-in-out forwards",
      }} />
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SeatArrivalTransition() {
  const { phase, isActive } = useSeatArrivalTransition();
  const stars   = useMemo(buildStars,   []);
  const streaks = useMemo(buildStreaks, []);

  const [magVariant,  setMagVariant]  = useState<FlyVariant>("slash");
  const [showMagFly,  setShowMagFly]  = useState(false);
  const magShown = useRef(false);

  const isLanding = phase === "landing";
  const isFlying  = phase === "flying";
  const isPausing = phase === "pausing";
  const isSeated  = phase === "seated";

  // Warp entry log — start on mount, track each phase transition
  useEffect(() => {
    WarpEntryLog.start();
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__tmiWarpLog = WarpEntryLog;
    }
  }, []);

  useEffect(() => {
    if (phase === "pausing") WarpEntryLog.markPhaseEnd("flying");
    if (phase === "landing") WarpEntryLog.markPhaseEnd("pausing");
    if (phase === "seated") {
      WarpEntryLog.markPhaseEnd("landing");
      WarpEntryLog.markSeated();
      WarpEntryLog.commit();
      // Adaptive settle window — shortens if users engage quickly, extends if slow
      const { settleWindowMs } = computeWarpAdapt(WarpEntryLog.getAll());
      SpotlightEventManager.lockUntil(settleWindowMs);
    }
  }, [phase]);

  // Trigger the magazine fly once per warp, ~600ms into the flying phase
  useEffect(() => {
    if (phase !== "flying" || magShown.current) return;
    const v = FLY_VARIANTS[Math.floor(Math.random() * FLY_VARIANTS.length)] ?? "slash";
    setMagVariant(v);
    const t1 = setTimeout(() => {
      setShowMagFly(true);
      magShown.current = true;
      const t2 = setTimeout(() => setShowMagFly(false), 1050);
      return () => clearTimeout(t2);
    }, 600);
    return () => clearTimeout(t1);
  }, [phase]);

  if (phase === "reduced") return <ReducedFallback phase="reduced" />;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="seat-arrival"
          initial={{ opacity: 1 }}
          animate={{ opacity: isSeated ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          aria-hidden
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "radial-gradient(ellipse at center, #0a0520 0%, #050510 60%, #000 100%)",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <style>{CSS}</style>

          {/* ── Void pause — deep black, no stars ── */}
          {isPausing && (
            <div style={{ position: "absolute", inset: 0, background: "#000" }} />
          )}

          {/* ── Arrival flash — fires at start of landing ── */}
          {isLanding && (
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0,
                background: "#fff",
                animation: "arrivalFlash 0.38s ease-out forwards",
                willChange: "opacity",
                pointerEvents: "none",
              }}
            />
          )}

          {/* ── Stars ── */}
          {isFlying && stars.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const cx  = 50 + Math.cos(rad) * s.dist;
            const cy  = 50 + Math.sin(rad) * s.dist;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${cx}%`, top: `${cy}%`,
                  width: s.size, height: s.size,
                  borderRadius: "50%",
                  background: i % 5 === 0 ? "#FFD700" : i % 3 === 0 ? "#FF2DAA" : "#fff",
                  willChange: "transform, opacity",
                  animation: `starDrive ${s.dur}s ${s.delay}s linear infinite`,
                }}
              />
            );
          })}

          {/* ── Streaks ── */}
          {isFlying && streaks.map((sk, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%", top: "50%",
                width: `${sk.len}%`, height: 1,
                transformOrigin: "left center",
                background: i % 3 === 0
                  ? "linear-gradient(90deg, transparent, #00FFFF)"
                  : i % 3 === 1
                  ? "linear-gradient(90deg, transparent, #FFD700)"
                  : "linear-gradient(90deg, transparent, #AA2DFF)",
                willChange: "transform, opacity",
                // @ts-expect-error custom properties
                "--sa": `${sk.angle}deg`,
                "--so": sk.opacity,
                animation: `streakDrive ${sk.dur}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* ── Magazine fly brand moment ── */}
          {showMagFly && <MagazineFly variant={magVariant} />}

          {/* ── Center TMI glow ── */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8,
            zIndex: 1,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 900, letterSpacing: "0.4em",
              color: isLanding ? "#FFD700" : "rgba(0,255,255,0.7)",
              textTransform: "uppercase",
              textShadow: isLanding
                ? "0 0 20px #FFD700, 0 0 40px rgba(255,215,0,0.5)"
                : "0 0 12px rgba(0,255,255,0.5)",
              transition: "color 0.4s ease, text-shadow 0.4s ease",
            }}>
              TMI
            </div>
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: isLanding ? "#FFD700" : "#00FFFF",
              boxShadow: isLanding
                ? "0 0 12px #FFD700, 0 0 24px rgba(255,215,0,0.4)"
                : "0 0 8px #00FFFF",
              transition: "all 0.4s ease",
            }} />
          </div>

          {/* ── Seat destination glow (landing phase) ── */}
          {isLanding && (
            <div style={{
              position: "absolute", left: "50%", top: "55%",
              transform: "translate(-50%, -50%)",
            }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                border: "2px solid #FFD700",
                boxShadow: "0 0 40px #FFD700, 0 0 80px rgba(255,215,0,0.3)",
                animation: "seatGlow 0.9s ease-out forwards",
                willChange: "transform, opacity",
              }} />
            </div>
          )}

          {/* ── Arrival text ── */}
          {isLanding && (
            <div style={{
              position: "absolute", bottom: "28%", left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              animation: "arrivalText 0.85s ease-out forwards",
              willChange: "opacity, transform",
            }}>
              <div style={{
                fontSize: 10, fontWeight: 900, letterSpacing: "0.22em",
                color: "#FFD700", textTransform: "uppercase",
                textShadow: "0 0 12px rgba(255,215,0,0.6)",
              }}>
                SEAT FOUND
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.55)", marginTop: 4,
                textTransform: "uppercase",
              }}>
                Welcome to the show
              </div>
            </div>
          )}

          {/* ── Arrival emote burst ── */}
          {isLanding && ARRIVAL_EMOTES.map((emote, i) => (
            <div
              key={emote}
              style={{
                position: "absolute",
                left: `${38 + i * 6}%`, bottom: "42%",
                fontSize: 18,
                animation: `emoteFloat 0.85s ${i * 0.08}s ease-out forwards`,
                willChange: "transform, opacity",
                pointerEvents: "none",
              }}
            >
              {emote}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
