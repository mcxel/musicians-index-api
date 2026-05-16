"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

export type HomepageKey = "home1" | "home1_2" | "home2" | "home3" | "home4" | "home5";

export type HomepageLoopScene = {
  key: HomepageKey;
  durationMs: number;
};

export type LoopState = {
  current: HomepageKey;
  next: HomepageKey;
  startedAt: number;
  duration: number;
  elapsed: number;
  remaining: number;
  cycle: number;
  phase: "stable" | "transition";
};

const DEFAULT_SCENES: HomepageLoopScene[] = [
  { key: "home1", durationMs: 25000 },
  { key: "home1_2", durationMs: 25000 },
  { key: "home2", durationMs: 25000 },
  { key: "home3", durationMs: 25000 },
  { key: "home4", durationMs: 25000 },
  { key: "home5", durationMs: 25000 },
];

const TRANSITION_WINDOW_MS = 1200;

type HomepageLoopContextValue = {
  scenes: HomepageLoopScene[];
  state: LoopState;
  setScene: (scene: HomepageKey) => void;
};

const HomepageLoopContext = createContext<HomepageLoopContextValue | null>(null);

function buildState(
  scenes: HomepageLoopScene[],
  sceneIndex: number,
  startedAt: number,
  now: number,
  cycle: number,
): LoopState {
  const currentScene = scenes[sceneIndex] ?? scenes[0];
  const nextScene = scenes[(sceneIndex + 1) % scenes.length] ?? scenes[0];
  const elapsed = Math.max(0, now - startedAt);
  const remaining = Math.max(0, currentScene.durationMs - elapsed);
  const phase = remaining <= TRANSITION_WINDOW_MS ? "transition" : "stable";

  return {
    current: currentScene.key,
    next: nextScene.key,
    startedAt,
    duration: currentScene.durationMs,
    elapsed,
    remaining,
    cycle,
    phase,
  };
}

export function HomepageLoopProvider({
  children,
  scenes = DEFAULT_SCENES,
}: {
  children: React.ReactNode;
  scenes?: HomepageLoopScene[];
}) {
  const safeScenes = scenes.length ? scenes : DEFAULT_SCENES;
  const [sceneIndex, setSceneIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setNow(Date.now());
    }, 200);
    return () => window.clearInterval(tickId);
  }, []);

  useEffect(() => {
    const current = safeScenes[sceneIndex] ?? safeScenes[0];
    const elapsed = now - startedAt;
    if (elapsed < current.durationMs) return;

    const nextIndex = (sceneIndex + 1) % safeScenes.length;
    setSceneIndex(nextIndex);
    setStartedAt(now);
    setCycle((prev) => prev + 1);
  }, [now, sceneIndex, startedAt, safeScenes]);

  const value = useMemo<HomepageLoopContextValue>(() => {
    const state = buildState(safeScenes, sceneIndex, startedAt, now, cycle);

    return {
      scenes: safeScenes,
      state,
      setScene: (scene: HomepageKey) => {
        const index = safeScenes.findIndex((s) => s.key === scene);
        if (index === -1) return;
        setSceneIndex(index);
        setStartedAt(Date.now());
      },
    };
  }, [safeScenes, sceneIndex, startedAt, now, cycle]);

  return createElement(HomepageLoopContext.Provider, { value }, children);
}

export function useHomepageLoop() {
  const ctx = useContext(HomepageLoopContext);
  if (!ctx) {
    throw new Error("useHomepageLoop must be used within HomepageLoopProvider");
  }
  return ctx;
}

export const HOMEPAGE_LOOP_DEFAULT_SCENES = DEFAULT_SCENES;
