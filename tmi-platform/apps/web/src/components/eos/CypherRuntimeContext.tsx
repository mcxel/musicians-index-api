"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  activateNextInQueue,
  beginCypherSessionEnd,
  completeActivePerformer,
  createInitialCypherState,
  getActiveBeat,
  getActivePerformer,
  getCypherDiscoveryStatus,
  requestMicSlot,
  restartCypherRecruiting,
  skipCurrentBeat,
  tickElapsed,
  toggleMic,
  type CypherEndKind,
  type CypherRuntimeState,
  type CypherSessionPhase,
} from "@/lib/eos/CypherRuntimeEngine";
import {
  allowsWinnerUi,
  resolveExperiencePersonality,
} from "@/lib/live/ExperiencePersonality";
import { runCompetitionRestartLoop } from "@/lib/live/CompetitionRestartLoop";
import CipherWinnerCeremony from "@/components/cipher/CipherWinnerCeremony";

/** Ending motion dwell before auto-restart recruiting (ms). */
const ENDING_DWELL_MS = 4200;

interface CypherRuntimeContextValue extends CypherRuntimeState {
  activePerformer: ReturnType<typeof getActivePerformer>;
  currentBeat: ReturnType<typeof getActiveBeat>;
  requestMic: (displayName?: string) => void;
  activateNext: () => void;
  completeActive: () => void;
  toggleMicActive: () => void;
  skipBeat: () => void;
  /** Host / bot: force session wrap with a specific end kind. */
  endSession: (kind?: CypherEndKind) => void;
  /** After ending motion — open recruiting (same roomId). */
  openRecruiting: () => void;
  discoveryStatus: ReturnType<typeof getCypherDiscoveryStatus>;
}

const CypherRuntimeContext = createContext<CypherRuntimeContextValue | null>(null);

export function CypherRuntimeProvider({
  roomId,
  sessionGenre = "Hip-Hop",
  cypherKing = false,
  children,
}: {
  roomId: string;
  sessionGenre?: string;
  /** Explicit Cypher King contest — enables champion ending only. */
  cypherKing?: boolean;
  children: ReactNode;
}) {
  const [state, setState] = useState(() => createInitialCypherState(roomId, sessionGenre));
  const endingTimer = useRef<number | null>(null);

  const personality = useMemo(
    () =>
      resolveExperiencePersonality({
        roomKind: "cypher",
        cypherKing,
      }),
    [cypherKing],
  );

  useEffect(() => {
    setState(createInitialCypherState(roomId, sessionGenre));
  }, [roomId, sessionGenre]);

  useEffect(() => {
    if (!state.isRoundRunning) return;
    const id = window.setInterval(() => setState((s) => tickElapsed(s)), 1000);
    return () => window.clearInterval(id);
  }, [state.isRoundRunning]);

  // ENDING → auto RECRUITING (keep discovery tile; honest looking-for-performers)
  useEffect(() => {
    if (state.sessionPhase !== "ENDING") {
      if (endingTimer.current) {
        window.clearTimeout(endingTimer.current);
        endingTimer.current = null;
      }
      return;
    }
    endingTimer.current = window.setTimeout(() => {
      setState((s) => {
        const next = restartCypherRecruiting(s);
        runCompetitionRestartLoop({
          venueSlug: s.roomId,
          roomKind: "cypher",
          afterResultReveal: true,
        });
        return next;
      });
    }, ENDING_DWELL_MS);
    return () => {
      if (endingTimer.current) window.clearTimeout(endingTimer.current);
    };
  }, [state.sessionPhase, state.sessionNumber]);

  const requestMic = useCallback((displayName = "You") => {
    setState((s) => requestMicSlot(s, displayName));
  }, []);

  const activateNext = useCallback(() => {
    setState((s) => activateNextInQueue(s));
  }, []);

  const completeActive = useCallback(() => {
    setState((s) => {
      const next = completeActivePerformer(s);
      // completeActivePerformer already begins NO_MORE_PARTICIPANTS when empty
      return next;
    });
  }, []);

  const toggleMicActive = useCallback(() => {
    setState((s) => toggleMic(s));
  }, []);

  const skipBeat = useCallback(() => {
    setState((s) => skipCurrentBeat(s));
  }, []);

  const endSession = useCallback(
    (kind: CypherEndKind = "SESSION_WRAP") => {
      setState((s) => {
        const resolved =
          kind === "CHAMPION" && !allowsWinnerUi(personality) ? "SESSION_WRAP" : kind;
        return beginCypherSessionEnd(s, resolved);
      });
    },
    [personality],
  );

  const openRecruiting = useCallback(() => {
    setState((s) => {
      const next = restartCypherRecruiting(s);
      runCompetitionRestartLoop({
        venueSlug: s.roomId,
        roomKind: "cypher",
        afterResultReveal: true,
      });
      return next;
    });
  }, []);

  const discoveryStatus = useMemo(() => getCypherDiscoveryStatus(state), [state]);

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
      endSession,
      openRecruiting,
      discoveryStatus,
    }),
    [
      state,
      requestMic,
      activateNext,
      completeActive,
      toggleMicActive,
      skipBeat,
      endSession,
      openRecruiting,
      discoveryStatus,
    ],
  );

  const showEnding = state.sessionPhase === "ENDING" && state.endKind != null;
  const endKind = state.endKind ?? "SESSION_WRAP";
  const championAllowed = allowsWinnerUi(personality) && endKind === "CHAMPION";

  return (
    <CypherRuntimeContext.Provider value={value}>
      <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "inherit" }}>
        {children}

        {/* Recruiting honesty banner — LOBBIES-facing status */}
        {state.sessionPhase === "RECRUITING" && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 55,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(170,45,255,0.45)",
              background: "rgba(5,5,16,0.92)",
              color: "#AA2DFF",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              pointerEvents: "none",
            }}
          >
            LOOKING FOR PERFORMERS · SESSION #{state.sessionNumber} · JOIN QUEUE
          </div>
        )}

        {showEnding && (
          <CipherWinnerCeremony
            endKind={championAllowed ? "CHAMPION" : endKind === "CHAMPION" ? "NO_MORE_PARTICIPANTS" : endKind}
            forceVisible
            presentationState="EXIT"
            sessionStats={{
              sessionNumber: state.sessionNumber,
              performerCount: state.queue.filter((e) => e.status === "done").length,
            }}
            onClose={openRecruiting}
          />
        )}
      </div>
    </CypherRuntimeContext.Provider>
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

export type { CypherSessionPhase, CypherEndKind };
