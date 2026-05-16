"use client";

type FanReactionBarProps = {
  enabledReactions: string[];
  onReaction: (reaction: string) => void;
};

const BUTTONS = [
  { id: "tip", label: "Tip", icon: "💸" },
  { id: "heart", label: "Heart", icon: "❤️" },
  { id: "wave", label: "Wave", icon: "👋" },
  { id: "confetti", label: "Confetti", icon: "🎊" },
  { id: "stage-spark", label: "Spark", icon: "⚡" },
  { id: "volume", label: "Volume", icon: "🔊" },
  { id: "menu", label: "Menu", icon: "☰" },
];

export default function FanReactionBar({ enabledReactions, onReaction }: FanReactionBarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        padding: "12px 14px",
        borderRadius: 16,
        background: "linear-gradient(160deg, rgba(6,15,36,0.95), rgba(3,8,18,0.96))",
        border: "1px solid rgba(255,120,45,0.32)",
        boxShadow: "inset 0 0 0 1px rgba(90,215,255,0.12)",
      }}
    >
      <div
        style={{
          width: "100%",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#6ec8ef",
          fontWeight: 800,
          marginBottom: 4,
        }}
      >
        Under Monitor — Reactions
      </div>
      {BUTTONS.map((button) => {
        const enabled = enabledReactions.includes(button.id);
        return (
          <button
            key={button.id}
            type="button"
            onClick={() => onReaction(button.id)}
            disabled={!enabled}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              borderRadius: 12,
              border: enabled
                ? "1px solid rgba(255,120,45,0.48)"
                : "1px solid rgba(90,215,255,0.18)",
              padding: "10px 12px",
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 800,
              color: enabled ? "#ffd8b3" : "rgba(198,238,255,0.3)",
              background: enabled ? "rgba(255,120,45,0.14)" : "rgba(8,16,32,0.6)",
              cursor: enabled ? "pointer" : "not-allowed",
              boxShadow: enabled ? "0 0 10px rgba(255,120,45,0.18), inset 0 0 0 1px rgba(255,120,45,0.2)" : "none",
              minWidth: 58,
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1, filter: enabled ? "none" : "grayscale(1) opacity(0.35)" }}>
              {button.icon}
            </span>
            <span>{button.label}</span>
          </button>
        );
      })}
    </div>
  );
}
