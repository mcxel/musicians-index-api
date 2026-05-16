"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { MagazineTransitionState } from "@/components/magazine/MagazineTransitionEngine";

type ShellState = "closed" | "open";

type PersistentShellContextValue = {
  shellState: ShellState;
  setShellState: (next: ShellState) => void;
  transitionState: MagazineTransitionState;
  setTransitionState: (next: MagazineTransitionState) => void;
};

const PersistentShellContext = createContext<PersistentShellContextValue | null>(null);

export function PersistentShellProvider({ children }: { children: React.ReactNode }) {
  const [shellState, setShellState] = useState<ShellState>("closed");
  const [transitionState, setTransitionState] = useState<MagazineTransitionState>("closed");

  const value = useMemo<PersistentShellContextValue>(
    () => ({ shellState, setShellState, transitionState, setTransitionState }),
    [shellState, transitionState]
  );

  return <PersistentShellContext.Provider value={value}>{children}</PersistentShellContext.Provider>;
}

export function usePersistentShell() {
  const context = useContext(PersistentShellContext);
  if (!context) {
    throw new Error("usePersistentShell must be used within PersistentShellProvider");
  }
  return context;
}
