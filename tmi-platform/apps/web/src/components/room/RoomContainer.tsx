"use client";

import React, { createContext, useContext, useMemo } from "react";
import RoomInfrastructureProvider from "@/components/room/RoomInfrastructureProvider";
import type { RoomType } from "@/components/room/RoomInfrastructureProvider";
import { DrawerProvider } from "@/components/room/DrawerContext";

// ── Room color/BPM context ────────────────────────────────────────────────────

interface RoomContextValue {
  roomId: string;
  title: string;
  accentColor: string;
  bpm: number;
  roomType: RoomType;
}

const RoomContext = createContext<RoomContextValue>({
  roomId: "room-global",
  title: "Global Room",
  accentColor: "#00FFFF",
  bpm: 120,
  roomType: "watch",
});

export function useRoom() {
  return useContext(RoomContext);
}

// ── RoomContainer ─────────────────────────────────────────────────────────────

interface RoomContainerProps {
  roomId: string;
  title: string;
  roomType?: RoomType;
  accentColor?: string;
  bpm?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function RoomContainer({
  roomId,
  title,
  roomType = "watch",
  accentColor = "#00FFFF",
  bpm = 120,
  children,
  className,
  style,
}: RoomContainerProps) {
  const ctxValue = useMemo<RoomContextValue>(
    () => ({ roomId, title, accentColor, bpm, roomType }),
    [roomId, title, accentColor, bpm, roomType]
  );

  return (
    <DrawerProvider>
    <RoomContext.Provider value={ctxValue}>
      <RoomInfrastructureProvider>
        <div
          className={className}
          style={{
            minHeight: "100vh",
            background: "#020209",
            color: "#fff",
            position: "relative",
            ...style,
          }}
        >
          {/* Ambient room glow */}
          <div
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`,
              zIndex: 100,
              pointerEvents: "none",
            }}
          />
          {children}
        </div>
      </RoomInfrastructureProvider>
    </RoomContext.Provider>
    </DrawerProvider>
  );
}
