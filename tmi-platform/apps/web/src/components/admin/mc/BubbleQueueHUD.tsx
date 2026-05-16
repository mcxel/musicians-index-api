"use client";

import type { BubbleMessage } from "@/lib/live/bubbleQueueEngine";

type BubbleQueueHUDProps = {
  bubbles: BubbleMessage[];
};

export default function BubbleQueueHUD({ bubbles }: BubbleQueueHUDProps) {
  return (
    <section style={{ border: "1px solid #5d4381", borderRadius: 14, background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#f0e6ff", marginTop: 0 }}>Bubble Queue HUD</h3>
      <p style={{ color: "#ccb8eb", fontSize: 12, marginBottom: 8 }}>Queued bubbles: {bubbles.length}</p>
      <div style={{ display: "grid", gap: 6, maxHeight: 160, overflowY: "auto" }}>
        {bubbles.map((bubble) => (
          <div key={bubble.id} style={{ borderRadius: 8, border: "1px solid #6c4c96", color: "#d8c8f1", background: "#120a1d", padding: "6px 8px", fontSize: 11 }}>
            [{bubble.type}] {bubble.text}
          </div>
        ))}
      </div>
    </section>
  );
}
