"use client";

import { useCallback, useMemo, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";

export type SliderDirection = "horizontal" | "vertical";

interface SliderEngineOptions {
  min: number;
  max: number;
  step?: number;
  initial?: number;
  direction?: SliderDirection;
  onChange?: (value: number) => void;
}

export interface SliderEngineState {
  value: number;
  percent: number;
  direction: SliderDirection;
  reducedMotion: boolean;
  setValue: (next: number) => void;
  increment: () => void;
  decrement: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useSliderEngine({
  min,
  max,
  step = 1,
  initial,
  direction = "horizontal",
  onChange,
}: SliderEngineOptions): SliderEngineState {
  const normalizedInitial = initial ?? min;
  const [value, rawSetValue] = useState(() => clamp(normalizedInitial, min, max));

  const setValue = useCallback((next: number) => {
    const clamped = clamp(next, min, max);
    rawSetValue(clamped);
    onChange?.(clamped);
  }, [min, max, onChange]);

  const increment = useCallback(() => {
    setValue(value + step);
  }, [setValue, step, value]);

  const decrement = useCallback(() => {
    setValue(value - step);
  }, [setValue, step, value]);

  const percent = useMemo(() => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  }, [max, min, value]);

  return {
    value,
    percent,
    direction,
    reducedMotion: prefersReducedMotion(),
    setValue,
    increment,
    decrement,
  };
}
