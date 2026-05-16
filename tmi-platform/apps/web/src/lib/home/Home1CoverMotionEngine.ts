"use client";

import { useEffect, useMemo, useState } from "react";

export interface Home1CoverMotionState {
  rankSwapFlashId: number;
  facePulseId: number;
  electricArcId: number;
  confettiBurstId: number;
  roomStatusPhase: "waiting" | "live";
  roomStatusId: number;
}

/**
 * Home1CoverMotionEngine
 * Drives staggered motion signals for the Home 1 cover without owning visual layout.
 */
export function useHome1CoverMotionEngine(): Home1CoverMotionState {
  const [rankSwapFlashId, setRankSwapFlashId] = useState(0);
  const [facePulseId, setFacePulseId] = useState(0);
  const [electricArcId, setElectricArcId] = useState(0);
  const [confettiBurstId, setConfettiBurstId] = useState(0);
  const [roomStatusId, setRoomStatusId] = useState(0);
  const [roomStatusPhase, setRoomStatusPhase] = useState<"waiting" | "live">("live");

  useEffect(() => {
    const rankSwapTimer = setInterval(() => {
      setRankSwapFlashId((n) => n + 1);
    }, 6200);

    const facePulseTimer = setInterval(() => {
      setFacePulseId((n) => n + 1);
    }, 4800);

    const electricArcTimer = setInterval(() => {
      setElectricArcId((n) => n + 1);
    }, 8000);

    const confettiTimer = setInterval(() => {
      setConfettiBurstId((n) => n + 1);
    }, 14500);

    const roomStatusTimer = setInterval(() => {
      setRoomStatusPhase((p) => (p === "waiting" ? "live" : "waiting"));
      setRoomStatusId((n) => n + 1);
    }, 9200);

    return () => {
      clearInterval(rankSwapTimer);
      clearInterval(facePulseTimer);
      clearInterval(electricArcTimer);
      clearInterval(confettiTimer);
      clearInterval(roomStatusTimer);
    };
  }, []);

  return useMemo(
    () => ({
      rankSwapFlashId,
      facePulseId,
      electricArcId,
      confettiBurstId,
      roomStatusPhase,
      roomStatusId,
    }),
    [rankSwapFlashId, facePulseId, electricArcId, confettiBurstId, roomStatusPhase, roomStatusId]
  );
}
