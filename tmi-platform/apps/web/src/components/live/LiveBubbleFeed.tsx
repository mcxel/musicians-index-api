"use client";

import type { BubbleMessage } from "@/lib/live/bubbleQueueEngine";

type LiveBubbleFeedProps = {
  bubbles: BubbleMessage[];
};

const typeColor: Record<BubbleMessage["type"], string> = {
  tip: "#8fffd8",
  praise: "#a5dbff",
  fire: "#ffb788",
};

export default function LiveBubbleFeed({ bubbles }: LiveBubbleFeedProps) {
  return (
    <section style={{ borderRadius: 14, border: "1px solid #5b4280", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#f0e5ff", marginTop: 0 }}>Live Bubble Feed</h3>
      <div style={{ display: "grid", gap: 6 }}>
        {bubbles.length === 0 ? <div style={{ color: "#9d87bf", fontSize: 12 }}>No bubbles yet.</div> : null}
        {bubbles.map((bubble) => (
          <div key={bubble.id} style={{ borderRadius: 10, border: `1px solid ${typeColor[bubble.type]}`, color: typeColor[bubble.type], background: "#120a1d", padding: "7px 9px", fontSize: 12 }}>
            {bubble.text}
          </div>
        ))}
      </div>
    </section>
  );
}
