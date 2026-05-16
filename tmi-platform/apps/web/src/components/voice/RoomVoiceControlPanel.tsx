"use client";

// RoomVoiceControlPanel.tsx
// Full voice control panel for host or performer.
// Shows active speakers, crowd gate toggle, focus controls.

import React, { useState } from "react";
import type { VoiceRoomSnapshot } from "@/lib/voice/RoomVoiceEngine";
import type { CrowdMoment } from "@/lib/voice/CrowdAudioMixEngine";
import { enforceAdultTeenContactBlock } from "@/lib/safety/AdultTeenContactBlocker";
import type { SafetyAgeClass } from "@/lib/safety/TeenMessagingPolicyEngine";

interface RoomVoiceControlPanelProps {
  snapshot: VoiceRoomSnapshot;
  crowdOpen: boolean;
  activeMoment: CrowdMoment;
  onOpenCrowd: (moment: CrowdMoment) => void;
  onCloseCrowd: () => void;
  onFocusPerson: (identifier: string) => void;
  onReleaseFocus: () => void;
  onMuteParticipant: (id: string) => void;
  focusedId?: string | null;
  actorAgeClass?: SafetyAgeClass;
  targetAgeClass?: SafetyAgeClass;
}

const CROWD_MOMENTS: CrowdMoment[] = ["YAY", "BOO", "APPLAUSE", "COMEBACK", "WINNER"];

const MOMENT_LABEL: Record<CrowdMoment, string> = {
  YAY: "YAY",
  BOO: "BOO",
  APPLAUSE: "APPLAUSE",
  COMEBACK: "COMEBACK",
  WINNER: "WINNER 🏆",
  BEBO_PULL: "BEBO PULL",
  BEBO_RETURN: "BEBO RETURN",
  NONE: "NONE",
};

const MOMENT_COLOR: Partial<Record<CrowdMoment, string>> = {
  YAY: "#00ffcc",
  BOO: "#ff4444",
  APPLAUSE: "#ffcc00",
  COMEBACK: "#ff9f00",
  WINNER: "#00e5ff",
};

export default function RoomVoiceControlPanel({
  snapshot,
  crowdOpen,
  activeMoment,
  onOpenCrowd,
  onCloseCrowd,
  onFocusPerson,
  onReleaseFocus,
  onMuteParticipant,
  focusedId,
  actorAgeClass = "unknown",
  targetAgeClass = "unknown",
}: RoomVoiceControlPanelProps) {
  const [focusInput, setFocusInput] = useState("");

  const decision = enforceAdultTeenContactBlock({
    source: "voice:control-panel",
    channel: "voice",
    actor: {
      userId: "voice-control-actor",
      ageClass: actorAgeClass,
      familyVerified: false,
      guardianApproved: false,
    },
    target: {
      userId: "voice-control-target",
      ageClass: targetAgeClass,
    },
  });

  const activeSpeakers = snapshot.participants.filter((p) =>
    snapshot.activeSpeakerIds.includes(p.id)
  );

  return (
    <div
      style={{
        background: "rgba(10,10,20,0.95)",
        border: "1px solid #222",
        borderRadius: "10px",
        padding: "16px",
        color: "#eee",
        fontFamily: "monospace",
        fontSize: "12px",
        minWidth: "280px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          borderBottom: "1px solid #333",
          paddingBottom: "8px",
        }}
      >
        <span style={{ color: "#00ffcc", fontWeight: 700, letterSpacing: "0.1em" }}>
          VOICE CONTROL
        </span>
        <span
          style={{
            fontSize: "10px",
            color: snapshot.voiceOpen ? "#00ffcc" : "#666",
            background: snapshot.voiceOpen ? "rgba(0,255,204,0.1)" : "transparent",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {snapshot.state}
        </span>
      </div>

      {/* Active speakers */}
      {!decision.allowed && (
        <div style={{ marginBottom: "10px", border: "1px solid #7f1d1d", borderRadius: "6px", background: "#2a0e14", color: "#fecaca", padding: "6px 8px", fontSize: "11px" }}>
          Voice contact blocked by P0 teen safety: {decision.reason}
        </div>
      )}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ color: "#888", marginBottom: "4px", fontSize: "10px" }}>
          ACTIVE MIC ({activeSpeakers.length})
        </div>
        {activeSpeakers.length === 0 ? (
          <div style={{ color: "#444", fontStyle: "italic" }}>silence</div>
        ) : (
          activeSpeakers.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
                borderBottom: "1px solid #1a1a2e",
              }}
            >
              <span
                style={{
                  color: p.id === focusedId ? "#00e5ff" : "#ccc",
                  fontWeight: p.id === focusedId ? 700 : 400,
                }}
              >
                {p.id === focusedId ? "▶ " : ""}
                {p.displayName}
                <span style={{ color: "#555", marginLeft: "4px" }}>
                  [{p.role}]
                </span>
              </span>
              <button
                type="button"
                onClick={() => onMuteParticipant(p.id)}
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
            </div>
          ))
        )}
      </div>

      {/* Focus a person */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ color: "#888", marginBottom: "4px", fontSize: "10px" }}>
          FOCUS PERSON
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            value={focusInput}
            onChange={(e) => setFocusInput(e.target.value)}
            placeholder="name or id"
            style={{
              flex: 1,
              background: "#111",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#eee",
              padding: "4px 8px",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (!decision.allowed) {
                return;
              }
              if (focusInput.trim()) {
                onFocusPerson(focusInput.trim());
                setFocusInput("");
              }
            }}
            style={{
              background: "rgba(0,229,255,0.1)",
              border: "1px solid #00e5ff",
              color: "#00e5ff",
              borderRadius: "4px",
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            FOCUS
          </button>
          {focusedId && (
            <button
              type="button"
              onClick={onReleaseFocus}
              style={{
                background: "transparent",
                border: "1px solid #555",
                color: "#888",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              RELEASE
            </button>
          )}
        </div>
      </div>

      {/* Crowd gate */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <span style={{ color: "#888", fontSize: "10px" }}>CROWD GATE</span>
          {crowdOpen && (
            <span
              style={{
                color: MOMENT_COLOR[activeMoment] ?? "#ffcc00",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {MOMENT_LABEL[activeMoment]} ▲
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {CROWD_MOMENTS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onOpenCrowd(m)}
              style={{
                background:
                  crowdOpen && activeMoment === m
                    ? `rgba(${m === "BOO" ? "255,68,68" : "0,255,204"},0.15)`
                    : "rgba(30,30,40,0.8)",
                border: `1px solid ${MOMENT_COLOR[m] ?? "#444"}`,
                color: MOMENT_COLOR[m] ?? "#aaa",
                borderRadius: "4px",
                padding: "3px 8px",
                cursor: "pointer",
                fontSize: "10px",
                fontFamily: "monospace",
              }}
            >
              {MOMENT_LABEL[m]}
            </button>
          ))}
          {crowdOpen && (
            <button
              type="button"
              onClick={onCloseCrowd}
              style={{
                background: "transparent",
                border: "1px solid #444",
                color: "#666",
                borderRadius: "4px",
                padding: "3px 8px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              CLOSE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
