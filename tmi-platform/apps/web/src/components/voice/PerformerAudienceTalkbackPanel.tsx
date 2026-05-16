"use client";

// PerformerAudienceTalkbackPanel.tsx
// Performer sees pending audience talkback requests.
// Can accept, mute, or focus one person.

import React from "react";
import type { TalkbackRequest } from "@/lib/voice/IntercomModeEngine";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

interface PerformerAudienceTalkbackPanelProps {
  performerId: string;
  requests: TalkbackRequest[];
  focusedId: string | null;
  onAccept: (audienceId: string) => void;
  onMute: (audienceId: string) => void;
  onFocus: (audienceId: string) => void;
  onClearFocus: () => void;
  actorAgeClass?: SafetyAgeClass;
  targetAgeClass?: SafetyAgeClass;
}

const STATUS_COLOR: Record<TalkbackRequest["status"], string> = {
  PENDING: "#ff9f00",
  ACCEPTED: "#00ffcc",
  REJECTED: "#555",
  FOCUSED: "#00e5ff",
  MUTED: "#ff4444",
};

const STATUS_LABEL: Record<TalkbackRequest["status"], string> = {
  PENDING: "PENDING",
  ACCEPTED: "LIVE",
  REJECTED: "REJECTED",
  FOCUSED: "FOCUSED",
  MUTED: "MUTED",
};

export default function PerformerAudienceTalkbackPanel({
  requests,
  focusedId,
  onAccept,
  onMute,
  onFocus,
  onClearFocus,
  actorAgeClass = "unknown",
  targetAgeClass = "unknown",
}: PerformerAudienceTalkbackPanelProps) {
  const visible = requests.filter((r) => r.status !== "REJECTED");

  const decision = enforceAdultTeenContactBlock({
    source: "voice:talkback-panel",
    channel: "talkback",
    actor: {
      userId: "performer-local",
      ageClass: actorAgeClass,
      familyVerified: false,
      guardianApproved: false,
    },
    target: {
      userId: "audience-local",
      ageClass: targetAgeClass,
    },
  });

  return (
    <div
      style={{
        background: "rgba(8,8,18,0.97)",
        border: "1px solid #1a1a2e",
        borderRadius: "10px",
        padding: "14px",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#ccc",
        minWidth: "260px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          borderBottom: "1px solid #1a1a2e",
          paddingBottom: "8px",
        }}
      >
        <span style={{ color: "#ff9f00", fontWeight: 700, letterSpacing: "0.08em" }}>
          AUDIENCE TALKBACK
        </span>
        <span style={{ color: "#555", fontSize: "10px" }}>
          {visible.length} request{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {focusedId && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            borderRadius: "6px",
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.25)",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "#00e5ff", fontSize: "11px" }}>
            ▶ FOCUSED ON {requests.find((r) => r.audienceId === focusedId)?.audienceDisplayName ?? focusedId}
          </span>
          <button
            type="button"
            onClick={onClearFocus}
            style={{
              background: "transparent",
              border: "1px solid #444",
              color: "#888",
              borderRadius: "4px",
              padding: "2px 6px",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            RELEASE
          </button>
        </div>
      )}

      {!decision.allowed && (
        <div style={{ marginBottom: "8px", border: "1px solid #7f1d1d", borderRadius: "6px", background: "#2a0e14", color: "#fecaca", padding: "6px 8px", fontSize: "11px" }}>
          Talkback blocked by P0 teen safety: {decision.reason}
        </div>
      )}

      {visible.length === 0 ? (
        <div style={{ color: "#333", fontStyle: "italic", padding: "8px 0" }}>
          no requests
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {visible.map((req) => (
            <div
              key={req.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: "6px",
                background:
                  req.audienceId === focusedId
                    ? "rgba(0,229,255,0.06)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${STATUS_COLOR[req.status]}22`,
              }}
            >
              <div>
                <span
                  style={{
                    color: req.audienceId === focusedId ? "#00e5ff" : "#ddd",
                    fontWeight: req.audienceId === focusedId ? 700 : 400,
                  }}
                >
                  {req.audienceDisplayName}
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "9px",
                    color: STATUS_COLOR[req.status],
                    fontWeight: 700,
                  }}
                >
                  {STATUS_LABEL[req.status]}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {req.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!decision.allowed) return;
                      onAccept(req.audienceId);
                    }}
                    style={{
                      background: "rgba(0,255,204,0.1)",
                      border: "1px solid #00ffcc",
                      color: "#00ffcc",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    ACCEPT
                  </button>
                )}
                {(req.status === "ACCEPTED" || req.status === "PENDING") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!decision.allowed) return;
                      onFocus(req.audienceId);
                    }}
                    style={{
                      background: "rgba(0,229,255,0.08)",
                      border: "1px solid #00e5ff",
                      color: "#00e5ff",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    FOCUS
                  </button>
                )}
                {req.status !== "MUTED" && (
                  <button
                    type="button"
                    onClick={() => onMute(req.audienceId)}
                    style={{
                      background: "transparent",
                      border: "1px solid #444",
                      color: "#ff4444",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    MUTE
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
