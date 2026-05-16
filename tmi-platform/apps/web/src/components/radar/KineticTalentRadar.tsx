"use client";

import {
  listBubbles,
  colorForGenre,
  type TalentBubble,
} from "@/lib/radar/TalentRadarEngine";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_R = 30;
const MAX_R = 56;
const DAMPING = 0.96;
const MAX_SPEED = 1.4;
const DRIFT_JITTER = 0.035;
const REPEL_PAD = 14;
const MOUSE_ATTRACT_DIST = 200;
const MOUSE_ATTRACT_FORCE = 0.00045;
const POLL_MS = 3000;

function bubbleRadius(b: TalentBubble): number {
  const r = MIN_R + (b.heatScore / 100) * (MAX_R - MIN_R);
  return r * b.displayScale;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const STYLE_ID = "kinetic-talent-radar-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes ktrLivePulse {
      0%   { transform: scale(1);   opacity: 0.9; }
      100% { transform: scale(2.2); opacity: 0;   }
    }
    @keyframes ktrLiveDot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }
    @keyframes ktrSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes ktrFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(el);
}

// ─── Physics types ────────────────────────────────────────────────────────────

type BubblePhys = {
  idx: number;
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
};

// ─── Scout Panel ─────────────────────────────────────────────────────────────

function ScoutPanel({
  bubble, color, onClose, onBook,
}: {
  bubble: TalentBubble; color: string;
  onClose: () => void;
  onBook: (b: TalentBubble) => void;
}) {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div
      style={{
        position: "absolute", top: 20, right: 20, width: 280, zIndex: 60,
        background: "linear-gradient(160deg, #07041a 0%, #0a061e 100%)",
        border: `1px solid ${color}44`,
        borderLeft: `4px solid ${color}`,
        borderRadius: "0 14px 14px 0",
        boxShadow: `0 0 40px ${color}22, 0 20px 40px rgba(0,0,0,0.7)`,
        padding: "18px 16px 16px",
        animation: "ktrFadeIn 0.28s ease-out forwards",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: `${color}`, textTransform: "uppercase", marginBottom: 3 }}>
            {bubble.genre} · {bubble.region}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{bubble.name}</div>
          {bubble.isLive && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2daa", animation: "ktrLiveDot 0.9s ease-in-out infinite" }} />
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#ff2daa" }}>LIVE NOW</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
          aria-label="Close scout panel"
        >
          ×
        </button>
      </div>

      {/* Heat score */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
        background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 10, padding: "8px 10px",
      }}>
        <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 16px ${color}` }}>
          {bubble.heatScore}
        </div>
        <div>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Heat Score</div>
          <div style={{ fontSize: 7, color: color, marginTop: 1, letterSpacing: "0.1em" }}>Fan-Driven Index</div>
        </div>
      </div>

      {/* Funnel metrics */}
      {[
        { label: "Completion",     game: "Endurance Score", val: bubble.completionRate,     color: "#00ffff" },
        { label: "Like Rate",      game: "Critical Hit %",  val: bubble.likeRate,           color: "#ff2daa" },
        { label: "Fan Conversion", game: "Level Up Rate",   val: bubble.fanConversionRate,  color: "#ffd700" },
        { label: "Reliability",    game: "Show-Up Rate",    val: bubble.reliabilityScore,   color: "#22c55e" },
      ].map((m) => (
        <div key={m.label} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{m.label}</span>
            <span style={{ fontSize: 8, fontWeight: 900, color: m.color }}>{pct(m.val)}</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: pct(m.val),
              background: `linear-gradient(to right, ${m.color}, ${m.color}88)`,
              borderRadius: 2, transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      ))}

      {/* Anti-hog warning */}
      {bubble.bookingCooldown && (
        <div style={{
          marginTop: 10, padding: "6px 10px",
          background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.25)",
          borderRadius: 8, fontSize: 8, color: "rgba(255,215,0,0.8)",
          letterSpacing: "0.08em", lineHeight: 1.5,
        }}>
          ⚠ Rotation Cooldown Active — {bubble.monthsAtTop} months at top. Boosting rising artists in suggestions.
        </div>
      )}

      {/* Book button */}
      <button
        type="button"
        onClick={() => onBook(bubble)}
        disabled={bubble.bookingCooldown}
        style={{
          marginTop: 12, width: "100%",
          padding: "10px 0",
          background: bubble.bookingCooldown ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${color}33, ${color}18)`,
          border: `1px solid ${bubble.bookingCooldown ? "rgba(255,255,255,0.1)" : color + "66"}`,
          borderRadius: 10, cursor: bubble.bookingCooldown ? "not-allowed" : "pointer",
          color: bubble.bookingCooldown ? "rgba(255,255,255,0.25)" : color,
          fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase",
          transition: "all 0.2s ease",
          boxShadow: bubble.bookingCooldown ? "none" : `0 0 14px ${color}22`,
        }}
      >
        {bubble.bookingCooldown ? "On Cooldown" : "Book Artist"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  height?: number;
  onBookingSelect?: (bubble: TalentBubble) => void;
};

