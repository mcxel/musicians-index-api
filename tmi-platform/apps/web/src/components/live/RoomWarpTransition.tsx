"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RoomWarpProps {
  roomId?: string;
  hostName?: string;
  audienceCount?: number;
  vibe?: string;
  genre?: string;
  onComplete?: () => void;
}

type Phase = "warp" | "reveal" | "preview" | "tunnel" | "done";

// ── Deterministic geometry (no Math.random in render) ───────────────────────

interface Star { x: number; y: number; size: number; speed: number; color: string }
interface Particle { x: number; y: number; angle: number; len: number; opacity: number }

const STAR_COLORS = ["#ffffff", "#00FFFF", "#AA2DFF", "#FFD700", "#FF2DAA"];

function buildStars(n: number): Star[] {
  return Array.from({ length: n }, (_, i) => ({
    x: ((i * 137.5) % 100),
    y: ((i * 97.3) % 100),
    size: 1 + (i % 3),
    speed: 0.6 + ((i * 13) % 40) / 100,
    color: STAR_COLORS[i % STAR_COLORS.length],
  }));
}

function buildParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    x: 50 + Math.cos((i / n) * Math.PI * 2) * (20 + (i % 30)),
    y: 50 + Math.sin((i / n) * Math.PI * 2) * (20 + (i % 30)),
    angle: (i / n) * 360,
    len: 8 + (i % 20),
    opacity: 0.3 + (i % 5) * 0.12,
  }));
}

const STARS = buildStars(80);
const PARTICLES = buildParticles(24);

// ── Loading messages per phase ───────────────────────────────────────────────

const WARP_MESSAGES = [
  "Entering venue...",
  "Locking your seat...",
  "Syncing live feed...",
];
const REVEAL_STEPS = ["Audience", "Stage", "Host", "Atmosphere"];

// ── CSS keyframes ────────────────────────────────────────────────────────────

const CSS = `
@keyframes warpStar {
  0%   { transform: translate(var(--sx), var(--sy)) scale(0.1); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translate(
    calc(var(--sx) + (50% - var(--sx)) * 3),
    calc(var(--sy) + (50% - var(--sy)) * 3)
  ) scale(3); opacity: 0; }
}
@keyframes tunnelPulse {
  0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.6; }
  100% { transform: translate(-50%,-50%) scale(12);  opacity: 0; }
}
@keyframes warpGlow {
  0%,100% { box-shadow: 0 0 40px #00FFFF, 0 0 80px rgba(0,255,255,0.3); }
  50%      { box-shadow: 0 0 60px #AA2DFF, 0 0 120px rgba(170,45,255,0.4); }
}
@keyframes tickerScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes revealStep {
  0%   { opacity: 0; transform: translateY(4px); }
  30%  { opacity: 1; transform: translateY(0); }
  70%  { opacity: 1; }
  100% { opacity: 0.4; }
}
@keyframes flashWhite {
  0%   { opacity: 0; }
  20%  { opacity: 0.6; }
  100% { opacity: 0; }
}
`;

// ── Sub-components ───────────────────────────────────────────────────────────

function WarpPhase({ stars }: { stars: Star[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.color,
            // @ts-expect-error custom props
            "--sx": `${s.x}%`,
            "--sy": `${s.y}%`,
            left: `${s.x}%`,
            top: `${s.y}%`,
            animation: `warpStar ${s.speed}s linear infinite`,
            animationDelay: `${(i * 7) % 100 / 100}s`,
          }}
        />
      ))}
    </div>
  );
}

function RevealPhase({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.4em", color: "rgba(0,255,255,0.5)", textTransform: "uppercase", marginBottom: 8 }}>
        LOADING
      </div>
      {REVEAL_STEPS.map((label, i) => (
        <div
          key={label}
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: i === step ? "#00FFFF" : i < step ? "rgba(0,255,255,0.35)" : "rgba(255,255,255,0.12)",
            animation: i === step ? `revealStep 0.6s ease-out forwards` : "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 9, color: i <= step ? "#00FFFF" : "rgba(255,255,255,0.1)" }}>
            {i < step ? "✓" : i === step ? "▶" : "○"}
          </span>
          {label}
        </div>
      ))}
    </div>
  );
}

