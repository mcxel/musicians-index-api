"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const toggleDrawer = (d: string) => setActiveDrawer(prev => prev === d ? null : d);
  
  return (
    <DrawerContext.Provider value={{ activeDrawer, setActiveDrawer, toggleDrawer }}>
      <Suspense fallback={null}><DrawerUrlListener /></Suspense>
      {children}
    </DrawerContext.Provider>
  );
}