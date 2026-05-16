"use client";

type LobbyReactionRailProps = {
  onReaction: (type: "clap" | "heart" | "fire" | "star") => void;
};

export default function LobbyReactionRail({ onReaction }: LobbyReactionRailProps) {
  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Reaction Rail</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onReaction("clap")} style={{ borderRadius: 8, border: "1px solid #7dd2ff", background: "#194a68", color: "#bfe9ff", padding: "6px 10px", cursor: "pointer" }}>Clap</button>
        <button onClick={() => onReaction("heart")} style={{ borderRadius: 8, border: "1px solid #ff8db0", background: "#5a2140", color: "#ffc2d4", padding: "6px 10px", cursor: "pointer" }}>Heart</button>
        <button onClick={() => onReaction("fire")} style={{ borderRadius: 8, border: "1px solid #ffbd7c", background: "#663a1a", color: "#ffd5ad", padding: "6px 10px", cursor: "pointer" }}>Fire</button>
        <button onClick={() => onReaction("star")} style={{ borderRadius: 8, border: "1px solid #f3ef89", background: "#5a5719", color: "#fffbc8", padding: "6px 10px", cursor: "pointer" }}>Star</button>
      </div>
    </section>
  );
}
