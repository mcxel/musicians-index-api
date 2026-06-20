"use client";

import TmiSeatedFanAvatar from "@/components/audience/TmiSeatedFanAvatar";
import type { TmiSeatedAudiencePresence } from "@/lib/audience/tmiAudienceSeatPresenceEngine";
import type { TmiSeatPosition } from "@/lib/audience/tmiFanAvatarSeatAssignment";

export default function TmiAudienceSeatGrid({
  rows = 4,
  cols = 8,
  seatMap,
  audience,
  currentFanId,
}: {
  rows?: number;
  cols?: number;
  /** Real seat metadata (section/rotation) from generateSeatMap() — VIP seats render with a gold border instead of being indistinguishable grey. */
  seatMap?: TmiSeatPosition[];
  audience: TmiSeatedAudiencePresence[];
  currentFanId?: string;
}) {
  const sectionBySeatId = new Map((seatMap ?? []).map((seat) => [seat.seatId, seat.section]));
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-300/40 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Audience Seats</p>
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">{audience.length} seated</p>
      </div>

      <div
        className="relative rounded-xl border border-white/10 bg-black/45"
        style={{ width: `${cols * 64 + 40}px`, height: `${rows * 70 + 40}px` }}
      >
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((__, col) => {
            const isVip = sectionBySeatId.get(`seat-${row}-${col}`) === "VIP";
            return (
              <div
                key={`${row}-${col}`}
                className={`absolute rounded-md ${isVip ? "border border-yellow-300/60 bg-yellow-500/10" : "border border-white/10 bg-zinc-900/60"}`}
                style={{ left: `${col * 64 + 20}px`, top: `${row * 70 + 14}px`, width: 48, height: 56 }}
              />
            );
          }),
        )}

        {audience.map((presence) => (
          <TmiSeatedFanAvatar
            key={`${presence.roomId}-${presence.fanId}`}
            presence={presence}
            isCurrentFan={presence.fanId === currentFanId}
          />
        ))}
      </div>
    </div>
  );
}