export default function KineticTalentRadar({ height = 580, onBookingSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleEls = useRef<(HTMLDivElement | null)[]>([]);
  const phys = useRef<BubblePhys[]>([]);
  const mousePos = useRef({ x: -9999, y: -9999 });
  const frameRef = useRef<number>(0);
  const [bubbles, setBubbles] = useState<TalentBubble[]>([]);
  const [selected, setSelected] = useState<TalentBubble | null>(null);

  // ── Initialise physics from bubble list ──
  const initPhysics = useCallback((bs: TalentBubble[], w: number, h: number) => {
    phys.current = bs.map((b, i) => {
      const angle = (i / bs.length) * Math.PI * 2 - Math.PI / 2;
      const dist = Math.min(w, h) * 0.3;
      return {
        idx: i,
        x: w / 2 + dist * Math.cos(angle),
        y: h / 2 + dist * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: bubbleRadius(b),
      };
    });
  }, []);

  // ── Poll engine for fresh bubble data ──
  useEffect(() => {
    const load = () => setBubbles(listBubbles());
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // ── Re-init physics when bubble set size changes ──
  useEffect(() => {
    if (!bubbles.length) return;
    ensureStyles();
    const w = containerRef.current?.offsetWidth ?? 800;
    const h = height;
    initPhysics(bubbles, w, h);
  }, [bubbles.length, height, initPhysics]);

  // ── RAF physics loop ──
  useEffect(() => {
    const tick = () => {
      const ps = phys.current;
      const W = containerRef.current?.offsetWidth ?? 800;
      const H = height;
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]!;

        // Drift
        p.vx += (Math.random() - 0.5) * DRIFT_JITTER;
        p.vy += (Math.random() - 0.5) * DRIFT_JITTER;

        // Mouse attract
        const mdx = mx - p.x;
        const mdy = my - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_ATTRACT_DIST && mdist > 0) {
          const pull = MOUSE_ATTRACT_FORCE * (MOUSE_ATTRACT_DIST - mdist);
          p.vx += (mdx / mdist) * pull;
          p.vy += (mdy / mdist) * pull;
        }

        // Repulsion between bubbles
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j]!;
          const rdx = p.x - q.x;
          const rdy = p.y - q.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const minD = p.radius + q.radius + REPEL_PAD;
          if (rdist < minD && rdist > 0) {
            const f = ((minD - rdist) / minD) * 0.5;
            const fx = (rdx / rdist) * f;
            const fy = (rdy / rdist) * f;
            p.vx += fx; p.vy += fy;
            q.vx -= fx; q.vy -= fy;
          }
        }

        // Damping + speed cap
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) { p.vx = (p.vx / spd) * MAX_SPEED; p.vy = (p.vy / spd) * MAX_SPEED; }

        p.x += p.vx;
        p.y += p.vy;

        // Soft boundary
        const pad = p.radius + 16;
        if (p.x < pad) { p.x = pad; p.vx = Math.abs(p.vx) * 0.5; }
        if (p.x > W - pad) { p.x = W - pad; p.vx = -Math.abs(p.vx) * 0.5; }
        if (p.y < pad) { p.y = pad; p.vy = Math.abs(p.vy) * 0.5; }
        if (p.y > H - pad) { p.y = H - pad; p.vy = -Math.abs(p.vy) * 0.5; }

        // Write to DOM (no React re-render)
        const el = bubbleEls.current[i];
        if (el) {
          el.style.transform = `translate(${p.x - p.radius}px, ${p.y - p.radius}px)`;
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [height]);

  // ── Mouse tracking ──
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onMouseLeave = useCallback(() => {
    mousePos.current = { x: -9999, y: -9999 };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height, overflow: "hidden" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Ambient background */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: [
          "radial-gradient(ellipse at 50% 50%, rgba(0,255,255,0.04) 0%, transparent 65%)",
          "radial-gradient(ellipse at 15% 80%, rgba(255,45,170,0.03) 0%, transparent 50%)",
          "radial-gradient(ellipse at 85% 20%, rgba(168,85,247,0.03) 0%, transparent 50%)",
        ].join(", "),
        pointerEvents: "none",
      }} />

      {/* Grid lines */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: [
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "60px 60px",
      }} />

      {/* Center crosshair */}
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 2, height: "60%", background: "rgba(0,255,255,0.04)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: "80%", height: 2, background: "rgba(0,255,255,0.04)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Bubbles */}
      {bubbles.map((b, i) => {
        const color = colorForGenre(b.genre);
        const r = phys.current[i]?.radius ?? bubbleRadius(b);
        const size = r * 2;
        const glow = b.heatScore / 100;
        const isSelected = selected?.id === b.id;

        return (
          <div
            key={b.id}
            ref={(el) => { bubbleEls.current[i] = el; }}
            role="button"
            tabIndex={0}
            aria-label={`${b.name} — Heat ${b.heatScore}`}
            onClick={() => setSelected(isSelected ? null : b)}
            onKeyDown={(e) => { if (e.key === "Enter") setSelected(isSelected ? null : b); }}
            style={{
              position: "absolute", top: 0, left: 0,
              width: size, height: size,
              cursor: "pointer",
              zIndex: isSelected ? 20 : 10,
              opacity: b.displayOpacity,
              transition: "opacity 0.4s ease",
            }}
          >
            {/* Outer pulse ring for LIVE */}
            {b.isLive && (
              <>
                <div style={{
                  position: "absolute", inset: -4, borderRadius: "50%",
                  border: `2px solid ${color}`,
                  animation: "ktrLivePulse 1.8s ease-out infinite",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", inset: -4, borderRadius: "50%",
                  border: `2px solid ${color}`,
                  animation: "ktrLivePulse 1.8s ease-out 0.9s infinite",
                  pointerEvents: "none",
                }} />
              </>
            )}

            {/* Selection ring */}
            {isSelected && (
              <div style={{
                position: "absolute", inset: -6, borderRadius: "50%",
                border: `2px solid ${color}`,
                animation: "ktrSpin 3s linear infinite",
                pointerEvents: "none",
                backgroundImage: `repeating-conic-gradient(${color}55 0deg 20deg, transparent 20deg 40deg)`,
                backgroundSize: "100% 100%",
              }} />
            )}

            {/* Bubble body */}
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: `radial-gradient(circle at 38% 35%, ${color}28 0%, ${color}08 50%, rgba(0,0,0,0.6) 100%)`,
              border: `1.5px solid ${color}${isSelected ? "cc" : "66"}`,
              boxShadow: [
                `0 0 ${Math.round(12 + glow * 24)}px ${color}${Math.round(40 + glow * 60).toString(16).padStart(2, "0")}`,
                isSelected ? `0 0 32px ${color}44, inset 0 0 16px ${color}18` : "",
              ].filter(Boolean).join(", "),
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2, overflow: "hidden",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              position: "relative",
            }}>
              {/* Cooldown overlay */}
              {b.bookingCooldown && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 2,
                }}>
                  <span style={{ fontSize: r > 40 ? 14 : 10, opacity: 0.7 }}>⏸</span>
                </div>
              )}

              {/* LIVE badge */}
              {b.isLive && (
                <div style={{
                  position: "absolute", top: "18%",
                  display: "flex", alignItems: "center", gap: 2, zIndex: 3,
                }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff2daa", animation: "ktrLiveDot 0.9s ease-in-out infinite" }} />
                  <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.14em", color: "#ff2daa" }}>LIVE</span>
                </div>
              )}

              {/* Name */}
              <span style={{
                fontSize: r > 44 ? 10 : r > 36 ? 9 : 8,
                fontWeight: 900, color: "#fff",
                textAlign: "center", lineHeight: 1.1,
                padding: "0 6px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: "90%",
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                zIndex: 1,
              }}>
                {b.name}
              </span>

              {/* Heat */}
              <span style={{
                fontSize: r > 40 ? 11 : 9,
                fontWeight: 900, color,
                textShadow: `0 0 8px ${color}`,
                lineHeight: 1, zIndex: 1,
              }}>
                {b.heatScore}°
              </span>
            </div>
          </div>
        );
      })}

      {/* Scout panel */}
      {selected && (
        <ScoutPanel
          bubble={selected}
          color={colorForGenre(selected.genre)}
          onClose={() => setSelected(null)}
          onBook={(b) => { onBookingSelect?.(b); setSelected(null); }}
        />
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, left: 14, zIndex: 30,
        display: "flex", flexWrap: "wrap", gap: 8,
      }}>
        {Object.entries({
          "Hip Hop": "#00ffff", "R&B": "#ff2daa",
          "Electronic": "#a855f7", "Rock": "#ffd700",
        }).map(([genre, color]) => (
          <div key={genre} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{genre}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
          <div style={{ width: 14, height: 6, borderRadius: 3, background: "linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.4))" }} />
          <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Size = Heat</span>
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 12, left: 14, zIndex: 30,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ffff", boxShadow: "0 0 8px rgba(0,255,255,0.8)", animation: "ktrLiveDot 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,255,255,0.55)" }}>
          Talent Radar · {bubbles.length} Artists
        </span>
      </div>
    </div>
  );
}
