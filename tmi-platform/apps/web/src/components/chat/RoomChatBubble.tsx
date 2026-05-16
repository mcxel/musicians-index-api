"use client";

import React, { useMemo } from "react";
import type { FloatingBubble } from "@/lib/chat/RoomBubbleChatEngine";

type RoomChatBubbleProps = {
  bubble: FloatingBubble;
  isVisible: boolean;
};

const ROLE_COLORS: Record<string, string> = {
  performer: "#00ffff",
  host: "#ffd700",
  judge: "#ff9f43",
  audience: "#ff2daa",
  sponsor: "#00ff88",
  system: "#9ca3af",
  moderator: "#ef4444",
};

const ROLE_LABELS: Record<string, string> = {
  performer: "PERFORMER",
  host: "HOST",
  judge: "JUDGE",
  audience: "AUDIENCE",
  sponsor: "SPONSOR",
  system: "SYSTEM",
  moderator: "MOD",
};

export function RoomChatBubble({ bubble, isVisible }: RoomChatBubbleProps) {
  const color = useMemo(() => ROLE_COLORS[bubble.message.role] ?? "#ffffff", [bubble.message.role]);
  const label = useMemo(() => ROLE_LABELS[bubble.message.role] ?? bubble.message.role.toUpperCase(), [
    bubble.message.role,
  ]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        left: `${bubble.position.x * 100}%`,
        top: `${bubble.position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        opacity: bubble.opacity,
        transition: bubble.state === "fading" ? "opacity 600ms ease-out" : "none",
        zIndex: bubble.zIndex,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          borderRadius: 12,
          padding: "8px 12px",
          maxWidth: 240,
          border: `2px solid ${color}`,
          background: "rgba(0,0,0,0.82)",
          color: "#ffffff",
          boxShadow: `0 0 20px ${color}66`,
          backdropFilter: "blur(4px)",
          fontSize: 12,
          lineHeight: 1.4,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Role Label */}
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: color,
            marginBottom: 4,
          }}
        >
          {label}
        </div>

        {/* Display Name */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#e5e7eb",
            marginBottom: 2,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {bubble.message.displayName}
        </div>

        {/* Message Text */}
        <div
          style={{
            fontSize: 11,
            color: "#f3f4f6",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            maxHeight: 60,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {bubble.message.text}
        </div>

        {/* Priority Badge */}
        <div
          style={{
            marginTop: 4,
            fontSize: 8,
            color: `${color}aa`,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {bubble.priority}
        </div>
      </div>
    </div>
  );
}
