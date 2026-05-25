"use client";

import {
  MAGAZINE_V1_SCENE_REGISTRY,
  MASTER_RESET_TIMINGS,
  MagazineRuntimeEngine,
  type MagazineRuntimePhase,
  type MagazineSceneId,
} from "@/engines/magazine/MagazineRuntimeEngine";
import { runPageTurn } from "@/lib/magazine/MagazineAssemblyDirector";
import { ingestMagazineSceneEnter } from "@/lib/performer/MagazinePerformerAnalyticsBridge";
import PhysicalMagazineViewport from "./PhysicalMagazineViewport";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import MagazineStarburstTransition from "./MagazineStarburstTransition";
import FeatherRuffleOverlay from "./FeatherRuffleOverlay";

// ─── Shared types ────────────────────────────────────────────────────────────

export type FullRotationScene = {
  id: MagazineSceneId;
  durationMs: number;
  content: ReactNode;
};

/**
 * Provides `isActive` to any descendant component that needs to pause
 * expensive work (timers, polling, video) when its scene is not visible.
 * Usage: `const isActive = useSceneVisible()`
 */
export const SceneVisibilityContext = createContext<boolean>(true);
export const useSceneVisible = () => useContext(SceneVisibilityContext);

// ─── Shared phase helpers ─────────────────────────────────────────────────────

function getRuntimeTransform(phase: MagazineRuntimePhase, dragX = 0, mobile = false): string {
  // On mobile: completely flat — no perspective, no rotateY. Content is always accessible.
  if (mobile) return "translateZ(0)";
  // Lighter drag tilt — capped at ±5° so holding feels stable
  const dragTilt = Math.max(-5, Math.min(5, dragX / 36));
  if (phase === "holding")   return `perspective(2400px) rotateY(${dragTilt}deg) translateZ(0)`;
  // Starburst: very subtle pull-back — just enough to signal something is coming
  if (phase === "starburst") return `perspective(2400px) rotateY(-2deg) scale(0.993) translateX(-4px)`;
  // Flip: tight, controlled — 10° is enough to read as a page turn without flopping
  if (phase === "flipping")  return `perspective(2400px) rotateY(-10deg) translateX(-18px) scale(0.980)`;
  // Re-enter / snap back: mirror at 3° so the settle feels symmetrical
  return `perspective(2400px) rotateY(3deg) translateX(5px) scale(0.997)`;
}

function getRuntimeTransition(phase: MagazineRuntimePhase, flipMs = 700): string {
  if (phase === "holding")   return "transform 90ms ease";
  // Expo.Out easing — snaps to position without overshooting
  if (phase === "starburst") return "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), filter 360ms ease";
  if (phase === "flipping")  return `transform ${flipMs}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${flipMs}ms ease`;
  return `transform 340ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 340ms ease`;
}

// ─── Single-scene mode (original behavior, preserved) ────────────────────────

type SwipeInterruptMeta = { sceneId: MagazineSceneId; deltaX: number };

type SingleSceneProps = {
  sceneId: MagazineSceneId;
  nextHref: string;
  holdMs?: number;
  children: ReactNode;
  scenes?: never;
  initialIndex?: never;
  onSwipeInterruptStart?: (meta: SwipeInterruptMeta) => void;
  onSwipeInterruptMove?: (meta: SwipeInterruptMeta) => void;
  onSwipeInterruptEnd?: (meta: SwipeInterruptMeta) => void;
};

