"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SponsorGift } from "@/lib/commerce/SponsorGiftCommerceEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SponsorBubble = {
  id: string;
  sponsorName: string;
  logoUrl?: string;
  tagline?: string;
  href: string;
  accentColor?: string;
  gift?: SponsorGift;
};

export type SponsorMotionMode =
  | "idle"
  | "pulse"
  | "swap"
  | "flash"
  | "scrollTicker"
  | "surpriseBurst"
  | "giftDrop";

type Props = {
  bubbles: SponsorBubble[];
  mode?: SponsorMotionMode;
  onGiftClaim?: (giftId: string) => void;
  zIndex?: number;
};

type BubbleState = {
  id: string;
  x: number;       // current render position (clamped, wave-offset from base)
  y: number;
  baseX: number;   // initial anchor — drift is relative to this, never accumulates
  baseY: number;
  scale: number;
  opacity: number;
  drift: number;
  speed: number;
  revealed: boolean;
};

type ConfettiParticle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  angle: number;
  spin: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

// At most 3 sponsors run motion loops — remainder render static.
const MAX_ANIMATED = 3;

const CONFETTI_COLORS = ["#00f5ff", "#ff2daa", "#facc15", "#a78bfa", "#4ade80", "#fb923c"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seedRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Deterministic Fisher-Yates shuffle — no Math.random().
function buildPlayOrder(len: number, seed: number): number[] {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seedRandom(seed + i * 31) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initBubbleState(bubble: SponsorBubble, idx: number): BubbleState {
  const bx = 5 + seedRandom(idx * 13 + 7) * 80;
  const by = 10 + seedRandom(idx * 17 + 3) * 70;
  return {
    id: bubble.id,
    x: bx,
    y: by,
    baseX: bx,
    baseY: by,
    scale: 0.85 + seedRandom(idx * 5) * 0.3,
    opacity: 0,
    drift: seedRandom(idx * 7) * Math.PI * 2,
    speed: 0.3 + seedRandom(idx * 11) * 0.7,
    revealed: false,
  };
}

// Deterministic confetti — seed-driven, zero Math.random() calls.
function buildConfetti(cx: number, cy: number, seed: number): ConfettiParticle[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: seed * 100 + i,
    x: cx,
    y: cy,
    vx: (seedRandom(seed + i * 3 + 1) - 0.5) * 6,
    vy: (seedRandom(seed + i * 7 + 2) - 1.2) * 5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 4 + seedRandom(seed + i * 11 + 3) * 6,
    angle: seedRandom(seed + i * 13 + 4) * 360,
    spin: (seedRandom(seed + i * 17 + 5) - 0.5) * 12,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SponsorMotionLayer({
  bubbles,
  mode = "idle",
  onGiftClaim,
  zIndex = 20,
}: Props) {
  const [bubbleStates, setBubbleStates] = useState<BubbleState[]>(() =>
    bubbles.map((b, i) => initBubbleState(b, i)),
  );
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [confettiVersion, setConfettiVersion] = useState(0);
  const [activeGift, setActiveGift] = useState<{ bubble: SponsorBubble } | null>(null);
  const [swapIndex, setSwapIndex] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [droppedIds, setDroppedIds] = useState<Set<string>>(new Set());

  const animFrameRef   = useRef<number | null>(null);
  const confettiFrameRef = useRef<number | null>(null);
  const tickerFrameRef = useRef<number | null>(null);
  const swapIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef        = useRef(0);
  const burstSeedRef   = useRef(1);
  const swapSeedRef    = useRef(100);
  const containerRef   = useRef<HTMLDivElement>(null);

  // Hover freeze — ref (not state) so flipping it never triggers re-render.
  const hoveredRef = useRef(false);

  // Swap play order — deterministic shuffle, no immediate duplicate across cycles.
  const playOrderRef  = useRef<number[]>([]);
  const playCursorRef = useRef(0);

  // ── Stagger fade-in (once on mount) ───────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    bubbles.forEach((_, idx) => {
      timers.push(
        setTimeout(() => {
          setBubbleStates(prev =>
            prev.map((s, i) => (i === idx ? { ...s, opacity: 0.01 } : s)),
          );
        }, idx * 180),
      );
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbles.length]);

  // ── Drift loop — active for idle, pulse, giftDrop ─────────────────────────
  useEffect(() => {
    if (mode !== "idle" && mode !== "pulse" && mode !== "giftDrop") return;
    let running = true;

    function tick() {
      if (!running) return;
      // Hover freeze: keep loop alive but skip position updates.
      if (hoveredRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      tickRef.current++;
      const t = tickRef.current * 0.012;
      setBubbleStates(prev =>
        prev.map((s, i) => {
          // Budget: only MAX_ANIMATED bubbles get motion updates.
          if (i >= MAX_ANIMATED) return { ...s, opacity: Math.min(0.6, s.opacity + 0.005), revealed: s.opacity > 0.4 };
          return {
            ...s,
            opacity: Math.min(1, s.opacity + 0.008),
            revealed: s.opacity > 0.5,
            // Bounded wave offset from anchor — never accumulates.
            x: s.baseX + Math.cos(t * s.speed * 0.6 + s.drift * 1.3) * 6,
            y: s.baseY + Math.sin(t * s.speed + s.drift) * 5,
          };
        }),
      );
      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode]);

  // ── Mode scheduling — drain previous loops, then activate new mode ────────
  useEffect(() => {
    if (swapIntervalRef.current)  { clearInterval(swapIntervalRef.current);      swapIntervalRef.current  = null; }
    if (flashIntervalRef.current) { clearInterval(flashIntervalRef.current);     flashIntervalRef.current = null; }
    if (tickerFrameRef.current)   { cancelAnimationFrame(tickerFrameRef.current); tickerFrameRef.current   = null; }
    setFlashOn(false);
    setTickerOffset(0);
    setDroppedIds(new Set());

    switch (mode) {
      case "swap": {
        if (bubbles.length <= 1) break;
        // Build fresh shuffled play order; prevent immediate duplicate from any previous cycle.
        const newOrder = buildPlayOrder(bubbles.length, ++swapSeedRef.current);
        playOrderRef.current  = newOrder;
        playCursorRef.current = 0;
        setSwapIndex(newOrder[0]);

        swapIntervalRef.current = setInterval(() => {
          if (hoveredRef.current) return; // freeze on hover, preserve current slot

          playCursorRef.current++;

          // End of cycle: reshuffle, guarding against immediate duplicate.
          if (playCursorRef.current >= playOrderRef.current.length) {
            const lastShown = playOrderRef.current[playOrderRef.current.length - 1];
            const next = buildPlayOrder(bubbles.length, ++swapSeedRef.current);
            if (next.length > 1 && next[0] === lastShown) {
              [next[0], next[1]] = [next[1], next[0]]; // swap to avoid repeat
            }
            playOrderRef.current  = next;
            playCursorRef.current = 0;
          }

          setSwapIndex(playOrderRef.current[playCursorRef.current]);
        }, 2000);
        break;
      }

      case "flash": {
        let step = 0;
        flashIntervalRef.current = setInterval(() => {
          if (hoveredRef.current) return; // freeze on hover
          step++;
          setFlashOn(step % 2 === 1);
          if (step >= 6) {
            if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
            flashIntervalRef.current = null;
            setFlashOn(false);
          }
        }, 120);
        break;
      }

      case "scrollTicker": {
        let running = true;
        function tickTicker() {
          if (!running) return;
          if (!hoveredRef.current) {
            setTickerOffset(prev => (prev + 0.35) % 110);
          }
          tickerFrameRef.current = requestAnimationFrame(tickTicker);
        }
        tickerFrameRef.current = requestAnimationFrame(tickTicker);
        return () => {
          running = false;
          if (tickerFrameRef.current) cancelAnimationFrame(tickerFrameRef.current);
        };
      }

      case "surpriseBurst": {
        burstSeedRef.current++;
        setConfetti(buildConfetti(50, 50, burstSeedRef.current));
        setConfettiVersion(v => v + 1);
        break;
      }

      case "giftDrop": {
        const timers = bubbles.map((b, idx) =>
          setTimeout(() => {
            setDroppedIds(prev => new Set(Array.from(prev).concat(b.id)));
          }, idx * 200 + 300),
        );
        return () => timers.forEach(clearTimeout);
      }
    }

    return () => {
      if (swapIntervalRef.current)  { clearInterval(swapIntervalRef.current);      swapIntervalRef.current  = null; }
      if (flashIntervalRef.current) { clearInterval(flashIntervalRef.current);     flashIntervalRef.current = null; }
      if (tickerFrameRef.current)   { cancelAnimationFrame(tickerFrameRef.current); tickerFrameRef.current   = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, bubbles.length]);

  // ── Confetti physics — keyed by version, not array reference ──────────────
  useEffect(() => {
    if (confetti.length === 0) return;
    let running = true;

    function tickConfetti() {
      if (!running) return;
      setConfetti(prev => {
        const next = prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.12, angle: p.angle + p.spin }))
          .filter(p => p.y < 120);
        if (next.length === 0) running = false;
        return next;
      });
      if (running) confettiFrameRef.current = requestAnimationFrame(tickConfetti);
    }

    confettiFrameRef.current = requestAnimationFrame(tickConfetti);
    return () => {
      running = false;
      if (confettiFrameRef.current) cancelAnimationFrame(confettiFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confettiVersion]);

  // ── Unmount cleanup ───────────────────────────────────────────────────────
  useEffect(() => () => {
    if (animFrameRef.current)    cancelAnimationFrame(animFrameRef.current);
    if (confettiFrameRef.current) cancelAnimationFrame(confettiFrameRef.current);
    if (tickerFrameRef.current)  cancelAnimationFrame(tickerFrameRef.current);
    if (swapIntervalRef.current)  clearInterval(swapIntervalRef.current);
    if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
  }, []);

  function handleGiftClick(bubble: SponsorBubble, el: HTMLElement) {
    if (!bubble.gift) return;
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const cx = containerRect
      ? ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100
      : 50;
    const cy = containerRect
      ? ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100
      : 50;
    burstSeedRef.current++;
    setConfetti(buildConfetti(cx, cy, burstSeedRef.current));
    setConfettiVersion(v => v + 1);
    setActiveGift({ bubble });
    onGiftClaim?.(bubble.gift.id);
  }

  // ── Mode-driven bubble style ───────────────────────────────────────────────
  function getBubbleStyle(idx: number, state: BubbleState): React.CSSProperties {
    const base: React.CSSProperties = {
      position: "absolute",
      left: `${Math.max(0, Math.min(85, state.x))}%`,
      top: `${Math.max(0, Math.min(85, state.y))}%`,
      transform: `scale(${state.scale})`,
      opacity: state.opacity,
      transition: "opacity 0.6s ease",
      pointerEvents: "auto",
      zIndex: 2,
    };

    // Budget guard: beyond MAX_ANIMATED in floating modes → static, dimmed.
    if (idx >= MAX_ANIMATED && (mode === "idle" || mode === "pulse" || mode === "giftDrop")) {
      return { ...base, opacity: state.revealed ? 0.55 : 0, transition: "opacity 0.6s ease" };
    }

    switch (mode) {
      case "pulse": {
        const phase =
          (tickRef.current * 0.04 + idx * (Math.PI * 2 / Math.max(bubbles.length, 1))) %
          (Math.PI * 2);
        const pulse = 0.92 + 0.08 * Math.sin(phase);
        return { ...base, transform: `scale(${state.scale * pulse})`, transition: "none" };
      }
      case "swap": {
        const isActive = idx === swapIndex;
        return {
          ...base,
          transform: isActive ? "scale(1.12)" : "scale(0.88)",
          opacity: state.revealed ? (isActive ? 1 : 0.4) : 0,
          transition: "transform 0.4s ease, opacity 0.4s ease",
          zIndex: isActive ? 5 : 1,
        };
      }
      case "flash":
        return {
          ...base,
          filter: flashOn ? "brightness(1.6) saturate(1.4)" : "none",
          transition: "filter 0.1s ease",
        };
      case "scrollTicker": {
        const baseX = (idx / Math.max(bubbles.length, 1)) * 100;
        const x = ((baseX + tickerOffset) % 110) - 5;
        return {
          ...base,
          left: `${x}%`,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: state.revealed ? 1 : 0,
          transition: "opacity 0.4s ease",
        };
      }
      case "giftDrop": {
        const settled = droppedIds.has(state.id);
        return {
          ...base,
          top: settled ? `${Math.max(0, Math.min(85, state.y))}%` : "-15%",
          opacity: settled ? state.opacity : 0,
          transition: settled
            ? "top 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease"
            : "none",
        };
      }
      default:
        return base;
    }
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex, overflow: "hidden" }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    >
      {/* Sponsor bubbles */}
      {bubbles.map((bubble, idx) => {
        const state = bubbleStates[idx];
        if (!state) return null;
        const accent = bubble.accentColor ?? "#00f5ff";
        const hasGift = !!bubble.gift && !activeGift;

        return (
          <div key={bubble.id} style={getBubbleStyle(idx, state)}>
            <Link href={bubble.href} style={{ textDecoration: "none" }} tabIndex={state.revealed ? 0 : -1}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(2,6,23,0.88)",
                  border: `1px solid ${accent}44`,
                  borderRadius: 999,
                  padding: "5px 12px 5px 7px",
                  boxShadow: `0 2px 16px ${accent}22`,
                  backdropFilter: "blur(6px)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {bubble.logoUrl ? (
                  <img
                    src={bubble.logoUrl}
                    alt={bubble.sponsorName}
                    style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: `${accent}22`, border: `1px solid ${accent}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: accent, fontWeight: 800,
                    }}
                  >
                    {bubble.sponsorName[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.08em" }}>
                    {bubble.sponsorName}
                  </div>
                  {bubble.tagline ? (
                    <div style={{ fontSize: 9, color: "#64748b" }}>{bubble.tagline}</div>
                  ) : null}
                </div>
              </div>
            </Link>

            {hasGift ? (
              <button
                type="button"
                onClick={e => handleGiftClick(bubble, e.currentTarget.parentElement as HTMLElement)}
                style={{
                  position: "absolute", top: -8, right: -8,
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#ff2daa", border: "2px solid #fff",
                  color: "#fff", fontSize: 11, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 12px #ff2daa88",
                }}
                aria-label="Claim sponsor gift"
              >
                🎁
              </button>
            ) : null}
          </div>
        );
      })}

      {/* Confetti */}
      {confetti.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.angle}deg)`,
            pointerEvents: "none",
            opacity: 0.9,
          }}
        />
      ))}

      {/* Gift reveal card */}
      {activeGift ? (
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "auto", zIndex: 10,
          }}
          onClick={() => setActiveGift(null)}
        >
          <div
            style={{
              background: "rgba(2,6,23,0.97)",
              border: "1px solid #ff2daa55",
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
              boxShadow: "0 0 64px #ff2daa22",
              maxWidth: 280,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎁</div>
            <div style={{ fontSize: 11, color: "#ff2daa", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              {activeGift.bubble.sponsorName} Gift
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
              {activeGift.bubble.gift?.title}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
              {activeGift.bubble.gift?.description}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#facc15", marginBottom: 16 }}>
              {activeGift.bubble.gift?.valueDisplay}
            </div>
            <button
              type="button"
              onClick={() => setActiveGift(null)}
              style={{
                background: "#ff2daa18", border: "1px solid #ff2daa55",
                borderRadius: 8, color: "#ff2daa",
                fontSize: 11, fontWeight: 700,
                padding: "6px 20px", cursor: "pointer", letterSpacing: "0.08em",
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
