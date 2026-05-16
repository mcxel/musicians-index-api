"use client";

type LobbyTipRailProps = {
  onTip: (amount: number) => void;
};

export default function LobbyTipRail({ onTip }: LobbyTipRailProps) {
  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Tip Rail</h3>
      <div style={{ display: "flex", gap: 8 }}>
        {[2, 5, 10, 25].map((amount) => (
          <button key={amount} onClick={() => onTip(amount)} style={{ borderRadius: 8, border: "1px solid #74ffc9", background: "#1a5038", color: "#baffdf", padding: "6px 10px", cursor: "pointer" }}>
            Tip ${amount}
          </button>
        ))}
      </div>
    </section>
  );
}
