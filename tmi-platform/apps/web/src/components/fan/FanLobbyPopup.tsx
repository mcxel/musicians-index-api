"use client";

type FanLobbyPopupProps = {
  invitedFriends: string[];
  lobbySlots: number;
  onJoin: () => void;
  onMoveCloser: () => void;
};

const AVATAR_COLORS = ["#ff7b2f", "#5ad7ff", "#ffb84a", "#62ecff", "#ff5266", "#a78cff"];

export default function FanLobbyPopup({ invitedFriends, lobbySlots, onJoin, onMoveCloser }: FanLobbyPopupProps) {
  const seats = Array.from({ length: lobbySlots }, (_, i) => invitedFriends[i] ?? `Open ${i + 1}`);
  const filledCount = Math.min(invitedFriends.length, lobbySlots);

  return (
    <section
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,120,45,0.44)",
        background: "linear-gradient(160deg, rgba(8,16,36,0.96), rgba(4,9,18,0.98))",
        padding: 14,
        boxShadow: "0 0 24px rgba(255,120,45,0.12)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ color: "#ffd09b", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 900 }}>
          Pop-up Lobby
        </strong>
        <span
          style={{
            borderRadius: 999,
            border: "1px solid rgba(90,215,255,0.35)",
            color: "#9bdcff",
            fontSize: 10,
            padding: "2px 8px",
            fontWeight: 700,
          }}
        >
          {filledCount}/{lobbySlots} seats
        </span>
      </div>

      {/* Avatar bubbles */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {seats.map((name, i) => {
          const filled = i < invitedFriends.length;
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length] ?? "#5ad7ff";
          return (
            <div key={`${name}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  border: `2px solid ${filled ? color : "rgba(255,255,255,0.14)"}`,
                  background: filled
                    ? `radial-gradient(circle at 38% 32%, ${color}30, rgba(4,10,22,0.88))`
                    : "rgba(6,12,26,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: filled ? 18 : 14,
                  color: filled ? color : "rgba(255,255,255,0.2)",
                  boxShadow: filled ? `0 0 12px ${color}44` : "none",
                }}
              >
                {filled ? "🎭" : "+"}
              </div>
              <div style={{ fontSize: 9, color: filled ? "#d9f2ff" : "rgba(255,255,255,0.28)", fontWeight: 700, letterSpacing: "0.04em" }}>
                {name.length > 7 ? `${name.slice(0, 7)}…` : name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat map preview */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7abee0", fontWeight: 800, marginBottom: 6 }}>
          Seat View
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 3 }}>
          {Array.from({ length: 32 }, (_, i) => {
            const reserved = i >= 12 && i < 12 + filledCount;
            return (
              <div
                key={i}
                style={{
                  height: 10,
                  borderRadius: 3,
                  background: reserved ? "#ff7b2f" : i < 8 ? "rgba(90,215,255,0.18)" : "rgba(255,255,255,0.08)",
                  boxShadow: reserved ? "0 0 5px rgba(255,120,45,0.5)" : "none",
                }}
              />
            );
          })}
        </div>
        <div style={{ fontSize: 9, color: "#6aadcb", marginTop: 4 }}>Orange = your group · Blue = front · Grey = available</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onJoin}
          style={{
            flex: 1,
            borderRadius: 10,
            border: "1px solid rgba(255,120,45,0.5)",
            background: "rgba(255,120,45,0.18)",
            color: "#ffd7aa",
            padding: "9px 10px",
            fontSize: 11,
            fontWeight: 900,
            cursor: "pointer",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Join Room
        </button>
        <button
          type="button"
          onClick={onMoveCloser}
          style={{
            flex: 1,
            borderRadius: 10,
            border: "1px solid rgba(90,215,255,0.45)",
            background: "rgba(90,215,255,0.10)",
            color: "#d9f5ff",
            padding: "9px 10px",
            fontSize: 11,
            fontWeight: 900,
            cursor: "pointer",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Move Closer
        </button>
      </div>
    </section>
  );
}
