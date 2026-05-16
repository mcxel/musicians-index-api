"use client";

import type { SeatingLayout, Seat } from "@/lib/environments/SeatingLayoutEngine";

type SeatingMapPreviewProps = {
  layout: SeatingLayout;
  accentColor: string;
};

const STATUS_COLOR: Record<string, string> = {
  empty:     "rgba(255,255,255,0.12)",
  occupied:  "currentColor",
  vip:       "#FFD700",
  reserved:  "#AA2DFF",
  bot:       "#00FFFF",
};

function SeatDot({ seat, accentColor }: { seat: Seat; accentColor: string }) {
  const color = seat.status === "occupied" ? accentColor : STATUS_COLOR[seat.status] ?? STATUS_COLOR["empty"];
  return (
    <div
      title={seat.label ?? `Row ${seat.row + 1} Col ${seat.col + 1}`}
      style={{
        position: "absolute",
        left: `${seat.x * 100}%`,
        top: `${seat.y * 100}%`,
        transform: "translate(-50%, -50%)",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        opacity: seat.status === "empty" ? 0.4 : 0.85,
      }}
    />
  );
}

export function SeatingMapPreview({ layout, accentColor }: SeatingMapPreviewProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "5%",
        top: "58%",
        width: "90%",
        height: "30%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {layout.seats.map((seat) => (
          <SeatDot key={seat.id} seat={seat} accentColor={accentColor} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -14,
          right: 0,
          fontSize: 9,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.1em",
        }}
      >
        {layout.occupiedCount}/{layout.totalCapacity} SEATS
      </div>
    </div>
  );
}
