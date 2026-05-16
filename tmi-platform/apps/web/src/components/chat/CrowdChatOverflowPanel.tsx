"use client";

import React, { useMemo, useState } from "react";
import type { OverflowRailEntry } from "@/lib/chat/ChatOverflowRailEngine";
import type { ChatRole } from "@/lib/chat/RoomChatEngine";

type CrowdChatOverflowPanelProps = {
  entries: OverflowRailEntry[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  density: number;
};

const ROLE_COLORS: Record<ChatRole, string> = {
  performer: "#00ffff",
  host: "#ffd700",
  judge: "#ff9f43",
  audience: "#ff2daa",
  sponsor: "#00ff88",
  system: "#9ca3af",
  moderator: "#ef4444",
};

const ROLE_ICONS: Record<ChatRole, string> = {
  performer: "🎤",
  host: "👑",
  judge: "⚖️",
  audience: "👥",
  sponsor: "💰",
  system: "⚙️",
  moderator: "🛡️",
};

export function CrowdChatOverflowPanel({
  entries,
  unreadCount,
  isOpen,
  onToggle,
  density,
}: CrowdChatOverflowPanelProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const byRole = useMemo(() => {
    const grouped: Record<ChatRole, OverflowRailEntry[]> = {
      host: [],
      performer: [],
      judge: [],
      audience: [],
      sponsor: [],
      system: [],
      moderator: [],
    };

    for (const entry of entries) {
      grouped[entry.role].push(entry);
    }

    return grouped;
  }, [entries]);

  const visibleEntries = useMemo(() => {
    return entries.slice(Math.max(0, entries.length - 30));
  }, [entries]);

  const densityLevel = useMemo(() => {
    if (density >= 25) return { label: "CROWDED", color: "#ef4444", level: 3 };
    if (density >= 18) return { label: "BUSY", color: "#f59e0b", level: 2 };
    if (density >= 12) return { label: "ACTIVE", color: "#10b981", level: 1 };
    return { label: "QUIET", color: "#6b7280", level: 0 };
  }, [density]);

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 24,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        type="button"
        aria-label={isOpen ? "Close overflow panel" : "Open overflow panel"}
        aria-pressed={isOpen}
        style={{
          position: "relative",
          width: 56,
          height: 56,
          borderRadius: 28,
          border: `2px solid ${densityLevel.color}`,
          background: `linear-gradient(135deg, ${densityLevel.color}22, ${densityLevel.color}11)`,
          color: densityLevel.color,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          transition: "all 200ms ease-out",
          boxShadow: `0 0 24px ${densityLevel.color}33`,
          backdropFilter: "blur(4px)",
        }}
      >
        <span>💬</span>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "#ef4444",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #1f2937",
            }}
          >
            {Math.min(unreadCount, 9)}
          </div>
        )}

        {/* Density Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            background: densityLevel.color,
            boxShadow: `0 0 8px ${densityLevel.color}66`,
            animation: densityLevel.level >= 2 ? "pulse 1s infinite" : undefined,
          }}
        />

        {/* Pulse animation style */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 0,
            width: 340,
            maxHeight: 500,
            display: "flex",
            flexDirection: "column",
            borderRadius: 16,
            border: `2px solid ${densityLevel.color}`,
            background: "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(10,15,35,0.92))",
            boxShadow: `0 0 40px ${densityLevel.color}22`,
            backdropFilter: "blur(12px)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: `1px solid ${densityLevel.color}33`,
              background: `linear-gradient(90deg, ${densityLevel.color}11, transparent)`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: densityLevel.color,
                  marginBottom: 2,
                }}
              >
                Chat Overflow
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>
                {densityLevel.label} ({density} msg/min)
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#10b981",
                  background: "rgba(16,185,129,0.1)",
                  padding: "4px 8px",
                  borderRadius: 4,
                }}
              >
                {entries.length}
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {visibleEntries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 11,
                  padding: 20,
                  fontStyle: "italic",
                }}
              >
                No messages yet
              </div>
            ) : (
              visibleEntries.map((entry) => {
                const color = ROLE_COLORS[entry.role];
                const icon = ROLE_ICONS[entry.role];

                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: `1px solid ${color}22`,
                      background: `linear-gradient(90deg, ${color}11, transparent)`,
                      transition: entry.isNew ? "all 300ms ease-out" : undefined,
                      animation: entry.isNew ? "slideIn 300ms ease-out" : undefined,
                    }}
                  >
                    <style>{`
                      @keyframes slideIn {
                        from { opacity: 0; transform: translateX(8px); }
                        to { opacity: 1; transform: translateX(0); }
                      }
                    `}</style>

                    {/* Meta */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                        fontSize: 9,
                      }}
                    >
                      <span style={{ fontSize: 11 }}>{icon}</span>
                      <span style={{ color, fontWeight: 700, textTransform: "uppercase" }}>
                        {entry.displayName}
                      </span>
                      {entry.isNew && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: 8,
                            color: "#ef4444",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div
                      style={{
                        fontSize: 10,
                        color: "#e5e7eb",
                        lineHeight: 1.4,
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        maxHeight: 50,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entry.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
              padding: 12,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.2)",
              fontSize: 9,
            }}
          >
            {Object.entries(byRole).map(([role, msgs]) =>
              msgs.length > 0 ? (
                <div key={role} style={{ textAlign: "center" }}>
                  <div style={{ color: ROLE_COLORS[role as ChatRole] }}>
                    {ROLE_ICONS[role as ChatRole]}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 8, marginTop: 2 }}>
                    {msgs.length}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
