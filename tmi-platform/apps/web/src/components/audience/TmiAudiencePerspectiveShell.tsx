"use client";

import { useMemo, useState } from "react";
import TmiAudienceSeatGrid from "@/components/audience/TmiAudienceSeatGrid";
import TmiSeatReactionControls from "@/components/audience/TmiSeatReactionControls";
import TmiMoveCloserPanel from "@/components/audience/TmiMoveCloserPanel";
import { joinAudienceSeat, listAudiencePresence } from "@/lib/audience/tmiAudienceSeatPresenceEngine";
import { getAudienceViewpointFromSeat } from "@/lib/audience/tmiAudienceViewpointEngine";
import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

const DEFAULT_SEATS = Array.from({ length: 32 }).map((_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  return {
    seatId: `seat-${row}-${col}`,
    row,
    col,
    x: col * 1.25 - 4.5,
    y: 0,
    z: row * 1.2,
  };
});

export default function TmiAudiencePerspectiveShell({
  roomId = "main-arena",
  fanId = "fan-you",
}: {
  roomId?: string;
  fanId?: string;
}) {
  const [tier, setTier] = useState<TmiSeatTier>("free-back-row");
  const [ready, setReady] = useState(false);

  if (!ready) {
    joinAudienceSeat(fanId, roomId, tier, DEFAULT_SEATS);
    setReady(true);
  }

  const audience = listAudiencePresence(roomId);
  const you = audience.find((entry) => entry.fanId === fanId);

  const viewpoint = useMemo(() => {
    if (!you) return undefined;
    return getAudienceViewpointFromSeat(you.assignment.seat, you.assignment.tier);
  }, [you]);

  return (
    <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-cyan-300/35 bg-black/55 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Audience Perspective</p>
        <p className="mt-1 text-xs uppercase text-zinc-300">
          camera {viewpoint ? `${viewpoint.cameraX.toFixed(1)}, ${viewpoint.cameraY.toFixed(1)}, ${viewpoint.cameraZ.toFixed(1)}` : "n/a"}
        </p>
        <div className="mt-3">
          <TmiAudienceSeatGrid rows={4} cols={8} audience={audience} currentFanId={fanId} />
        </div>
      </div>

      <div className="space-y-3">
        <TmiSeatReactionControls roomId={roomId} fanId={fanId} />
        <TmiMoveCloserPanel
          currentTier={tier}
          onTierChange={(nextTier) => {
            setTier(nextTier);
            joinAudienceSeat(fanId, roomId, nextTier, DEFAULT_SEATS);
          }}
        />
      </div>
    </section>
  );
}
