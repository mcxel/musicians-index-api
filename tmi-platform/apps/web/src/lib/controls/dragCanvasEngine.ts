"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

export interface DragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DragCanvasState {
  x: number;
  y: number;
  dragging: boolean;
  reducedMotion: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  reset: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useDragCanvasEngine(bounds: DragBounds): DragCanvasState {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    originRef.current = { x: e.clientX - x, y: e.clientY - y };
    setDragging(true);
  }, [x, y]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const nextX = clamp(e.clientX - originRef.current.x, bounds.minX, bounds.maxX);
    const nextY = clamp(e.clientY - originRef.current.y, bounds.minY, bounds.maxY);
    setX(nextX);
    setY(nextY);
  }, [bounds.maxX, bounds.maxY, bounds.minX, bounds.minY, dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const reset = useCallback(() => {
    setX(0);
    setY(0);
    setDragging(false);
  }, []);

  return useMemo(() => ({
    x,
    y,
    dragging,
    reducedMotion: prefersReducedMotion(),
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  }), [dragging, onPointerDown, onPointerMove, onPointerUp, reset, x, y]);
}
