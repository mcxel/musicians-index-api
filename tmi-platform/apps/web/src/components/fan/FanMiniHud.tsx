"use client";

type FanMiniHudProps = {
  onAction: (action: string) => void;
};

const HUD_ACTIONS = [
  { id: "tip", label: "TIP", icon: "💸" },
  { id: "heart", label: "HEART", icon: "❤️" },
  { id: "wave", label: "WAVE", icon: "👋" },
  { id: "confetti", label: "CONFETTI", icon: "🎊" },
  { id: "lighter", label: "LIGHTER", icon: "🔥" },
  { id: "chat", label: "CHAT", icon: "💬" },
  { id: "leave", label: "LEAVE", icon: "🚪" },
];

export default function FanMiniHud({ onAction }: FanMiniHudProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 12,
        display: "flex",
        justifyContent: "center",
        gap: 6,
        flexWrap: "wrap",
        zIndex: 10,
      }}
    >
      {HUD_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            borderRadius: 12,
            border: action.id === "leave" ? "1px solid rgba(255,60,60,0.45)" : "1px solid rgba(90,215,255,0.38)",
            background:
              action.id === "leave"
                ? "rgba(255,40,40,0.14)"
                : "rgba(4,10,24,0.88)",
            color: action.id === "leave" ? "#ff8888" : "#d7f2ff",
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 800,
            padding: "7px 9px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            minWidth: 50,
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
