"use client";

import { getFlagEmoji } from "@/lib/global/FlagDisplayEngine";
import { getCountry } from "@/lib/global/GlobalCountryRegistry";
import type { GlobalRoom } from "@/lib/global/GlobalRoomDiscoveryEngine";

interface RoomCountryCardProps {
  room: GlobalRoom;
  onClick?: (roomId: string) => void;
}

export default function RoomCountryCard({ room, onClick }: RoomCountryCardProps) {
  const country = getCountry(room.countryCode);
  const flag = getFlagEmoji(room.countryCode);

  return (
    <button
      onClick={() => onClick?.(room.roomId)}
      className="w-full text-left rounded-lg p-3 transition-all hover:scale-[1.02]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <div>
            <div className="text-sm font-semibold text-white truncate max-w-[140px]">{room.title}</div>
            <div className="text-xs text-white/50">{country?.name ?? room.countryCode} · {room.genre}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-green-400 font-mono">{room.activeUsers}</div>
          <div className="text-xs text-white/30">live</div>
        </div>
      </div>
      {room.isLive && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      )}
    </button>
  );
}
