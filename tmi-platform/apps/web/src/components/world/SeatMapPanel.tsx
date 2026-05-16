'use client';
// SeatMapPanel.tsx — Arena/venue seat map showing occupied/available positions
// Copilot wires: useRoomRoster(roomId) — returns occupied seat positions
// Proof: occupied seats show filled, empty seats show available
export function SeatMapPanel({ roomId }: { roomId: string }) {
  return (
    <div className="tmi-seat-map">
      <div className="tmi-seat-map__canvas" data-slot="seats">
        {/* Visual seat map — Copilot wires occupancy data */}
      </div>
      <div className="tmi-seat-map__legend">
        <span className="tmi-seat-map__occupied">Occupied</span>
        <span className="tmi-seat-map__available">Available</span>
      </div>
    </div>
  );
}
