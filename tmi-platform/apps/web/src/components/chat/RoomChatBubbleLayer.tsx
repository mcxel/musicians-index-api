"use client";

import { useMemo } from "react";
import type { RoomChatMessage, RoomRuntimeState } from "@/lib/chat/RoomChatEngine";
import { filterPlacementsToAvoidStageObstruction, placeChatBubble } from "@/lib/chat/ChatBubblePlacementEngine";
import { selectVisibleBubbles } from "@/lib/chat/ChatVisibilityEngine";

type RoomChatBubbleLayerProps = {
  messages: RoomChatMessage[];
  state: RoomRuntimeState;
  viewerDistance?: "near" | "mid" | "far";
  seed?: number;
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

export function RoomChatBubbleLayer({
  messages,
  state,
  viewerDistance = "mid",
  seed = 7,
}: RoomChatBubbleLayerProps) {
  const visible = useMemo(() => {
    const density = messages.length;
    const placements = messages.map((message) => placeChatBubble({ message, state, density, seed }));
    const filtered = filterPlacementsToAvoidStageObstruction(placements);
    return selectVisibleBubbles(filtered, state, viewerDistance);
  }, [messages, seed, state, viewerDistance]);

  const byId = useMemo(() => {
    return messages.reduce<Record<string, RoomChatMessage>>((acc, message) => {
      acc[message.id] = message;
      return acc;
    }, {});
  }, [messages]);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 18,
      }}
    >
      {visible.map((placement) => {
        const msg = byId[placement.messageId];
        if (!msg) return null;

        const color = ROLE_COLORS[msg.role] ?? "#ffffff";
        return (
          <div
            key={placement.messageId}
            style={{
              position: "absolute",
              left: `${placement.x * 100}%`,
              top: `${placement.y * 100}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: 10,
              padding: "6px 10px",
              maxWidth: 220,
              border: `1px solid ${color}88`,
              background: "rgba(0,0,0,0.72)",
              color: "#fff",
              boxShadow: `0 0 16px ${color}55`,
              opacity: placement.opacity,
              zIndex: placement.zIndex,
              fontSize: 11,
              lineHeight: 1.35,
              backdropFilter: "blur(2px)",
            }}
          >
            <div style={{ color, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
              {msg.displayName}
            </div>
            <div>{msg.text}</div>
          </div>
        );
      })}
    </div>
  );
}
