"use client";

import { useMemo } from "react";
import type { RoomChatMessage, RoomRuntimeState } from "@/lib/chat/RoomChatEngine";
import { buildPerformerFeedback } from "@/lib/chat/PerformerFeedbackEngine";

type PerformerFeedbackPanelProps = {
  messages: RoomChatMessage[];
  state: RoomRuntimeState;
};

export function PerformerFeedbackPanel({ messages, state }: PerformerFeedbackPanelProps) {
  const snapshot = useMemo(() => buildPerformerFeedback(messages, state), [messages, state]);

  return (
    <section
      style={{
        width: 300,
        borderRadius: 12,
        border: "1px solid rgba(255,45,170,0.35)",
        background: "linear-gradient(180deg, rgba(28,8,26,0.86), rgba(8,6,20,0.84))",
        boxShadow: "0 0 20px rgba(255,45,170,0.12)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <h3 style={{ margin: 0, color: "#f9a8d4", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Performer Mirror
        </h3>
        <span style={{ color: "#e5e7eb", fontSize: 10 }}>{snapshot.momentum}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ borderRadius: 8, background: "rgba(255,255,255,0.05)", padding: 8 }}>
          <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>Support</div>
          <div style={{ fontSize: 16, color: "#22c55e", fontWeight: 800 }}>{snapshot.supportScore}</div>
        </div>
        <div style={{ borderRadius: 8, background: "rgba(255,255,255,0.05)", padding: 8 }}>
          <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" }}>Pressure</div>
          <div style={{ fontSize: 16, color: "#ef4444", fontWeight: 800 }}>{snapshot.pressureScore}</div>
        </div>
      </div>

      <div style={{ maxHeight: 180, overflowY: "auto", display: "grid", gap: 6 }}>
        {snapshot.signals.slice(-8).reverse().map((signal) => (
          <div key={signal.id} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 9, color: "#c4b5fd", textTransform: "uppercase", fontWeight: 700 }}>
              {signal.type}
            </div>
            <div style={{ fontSize: 11, color: "#f3f4f6", lineHeight: 1.35 }}>{signal.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
