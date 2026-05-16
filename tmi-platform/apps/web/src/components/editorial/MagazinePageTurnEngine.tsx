"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MagazineTurnDirection = "forward" | "backward" | null;
export type MagazineTurnPhase = "out" | "in" | null;

type UseMagazinePageTurnEngineOptions = {
  spreadCount: number;
  initialSpread?: number;
};

export function useMagazinePageTurnEngine({ spreadCount, initialSpread = 0 }: UseMagazinePageTurnEngineOptions) {
  const [currentSpread, setCurrentSpread] = useState(() => Math.max(0, Math.min(initialSpread, Math.max(0, spreadCount - 1))));
  const [turnDirection, setTurnDirection] = useState<MagazineTurnDirection>(null);
  const [turnPhase, setTurnPhase] = useState<MagazineTurnPhase>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const pendingSpread = useRef<number | null>(null);

  const canGoBack = currentSpread > 0;
  const canGoForward = currentSpread < spreadCount - 1;

  const commitTurn = useCallback((nextSpread: number, direction: Exclude<MagazineTurnDirection, null>) => {
    if (turnDirection || nextSpread === currentSpread) return;
    pendingSpread.current = nextSpread;
    setTurnDirection(direction);
    setTurnPhase("out");

    window.setTimeout(() => {
      setCurrentSpread(nextSpread);
      setTurnPhase("in");
      window.setTimeout(() => {
        setTurnDirection(null);
        setTurnPhase(null);
        pendingSpread.current = null;
      }, 340);
    }, 280);
  }, [currentSpread, turnDirection]);

  const forward = useCallback(() => {
    if (!canGoForward) return;
    commitTurn(currentSpread + 1, "forward");
  }, [canGoForward, commitTurn, currentSpread]);

  const back = useCallback(() => {
    if (!canGoBack) return;
    commitTurn(currentSpread - 1, "backward");
  }, [canGoBack, commitTurn, currentSpread]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") forward();
      if (event.key === "ArrowLeft") back();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [back, forward]);

  const onPointerDown = useCallback((clientX: number) => {
    pointerStartX.current = clientX;
  }, []);

  const onPointerMove = useCallback((clientX: number) => {
    if (pointerStartX.current === null) return;
    setDragOffset(clientX - pointerStartX.current);
  }, []);

  const onPointerUp = useCallback((clientX: number) => {
    if (pointerStartX.current === null) return;
    const delta = clientX - pointerStartX.current;
    pointerStartX.current = null;
    setDragOffset(0);
    if (Math.abs(delta) < 60) return;
    if (delta < 0) forward();
    else back();
  }, [back, forward]);

  const spreadTransform = useMemo(() => {
    if (!turnDirection || !turnPhase) {
      if (dragOffset === 0) return "perspective(1800px) rotateX(0deg) rotateY(0deg)";
      const dragTilt = Math.max(-12, Math.min(12, dragOffset / 18));
      return `perspective(1800px) rotateX(0deg) rotateY(${dragTilt}deg)`;
    }

    if (turnPhase === "out") {
      return turnDirection === "forward"
        ? "perspective(1800px) rotateY(-16deg) translateX(-14px)"
        : "perspective(1800px) rotateY(16deg) translateX(14px)";
    }

    return turnDirection === "forward"
      ? "perspective(1800px) rotateY(8deg) translateX(8px)"
      : "perspective(1800px) rotateY(-8deg) translateX(-8px)";
  }, [dragOffset, turnDirection, turnPhase]);

  const spreadTransition = !turnPhase
    ? "transform 120ms ease"
    : turnPhase === "out"
    ? "transform 280ms cubic-bezier(0.4, 0, 1, 1), box-shadow 280ms ease"
    : "transform 340ms cubic-bezier(0.0, 0, 0.2, 1), box-shadow 340ms ease";

  return {
    currentSpread,
    canGoBack,
    canGoForward,
    forward,
    back,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    dragOffset,
    spreadTransform,
    spreadTransition,
  };
}