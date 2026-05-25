"use client";

/**
 * TMICurtainSystem.tsx
 * Theatrical curtain open/close animation for The Musician's Index live shows.
 *
 * Drop at: apps/web/src/components/curtain/TMICurtainSystem.tsx
 *
 * Use when:
 *  - A performer goes live (curtain opens → reveals stage)
 *  - A show ends (curtain closes → hides stage)
 *  - Scene transitions within a live event
 *  - Battle countdown intro (curtain opens at 0)
 *  - Sponsor reveal (brief close/open between segments)
 *
 * Curtain variants:
 *  "velvet"    — classic red/maroon stage curtain (heavy folds)
 *  "neon"      — 1980s neon electric blue/purple digital curtain
 *  "glitch"    — pixelated digital glitch transition
 *  "iris"      — circular iris open (spotlight effect)
 *  "blinds"    — horizontal venetian blinds effect
 *  "spotlight" — dark stage with single spotlight growing to full
 *
 * Usage:
 *   const { openCurtain, closeCurtain, CurtainStage } = useCurtain("neon");
 *
 *   openCurtain()          → triggers open animation (1.5s)
 *   closeCurtain()         → triggers close animation (1.0s)
 *   <CurtainStage>         → wraps your stage content
 *
 * Also exports:
 *   <BattleCountdownCurtain countdown={5} onOpen={startBattle} />
 *   <SceneTransition direction="horizontal" />
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type CurtainVariant = "velvet" | "neon" | "glitch" | "iris" | "blinds" | "spotlight";
export type CurtainState = "closed" | "opening" | "open" | "closing";

interface CurtainOptions {
  variant?: CurtainVariant;
  openDurationMs?: number;
  closeDurationMs?: number;
  onOpen?: () => void;
  onClose?: () => void;
  countdownBeforeOpen?: number;  // seconds of countdown before curtain opens
}

/* ─── CSS animation keyframes ─────────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes curtainOpenLeft  { from { transform: translateX(0); } to { transform: translateX(-100%); } }
  @keyframes curtainOpenRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
  @keyframes curtainCloseLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes curtainCloseRight{ from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes irisOpen   { from { clip-path: circle(0% at 50% 50%); } to { clip-path: circle(150% at 50% 50%); } }
  @keyframes irisClose  { from { clip-path: circle(150% at 50% 50%); } to { clip-path: circle(0% at 50% 50%); } }
  @keyframes spotOpen   { from { opacity: 1; } to { opacity: 0; } }
  @keyframes spotClose  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glitchIn   {
    0%   { opacity: 1; clip-path: inset(0 0 100% 0); }
    20%  { clip-path: inset(80% 0 0 0); }
    40%  { clip-path: inset(20% 0 60% 0); }
    60%  { clip-path: inset(50% 0 20% 0); }
    80%  { clip-path: inset(0 0 5% 0); }
    100% { opacity: 0; clip-path: inset(0 0 0 0); }
  }
  @keyframes curtainFold {
    0%,100% { background-position: 0 0; }
    50%     { background-position: 20px 0; }
  }
  @keyframes blindsOpen { from { transform: scaleY(1); } to { transform: scaleY(0); } }
  @keyframes countdownPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%     { transform: scale(1.3); opacity: 0.7; }
  }
`;

/* ─── Velvet curtain half ─────────────────────────────────────────────────── */
function VelvetHalf({
  side, state, duration,
}: { side: "left" | "right"; state: CurtainState; duration: number }) {
  const isLeft = side === "left";
  let animation = "none";
  if (state === "opening") animation = `${isLeft ? "curtainOpenLeft" : "curtainOpenRight"} ${duration}ms cubic-bezier(0.77,0,0.18,1) forwards`;
  if (state === "closing") animation = `${isLeft ? "curtainCloseLeft" : "curtainCloseRight"} ${Math.round(duration * 0.7)}ms cubic-bezier(0.77,0,0.18,1) forwards`;

  return (
    <div
      className="absolute top-0 bottom-0"
      style={{
        width: "51%",
        left: isLeft ? 0 : undefined,
        right: isLeft ? undefined : 0,
        animation,
        zIndex: 10,
        willChange: "transform",
        backgroundImage: `
          repeating-linear-gradient(
            ${isLeft ? "to right" : "to left"},
            rgba(0,0,0,0.3) 0px,
            transparent 8px,
            rgba(0,0,0,0.2) 16px,
            transparent 24px
          ),
          linear-gradient(
            to bottom,
            #5b0c0c 0%,
            #8b0000 20%,
            #6b0c0c 40%,
            #8b0000 60%,
            #5b0c0c 80%,
            #8b0000 100%
          )
        `,
        transform: state === "open" ? `translateX(${isLeft ? "-100%" : "100%"})` : "translateX(0)",
      }}
    />
  );
}

