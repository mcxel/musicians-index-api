"use client";

import { useMemo } from "react";
import type { RoomChatMessage } from "@/lib/chat/RoomChatEngine";
import { moderateMessage } from "@/lib/chat/ChatModerationEngine";

type ModeratorShieldProps = {
  incoming: RoomChatMessage[];
  historyByUser: Record<string, RoomChatMessage[]>;
};

export function ModeratorShield({ incoming, historyByUser }: ModeratorShieldProps) {
  const results = useMemo(() => {
    return incoming.map((message) => {
      const history = historyByUser[message.userId] ?? [];
      return moderateMessage(message, history);
    });
  }, [incoming, historyByUser]);

  const dropped = results.filter((r) => r.action === "drop-hate" || r.action === "drop-threat").length;
  const timedOut = results.filter((r) => r.action === "timeout-user").length;
  const reportable = results.filter((r) => r.reportable).length;

  return (
    <section
      style={{
        borderRadius: 12,
        border: "1px solid rgba(239,68,68,0.35)",
        background: "linear-gradient(180deg, rgba(40,8,8,0.9), rgba(22,8,8,0.88))",
        padding: 12,
        width: 260,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 8, color: "#fca5a5", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Moderator Shield
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
        <Stat label="Dropped" value={dropped} color="#ef4444" />
        <Stat label="Timeout" value={timedOut} color="#f59e0b" />
        <Stat label="Reports" value={reportable} color="#38bdf8" />
      </div>

      <div style={{ maxHeight: 160, overflowY: "auto", display: "grid", gap: 6 }}>
        {results.slice(-10).reverse().map((result) => (
          <div key={result.messageId} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 9, color: "#fda4af", textTransform: "uppercase", fontWeight: 700 }}>
              {result.action}
            </div>
            <div style={{ fontSize: 10, color: "#e5e7eb" }}>
              {result.reasons.length > 0 ? result.reasons.join(", ") : "clean"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ borderRadius: 8, padding: 6, background: "rgba(255,255,255,0.04)" }}>
      <div style={{ fontSize: 8, color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