function SingleSceneRuntime({
  sceneId, nextHref, holdMs, children,
  onSwipeInterruptStart, onSwipeInterruptMove, onSwipeInterruptEnd,
}: SingleSceneProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<MagazineRuntimePhase>("holding");
  const [dragX, setDragX] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const pushed = useRef(false);

  const scene = useMemo(() => {
    const base = MAGAZINE_V1_SCENE_REGISTRY[sceneId];
    return { ...base, durationMs: holdMs ?? base.durationMs };
  }, [holdMs, sceneId]);

  useEffect(() => {
    pushed.current = false;
    const runtime = new MagazineRuntimeEngine({
      scene,
      onPhaseChange: (nextPhase) => setPhase(nextPhase),
      onAdvance: () => {
        if (pushed.current) return;
        pushed.current = true;
        router.push(nextHref);
      },
    });
    runtime.start();
    return () => runtime.stop();
  }, [nextHref, router, scene]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    onSwipeInterruptStart?.({ sceneId, deltaX: 0 });
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null || phase !== "holding") return;
    const deltaX = e.clientX - pointerStartX.current;
    setDragX(deltaX);
    onSwipeInterruptMove?.({ sceneId, deltaX });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    setDragX(0);
    onSwipeInterruptEnd?.({ sceneId, deltaX });
  };

  return (
    <section
      aria-label="Magazine runtime scene"
      data-runtime-scene={sceneId}
      data-runtime-phase={phase}
      style={{ position: "relative", minHeight: "100svh", overflow: "clip", maxWidth: "100vw", touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 12% 24%, rgba(0, 255, 255, 0.14) 0%, transparent 58%), radial-gradient(ellipse at 84% 76%, rgba(255, 45, 170, 0.14) 0%, transparent 58%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", left: "50%", top: "5%", width: "min(1200px, 96vw)", height: "90%", transform: "translateX(-50%)", borderRadius: 22, background: "linear-gradient(140deg, rgba(8, 6, 24, 0.9), rgba(5, 5, 16, 0.94))", boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 18px 0 22px rgba(255,255,255,0.04), inset -18px 0 20px rgba(0,0,0,0.3)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 3, minHeight: "100svh", transformOrigin: "left center", transform: getRuntimeTransform(phase, dragX), transition: getRuntimeTransition(phase), filter: phase === "starburst" ? "brightness(1.18) saturate(1.18)" : "none", boxShadow: phase === "flipping" ? "-14px 0 28px rgba(0,0,0,0.32), 0 10px 24px rgba(0,0,0,0.26)" : "none" }}>
        {children}
      </div>
      <MagazineStarburstTransition active={phase !== "holding"} phase={phase} />
      <FeatherRuffleOverlay phase={phase} />
    </section>
  );
}

// ─── Multi-scene mode (full rotation, all three Gemini fixes applied) ─────────

const SESSION_KEY = "tmi_mag_scene_idx";

type MultiSceneProps = {
  scenes: FullRotationScene[];
  initialIndex?: number;
  onSceneEnter?: (sceneId: MagazineSceneId) => void;
  onSceneExit?: (sceneId: MagazineSceneId) => void;
  sceneId?: never;
  nextHref?: never;
  holdMs?: never;
  children?: never;
};

function MultiSceneRuntime({ scenes, initialIndex = 0, onSceneEnter, onSceneExit }: { scenes: FullRotationScene[]; initialIndex?: number; onSceneEnter?: (id: MagazineSceneId) => void; onSceneExit?: (id: MagazineSceneId) => void }) {
  const [sceneIndex, setSceneIndex] = useState<number>(() => initialIndex);
  const [phase, setPhase] = useState<MagazineRuntimePhase>("holding");
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [chevronHover, setChevronHover] = useState<'prev' | 'next' | null>(null);
  const advancedRef = useRef(false);
  const pausedRef = useRef(false);
  const pauseTimerRef = useRef<number | null>(null);
  const pointerInsideRef = useRef(false);
  const pageTurnCancelRef = useRef<(() => void) | null>(null);
  const currentIdRef = useRef<MagazineSceneId>(scenes[initialIndex]?.id ?? scenes[0]!.id);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const scene = scenes[sceneIndex]!;
  // Master reset: fires during transition FROM the last scene back to first
  const isMasterWrap = sceneIndex === scenes.length - 1;
  const flipMs = isMasterWrap ? MASTER_RESET_TIMINGS.flipMs : 820;

  // Fix 1: Engine is the timing authority — use nextSceneId from onAdvance, don't compute it in container
  const advanceToId = useCallback((nextId: MagazineSceneId) => {
    const idx = scenes.findIndex((s) => s.id === nextId);
    if (idx === -1) return;
    onSceneExit?.(currentIdRef.current);
    currentIdRef.current = nextId;
    setSceneIndex(idx);
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, String(idx));
    setPhase("holding");
    advancedRef.current = false;
  }, [scenes, onSceneExit]);

  useEffect(() => {
    ingestMagazineSceneEnter(scene.id);
    onSceneEnter?.(scene.id);
  }, [scene.id, onSceneEnter]);

  useEffect(() => {
    if (paused) return;
    advancedRef.current = false;
    const nextSceneId = MAGAZINE_V1_SCENE_REGISTRY[scene.id].nextSceneId;

    const engine = new MagazineRuntimeEngine({
      scene: {
        id: scene.id,
        durationMs: scene.durationMs,
        nextSceneId,
      },
      timings: isMasterWrap ? MASTER_RESET_TIMINGS : undefined,
      onPhaseChange: (p) => {
        if (pausedRef.current) return;
        setPhase(p);

        // When the visual transition begins, schedule content swap at the
        // edge-on midpoint (page invisible) instead of after full animation.
        if (p === "starburst") {
          pageTurnCancelRef.current?.();
          pageTurnCancelRef.current = runPageTurn(
            "forward",
            {
              onMidpoint: () => {
                if (advancedRef.current || pausedRef.current) return;
                advancedRef.current = true;
                advanceToId(nextSceneId);
              },
              onComplete: () => {
                pageTurnCancelRef.current = null;
              },
            }
          );
        }
      },
      // onAdvance is now a no-op — content swap is owned by runPageTurn above.
      onAdvance: () => {},
    });

    engine.start();
    return () => {
      engine.stop();
      pageTurnCancelRef.current?.();
      pageTurnCancelRef.current = null;
    };
  }, [sceneIndex, paused, scene, scenes, isMasterWrap, advanceToId]);

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const schedulePause = useCallback(() => {
    clearPauseTimer();
    pauseTimerRef.current = window.setTimeout(() => {
      if (!pointerInsideRef.current) return;
      setPaused(true);
      pausedRef.current = true;
    }, 500);
  }, [clearPauseTimer]);

  const handlePointerEnter = useCallback(() => {
    pointerInsideRef.current = true;
    schedulePause();
  }, [schedulePause]);

  const handlePointerMove = useCallback(() => {
    if (!pointerInsideRef.current) return;
    schedulePause();
  }, [schedulePause]);

  const handlePointerLeave = useCallback(() => {
    pointerInsideRef.current = false;
    clearPauseTimer();
    setPaused(false);
    pausedRef.current = false;
  }, [clearPauseTimer]);

  const goToScene = useCallback((id: MagazineSceneId) => {
    advancedRef.current = false;
    advanceToId(id);
  }, [advanceToId]);

  const goToIndex = useCallback((idx: number) => {
    const clamped = ((idx % scenes.length) + scenes.length) % scenes.length;
    const target = scenes[clamped];
    if (!target) return;
    advancedRef.current = false;
    advanceToId(target.id);
  }, [scenes, advanceToId]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    // Only treat as horizontal swipe if dx dominates
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 0.8) return;
    if (dx < 0) {
      // Swipe left → next scene
      goToIndex(sceneIndex + 1);
    } else {
      // Swipe right → previous scene
      goToIndex(sceneIndex - 1);
    }
  }, [sceneIndex, goToIndex]);

  return (
    <section
      aria-label="Magazine full rotation"
      data-runtime-phase={phase}
      style={{ position: "relative", minHeight: "100svh", overflow: "clip", maxWidth: "100vw" }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fix 3: Master reset glow fires during transition FROM last scene, not while sitting on it */}
      {isMasterWrap && phase !== "holding" && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(0,255,255,0.18) 0%, transparent 70%)",
            pointerEvents: "none", zIndex: 110,
            opacity: phase === "starburst" ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        />
      )}

      {/* Flip transform wrapper — covers all warm-mounted scenes */}
      <PhysicalMagazineViewport phase={phase} sceneId={scene.id}>
        <div
          style={{
            position: "absolute", inset: 0,
            transformOrigin: "left center",
            transform: getRuntimeTransform(phase, 0, mobile),
            transition: getRuntimeTransition(phase, flipMs),
            filter: phase === "starburst" ? "brightness(1.2) saturate(1.22)" : "none",
            boxShadow: phase === "flipping" ? "-14px 0 28px rgba(0,0,0,0.32), 0 10px 24px rgba(0,0,0,0.26)" : "none",
            zIndex: 3,
          }}
        >
          {/* Fix 2: All scenes warm-mounted — CSS opacity only, zero remounts.
              SceneVisibilityContext lets heavy descendants pause when not visible. */}
          {scenes.map((s, i) => {
            const isActive = i === sceneIndex;
            return (
              <div
                key={s.id}
                style={{
                  position: "absolute", inset: 0,
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                  transition: "opacity 220ms ease",
                  zIndex: isActive ? 2 : 1,
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <SceneVisibilityContext.Provider value={isActive}>
                  {s.content}
                </SceneVisibilityContext.Provider>
              </div>
            );
          })}
        </div>
      </PhysicalMagazineViewport>

      <MagazineStarburstTransition active={phase !== "holding"} phase={phase} />
      <FeatherRuffleOverlay phase={phase} />

      {/* ─── Left Chevron (Prev) ─── */}
      <button
        type="button"
        aria-label="Previous scene"
        onClick={() => goToIndex(sceneIndex - 1)}
        onMouseEnter={() => setChevronHover('prev')}
        onMouseLeave={() => setChevronHover(null)}
        style={{
          position: "fixed", left: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 210, width: 44, height: 44, borderRadius: "50%",
          background: chevronHover === 'prev'
            ? "rgba(0,255,255,0.22)"
            : "rgba(5,5,16,0.72)",
          border: `1.5px solid ${chevronHover === 'prev' ? "rgba(0,255,255,0.7)" : "rgba(0,255,255,0.25)"}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
          boxShadow: chevronHover === 'prev'
            ? "0 0 18px rgba(0,255,255,0.35), inset 0 0 10px rgba(0,255,255,0.08)"
            : "0 2px 12px rgba(0,0,0,0.5)",
          transition: "all 0.18s ease",
          opacity: sceneIndex === 0 ? 0.35 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={chevronHover === 'prev' ? "#00FFFF" : "rgba(255,255,255,0.7)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ─── Right Chevron (Next) ─── */}
      <button
        type="button"
        aria-label="Next scene"
        onClick={() => goToIndex(sceneIndex + 1)}
        onMouseEnter={() => setChevronHover('next')}
        onMouseLeave={() => setChevronHover(null)}
        style={{
          position: "fixed", right: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 210, width: 44, height: 44, borderRadius: "50%",
          background: chevronHover === 'next'
            ? "rgba(0,255,255,0.22)"
            : "rgba(5,5,16,0.72)",
          border: `1.5px solid ${chevronHover === 'next' ? "rgba(0,255,255,0.7)" : "rgba(0,255,255,0.25)"}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
          boxShadow: chevronHover === 'next'
            ? "0 0 18px rgba(0,255,255,0.35), inset 0 0 10px rgba(0,255,255,0.08)"
            : "0 2px 12px rgba(0,0,0,0.5)",
          transition: "all 0.18s ease",
          opacity: sceneIndex === scenes.length - 1 ? 0.55 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={chevronHover === 'next' ? "#00FFFF" : "rgba(255,255,255,0.7)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* ─── Scene nav dots + scene label ─── */}
      <nav
        aria-label="Scene navigation"
        style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 200,
        }}
      >
        {/* Scene label */}
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(0,255,255,0.6)", background: "rgba(5,5,16,0.72)",
          padding: "3px 10px", borderRadius: 99, border: "1px solid rgba(0,255,255,0.15)",
          backdropFilter: "blur(6px)",
        }}>
          {sceneIndex + 1} / {scenes.length}{paused ? "  · PAUSED" : ""}
        </div>

        {/* Dots row */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {scenes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to scene ${i + 1}`}
              onClick={() => goToScene(s.id)}
              style={{
                width: i === sceneIndex ? 28 : 8, height: 8,
                borderRadius: 999,
                background: i === sceneIndex ? "rgba(0,255,255,0.9)" : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", padding: 0,
                boxShadow: i === sceneIndex ? "0 0 8px rgba(0,255,255,0.5)" : "none",
              }}
            />
          ))}
        </div>

        {/* Swipe hint — only on touch devices */}
        <div style={{
          fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>← SWIPE TO NAVIGATE →</span>
        </div>
      </nav>
    </section>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

type MagazinePageFlipRuntimeProps = SingleSceneProps | MultiSceneProps;

export function MagazinePageFlipRuntime(props: MagazinePageFlipRuntimeProps) {
  if (props.scenes) {
    return (
      <MultiSceneRuntime
        scenes={props.scenes}
        initialIndex={props.initialIndex}
        onSceneEnter={props.onSceneEnter}
        onSceneExit={props.onSceneExit}
      />
    );
  }
  return <SingleSceneRuntime {...(props as SingleSceneProps)} />;
}

export default MagazinePageFlipRuntime;
