"use client";

type VenueAudienceShellProps = {
  occupiedSeats: number;
  reactions: number;
  tipsTotal: number;
  onSeatDelta: (delta: number) => void;
  onReaction: () => void;
  onTip: (amount: number) => void;
};

export default function VenueAudienceShell({
  occupiedSeats,
  reactions,
  tipsTotal,
  onSeatDelta,
  onReaction,
  onTip,
}: VenueAudienceShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #4f5f86", background: "#141a29", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#bfd6ff" }}>Venue Audience Shell</h3>
      <p style={{ color: "#cfdbf5", fontSize: 12 }}>Seats occupied: {occupiedSeats}</p>
      <p style={{ color: "#cfdbf5", fontSize: 12 }}>Live reactions: {reactions}</p>
      <p style={{ color: "#cfdbf5", fontSize: 12 }}>Tips total: ${tipsTotal}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={() => onSeatDelta(1)} style={{ borderRadius: 8, border: "1px solid #7cb5ff", background: "#21406b", color: "#cfe8ff", padding: "6px 10px", cursor: "pointer" }}>Seat +1</button>
        <button onClick={() => onSeatDelta(-1)} style={{ borderRadius: 8, border: "1px solid #7cb5ff", background: "#21406b", color: "#cfe8ff", padding: "6px 10px", cursor: "pointer" }}>Seat -1</button>
        <button onClick={onReaction} style={{ borderRadius: 8, border: "1px solid #9ec8ff", background: "#2b507f", color: "#d9ebff", padding: "6px 10px", cursor: "pointer" }}>Send Reaction</button>
        <button onClick={() => onTip(5)} style={{ borderRadius: 8, border: "1px solid #81ffc5", background: "#175037", color: "#c2ffe1", padding: "6px 10px", cursor: "pointer" }}>Tip $5</button>
      </div>
    </section>
  );
}
