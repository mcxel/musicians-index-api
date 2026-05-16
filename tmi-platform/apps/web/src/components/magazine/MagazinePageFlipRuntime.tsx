"use client";

import {
  MAGAZINE_V1_SCENE_REGISTRY,
  MASTER_RESET_TIMINGS,
  MagazineRuntimeEngine,
  type MagazineRuntimePhase,
  type MagazineSceneId,
} from "@/engines/magazine/MagazineRuntimeEngine";
import { ingestMagazineSceneEnter } from "@/lib/performer/MagazinePerformerAnalyticsBridge";
import PhysicalMagazineViewport from "./PhysicalMagazineViewport";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import MagazineStarburstTransition from "./MagazineStarburstTransition";

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

function getRuntimeTransform(phase: MagazineRuntimePhase, dragX = 0): string {
  const dragTilt = Math.max(-12, Math.min(12, dragX / 20));
  if (phase === "holding")   return `perspective(1800px) rotateY(${dragTilt}deg) translateZ(0)`;
  if (phase === "starburst") return "perspective(1800px) rotateY(-6deg) scale(0.986) translateX(-8px)";
  if (phase === "flipping")  return "perspective(1800px) rotateY(-19deg) rotateX(1deg) translateX(-26px) scale(0.975)";
  return "perspective(1800px) rotateY(8deg) translateX(10px) scale(0.994)";
}

function getRuntimeTransition(phase: MagazineRuntimePhase, flipMs = 820): string {
  if (phase === "holding")   return "transform 140ms ease";
  if (phase === "starburst") return "transform 420ms cubic-bezier(0.18, 0.82, 0.22, 1), filter 420ms ease";
  if (phase === "flipping")  return `transform ${flipMs}ms cubic-bezier(0.33, 0.06, 0.08, 1), box-shadow ${flipMs}ms ease`;
  return "transform 420ms cubic-bezier(0.08, 0.82, 0.2, 1), box-shadow 420ms ease";
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
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 12% 24%, rgba(0, 255, 255, 0.14) 0%, transparent 58%), radial-gradient(ellipse at 84% 76%, rgba(255, 45, 170, 0.14) 0%, transparent 58%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", left: "50%", top: "5%", width: "min(1200px, 96vw)", height: "90%", transform: "translateX(-50%)", borderRadius: 22, background: "linear-gradient(140deg, rgba(8, 6, 24, 0.9), rgba(5, 5, 16, 0.94))", boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 18px 0 22px rgba(255,255,255,0.04), inset -18px 0 20px rgba(0,0,0,0.3)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 3, minHeight: "100vh", transformOrigin: "left center", transform: getRuntimeTransform(phase, dragX), transition: getRuntimeTransition(phase), filter: phase === "starburst" ? "brightness(1.2) saturate(1.22)" : "none", boxShadow: phase === "flipping" ? "-22px 0 38px rgba(0, 0, 0, 0.4), 0 18px 40px rgba(0, 0, 0, 0.34)" : "none" }}>
        {children}
      </div>
      <MagazineStarburstTransition active={phase !== "holding"} phase={phase} />
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
  const advancedRef = useRef(false);
  const pausedRef = useRef(false);
  const pauseTimerRef = useRef<number | null>(null);
  const pointerInsideRef = useRef(false);
  const currentIdRef = useRef<MagazineSceneId>(scenes[initialIndex]?.id ?? scenes[0]!.id);

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
      },
      onAdvance: (nextId) => {
        if (advancedRef.current || pausedRef.current) return;
        advancedRef.current = true;
        advanceToId(nextId);  // engine decides what's next
      },
    });

    engine.start();
    return () => engine.stop();
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

  return (
    <section
      aria-label="Magazine full rotation"
      data-runtime-phase={phase}
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
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
            transform: getRuntimeTransform(phase),
            transition: getRuntimeTransition(phase, flipMs),
            filter: phase === "starburst" ? "brightness(1.2) saturate(1.22)" : "none",
            boxShadow: phase === "flipping" ? "-22px 0 38px rgba(0,0,0,0.4), 0 18px 40px rgba(0,0,0,0.34)" : "none",
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
                  overflow: "hidden",
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

      {/* Scene nav dots */}
      <nav
        aria-label="Scene navigation"
        style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 200 }}
      >
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Go to scene ${i + 1}`}
            onClick={() => goToScene(s.id)}
            style={{
              width: i === sceneIndex ? 24 : 8, height: 8,
              borderRadius: 999,
              background: i === sceneIndex ? "rgba(0,255,255,0.85)" : "rgba(255,255,255,0.22)",
              border: "none", cursor: "pointer",
              transition: "all 0.3s ease", padding: 0,
            }}
          />
        ))}
      </nav>

      {/* Position HUD */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 200,
          fontSize: 8, fontWeight: 900, letterSpacing: "0.3em",
          textTransform: "uppercase", color: "rgba(0,255,255,0.55)",
          pointerEvents: "none",
        }}
      >
        {sceneIndex + 1}/{scenes.length}{paused ? " · PAUSED" : ""}
      </div>
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
