"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";

interface FreeRoamState {
  isWarping: boolean;
  destination: string | null;
}

let globalJumpFn: ((dest: string) => void) | null = null;

/** Global singleton so any component can call jumpTo without prop drilling */
export function getGlobalJumpFn() { return globalJumpFn; }

export interface FreeRoamNavigation {
  isWarping: boolean;
  jumpTo: (destination: string) => void;
}

export function useFreeRoamNavigation(): FreeRoamNavigation {
  const router = useRouter();
  const [state, setState] = useState<FreeRoamState>({ isWarping: false, destination: null });

  const jumpTo = useCallback((destination: string) => {
    if (state.isWarping) return;
    setState({ isWarping: true, destination });
    WarpEntryLog.start();

    // Brief warp-launch delay lets the warp overlay render before navigation
    const t = window.setTimeout(() => {
      router.push(destination);
    }, 120);

    return () => window.clearTimeout(t);
  }, [state.isWarping, router]);

  // Register as global so non-hook contexts can trigger jumps
  useEffect(() => {
    globalJumpFn = jumpTo;
    return () => { if (globalJumpFn === jumpTo) globalJumpFn = null; };
  }, [jumpTo]);

  // Reset warp state when navigation completes
  useEffect(() => {
    if (!state.isWarping) return;
    const t = window.setTimeout(() => setState({ isWarping: false, destination: null }), 3500);
    return () => window.clearTimeout(t);
  }, [state.isWarping]);

  return { isWarping: state.isWarping, jumpTo };
}