function PreviewCard({ hostName, audienceCount, vibe, genre }: Omit<RoomWarpProps, "roomId" | "onComplete">) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: "linear-gradient(145deg, rgba(170,45,255,0.15), rgba(0,255,255,0.08), rgba(0,0,0,0.7))",
        border: "1px solid rgba(0,255,255,0.3)",
        borderRadius: 16,
        padding: "24px 28px",
        minWidth: 280,
        maxWidth: 340,
        animation: "warpGlow 2s ease-in-out infinite",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.35em", color: "#FF2DAA", textTransform: "uppercase", marginBottom: 14 }}>
        ● LIVE NOW
      </div>

      <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", marginBottom: 6, letterSpacing: "0.05em" }}>
        {hostName ?? "TMI Live"}
      </div>

      {genre && (
        <div style={{ fontSize: 10, color: "#AA2DFF", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
          {genre}
        </div>
      )}

      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Audience</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#00FFFF" }}>
            {audienceCount !== undefined ? audienceCount.toLocaleString() : "—"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Energy</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>
            {audienceCount !== undefined
              ? audienceCount > 500 ? "🔥 HIGH" : audienceCount > 100 ? "⚡ MID" : "✨ RISING"
              : "⚡"}
          </div>
        </div>
      </div>

      {vibe && (
        <div style={{
          fontSize: 10, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 10px",
          letterSpacing: "0.12em",
        }}>
          {vibe}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00FFFF", animation: "warpGlow 1s ease-in-out infinite" }} />
        Taking your seat...
      </div>
    </motion.div>
  );
}

function TunnelPhase({ particles }: { particles: Particle[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%", top: "50%",
            width: 60 + i * 80,
            height: 60 + i * 80,
            borderRadius: "50%",
            border: `1px solid ${i % 2 === 0 ? "rgba(0,255,255,0.4)" : "rgba(170,45,255,0.3)"}`,
            animation: `tunnelPulse 0.7s ${i * 0.12}s ease-out forwards`,
          }}
        />
      ))}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`, top: `${p.y}%`,
            width: 2, height: p.len,
            background: `linear-gradient(180deg, transparent, ${i % 2 === 0 ? "#00FFFF" : "#AA2DFF"})`,
            transform: `rotate(${p.angle}deg)`,
            opacity: p.opacity,
            animation: `tunnelPulse 0.5s ${(i * 3) % 100 / 200}s ease-out forwards`,
          }}
        />
      ))}
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff",
        animation: "flashWhite 0.35s ease-out forwards",
      }} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function RoomWarpTransition({
  roomId,
  hostName,
  audienceCount,
  vibe,
  genre,
  onComplete,
}: RoomWarpProps) {
  const [phase, setPhase] = useState<Phase>("warp");
  const [revealStep, setRevealStep] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stars = useMemo(() => STARS, []);
  const particles = useMemo(() => PARTICLES, []);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(() => { setPhase("done"); onComplete?.(); }, 600);
      return () => clearTimeout(t);
    }

    // Warp: 1.4s — cycle loading messages
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % WARP_MESSAGES.length), 500);
    timers.current.push(msgTimer as unknown as ReturnType<typeof setTimeout>);

    const t1 = setTimeout(() => {
      clearInterval(msgTimer);
      setPhase("reveal");

      // Reveal steps: 200ms each
      REVEAL_STEPS.forEach((_, i) => {
        const t = setTimeout(() => setRevealStep(i), i * 200);
        timers.current.push(t);
      });

      const t2 = setTimeout(() => {
        setPhase("preview");

        const t3 = setTimeout(() => {
          setPhase("tunnel");

          const t4 = setTimeout(() => {
            setPhase("done");
            onComplete?.();
          }, 500);
          timers.current.push(t4);
        }, 1400);
        timers.current.push(t3);
      }, REVEAL_STEPS.length * 200 + 200);
      timers.current.push(t2);
    }, 1400);
    timers.current.push(t1);

    return () => {
      timers.current.forEach(clearTimeout);
      clearInterval(msgTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="room-warp"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "tunnel" ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "radial-gradient(ellipse at center, #0a0520 0%, #050510 55%, #000 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <style>{CSS}</style>

        {/* Stars — warp phase */}
        {(phase === "warp") && <WarpPhase stars={stars} />}

        {/* Tunnel — exit phase */}
        {phase === "tunnel" && <TunnelPhase particles={particles} />}

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

          {/* TMI wordmark */}
          <div style={{
            fontSize: 11, fontWeight: 900, letterSpacing: "0.5em",
            color: phase === "preview" ? "#FFD700" : "rgba(0,255,255,0.7)",
            textTransform: "uppercase",
            textShadow: phase === "preview"
              ? "0 0 20px #FFD700, 0 0 40px rgba(255,215,0,0.5)"
              : "0 0 12px rgba(0,255,255,0.5)",
            transition: "color 0.4s ease, text-shadow 0.4s ease",
          }}>
            THE MUSICIAN&apos;S INDEX
          </div>

          {/* Phase content */}
          {phase === "warp" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {/* Pulsing ring */}
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                border: "1.5px solid #00FFFF",
                boxShadow: "0 0 30px #00FFFF, 0 0 60px rgba(0,255,255,0.25), inset 0 0 20px rgba(0,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "warpGlow 1.4s ease-in-out infinite",
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00FFFF", boxShadow: "0 0 12px #00FFFF" }} />
              </div>

              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.25em", color: "rgba(0,255,255,0.7)", textTransform: "uppercase", transition: "all 0.3s" }}>
                {WARP_MESSAGES[msgIdx]}
              </div>
            </div>
          )}

          {phase === "reveal" && <RevealPhase step={revealStep} />}

          {phase === "preview" && (
            <PreviewCard
              hostName={hostName}
              audienceCount={audienceCount}
              vibe={vibe}
              genre={genre}
            />
          )}

          {phase === "tunnel" && (
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.3em", color: "#FFD700", textTransform: "uppercase" }}>
              ENTERING NOW
            </div>
          )}
        </div>

        {/* Bottom ticker */}
        {phase === "warp" && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(0,255,255,0.06)",
            borderTop: "1px solid rgba(0,255,255,0.1)",
            padding: "6px 0",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", gap: 40, animation: "tickerScroll 12s linear infinite", width: "max-content" }}>
              {[...Array(6)].map((_, i) => (
                <span key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.25em", color: "rgba(0,255,255,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  THE MUSICIAN&apos;S INDEX &nbsp;·&nbsp; LIVE MUSIC PLATFORM &nbsp;·&nbsp; ENTERING VENUE
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
