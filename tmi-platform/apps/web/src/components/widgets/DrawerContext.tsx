"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { registerCanisterWindow, useWindowRuntime, WindowManagerRuntime } from "@/lib/runtime/window";

interface DrawerContextType {
  activeDrawer: string | null;
  setActiveDrawer: (d: string | null) => void;
  toggleDrawer: (d: string) => void;
}

const DrawerContext = createContext<DrawerContextType>({
  activeDrawer: null,
  setActiveDrawer: () => {},
  toggleDrawer: () => {}
});

export const useDrawer = () => useContext(DrawerContext);

function DrawerUrlListener() {
  const searchParams = useSearchParams();
  const { setActiveDrawer } = useDrawer();
  
  useEffect(() => {
    const d = searchParams?.get('drawer');
    if (d) setActiveDrawer(d);
  }, [searchParams, setActiveDrawer]);
  return null;
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const runtime = useWindowRuntime();
  const [activeDrawer, setActiveDrawerState] = useState<string | null>(null);

  useEffect(() => {
    if (activeDrawer) registerCanisterWindow(activeDrawer);
  }, [activeDrawer]);

  useEffect(() => {
    if (activeDrawer && runtime.windows[activeDrawer] && !runtime.windows[activeDrawer].visible) {
      setActiveDrawerState(null);
    }
  }, [runtime, activeDrawer]);

  const setActiveDrawer = (d: string | null) => {
    if (!d) {
      if (activeDrawer) WindowManagerRuntime.hide(activeDrawer);
      setActiveDrawerState(null);
      return;
    }

    registerCanisterWindow(d);
    if (activeDrawer && activeDrawer !== d) WindowManagerRuntime.hide(activeDrawer);
    WindowManagerRuntime.show(d);
    WindowManagerRuntime.focus(d);
    setActiveDrawerState(d);
  };

  const toggleDrawer = (d: string) => {
    if (activeDrawer === d) {
      WindowManagerRuntime.hide(d);
      setActiveDrawerState(null);
      return;
    }
    setActiveDrawer(d);
  };
  
  return (
    <DrawerContext.Provider value={{ activeDrawer, setActiveDrawer, toggleDrawer }}>
      <Suspense fallback={null}><DrawerUrlListener /></Suspense>
      {children}
    </DrawerContext.Provider>
  );
}
