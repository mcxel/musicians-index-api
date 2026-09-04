"use client";

import React from "react";

interface IntercomButtonProps {
  performerId: string;
  intercomEnabled: boolean;
  allowAudienceTalkback: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function IntercomButton({
  intercomEnabled,
  allowAudienceTalkback,
  onToggle,
}: IntercomButtonProps) {
  return (
    <button
      type="button"
      aria-label={intercomEnabled ? "Close intercom" : "Open intercom"}
      onClick={() => {
        onToggle(!intercomEnabled);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "8px",
        border: `2px solid ${intercomEnabled ? "#00ffcc" : "#555"}`,
        background: intercomEnabled
          ? "rgba(0,255,204,0.12)"
          : "rgba(30,30,40,0.85)",
        color: intercomEnabled ? "#00ffcc" : "#aaa",
        fontFamily: "monospace",
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: intercomEnabled
          ? "0 0 12px rgba(0,255,204,0.35)"
          : "none",
        position: "relative",
      }}
    >
      {/* Mic icon */}
      <span
        style={{
          display: "inline-block",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: intercomEnabled ? "#00ffcc" : "#555",
          boxShadow: intercomEnabled ? "0 0 6px #00ffcc" : "none",
        }}
      />
      {intercomEnabled ? "INTERCOM ON" : "INTERCOM OFF"}
      {allowAudienceTalkback && intercomEnabled && (
        <span
          style={{
            marginLeft: "6px",
            fontSize: "10px",
            color: "#ff9f00",
            letterSpacing: "0.04em",
          }}
        >
          TALKBACK
        </span>
      )}
    </button>
  );
}