/* ─── Neon digital curtain ───────────────────────────────────────────────── */
function NeonCurtainHalf({
  side, state, duration,
}: { side: "left" | "right"; state: CurtainState; duration: number }) {
  const isLeft = side === "left";
  let animation = "none";
  if (state === "opening") animation = `${isLeft ? "curtainOpenLeft" : "curtainOpenRight"} ${duration}ms cubic-bezier(0.85,0,0.15,1) forwards`;
  if (state === "closing") animation = `${isLeft ? "curtainCloseLeft" : "curtainCloseRight"} ${Math.round(duration * 0.7)}ms cubic-bezier(0.85,0,0.15,1) forwards`;

  return (
    <div
      className="absolute top-0 bottom-0"
      style={{
        width: "51%",
        left: isLeft ? 0 : undefined,
        right: isLeft ? undefined : 0,
        animation,
        zIndex: 10,
        willChange: "transform",
        background: `linear-gradient(${isLeft ? "to right" : "to left"}, #07031a 0%, #0c0a2e 50%, #12103a 100%)`,
        borderRight: isLeft ? "2px solid #a855f7" : undefined,
        borderLeft: isLeft ? undefined : "2px solid #a855f7",
        boxShadow: isLeft ? "4px 0 24px #a855f780" : "-4px 0 24px #a855f780",
        transform: state === "open" ? `translateX(${isLeft ? "-100%" : "100%"})` : "translateX(0)",
      }}
    >
      {/* Neon scan lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(168,85,247,0.06) 3px, rgba(168,85,247,0.06) 4px)",
      }} />
      {/* Edge glow strip */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          width: "3px",
          [isLeft ? "right" : "left"]: 0,
          background: "linear-gradient(to bottom, transparent, #a855f7, #06b6d4, #a855f7, transparent)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

/* ─── Blinds curtain ────────────────────────────────────────────────────────── */
function BlindsCurtain({ state, duration }: { state: CurtainState; duration: number }) {
  const count = 12;
  return (
    <div className="absolute inset-0 z-10">
      {Array.from({ length: count }).map((_, i) => {
        const delay = (state === "opening" ? i : count - 1 - i) * (duration / count / 2);
        let animation = "none";
        if (state === "opening") animation = `blindsOpen ${duration / 2}ms ${delay}ms ease-in forwards`;
        if (state === "closing") animation = `blindsOpen ${duration / 2}ms ${delay}ms ease-out reverse forwards`;
        return (
          <div
            key={i}
            className="absolute w-full"
            style={{
              height: `${100 / count}%`,
              top: `${(i * 100) / count}%`,
              background: "#07031a",
              transformOrigin: "top",
              animation,
              transform: state === "open" ? "scaleY(0)" : "scaleY(1)",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Main curtain hook ────────────────────────────────────────────────────── */
export function useCurtain(variant: CurtainVariant = "neon", opts: CurtainOptions = {}) {
  const {
    openDurationMs = 1500,
    closeDurationMs = 1000,
    onOpen,
    onClose,
  } = opts;

  const [curtainState, setCurtainState] = useState<CurtainState>("closed");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openCurtain = useCallback(() => {
    setCurtainState("opening");
    timeoutRef.current = setTimeout(() => {
      setCurtainState("open");
      onOpen?.();
    }, openDurationMs);
  }, [openDurationMs, onOpen]);

  const closeCurtain = useCallback(() => {
    setCurtainState("closing");
    timeoutRef.current = setTimeout(() => {
      setCurtainState("closed");
      onClose?.();
    }, closeDurationMs);
  }, [closeDurationMs, onClose]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  function CurtainStage({ children }: { children: ReactNode }) {
    const isVisible = curtainState === "open";

    return (
      <div className="relative w-full h-full overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

        {/* Stage content */}
        <div style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.3s ease" }}>
          {children}
        </div>

        {/* Curtain overlay */}
        {curtainState !== "open" && (
          <>
            {(variant === "velvet") && (
              <>
                <VelvetHalf side="left"  state={curtainState} duration={openDurationMs} />
                <VelvetHalf side="right" state={curtainState} duration={openDurationMs} />
              </>
            )}
            {(variant === "neon") && (
              <>
                <NeonCurtainHalf side="left"  state={curtainState} duration={openDurationMs} />
                <NeonCurtainHalf side="right" state={curtainState} duration={openDurationMs} />
              </>
            )}
            {(variant === "blinds") && (
              <BlindsCurtain state={curtainState} duration={openDurationMs} />
            )}
            {(variant === "iris") && (
              <div
                className="absolute inset-0 z-10 bg-[#07031a]"
                style={{
                  animation: curtainState === "opening"
                    ? `irisOpen ${openDurationMs}ms cubic-bezier(0.77,0,0.18,1) forwards`
                    : curtainState === "closing"
                    ? `irisClose ${closeDurationMs}ms cubic-bezier(0.77,0,0.18,1) forwards`
                    : "none",
                }}
              />
            )}
            {(variant === "glitch") && (
              <div
                className="absolute inset-0 z-10 bg-[#07031a]"
                style={{
                  animation: curtainState === "opening"
                    ? `glitchIn ${openDurationMs}ms step-end forwards`
                    : "none",
                }}
              />
            )}
            {(variant === "spotlight") && (
              <div
                className="absolute inset-0 z-10 bg-black"
                style={{
                  animation: curtainState === "opening"
                    ? `spotOpen ${openDurationMs}ms ease-out forwards`
                    : curtainState === "closing"
                    ? `spotClose ${closeDurationMs}ms ease-in forwards`
                    : "none",
                }}
              />
            )}
          </>
        )}
      </div>
    );
  }

  return { openCurtain, closeCurtain, curtainState, CurtainStage };
}

/* ─── Battle countdown curtain ────────────────────────────────────────────── */
export function BattleCountdownCurtain({
  onOpen,
  variant = "neon",
  initialCount = 5,
}: {
  onOpen: () => void;
  variant?: CurtainVariant;
  initialCount?: number;
}) {
  const [count, setCount] = useState(initialCount);
  const { openCurtain, CurtainStage } = useCurtain(variant, { onOpen });

  useEffect(() => {
    if (count <= 0) { openCurtain(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, openCurtain]);

  return (
    <CurtainStage>
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        {count > 0 && (
          <div
            className="text-8xl font-black"
            style={{
              color: "#ffffff",
              textShadow: "0 0 60px #a855f7, 0 0 120px #a855f7",
              animation: "countdownPulse 0.8s ease-in-out",
              animationFillMode: "backwards",
            }}
          >
            {count}
          </div>
        )}
      </div>
    </CurtainStage>
  );
}

/* ─── Scene transition (quick horizontal wipe) ────────────────────────────── */
export function SceneTransition({
  trigger,
  direction = "horizontal",
  color = "#07031a",
  durationMs = 400,
}: {
  trigger: boolean;
  direction?: "horizontal" | "vertical";
  color?: string;
  durationMs?: number;
}) {
  if (!trigger) return null;
  return (
    <div
      className="fixed inset-0 z-[999] pointer-events-none"
      style={{
        background: color,
        animation: `${direction === "horizontal" ? "curtainOpenLeft" : "irisOpen"} ${durationMs}ms ease-in-out forwards`,
      }}
    />
  );
}
