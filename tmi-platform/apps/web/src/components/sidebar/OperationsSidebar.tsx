"use client";

/**
 * OperationsSidebar.tsx — Phase 5.4 Production UX Convergence
 * 5-Tab Right Operations Sidebar (CHAT | ROOM | PEOPLE | COMMUNITY | SUPPORT).
 *
 * Features:
 *   - CHAT: Always-on community MessagingCanister (no live-room gate)
 *   - ROOM: Active venue room metadata
 *   - PEOPLE: Session identity (honest — full roster not wired)
 *   - COMMUNITY: Platform-wide public feed (real, one shared Conversation row)
 *   - SUPPORT: Observatory diagnostic reporting
 */

import { useState } from "react";
import { useTheme } from "@/lib/design/ThemeEngine";
import { supportDiagnosticsEngine } from "@/lib/support/SupportDiagnosticsEngine";
import { tmiSoundRegistry } from "@/lib/audio/TmiSoundRegistry";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import CommunityFeedPanel from "@/components/messaging/CommunityFeedPanel";

export type OperationsTab = "CHAT" | "ROOM" | "PEOPLE" | "COMMUNITY" | "SUPPORT";

interface OperationsSidebarProps {
  role: "fan" | "performer" | "admin";
  userId: string;
  displayName: string;
  roomId?: string;
  featuredPerformerName?: string;
}

export default function OperationsSidebar({
  role,
  userId,
  displayName,
  roomId = "room-main-stage",
  featuredPerformerName,
}: OperationsSidebarProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<OperationsTab>("CHAT");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportCategory, setSupportCategory] = useState<"BUG_REPORT" | "FEATURE_REQUEST" | "PERFORMANCE_ISSUE">("BUG_REPORT");
  const [supportSubmitted, setSupportSubmitted] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: OperationsTab[] = ["CHAT", "ROOM", "PEOPLE", "COMMUNITY", "SUPPORT"];

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setIsSubmitting(true);
    tmiSoundRegistry.playCue("message");
    const result = await supportDiagnosticsEngine.submitSupportReport(
      supportMessage,
      supportCategory,
      role,
      roomId,
      `sess_${userId}`,
    );
    setIsSubmitting(false);
    setSupportSubmitted(result.reportId);
    setSupportMessage("");
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 180,
        background: "rgba(5,5,18,0.65)",
        borderRadius: 12,
        border: `1px solid ${theme.primary}22`,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 5-Tab Navigation Bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: 6,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setActiveTab(t);
                tmiSoundRegistry.playCue("message");
              }}
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: isActive ? theme.primary : "rgba(255,255,255,0.4)",
                background: isActive ? `${theme.primary}18` : "transparent",
                border: isActive ? `1px solid ${theme.primary}44` : "1px solid transparent",
                borderRadius: 6,
                padding: "4px 7px",
                cursor: "pointer",
                transition: "all 120ms ease",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", minHeight: 120 }}>
        {/* CHAT TAB — community messaging always on (no live-room gate) */}
        {activeTab === "CHAT" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
            {featuredPerformerName ? (
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 700, padding: "0 2px" }}>
                Room context: {featuredPerformerName}
              </div>
            ) : null}
            <MessagingCanister height={320} compact />
            <div style={{ fontSize: 9, color: theme.secondary, textAlign: "center", fontWeight: 800 }}>
              🟢 Community Moderation Active
            </div>
          </div>
        )}

        {/* ROOM TAB */}
        {activeTab === "ROOM" && (
          <div style={{ fontSize: 10, display: "flex", flexDirection: "column", gap: 6, color: "rgba(255,255,255,0.7)" }}>
            <div><strong style={{ color: theme.primary }}>Room ID:</strong> {roomId}</div>
            <div><strong style={{ color: theme.primary }}>Stage Performer:</strong> {featuredPerformerName ?? "None Live"}</div>
          </div>
        )}

        {/* PEOPLE TAB */}
        {activeTab === "PEOPLE" && (
          <div style={{ fontSize: 10, display: "flex", flexDirection: "column", gap: 6, color: "rgba(255,255,255,0.7)" }}>
            <div style={{ fontWeight: 900, color: theme.primary }}>ACTIVE PARTICIPANTS</div>
            <div>👑 {displayName} ({role.toUpperCase()})</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              Real room roster isn't wired to this panel yet — only your own session is shown.
            </div>
          </div>
        )}

        {/* COMMUNITY TAB — Rule 20 honest empty (no fake feed claims) */}
        {activeTab === "COMMUNITY" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.06em" }}>
              PLATFORM-WIDE — everyone on TMI sees this
            </div>
            <CommunityFeedPanel />
          </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === "SUPPORT" && (
          <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: theme.primary, letterSpacing: "0.06em" }}>
              OBSERVATORY SUPPORT DIAGNOSTICS
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
              Auto-attaches route, viewport, browser, session & JS errors directly into Observatory queue.
            </div>

            {supportSubmitted ? (
              <div style={{ fontSize: 9, color: "#00FF88", background: "rgba(0,255,136,0.1)", padding: 8, borderRadius: 6, border: "1px solid #00FF88" }}>
                ✓ Support Report Dispatched to Observatory! ID: {supportSubmitted}
              </div>
            ) : (
              <>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value as typeof supportCategory)}
                  style={{
                    fontSize: 9,
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 4,
                    padding: "3px 6px",
                  }}
                >
                  <option value="BUG_REPORT">Bug Report 🐛</option>
                  <option value="FEATURE_REQUEST">Feature Request 💡</option>
                  <option value="PERFORMANCE_ISSUE">Performance / Latency ⚡</option>
                </select>

                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe what happened..."
                  rows={2}
                  style={{
                    fontSize: 9,
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 4,
                    padding: 6,
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !supportMessage.trim()}
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: supportMessage.trim() ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : "rgba(255,255,255,0.1)",
                    color: supportMessage.trim() ? "#fff" : "rgba(255,255,255,0.4)",
                    cursor: supportMessage.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  {isSubmitting ? "Dispatching..." : "REPORT TO OBSERVATORY ↗"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
