"use client";

import { useState, useEffect, useRef } from "react";
import {
  roomChatEngine,
  type RoomChatMessage,
  type RoomChatRole,
} from "@/lib/messaging/RoomChatEngine";
import "@/styles/tmiTypography.css";

interface RoomChatPanelProps {
  roomId: string;
  userId: string;
  userName: string;
  userRole?: RoomChatRole;
  isMod?: boolean;
  /** Height of the chat panel */
  height?: number;
}

const ROLE_BADGE: Record<RoomChatRole, { label: string; color: string }> = {
  host:   { label: "HOST",    color: "#FFD700" },
  mod:    { label: "MOD",     color: "#AA2DFF" },
  artist: { label: "ARTIST",  color: "#FF2DAA" },
  fan:    { label: "FAN",     color: "#00FFFF" },
  viewer: { label: "",        color: "rgba(255,255,255,0.3)" },
  bot:    { label: "BOT",     color: "rgba(255,255,255,0.2)" },
};

const TYPE_ICONS: Partial<Record<string, string>> = {
  tip:        "💰",
  "crown-toss": "👑",
  cheer:      "🔥",
  vote:       "🗳️",
  "tip-blast": "💸",
  join:       "→",
  leave:      "←",
  system:     "⚙",
};

export default function RoomChatPanel({
  roomId,
  userId,
  userName,
  userRole = "fan",
  isMod = false,
  height = 360,
}: RoomChatPanelProps) {
  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ensure room is initialised
  useEffect(() => {
    roomChatEngine.initRoom(roomId);
    // Emit join message
    roomChatEngine.emitPresenceEvent(roomId, userId, userName, "join");
    refresh();

    const interval = setInterval(refresh, 1500);
    return () => {
      clearInterval(interval);
      roomChatEngine.emitPresenceEvent(roomId, userId, userName, "leave");
    };
  }, [roomId]);

  const refresh = () => {
    const latest = roomChatEngine.getRecentMessages(roomId, 80);
    setMessages([...latest]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    if (!draft.trim()) return;
    roomChatEngine.sendMessage({
      roomId,
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      body: draft.trim(),
    });
    setDraft("");
    refresh();
  };

  const deleteMsg = (messageId: string) => {
    if (!isMod) return;
    roomChatEngine.deleteMessage(roomId, messageId);
    refresh();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height,
        background: "rgba(5,5,16,0.95)",
        border: "1px solid rgba(0,255,255,0.12)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00FF88",
              boxShadow: "0 0 5px #00FF88",
              display: "inline-block",
            }}
          />
          <span className="tmi-hud-label" style={{ fontSize: 7, color: "#00FFFF" }}>
            LIVE CHAT
          </span>
        </div>
        <span className="tmi-counter" style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>
          {messages.length} msgs
        </span>
      </div>

      {/* Message feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {messages.map((msg) => {
          const badge = ROLE_BADGE[msg.senderRole];
          const icon = TYPE_ICONS[msg.type];
          const isSystem =
            msg.type === "system" || msg.type === "join" || msg.type === "leave";

          if (isSystem) {
            return (
              <div
                key={msg.messageId}
                className="tmi-body-copy"
                style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  padding: "2px 0",
                }}
              >
                {icon} {msg.body}
              </div>
            );
          }

          const isTip = msg.type === "tip" || msg.type === "tip-blast";

          return (
            <div
              key={msg.messageId}
              style={{
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
                background: isTip ? "rgba(255,215,0,0.06)" : "transparent",
                borderRadius: isTip ? 6 : 0,
                padding: isTip ? "4px 6px" : 0,
              }}
            >
              {/* Sender name + badge */}
              <span
                className="tmi-hud-label"
                style={{
                  fontSize: 8,
                  color: badge.color,
                  flexShrink: 0,
                  lineHeight: 1.5,
                }}
              >
                {badge.label && (
                  <span
                    style={{
                      fontSize: 6,
                      background: `${badge.color}22`,
                      border: `1px solid ${badge.color}44`,
                      borderRadius: 3,
                      padding: "1px 4px",
                      marginRight: 4,
                    }}
                  >
                    {badge.label}
                  </span>
                )}
                {msg.senderName}
              </span>

              {/* Body */}
              <div style={{ flex: 1 }}>
                {isTip && msg.valueUsdCents && (
                  <span
                    className="tmi-counter"
                    style={{ fontSize: 8, color: "#FFD700", marginRight: 4 }}
                  >
                    {icon} ${(msg.valueUsdCents / 100).toFixed(2)}
                  </span>
                )}
                <span
                  className="tmi-body-copy"
                  style={{
                    fontSize: 10,
                    color: isTip ? "#FFD700" : "rgba(255,255,255,0.75)",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.body}
                </span>
              </div>

              {/* Mod delete */}
              {isMod && msg.senderId !== "system" && (
                <button
                  onClick={() => deleteMsg(msg.messageId)}
                  title="Delete"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,45,170,0.4)",
                    fontSize: 8,
                    padding: "0 2px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose bar */}
      <div
        style={{
          padding: "8px 10px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          gap: 6,
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Say something..."
          maxLength={500}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            padding: "6px 10px",
            color: "#fff",
            fontSize: 10,
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          className="tmi-button-text"
          style={{
            padding: "6px 12px",
            fontSize: 8,
            borderRadius: 6,
            background: draft.trim() ? "rgba(0,255,255,0.12)" : "transparent",
            border: `1px solid ${draft.trim() ? "rgba(0,255,255,0.35)" : "rgba(255,255,255,0.06)"}`,
            color: draft.trim() ? "#00FFFF" : "rgba(255,255,255,0.15)",
            cursor: draft.trim() ? "pointer" : "default",
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
