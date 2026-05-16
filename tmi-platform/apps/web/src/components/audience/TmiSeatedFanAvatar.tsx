"use client";

import type { TmiSeatedAudiencePresence } from "@/lib/audience/tmiAudienceSeatPresenceEngine";

function stateGlow(state: TmiSeatedAudiencePresence["state"]): string {
  switch (state) {
    case "cheering":
    case "clapping":
      return "shadow-[0_0_26px_rgba(34,211,238,0.65)]";
    case "voting":
    case "tipping":
      return "shadow-[0_0_26px_rgba(217,70,239,0.65)]";
    case "chatting":
      return "shadow-[0_0_20px_rgba(59,130,246,0.55)]";
    default:
      return "shadow-[0_0_14px_rgba(16,185,129,0.35)]";
  }
}

export default function TmiSeatedFanAvatar({
  presence,
  isCurrentFan,
}: {
  presence: TmiSeatedAudiencePresence;
  isCurrentFan?: boolean;
}) {
  const seat = presence.assignment.seat;

  return (
    <div
      className={`absolute transition-all duration-500 ${stateGlow(presence.state)}`}
      style={{
        left: `${seat.col * 64 + 24}px`,
        top: `${seat.row * 70 + 18}px`,
      }}
      title={`${presence.fanId} • ${presence.state}`}
    >
      <div className="relative">
        <div className={`h-10 w-10 rounded-full border-2 ${isCurrentFan ? "border-fuchsia-300" : "border-cyan-300"} bg-gradient-to-br from-zinc-800 to-zinc-950`} />
        <div className="mt-1 w-max rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">
          {isCurrentFan ? "YOU" : presence.fanId.slice(0, 8)}
        </div>
      </div>
    </div>
  );
}
