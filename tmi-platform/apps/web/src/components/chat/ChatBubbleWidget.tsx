"use client";

import { useMemo } from "react";
import type { RoomChatMessage, RoomRuntimeState } from "@/lib/chat/RoomChatEngine";
import { buildOverflowWindow } from "@/lib/chat/ChatOverflowWidgetEngine";

type ChatBubbleWidgetProps = {
  messages: RoomChatMessage[];
  state: RoomRuntimeState;
  unreadCount: number;
};

export function ChatBubbleWidget({ messages, state, unreadCount }: ChatBubbleWidgetProps) {
  const overflow = useMemo(
    () => buildOverflowWindow(messages, messages.length, state, unreadCount),
    [messages, state, unreadCount],
  );

  if (!overflow.enabled) return null;

  return (
    <aside
      style={{
        position: "absolute",
        right: 12,
        top: 12,
        width: 280,
        maxHeight: 320,
        overflow: "hidden",
        borderRadius: 12,
        border: "1px solid rgba(0,255,255,0.35)",
        background: "linear-gradient(180deg, rgba(2,8,20,0.92), rgba(15,23,42,0.85))",
        boxShadow: "0 0 24px rgba(0,255,255,0.15)",
        zIndex: 25,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          color: "#a5f3fc",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        <span>Chat Overflow</span>
        <span style={{ color: "#fff" }}>{overflow.unreadCount}</span>
      </header>

      <div style={{ maxHeight: 270, overflowY: "auto", padding: 8, display: "grid", gap: 6 }}>
        {overflow.messages.map((message) => (
          <div
            key={message.id}
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "6px 8px",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 9, color: "#67e8f9", fontWeight: 700, textTransform: "uppercase" }}>
              {message.displayName} · {message.role}
            </div>
            <div style={{ fontSize: 11, color: "#e5e7eb", lineHeight: 1.35 }}>{message.text}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
