"use client";

import React, { useMemo, useEffect, useState } from "react";
import { RoomChatBubble } from "./RoomChatBubble";
import type { FloatingBubble } from "@/lib/chat/RoomBubbleChatEngine";
import { filterVisibleBubbles } from "@/lib/chat/BubbleVisibilityEngine";

type RoomBubbleRailProps = {
  bubbles: FloatingBubble[];
  maxVisible?: number;
  enableDensityCulling?: boolean;
};

export function RoomBubbleRail({
  bubbles,
  maxVisible = 16,
  enableDensityCulling = true,
}: RoomBubbleRailProps) {
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Force re-render on bubble updates
    const interval = setInterval(() => {
      setRenderKey((prev) => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const visibleBubbles = useMemo(() => {
    if (!enableDensityCulling) {
      return bubbles.slice(0, maxVisible);
    }

    const filtered = filterVisibleBubbles(bubbles, {
      rule: bubbles.length > 20 ? "host-priority" : "all",
      densityThreshold: 18,
      maxVisiblePerRole: 4,
      performerBubblePriority: true,
      hostAlwaysVisible: true,
    });

    return filtered.slice(0, maxVisible);
  }, [bubbles, maxVisible, enableDensityCulling, renderKey]);

  return (
    <div
      role="region"
      aria-label="Chat bubble rail"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 20,
        overflow: "hidden",
      }}
    >
      {visibleBubbles.map((bubble) => (
        <RoomChatBubble key={bubble.id} bubble={bubble} isVisible={true} />
      ))}

      {/* Debug info (in development) */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            fontSize: 10,
            color: "#94a3b8",
            background: "rgba(0,0,0,0.6)",
            padding: "4px 6px",
            borderRadius: 4,
            fontFamily: "monospace",
            zIndex: 100,
            pointerEvents: "auto",
          }}
        >
          <div>Bubbles: {visibleBubbles.length}/{bubbles.length}</div>
          <div>Total: {bubbles.length}</div>
        </div>
      )}
    </div>
  );
}
