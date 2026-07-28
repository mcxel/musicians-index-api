"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  activateNextInQueue,
  completeActivePerformer,
  createInitialCypherState,
  getActiveBeat,
  getActivePerformer,
  requestMicSlot,
  skipCurrentBeat,
  tickElapsed,
  toggleMic,
  type CypherRuntimeState,
} from "@/lib/eos/CypherRuntimeEngine";

interface CypherRuntimeContextValue extends CypherRuntimeState {
  activePerformer: ReturnType<typeof getActivePerformer>;
  currentBeat: ReturnType<typeof getActiveBeat>;
  requestMic: (displayName?: string) => void;
  activateNext: () => void;
  completeActive: () => void;
  toggleMicActive: () => void;
  skipBeat: () => void;
}

const CypherRuntimeContext = createContext<CypherRuntimeContextValue | null>(null);

export function CypherRuntimeProvider({
  roomId,
  sessionGenre = "Hip-Hop",
  children,
}: {
  roomId: string;
  sessionGenre?: string;
  children: ReactNode;
}) {
  const [state, setState] = useState(() => createInitialCypherState(roomId, sessionGenre));

  useEffect(() => {
    setState(createInitialCypherState(roomId, sessionGenre));
  }, [roomId, sessionGenre]);

  useEffect(() => {
    if (!state.isRoundRunning) return;
    const id = window.setInterval(() => setState((s) => tickElapsed(s)), 1000);
    return () => window.clearInterval(id);
  }, [state.isRoundRunning]);

  const requestMic = useCallback((displayName = "You") => {
    setState((s) => requestMicSlot(s, displayName));
  }, []);

  const activateNext = useCallback(() => {
    setState((s) => activateNextInQueue(s));
  }, []);

  const completeActive = useCallback(() => {
    setState((s) => completeActivePerformer(s));
  }, []);

  const toggleMicActive = useCallback(() => {
    setState((s) => toggleMic(s));
  }, []);

  const skipBeat = useCallback(() => {
    setState((s) => skipCurrentBeat(s));
  }, []);

  const value = useMemo<CypherRuntimeContextValue>(
    () => ({
      ...state,
      activePerformer: getActivePerformer(state),
      currentBeat: getActiveBeat(state),
      requestMic,
      activateNext,
      completeActive,
      toggleMicActive,
      skipBeat,
    }),
    [state, requestMic, activateNext, completeActive, toggleMicActive, skipBeat]
  );

  return (
    <CypherRuntimeContext.Provider value={value}>{children}</CypherRuntimeContext.Provider>
  );
}

export function useCypherRuntime(): CypherRuntimeContextValue | null {
  return useContext(CypherRuntimeContext);
}

export function useCypherRuntimeRequired(): CypherRuntimeContextValue {
  const ctx = useContext(CypherRuntimeContext);
  if (!ctx) {
    throw new Error("useCypherRuntimeRequired must be used within CypherRuntimeProvider");
  }
  return ctx;
}
