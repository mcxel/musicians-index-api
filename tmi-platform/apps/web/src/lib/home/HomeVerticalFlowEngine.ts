"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TouchEvent, WheelEvent } from "react";

type VerticalFlowConfig = {
  sectionCount: number;
  nextRoute?: string;
  prevRoute?: string;
};

export function useHomeVerticalFlowEngine({ sectionCount, nextRoute, prevRoute }: VerticalFlowConfig) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const clamp = useCallback(
    (value: number) => Math.max(0, Math.min(sectionCount - 1, value)),
    [sectionCount],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const safe = clamp(index);
      setActiveIndex(safe);
      const node = sectionRefs.current[safe];
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [clamp],
  );

  const goDelta = useCallback(
    (delta: number) => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      window.setTimeout(() => {
        wheelLock.current = false;
      }, 420);

      const target = activeIndex + delta;
      if (target < 0 && prevRoute) {
        router.push(prevRoute);
        return;
      }
      if (target > sectionCount - 1 && nextRoute) {
        router.push(nextRoute);
        return;
      }
      scrollToIndex(target);
    },
    [activeIndex, nextRoute, prevRoute, router, scrollToIndex, sectionCount],
  );

  const onWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (Math.abs(event.deltaY) < 26) return;
      event.preventDefault();
      goDelta(event.deltaY > 0 ? 1 : -1);
    },
    [goDelta],
  );

  const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = touchStartY.current;
      const end = event.changedTouches[0]?.clientY;
      touchStartY.current = null;
      if (start == null || end == null) return;
      const diff = start - end;
      if (Math.abs(diff) < 34) return;
      goDelta(diff > 0 ? 1 : -1);
    },
    [goDelta],
  );

  const bindSectionRef = useCallback((index: number) => {
    return (el: HTMLElement | null) => {
      sectionRefs.current[index] = el;
    };
  }, []);

  return useMemo(
    () => ({
      rootRef,
      activeIndex,
      onWheel,
      onTouchStart,
      onTouchEnd,
      bindSectionRef,
      scrollToIndex,
    }),
    [activeIndex, bindSectionRef, onTouchEnd, onTouchStart, onWheel, scrollToIndex],
  );
}
