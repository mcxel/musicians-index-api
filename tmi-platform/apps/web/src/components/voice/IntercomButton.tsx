"use client";

// IntercomButton.tsx
// Performer's intercom toggle — opens/closes room voice for the performer.

import React from "react";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

interface IntercomButtonProps {
  performerId: string;
  intercomEnabled: boolean;
  allowAudienceTalkback: boolean;
  onToggle: (enabled: boolean) => void;
  actorAgeClass?: SafetyAgeClass;
  targetAgeClass?: SafetyAgeClass;
}

export default function IntercomButton({
  intercomEnabled,
  allowAudienceTalkback,
  onToggle,
  actorAgeClass = "unknown",
  targetAgeClass = "unknown",
}: IntercomButtonProps) {
  const decision = enforceAdultTeenContactBlock({
    source: "voice:intercom-button",
    channel: "voice",
    actor: {
      userId: "performer-local",
      ageClass: actorAgeClass,
    },
    target: {
      userId: "audience-local",
      ageClass: targetAgeClass,
    },
  });

  return (
    <button
      type="button"
      aria-label={intercomEnabled ? "Close intercom" : "Open intercom"}
      onClick={() => {
        if (!decision.allowed) return;
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
        opacity: decision.allowed ? 1 : 0.55,
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
      {!decision.allowed && (
        <span style={{ marginLeft: "6px", fontSize: "10px", color: "#fca5a5", letterSpacing: "0.03em" }}>BLOCKED</span>
      )}
    </button>
  );
}
