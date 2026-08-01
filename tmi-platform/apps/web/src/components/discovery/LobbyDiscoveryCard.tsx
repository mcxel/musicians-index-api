/**
 * LobbyDiscoveryCard — Brady Bunch tile for Live Lobby Walls.
 * Thin adapter: LiveDiscoveryRecord → LiveSurfaceCard → LiveSurfaceCardView.
 * Neon conic-gradient rim (GPU-safe CSS). Join via caller → LobbyEntryFlow.
 */

"use client";

import { useMemo } from "react";
import type { LiveDiscoveryRecord } from "@/lib/discovery/LiveDiscoveryRecord";
import { projectDiscoveryRecordToSurfaceCard } from "@/lib/discovery/LiveSurfaceCard";
import LiveSurfaceCardView from "@/components/discovery/LiveSurfaceCardView";

export interface LobbyDiscoveryCardProps {
  record: LiveDiscoveryRecord;
  focused?: boolean;
  highlighted?: boolean;
  onJoin: (record: LiveDiscoveryRecord) => void;
}

export default function LobbyDiscoveryCard({
  record,
  focused = false,
  highlighted = false,
  onJoin,
}: LobbyDiscoveryCardProps) {
  const card = useMemo(
    () => projectDiscoveryRecordToSurfaceCard(record),
    [record],
  );

  if (!card) return null;

  return (
    <LiveSurfaceCardView
      card={card}
      focused={focused}
      highlighted={highlighted}
      onJoin={() => onJoin(record)}
    />
  );
}
