"use client";

import type { LobbySeat } from "@/lib/lobby/lobbySeatEngine";

type AudienceAvatarSeatProps = {
  seat: LobbySeat;
  selected: boolean;
  onSelect: (seatId: string) => void;
};

const stateColor: Record<LobbySeat["state"], string> = {
  empty: "#2f2742",
  occupied: "#1f4f3e",
  reserved: "#514215",
  "bot-held": "#4b2e52",
  "live performer": "#52411d",
};

export default function AudienceAvatarSeat({ seat, selected, onSelect }: AudienceAvatarSeatProps) {
  return (
    <button
      onClick={() => onSelect(seat.id)}
      style={{
        borderRadius: 10,
        border: selected ? "1px solid #7cf2ff" : "1px solid #4e3a6d",
        background: stateColor[seat.state],
        color: "#f5e9ff",
        padding: "8px 6px",
        fontSize: 11,
        cursor: "pointer",
        textAlign: "left",
      }}
      title={seat.occupantName ? `${seat.id} - ${seat.occupantName}` : seat.id}
    >
      <div>{seat.id}</div>
      <div style={{ opacity: 0.75 }}>{seat.state}</div>
    </button>
  );
}
