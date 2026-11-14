/**
 * LobbyDiscoveryCard — Brady Bunch tile for Live Lobby Walls.
 * Thin adapter: LiveDiscoveryRecord → LiveSurfaceCard → LiveSurfaceCardView.
 * SELECT ≠ WATCH ≠ JOIN (Rule — mosaic interaction ladder).
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
  onSelect?: (record: LiveDiscoveryRecord) => void;
  onWatch?: (record: LiveDiscoveryRecord) => void;
}

export default function LobbyDiscoveryCard({
  record,
  focused = false,
  highlighted = false,
  onJoin,
  onSelect,
  onWatch,
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
      fillGrid
      onJoin={() => onJoin(record)}
      onSelect={onSelect ? () => onSelect(record) : undefined}
      onWatch={onWatch ? () => onWatch(record) : undefined}
    />
  );
}
