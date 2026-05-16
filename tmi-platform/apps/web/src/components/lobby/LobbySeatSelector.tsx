"use client";

type LobbySeatSelectorProps = {
  selectedSeatId: string | null;
  onClaim: () => void;
  onRelease: () => void;
  onSwitch: () => void;
};

export default function LobbySeatSelector({
  selectedSeatId,
  onClaim,
  onRelease,
  onSwitch,
}: LobbySeatSelectorProps) {
  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0, marginBottom: 10 }}>Seat Selector</h3>
      <p style={{ color: "#d0beeb", fontSize: 12, marginTop: 0 }}>
        Selected seat: {selectedSeatId ?? "none"}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onClaim} style={{ borderRadius: 8, border: "1px solid #64ffc2", background: "#14412f", color: "#9ff8d2", padding: "6px 10px", cursor: "pointer" }}>Claim</button>
        <button onClick={onRelease} style={{ borderRadius: 8, border: "1px solid #ff9ba9", background: "#4f1e2a", color: "#ffc5cf", padding: "6px 10px", cursor: "pointer" }}>Release</button>
        <button onClick={onSwitch} style={{ borderRadius: 8, border: "1px solid #8fd2ff", background: "#173e5d", color: "#c4e7ff", padding: "6px 10px", cursor: "pointer" }}>Switch</button>
      </div>
    </section>
  );
}
