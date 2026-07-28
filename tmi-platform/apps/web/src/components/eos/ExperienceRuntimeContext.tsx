"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { RuntimeManifest } from "@/core/eos/types";

const ExperienceRuntimeContext = createContext<RuntimeManifest | null>(null);

export function ExperienceRuntimeProvider({
  manifest,
  children,
}: {
  manifest: RuntimeManifest;
  children: ReactNode;
}) {
  return (
    <ExperienceRuntimeContext.Provider value={manifest}>
      {children}
    </ExperienceRuntimeContext.Provider>
  );
}

export function useExperienceRuntime(): RuntimeManifest {
  const ctx = useContext(ExperienceRuntimeContext);
  if (!ctx) {
    throw new Error("useExperienceRuntime must be used inside ExperienceRuntimeProvider");
  }
  return ctx;
}
