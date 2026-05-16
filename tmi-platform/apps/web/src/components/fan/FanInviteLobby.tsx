"use client";

type FanInviteLobbyProps = {
  invitedFriends: string[];
  onInvite: () => void;
};

const SLOT_COLORS = ["#ff7b2f", "#5ad7ff", "#ffb84a", "#62ecff"];

export default function FanInviteLobby({ invitedFriends, onInvite }: FanInviteLobbyProps) {
  return (
    <section
      style={{
        borderRadius: 14,
        border: "1px solid rgba(90,215,255,0.28)",
        background: "rgba(5,12,28,0.90)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <strong
          style={{
            color: "#9ed9ff",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontWeight: 900,
          }}
        >
          Invite Lobby
        </strong>
        <button
          type="button"
          onClick={onInvite}
          style={{
            borderRadius: 8,
            border: "1px solid rgba(255,120,45,0.44)",
            background: "rgba(255,120,45,0.16)",
            color: "#ffd6b3",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 800,
            padding: "4px 10px",
          }}
        >
          + Invite
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {invitedFriends.map((friend, i) => (
          <div
            key={friend}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              border: `1px solid ${SLOT_COLORS[i % SLOT_COLORS.length] ?? "#5ad7ff"}44`,
              background: `${SLOT_COLORS[i % SLOT_COLORS.length] ?? "#5ad7ff"}0e`,
              color: "#d7f0ff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: `${SLOT_COLORS[i % SLOT_COLORS.length] ?? "#5ad7ff"}28`,
                border: `1px solid ${SLOT_COLORS[i % SLOT_COLORS.length] ?? "#5ad7ff"}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              🎭
            </div>
            {friend}
          </div>
        ))}
      </div>
    </section>
  );
}
