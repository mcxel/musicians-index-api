"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAudio } from "@/components/AudioProvider";
import { useSharedPreview } from "@/components/preview/SharedPreviewProvider";
import { useTurnQueue } from "@/components/turnqueue/TurnQueueProvider";
import { useRoomWatchdog } from "@/components/watchdog/RoomWatchdogProvider";

export type SessionRecoveryMode = "resumable" | "non_resumable" | "observer_only";

export type SessionRecoverySnapshot = {
  capturedAt: string;
  audio: {
    hasTrack: boolean;
    isPlaying: boolean;
  };
  preview: {
    isOpen: boolean;
    hasContent: boolean;
    sourceType: string | null;
    status: string | null;
  };
  queue: {
    size: number;
    currentTurnId: string | null;
    isTurnLocked: boolean;
  };
  room: {
    status: string;
    watchdogHealth: string;
  };
};

type RestoreResult = {
  ok: boolean;
  mode: SessionRecoveryMode;
  reason?: string;
};

type SessionRecoveryContextValue = {
  isResumable: boolean;
  recoveryMode: SessionRecoveryMode;
  snapshot: SessionRecoverySnapshot | null;
  markRecoverable: () => SessionRecoverySnapshot;
  clearRecovery: () => void;
  restorePlaceholder: () => RestoreResult;
};

const SessionRecoveryContext = createContext<SessionRecoveryContextValue | undefined>(undefined);

export function useSessionRecovery() {
  const context = useContext(SessionRecoveryContext);
  if (!context) throw new Error("useSessionRecovery must be used within SessionRecoveryProvider");
  return context;
}

export default function SessionRecoveryProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { currentTrack, isPlaying } = useAudio();
  const { isOpen: previewOpen, content: previewContent } = useSharedPreview();
  const { queue, currentTurnId, isTurnLocked } = useTurnQueue();
  const { roomStatus, healthState } = useRoomWatchdog();

  const [snapshot, setSnapshot] = useState<SessionRecoverySnapshot | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<SessionRecoveryMode>("non_resumable");

  const createSnapshot = useCallback((): SessionRecoverySnapshot => {
    return {
      capturedAt: new Date().toISOString(),
      audio: {
        hasTrack: !!currentTrack,
        isPlaying,
      },
      preview: {
        isOpen: previewOpen,
        hasContent: !!previewContent,
        sourceType: previewContent?.sourceType ?? null,
        status: previewContent?.status ?? null,
      },
      queue: {
        size: queue.length,
        currentTurnId,
        isTurnLocked,
      },
      room: {
        status: roomStatus,
        watchdogHealth: healthState,
      },
    };
  }, [currentTrack, isPlaying, previewOpen, previewContent, queue.length, currentTurnId, isTurnLocked, roomStatus, healthState]);

  const markRecoverable = useCallback(() => {
    const nextSnapshot = createSnapshot();
    setSnapshot(nextSnapshot);

    if (healthState === "stuck") {
      setRecoveryMode("observer_only");
    } else if (healthState === "degraded") {
      setRecoveryMode("non_resumable");
    } else {
      setRecoveryMode("resumable");
    }

    return nextSnapshot;
  }, [createSnapshot, healthState]);

  const clearRecovery = useCallback(() => {
    setSnapshot(null);
    setRecoveryMode("non_resumable");
  }, []);

  const restorePlaceholder = useCallback((): RestoreResult => {
    if (!snapshot) {
      return { ok: false, mode: "non_resumable", reason: "No snapshot available" };
    }

    if (recoveryMode === "observer_only") {
      return {
        ok: false,
        mode: recoveryMode,
        reason: "Observer fallback required for current health state",
      };
    }

    if (recoveryMode === "non_resumable") {
      return {
        ok: false,
        mode: recoveryMode,
        reason: "Snapshot exists but runtime is not safe to resume",
      };
    }

    return { ok: true, mode: recoveryMode };
  }, [snapshot, recoveryMode]);

  const value = useMemo<SessionRecoveryContextValue>(
    () => ({
      isResumable: recoveryMode === "resumable" && !!snapshot,
      recoveryMode,
      snapshot,
      markRecoverable,
      clearRecovery,
      restorePlaceholder,
    }),
    [recoveryMode, snapshot, markRecoverable, clearRecovery, restorePlaceholder]
  );

  return <SessionRecoveryContext.Provider value={value}>{children}</SessionRecoveryContext.Provider>;
}
