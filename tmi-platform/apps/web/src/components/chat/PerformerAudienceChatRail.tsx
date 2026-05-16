"use client";

import React, { useMemo } from "react";
import type { RoomChatMessage } from "@/lib/chat/RoomChatEngine";

type PerformerAudienceChatRailProps = {
  messages: RoomChatMessage[];
  performerName?: string;
  maxMessages?: number;
  position?: "left" | "right" | "bottom";
};

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  performer: { label: "🎤", color: "#00ffff" },
  host: { label: "👑", color: "#ffd700" },
  judge: { label: "⚖️", color: "#ff9f43" },
  sponsor: { label: "💰", color: "#00ff88" },
  audience: { label: "👥", color: "#ff2daa" },
  system: { label: "⚙️", color: "#9ca3af" },
  moderator: { label: "🛡️", color: "#ef4444" },
};

export function PerformerAudienceChatRail({
  messages,
  performerName,
  maxMessages = 12,
  position = "right",
}: PerformerAudienceChatRailProps) {
  const recentMessages = useMemo(() => {
    return messages.slice(Math.max(0, messages.length - maxMessages));
  }, [messages, maxMessages]);

  const audienceMessages = useMemo(() => {
    return recentMessages.filter(
      (m) => m.role === "audience" || m.role === "sponsor" || m.role === "judge",
    );
  }, [recentMessages]);

  const positionStyles = {
    left: { left: 12, top: "50%", transform: "translateY(-50%)" },
    right: { right: 12, top: "50%", transform: "translateY(-50%)" },
    bottom: { left: "50%", bottom: 12, transform: "translateX(-50%)" },
  } as const;

  return (
    <div
      role="region"
      aria-label="Performer audience chat rail"
      style={{
        position: "absolute",
        ...positionStyles[position],
        width: position === "bottom" ? "auto" : 320,
        maxHeight: position === "bottom" ? 120 : 400,
        display: "flex",
        flexDirection: position === "bottom" ? "row" : "column",
        gap: 8,
        padding: 12,
        borderRadius: 16,
        border: "1px solid rgba(0,255,255,0.3)",
        background: "linear-gradient(135deg, rgba(10,15,35,0.92), rgba(20,30,50,0.88))",
        boxShadow: "0 0 32px rgba(0,255,255,0.15)",
        backdropFilter: "blur(8px)",
        zIndex: 22,
        overflow: position === "bottom" ? "auto hidden" : "auto",
      }}
    >
      {/* Header */}
      {position !== "bottom" && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#00ffff",
            paddingBottom: 8,
            borderBottom: "1px solid rgba(0,255,255,0.2)",
            marginBottom: 4,
            whiteSpace: "nowrap",
          }}
        >
          {performerName ? `${performerName}'s Chat` : "Audience Chat"}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          display: "flex",
          flexDirection: position === "bottom" ? "row" : "column",
          gap: 6,
          overflow: "auto",
          maxHeight: position === "bottom" ? 100 : 350,
        }}
      >
        {audienceMessages.length === 0 ? (
          <div
            style={{
              fontSize: 10,
              color: "#94a3b8",
              fontStyle: "italic",
              padding: 8,
              textAlign: "center",
            }}
          >
            Waiting for audience...
          </div>
        ) : (
          audienceMessages.map((message) => {
            const badge = ROLE_BADGES[message.role] ?? ROLE_BADGES.audience;
            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  flex: position === "bottom" ? "0 0 auto" : "1",
                  minWidth: position === "bottom" ? 140 : undefined,
                }}
              >
                {/* Badge */}
                <div style={{ fontSize: 12, flexShrink: 0 }}>{badge.label}</div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: badge.color,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      marginBottom: 1,
                    }}
                  >
                    {message.displayName}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#e5e7eb",
                      lineHeight: 1.3,
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                      maxHeight: 40,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Badge */}
      <div
        style={{
          marginTop: position === "bottom" ? 0 : 4,
          fontSize: 9,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          paddingTop: 4,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {audienceMessages.length} messages
      </div>
    </div>
  );
}
