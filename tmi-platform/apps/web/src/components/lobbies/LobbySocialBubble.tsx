"use client";

import LobbyAvatarSeat from "@/components/lobbies/LobbyAvatarSeat";
import AvatarItemShowcase from "@/components/avatar/AvatarItemShowcase";

type SeatVisualState = "open" | "occupied" | "vip" | "reserved" | "speaker" | "host";

export type TheaterSeat = {
  id: string;
  row: string;
  index: number;
  visualState: SeatVisualState;
  occupantName?: string;
};

type LobbySeatGridProps = {
  seats: TheaterSeat[];
  selectedSeatId: string | null;
  onSelectSeat: (seatId: string) => void;
};

export default function LobbySeatGrid({ seats, selectedSeatId, onSelectSeat }: LobbySeatGridProps) {
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null;
  const showInventory = selectedSeat && selectedSeat.visualState !== "open";

  return (
    <section style={{ borderRadius: 16, border: "1px solid #6f4aa5", background: "#120a20", padding: 14 }}>
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>Seat Grid</div>
      <h3 style={{ margin: "6px 0 10px", color: "#f0e6ff", fontSize: 18 }}>Avatar Seat UI</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 8 }}>
        {seats.map((seat) => {
          return (
            <LobbyAvatarSeat
              key={seat.id}
              seat={seat}
              selected={seat.id === selectedSeatId}
              onSelect={onSelectSeat}
            />
          );
        })}
      </div>

      {showInventory ? (
        <div style={{ marginTop: 10 }}>
          <AvatarItemShowcase seed={`${selectedSeat.id}-${selectedSeat.occupantName ?? "guest"}`} />
        </div>
      ) : null}
    </section>
  );
}
