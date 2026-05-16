"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PageEdgeStack from "@/components/magazine/PageEdgeStack";
import {
  computeContentOpacity,
  computeShellTransform,
  toVisualState,
} from "@/components/magazine/MagazineTransitionEngine";
import { usePersistentShell } from "@/providers/PersistentShellProvider";

// ─── LOCKED AUTHORITY DIMENSIONS ────────────────────────────────────────────
const SHELL_W     = 920;   // px
const SHELL_H     = 1280;  // px
const SPINE_W     = 42;    // px
const PERSPECTIVE = 1800;  // px
const RADIUS      = 18;    // px
const SHADOW_D    = 38;    // px

const OPEN_MS  = 900;
const CLOSE_MS = 700;
const EASING   = "cubic-bezier(.22,.8,.2,1)";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface HomeMagazineShellProps {
  state: "closed" | "open";
  onOpen?:  () => void;
  onClose?: () => void;
  onBeforeOpen?: () => void;
  openRequestToken?: number;
  physicalScale?: number;
  children: React.ReactNode;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function HomeMagazineShell({
  state,
  onOpen,
  onClose,
  onBeforeOpen,
  openRequestToken,
  physicalScale = 1,
  children,
}: HomeMagazineShellProps) {
  const [phase, setPhase] = useState<"idle" | "opening" | "closing">("idle");
  const [mounted, setMounted] = useState(false);
  const [settled, setSettled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOpenRequestRef = useRef<number | undefined>(undefined);
  const { setShellState, transitionState, setTransitionState } = usePersistentShell();

  // Deferred mount to trigger entrance animation after first paint
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setSettled(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Clean up any in-flight timers on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const triggerOpen = useCallback(() => {
    if (phase !== "idle") return;
    onBeforeOpen?.();
    setPhase("opening");
    setTransitionState("opening");
    timerRef.current = setTimeout(() => {
      setPhase("idle");
      setShellState("open");
      setTransitionState("open");
      onOpen?.();
    }, Math.round(OPEN_MS * 0.55)); // navigate at the page-edge-on moment
  }, [onBeforeOpen, onOpen, phase, setShellState, setTransitionState]);

  const triggerClose = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("closing");
    setTransitionState("closing");
    timerRef.current = setTimeout(() => {
      setPhase("idle");
      setShellState("closed");
      setTransitionState("closed");
      onClose?.();
    }, Math.round(CLOSE_MS * 0.55));
  }, [onClose, phase, setShellState, setTransitionState]);

  useEffect(() => {
    setShellState(state);
    if (state === "open") {
      setTransitionState(transitionState === "opening" ? transitionState : "open");
      return;
    }
    setTransitionState(transitionState === "closing" ? transitionState : "closed");
  }, [setShellState, setTransitionState, state]);

  useEffect(() => {
    if (openRequestToken === undefined) return;
    if (lastOpenRequestRef.current === openRequestToken) return;
    lastOpenRequestRef.current = openRequestToken;
    triggerOpen();
  }, [openRequestToken, triggerOpen]);

  // ── Inner-frame transform ───────────────────────────────────────────────
  // Opening:  cover page rotates around the spine (left edge) → peels away to the left
  // Closing:  spread page rotates back around the spine → seals shut to the right
  // Settle:   on mount, a tiny spring settle from a slight offset
  let innerTransform = "rotateY(0deg) scale(1)";
  let innerTransition = "none";
  let innerOpacity = 1;

  if (!mounted) {
    // Pre-mount: slightly tilted (invisible) so the settle looks natural
    innerTransform = state === "closed"
      ? "rotateY(4deg) scale(0.98)"
      : "rotateY(-4deg) scale(0.98)";
    innerOpacity = 0;
  } else if (!settled) {
    // Settle from slight tilt → flat (60ms ease-out spring)
    innerTransition = `transform 320ms ${EASING}, opacity 220ms ease`;
    innerOpacity = 1;
  } else if (phase === "opening") {
    innerTransform = computeShellTransform("closed", "opening");
    innerTransition = `transform ${Math.round(OPEN_MS * 0.6)}ms ${EASING}, opacity ${Math.round(OPEN_MS * 0.45)}ms ease-in`;
    innerOpacity = computeContentOpacity("opening");
  } else if (phase === "closing") {
    innerTransform = computeShellTransform("open", "closing");
    innerTransition = `transform ${Math.round(CLOSE_MS * 0.6)}ms ${EASING}, opacity ${Math.round(CLOSE_MS * 0.45)}ms ease-in`;
    innerOpacity = computeContentOpacity("closing");
  }

  // ── Spine accent color based on state ──────────────────────────────────
  const spineColor = state === "closed"
    ? "linear-gradient(to bottom, #00FFFF44, #FF2DAA33, #FFD70022, #00FFFF44)"
    : "linear-gradient(to bottom, #FF2DAA44, #AA2DFF33, #00FFFF22, #FF2DAA44)";

  // ── CTA button styles ───────────────────────────────────────────────────
  const ctaBase: React.CSSProperties = {
    position: "absolute",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 50,
    padding: "14px 36px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    borderRadius: 10,
    border: "2px solid",
    cursor: phase !== "idle" ? "not-allowed" : "pointer",
    opacity: phase !== "idle" ? 0.5 : 1,
    transition: "all 200ms ease",
    whiteSpace: "nowrap" as const,
  };

  const scaledShellWidth = Math.round(SHELL_W * physicalScale);
  const visualState = toVisualState(state, transitionState);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 25% 30%, rgba(0,255,255,0.08), transparent 50%)," +
          "radial-gradient(circle at 80% 70%, rgba(255,45,170,0.07), transparent 50%)," +
          "linear-gradient(160deg, #07030f 0%, #020617 55%, #0a0a14 100%)",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(78vw, 1200px)",
          aspectRatio: "78 / 100",
          perspective: PERSPECTIVE + "px",
          perspectiveOrigin: "50% 50%",
          flexShrink: 0,
        }}
      >
        {/* ── Drop shadow frame ─── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS + 2,
            boxShadow:
              `0 ${SHADOW_D}px ${SHADOW_D * 2}px rgba(0,0,0,0.85),` +
              `0 0 0 1px rgba(255,255,255,0.06),` +
              `0 0 ${SHADOW_D}px rgba(0,255,255,0.04)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── Animated inner frame ─── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: RADIUS,
            overflow: "visible",
            transform: innerTransform,
            transition: innerTransition,
            opacity: innerOpacity,
            transformOrigin: `${SPINE_W}px 50%`,
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            zIndex: 4,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: RADIUS,
              overflow: "hidden",
              background:
                visualState === "closed"
                  ? "linear-gradient(180deg, rgba(8,8,16,1) 0%, rgba(6,6,14,1) 100%)"
                  : "linear-gradient(180deg, rgba(244,236,219,0.98) 0%, rgba(232,220,200,0.98) 100%)",
            }}
          >
            {children}
          </div>

          <PageEdgeStack side="left" active={visualState !== "closed"} />
          <PageEdgeStack side="right" active={visualState !== "closed"} />

          {/* ── Open-spread center seam ─── */}
          {visualState !== "closed" && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 6,
                transform: "translateX(-50%)",
                background: "linear-gradient(to right, rgba(0,0,0,0.28), rgba(180,160,130,0.18), rgba(0,0,0,0.28))",
                zIndex: 38,
                pointerEvents: "none",
                boxShadow: "0 0 10px rgba(0,0,0,0.35)",
              }}
            />
          )}

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 18,
              borderRadius: "0 0 18px 18px",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.34))",
              zIndex: 42,
              pointerEvents: "none",
            }}
          />

          {/* ── Spine line ─── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: SPINE_W - 1,
              top: 0,
              width: 2,
              height: "100%",
              background: spineColor,
              zIndex: 40,
              pointerEvents: "none",
              opacity: 0.7,
            }}
          />

          {/* ── Spine shadow (depth illusion) ─── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: SPINE_W + 16,
              height: "100%",
              background:
                "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)",
              zIndex: 39,
              pointerEvents: "none",
            }}
          />

          {/* ── Page edge highlight (right) ─── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 3,
              height: "100%",
              background:
                "linear-gradient(to left, rgba(255,255,255,0.07) 0%, transparent 100%)",
              zIndex: 39,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── CTA button — outside the animated frame so it doesn't flip away ─── */}
        {state === "closed" && (
          <button
            type="button"
            aria-label="Open Magazine"
            onClick={triggerOpen}
            style={{
              ...ctaBase,
              borderColor: "#00FFFF",
              color: "#00FFFF",
              background: "rgba(0,255,255,0.08)",
              boxShadow: "0 0 24px rgba(0,255,255,0.18)",
            }}
          >
            ▶ Open Magazine
          </button>
        )}

        {state === "open" && (
          <button
            type="button"
            aria-label="Close Magazine"
            onClick={triggerClose}
            style={{
              ...ctaBase,
              borderColor: "#FF2DAA",
              color: "#FF2DAA",
              background: "rgba(255,45,170,0.08)",
              boxShadow: "0 0 24px rgba(255,45,170,0.18)",
            }}
          >
            ✕ Close Magazine
          </button>
        )}
      </div>
    </div>
  );
}
