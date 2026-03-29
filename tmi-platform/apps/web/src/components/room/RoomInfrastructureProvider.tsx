"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type RoomType = "arena" | "cypher" | "mini_cypher" | "producer" | "battle" | "venue" | "watch";
export type RoomStatus = "idle" | "active" | "paused";

export type RoomParticipantShell = {
  id: string;
  displayName: string;
  role?: string;
  isOnline?: boolean;
};

type RoomIdentity = {
  roomId: string;
  roomType: RoomType;
  roomTitle: string;
};

type RoomMountRegions = {
  previewWindow: string;
  turnQueueDock: string;
  liveControlPanel: string;
  watchdog: string;
  recovery: string;
};

type RoomInfrastructureContextValue = {
  roomId: string;
  roomType: RoomType;
  roomTitle: string;
  roomStatus: RoomStatus;
  roomMode: RoomType;
  participants: RoomParticipantShell[];
  participantCount: number;
  mountRegions: RoomMountRegions;
  setRoomIdentity: (identity: Partial<RoomIdentity>) => void;
  setRoomStatus: (status: RoomStatus) => void;
  setRoomMode: (mode: RoomType) => void;
  setParticipants: (participants: RoomParticipantShell[]) => void;
};

const DEFAULT_IDENTITY: RoomIdentity = {
  roomId: "room-global",
  roomType: "watch",
  roomTitle: "Global Room Shell",
};

const DEFAULT_MOUNT_REGIONS: RoomMountRegions = {
  previewWindow: "room.preview.window",
  turnQueueDock: "room.turn.queue.dock",
  liveControlPanel: "room.live.control.panel",
  watchdog: "room.watchdog",
  recovery: "room.recovery",
};

const RoomInfrastructureContext = createContext<RoomInfrastructureContextValue | undefined>(undefined);

export function useRoomInfrastructure() {
  const context = useContext(RoomInfrastructureContext);
  if (!context) {
    throw new Error("useRoomInfrastructure must be used within RoomInfrastructureProvider");
  }
  return context;
}

export default function RoomInfrastructureProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [identity, setIdentity] = useState<RoomIdentity>(DEFAULT_IDENTITY);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("idle");
  const [roomMode, setRoomMode] = useState<RoomType>("watch");
  const [participants, setParticipants] = useState<RoomParticipantShell[]>([]);

  const setRoomIdentity = useCallback((nextIdentity: Partial<RoomIdentity>) => {
    setIdentity((prev) => ({ ...prev, ...nextIdentity }));
  }, []);

  const value = useMemo<RoomInfrastructureContextValue>(
    () => ({
      roomId: identity.roomId,
      roomType: identity.roomType,
      roomTitle: identity.roomTitle,
      roomStatus,
      roomMode,
      participants,
      participantCount: participants.length,
      mountRegions: DEFAULT_MOUNT_REGIONS,
      setRoomIdentity,
      setRoomStatus,
      setRoomMode,
      setParticipants,
    }),
    [identity, roomStatus, roomMode, participants, setRoomIdentity]
  );

  return <RoomInfrastructureContext.Provider value={value}>{children}</RoomInfrastructureContext.Provider>;
}
