"use client";

// VoiceFocusBadge.tsx
// Displayed on the focused participant — highlights them as the current voice focus.

import React from "react";

interface VoiceFocusBadgeProps {
  name: string;
  isFocused: boolean;
  role?: string;
}

export default function VoiceFocusBadge({ name, isFocused, role }: VoiceFocusBadgeProps) {
  if (!isFocused) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "20px",
        background: "rgba(0,229,255,0.12)",
        border: "1.5px solid #00e5ff",
        boxShadow: "0 0 10px rgba(0,229,255,0.3)",
        fontFamily: "monospace",
        fontSize: "11px",
        fontWeight: 700,
        color: "#00e5ff",
        letterSpacing: "0.06em",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Pulse dot */}
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#00e5ff",
          boxShadow: "0 0 6px #00e5ff",
          display: "inline-block",
          animation: "pulse 1.2s ease-in-out infinite",
        }}
      />
      <span>
        {name}
        {role ? (
          <span style={{ color: "#888", fontWeight: 400, marginLeft: "4px" }}>
            [{role}]
          </span>
        ) : null}
      </span>
      <span style={{ fontSize: "9px", color: "#00e5ff", opacity: 0.7 }}>
        FOCUSED
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
}
