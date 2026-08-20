"use client";

/**
 * Stream & Win — live video mosaic (GTA-lobby style).
 * Reuses LiveLobbyWallGrid + DiscoveryBus; tap tile → instant /live/rooms/{roomId}.
 */

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MobileQuickPanelShell from "@/components/hud/MobileQuickPanelShell";
import LiveLobbyWallGrid, { type LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import { discoveryToLobbyRoom } from "@/lib/discovery/discoveryToLobbyRoom";
import { filterStreamWinDiscoveryRecords } from "@/lib/commandCenter/streamWinDiscovery";

const GOLD = "#FFD700";

export interface StreamWinMosaicPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StreamWinMosaicPanel({ isOpen, onClose }: StreamWinMosaicPanelProps) {
  const router = useRouter();
  const records = useDiscoveryBus(null);
  const streamWinRecords = useMemo(
    () => filterStreamWinDiscoveryRecords(records),
    [records],
  );
  const rooms = useMemo(
    () => streamWinRecords.map(discoveryToLobbyRoom),
    [streamWinRecords],
  );

  const genreGroups = useMemo(() => {
    const map = new Map<string, LobbyRoom[]>();
    for (const room of rooms) {
      const key = room.genre?.trim() || "Stream & Win Radio";
      const list = map.get(key) ?? [];
      list.push(room);
      map.set(key, list);
    }
    return map;
  }, [rooms]);

  const genres = useMemo(() => Array.from(genreGroups.keys()), [genreGroups]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const visibleRooms = useMemo(() => {
    if (activeGenre) return genreGroups.get(activeGenre) ?? [];
    return rooms;
  }, [activeGenre, genreGroups, rooms]);

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      const href = `/live/rooms/${room.id}`;
      setActiveGenre(null);
      // Hard navigation — avoids client transition torn down when the quick panel closes on mobile.
      if (typeof window !== "undefined") {
        window.location.assign(href);
        return;
      }
      router.push(href);
      onClose();
    },
    [onClose, router],
  );

  const handleGenreSelect = useCallback(
    (genre: string) => {
      const group = genreGroups.get(genre) ?? [];
      if (group.length === 1) {
        handleRoomJoin(group[0]!);
        return;
      }
      setActiveGenre(genre);
    },
    [genreGroups, handleRoomJoin],
  );

  return (
    <MobileQuickPanelShell
      isOpen={isOpen}
      title="📻 STREAM & WIN · LIVE MOSAIC"
      accentColor={GOLD}
      onClose={() => {
        setActiveGenre(null);
        onClose();
      }}
    >
      <div style={{ padding: "8px 10px 16px", minHeight: 200 }}>
        {genres.length > 1 ? (
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 10,
              scrollbarWidth: "none" as const,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveGenre(null)}
              style={genrePillStyle(!activeGenre)}
            >
              ALL
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreSelect(genre)}
                style={genrePillStyle(activeGenre === genre)}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}

        {visibleRooms.length === 0 ? (
          <div
            style={{
              padding: 28,
              textAlign: "center",
              fontSize: 10,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.5,
            }}
          >
            No Stream & Win rooms live right now.
            <br />
            Check back when a listening lounge opens.
          </div>
        ) : (
          <LiveLobbyWallGrid
            rooms={visibleRooms}
            title="Tap preview → join room"
            accentColor={GOLD}
            typeLabel="STREAM & WIN"
            variant="quick"
            onRoomJoin={handleRoomJoin}
          />
        )}
      </div>
    </MobileQuickPanelShell>
  );
}

function genrePillStyle(active: boolean): React.CSSProperties {
  return {
    flexShrink: 0,
    padding: "5px 10px",
    borderRadius: 8,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.06em",
    cursor: "pointer",
    fontFamily: "inherit",
    border: active ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.14)",
    background: active ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
    color: active ? "#FFD700" : "rgba(255,255,255,0.75)",
  };
}
