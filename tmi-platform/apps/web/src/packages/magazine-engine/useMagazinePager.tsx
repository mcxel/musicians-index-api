"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isNavigationLocked, lockNavigation } from "@/lib/navigationLock";
import { magazinePages } from "./magazinePages";
import { getIssueById } from "./issueRegistry";

const STORAGE_KEY = "tmi-magazine-page";

type MagazinePagerContextValue = {
  pages: typeof magazinePages;
  currentIndex: number;
  currentPage: (typeof magazinePages)[number];
  direction: 1 | -1;
  isFlipping: boolean;
  canNext: boolean;
  canPrev: boolean;
  next: () => void;
  prev: () => void;
  goToIndex: (nextIndex: number) => void;
};

const MagazinePagerContext = createContext<MagazinePagerContextValue | null>(null);

export function getCurrentIssue(page: number) {
  return getIssueById(page);
}

function resolveIndexFromPath(pathname: string) {
  const found = magazinePages.findIndex((page) => page.route === pathname);
  return found >= 0 ? found : 0;
}

export function MagazinePagerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(() => resolveIndexFromPath(pathname));
  const [hasRestoredMemory, setHasRestoredMemory] = useState(false);

  const [direction, setDirection] = useState<1 | -1>(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const currentIndexRef = useRef(currentIndex);
  const flipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const nextFromPath = resolveIndexFromPath(pathname);
    setCurrentIndex((prev) => {
      if (prev !== nextFromPath) {
        setDirection(nextFromPath > prev ? 1 : -1);
      }
      return nextFromPath;
    });
  }, [pathname]);

  useEffect(() => {
    setHasRestoredMemory(false);

    if (pathname === "/") {
      const savedPageId = Number(window.sessionStorage.getItem(STORAGE_KEY));
      const savedIndex = magazinePages.findIndex((page) => page.id === savedPageId);

      if (savedIndex >= 0 && savedIndex !== currentIndexRef.current) {
        setDirection(savedIndex > currentIndexRef.current ? 1 : -1);
        setCurrentIndex(savedIndex);
      }
    }

    setHasRestoredMemory(true);
  }, [pathname]);

  useEffect(() => {
    if (!hasRestoredMemory) return;

    const current = magazinePages[currentIndex];
    if (current) {
      window.sessionStorage.setItem(STORAGE_KEY, String(current.id));
    }
  }, [currentIndex, hasRestoredMemory]);

  useEffect(() => {
    if (!hasRestoredMemory) return;
    if (isNavigationLocked()) return;

    const targetRoute = magazinePages[currentIndex]?.route;
    if (!targetRoute || pathname === targetRoute) return;

    lockNavigation(targetRoute);
    router.replace(targetRoute, { scroll: false });
  }, [currentIndex, hasRestoredMemory, pathname, router]);

  useEffect(
    () => () => {
      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }
    },
    []
  );

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const activeIndex = currentIndexRef.current;
      if (nextIndex < 0 || nextIndex >= magazinePages.length) return;
      if (nextIndex === activeIndex) return;
      if (isNavigationLocked()) return;

      setDirection(nextIndex > activeIndex ? 1 : -1);
      setIsFlipping(true);

      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }

      setCurrentIndex(nextIndex);
      flipTimerRef.current = window.setTimeout(() => setIsFlipping(false), 420);
    },
    []
  );

  const next = useCallback(() => goToIndex(currentIndexRef.current + 1), [goToIndex]);
  const prev = useCallback(() => goToIndex(currentIndexRef.current - 1), [goToIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isFormField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isFormField) return;
      if (isNavigationLocked()) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };

    document.addEventListener("keydown", onKey, true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [next, prev]);

  const value: MagazinePagerContextValue = {
    pages: magazinePages,
    currentIndex,
    currentPage: magazinePages[currentIndex],
    direction,
    isFlipping,
    canNext: currentIndex < magazinePages.length - 1,
    canPrev: currentIndex > 0,
    next,
    prev,
    goToIndex,
  };

  return <MagazinePagerContext.Provider value={value}>{children}</MagazinePagerContext.Provider>;
}

export function useMagazinePager() {
  const context = useContext(MagazinePagerContext);
  if (!context) {
    throw new Error("useMagazinePager must be used within a MagazinePagerProvider");
  }

  return context;
}
