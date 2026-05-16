"use client";

import { getReactionLabel, type ReactionType } from "@/components/live/ReactionEngine";
import LiveTipButton from "@/components/live/LiveTipButton";

type LiveViewerHudProps = {
  onReaction: (reaction: ReactionType) => void;
  onTip: (amount: number) => void;
};

export default function LiveViewerHud({ onReaction, onTip }: LiveViewerHudProps) {
  const reactions: ReactionType[] = ["clap", "heart", "fire", "star"];

  return (
    <section style={{ borderRadius: 14, border: "1px solid #5b4280", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#f0e5ff", marginTop: 0 }}>Live Viewer HUD</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {reactions.map((reaction) => (
          <button
            key={reaction}
            onClick={() => onReaction(reaction)}
            style={{ borderRadius: 8, border: "1px solid #91ceff", background: "#1a3f5f", color: "#caeaff", padding: "6px 10px", cursor: "pointer" }}
          >
            {getReactionLabel(reaction)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <LiveTipButton amount={2} onTip={onTip} />
        <LiveTipButton amount={5} onTip={onTip} />
        <LiveTipButton amount={10} onTip={onTip} />
      </div>
    </section>
  );
}
