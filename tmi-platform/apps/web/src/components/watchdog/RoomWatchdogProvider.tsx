"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSharedPreview } from "@/components/preview/SharedPreviewProvider";
import { useTurnQueue } from "@/components/turnqueue/TurnQueueProvider";
import { useRoomInfrastructure } from "@/components/room/RoomInfrastructureProvider";

export type RoomHealthState = "healthy" | "warning" | "degraded" | "stuck";
export type RoomStatus = "idle" | "active" | "paused";

type WatchdogSignal = {
  queueValid: boolean;
  turnValid: boolean;
  previewOpenTooLong: boolean;
  previewStuck: boolean;
};

type RoomWatchdogContextValue = {
  roomStatus: RoomStatus;
  healthState: RoomHealthState;
  signals: WatchdogSignal;
  setRoomStatus: (status: RoomStatus) => void;
  warningThresholdMs: number;
  stuckThresholdMs: number;
};

const RoomWatchdogContext = createContext<RoomWatchdogContextValue | undefined>(undefined);

const WARNING_THRESHOLD_MS = 45_000;
const STUCK_THRESHOLD_MS = 120_000;

export function useRoomWatchdog() {
  const context = useContext(RoomWatchdogContext);
  if (!context) throw new Error("useRoomWatchdog must be used within RoomWatchdogProvider");
  return context;
}

export default function RoomWatchdogProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { isOpen: isPreviewOpen } = useSharedPreview();
  const { queue, currentTurnId, isTurnLocked } = useTurnQueue();
  const { roomStatus, setRoomStatus } = useRoomInfrastructure();

  const [previewOpenedAtMs, setPreviewOpenedAtMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    if (isPreviewOpen) {
      setPreviewOpenedAtMs((prev) => prev ?? Date.now());
      return;
    }
    setPreviewOpenedAtMs(null);
  }, [isPreviewOpen]);

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      globalThis.clearInterval(timer);
    };
  }, []);

  const value = useMemo<RoomWatchdogContextValue>(() => {
    const queueIds = queue.map((item) => item.id);
    const uniqueQueueIds = new Set(queueIds);
    const hasDuplicates = uniqueQueueIds.size !== queueIds.length;
    const queueValid = !hasDuplicates;

    const currentTurnExists = currentTurnId ? queue.some((item) => item.id === currentTurnId) : true;
    const turnValid = !isTurnLocked || currentTurnExists;

    const previewOpenDurationMs = previewOpenedAtMs ? nowMs - previewOpenedAtMs : 0;
    const previewOpenTooLong = isPreviewOpen && previewOpenDurationMs >= WARNING_THRESHOLD_MS;
    const previewStuck = isPreviewOpen && previewOpenDurationMs >= STUCK_THRESHOLD_MS;

    const signals: WatchdogSignal = {
      queueValid,
      turnValid,
      previewOpenTooLong,
      previewStuck,
    };

    let healthState: RoomHealthState = "healthy";
    if (!queueValid || !turnValid) {
      healthState = "degraded";
    }
    if (previewOpenTooLong && healthState === "healthy") {
      healthState = "warning";
    }
    if (previewStuck) {
      healthState = "stuck";
    }

    return {
      roomStatus,
      healthState,
      signals,
      setRoomStatus,
      warningThresholdMs: WARNING_THRESHOLD_MS,
      stuckThresholdMs: STUCK_THRESHOLD_MS,
    };
  }, [queue, currentTurnId, isTurnLocked, isPreviewOpen, previewOpenedAtMs, nowMs, roomStatus]);

  return <RoomWatchdogContext.Provider value={value}>{children}</RoomWatchdogContext.Provider>;
}
