"use client";

import AudienceAvatarSeat from "@/components/lobby/AudienceAvatarSeat";
import type { LobbySeat } from "@/lib/lobby/lobbySeatEngine";

type LobbySeatGridProps = {
  seats: LobbySeat[];
  selectedSeatId: string | null;
  onSelectSeat: (seatId: string) => void;
};

export default function LobbySeatGrid({ seats, selectedSeatId, onSelectSeat }: LobbySeatGridProps) {
  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Seat Grid</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: 8 }}>
        {seats.map((seat) => (
          <AudienceAvatarSeat
            key={seat.id}
            seat={seat}
            selected={selectedSeatId === seat.id}
            onSelect={onSelectSeat}
          />
        ))}
      </div>
    </section>
  );
}
