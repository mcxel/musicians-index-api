"use client";

import React from "react";
import type { ChatWidgetMinimizeStyle } from "@/lib/chat/ChatWidgetPreferenceEngine";

type ChatWidgetMinimizedPillProps = {
  label: string;
  styleMode: Exclude<ChatWidgetMinimizeStyle, "none">;
  unreadCount?: number;
  onRestore: () => void;
};

export function ChatWidgetMinimizedPill({
  label,
  styleMode,
  unreadCount = 0,
  onRestore,
}: ChatWidgetMinimizedPillProps) {
  const shape =
    styleMode === "icon"
      ? { width: 44, height: 44, borderRadius: 22 }
      : styleMode === "tab"
        ? { width: 98, height: 30, borderRadius: 8 }
        : { width: 130, height: 34, borderRadius: 17 };

  return (
    <button
      type="button"
      onClick={onRestore}
      style={{
        ...shape,
        position: "relative",
        border: "1px solid rgba(56,189,248,0.55)",
        background: "linear-gradient(135deg, rgba(14,116,144,0.55), rgba(15,23,42,0.9))",
        color: "#e0f2fe",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
      aria-label={`Restore ${label}`}
    >
      <span>{styleMode === "icon" ? "C" : label}</span>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            padding: "0 4px",
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            lineHeight: "18px",
          }}
        >
          {Math.min(unreadCount, 99)}
        </span>
      )}
    </button>
  );
}
